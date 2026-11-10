import { describe, expect, it } from "vitest";
import * as ckan from "../../../src/sources/sehir/ckan.js";
import * as ibb from "../../../src/sources/sehir/ibb.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`sehir/${p}`), contentType: "application/json" });

describe("İBB trafik endeksi", () => {
  it("TI alanlarını Türkçe adlara çevirir", async () => {
    mockFetch([{ match: "TrafficIndex_Sc1_Cont", ...j("ibb-trafik.json") }]);
    const s = await ibb.getTrafficIndex();
    expect(s.veri).toEqual({ genel: 26, anadolu: 18, avrupa: 31 });
  });
});

describe("İSPARK", () => {
  it("varsayılan 20 kayıt, açık olanlar, boş yere göre azalan", async () => {
    mockFetch([{ match: "api.ibb.gov.tr/ispark/Park", ...j("ispark.json") }]);
    const s = await ibb.getParking();
    expect(s.veri).toHaveLength(20);
    expect(s.veri.every((p) => p.acik)).toBe(true);
    for (let i = 1; i < s.veri.length; i++) {
      expect(s.veri[i - 1]?.bos ?? 0).toBeGreaterThanOrEqual(s.veri[i]?.bos ?? 0);
    }
  });

  it("ilçe filtresi Türkçe karakter duyarsız, alan dönüşümü", async () => {
    mockFetch([{ match: "ispark/Park", ...j("ispark.json") }]);
    const s = await ibb.getParking({ ilce: "sisli", limit: 200 });
    expect(s.veri.length).toBeGreaterThan(0);
    expect(s.veri.every((p) => p.ilce === "ŞİŞLİ")).toBe(true);
    expect(s.veri.find((p) => p.ad === "19 Mayıs Açık")).toEqual({
      id: 2338,
      ad: "19 Mayıs Açık",
      ilce: "ŞİŞLİ",
      kapasite: 65,
      bos: 14,
      tur: "AÇIK OTOPARK",
      calismaSaatleri: "24 Saat",
      acik: true,
      ucretsizDakika: 0,
      enlem: 41.0563,
      boylam: 28.9941,
    });
  });
});

describe("CKAN açık veri", () => {
  it("İBB'de veri seti arama", async () => {
    const { calls } = mockFetch([
      { match: "data.ibb.gov.tr/api/3/action/package_search", ...j("ckan-search-baraj.json") },
    ]);
    const s = await ckan.searchDatasets("ibb", "baraj", 5);
    expect(new URL(calls[0]?.url ?? "").searchParams.get("q")).toBe("baraj");
    expect(s.veri.toplam).toBe(4);
    const d = s.veri.sonuclar.find((x) => x.id === "istanbul-barajlari-gunluk-doluluk-oranlari");
    expect(d).toMatchObject({
      kurum: "İSKİ",
      url: "https://data.ibb.gov.tr/dataset/istanbul-barajlari-gunluk-doluluk-oranlari",
    });
    expect(d?.kaynaklar[0]).toMatchObject({
      id: "af0b3902-cfd9-4096-85f7-e2c3017e4f21",
      format: "XLSX",
      datastore: true,
    });
  });

  it("İzmir portalında arama", async () => {
    const { calls } = mockFetch([
      {
        match: "acikveri.bizizmir.com/api/3/action/package_search",
        ...j("izmir-search-eczane.json"),
      },
    ]);
    const s = await ckan.searchDatasets("izmir", "eczane");
    expect(calls[0]?.url).toContain("acikveri.bizizmir.com");
    expect(s.kaynak.id).toBe("izmir-acik-veri");
    expect(s.veri.sonuclar[0]?.id).toBe("nobetci-eczaneler-ve-eczane-listesi");
  });

  it("datastore sorgusu: alanlar (_id hariç), kayıtlar, toplam", async () => {
    const { calls } = mockFetch([{ match: "datastore_search", ...j("ckan-datastore-baraj.json") }]);
    const s = await ckan.queryDatastore("ibb", "af0b3902-cfd9-4096-85f7-e2c3017e4f21", {
      limit: 3,
      sirala: "_id desc",
    });
    const u = new URL(calls[0]?.url ?? "");
    expect(u.searchParams.get("resource_id")).toBe("af0b3902-cfd9-4096-85f7-e2c3017e4f21");
    expect(u.searchParams.get("sort")).toBe("_id desc");
    expect(s.veri.toplam).toBe(8520);
    expect(s.veri.alanlar).toContain("Omerli");
    expect(s.veri.alanlar).not.toContain("_id");
    expect(s.veri.kayitlar).toHaveLength(3);
  });

  it("success:false → KaynakHatasi", async () => {
    mockFetch([
      { match: "datastore_search", body: { success: false, error: { message: "Not found" } } },
    ]);
    await expect(ckan.queryDatastore("ibb", "yok")).rejects.toMatchObject({ tur: "bulunamadi" });
  });
});

describe("şehir araçları", () => {
  const al = async (ad: string) => {
    const { sehir } = await import("../../../src/sources/sehir/index.js");
    const a = sehir.tools.find((t) => t.name === ad);
    if (!a) throw new Error(`${ad} yok`);
    return a;
  };

  it("4 araç: trafik, otopark, açık veri arama ve sorgu", async () => {
    const { sehir } = await import("../../../src/sources/sehir/index.js");
    expect(sehir.tools.map((t) => t.name)).toEqual([
      "istanbul_get_traffic_index",
      "istanbul_get_parking",
      "opendata_search",
      "opendata_query",
    ]);
  });

  it("trafik özeti yorum içerir", async () => {
    const a = await al("istanbul_get_traffic_index");
    mockFetch([{ match: "TrafficIndex", ...j("ibb-trafik.json") }]);
    const g = a.inputSchema.parse({});
    expect(a.ozet(await a.run(g, {}), g)).toContain("Genel: 26/100");
  });

  it("açık veri arama özeti kaynak id'lerini gösterir", async () => {
    const a = await al("opendata_search");
    mockFetch([{ match: "package_search", ...j("ckan-search-baraj.json") }]);
    const g = a.inputSchema.parse({ portal: "ibb", sorgu: "baraj" });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("İstanbul Barajları Günlük Doluluk Oranları");
    expect(ozet).toContain("af0b3902-cfd9-4096-85f7-e2c3017e4f21");
    expect(ozet).toContain("sorgulanabilir");
  });
});
