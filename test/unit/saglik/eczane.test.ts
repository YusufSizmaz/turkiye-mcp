import { describe, expect, it } from "vitest";
import { getOnDuty } from "../../../src/sources/saglik/eczane/index.js";
import { fixture, mockFetch } from "../../helpers.js";

const f = (p: string, ct: string) => ({ body: fixture(`saglik/${p}`), contentType: ct });

describe("Nöbetçi eczane — İstanbul", () => {
  it("sayfadaki token ile ilçe API'sini çağırır (X-Web-Token + Referer)", async () => {
    const { calls } = mockFetch([
      {
        match: "api/nobetci-eczane-web/?action=district&id=18",
        ...f("ieo-kadikoy.json", "application/json"),
      },
      { match: "istanbuleczaciodasi.org.tr/nobetci-eczane/", ...f("ieo-sayfa.html", "text/html") },
    ]);
    const s = await getOnDuty({ il: "istanbul", ilce: "KADIKOY" });
    const api = calls.find((c) => c.url.includes("action=district"));
    const h = new Headers(api?.init?.headers);
    expect(h.get("x-web-token")).toMatch(/^v1\./);
    expect(h.get("referer")).toBe("https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/");
    expect(s.kaynak.id).toBe("eczane-istanbul");
    expect(s.veri).toHaveLength(8);
    expect(s.veri[0]).toEqual({
      ad: "BURKAY ECZANESİ",
      ilce: "Kadıköy",
      adres: "Göztepe Mahallesi Mustafakaya Sokak 18/B",
      telefon: null,
      konum: { enlem: 40.9830983267364, boylam: 29.0614057554761 },
      tarif: "Göztepe Vakıflar Bankası Karşısı",
      nobet: "10.11.2026 19:00–09:00",
    });
  });

  it("İstanbul'da ilçe zorunlu; bilinmeyen ilçede ilçe listesiyle hata", async () => {
    mockFetch([
      { match: "istanbuleczaciodasi.org.tr/nobetci-eczane/", ...f("ieo-sayfa.html", "text/html") },
    ]);
    await expect(getOnDuty({ il: "İstanbul" })).rejects.toMatchObject({
      tur: "bulunamadi",
      message: expect.stringContaining("Kadıköy"),
    });
    await expect(getOnDuty({ il: "İstanbul", ilce: "Atlantis" })).rejects.toMatchObject({
      tur: "bulunamadi",
    });
  });
});

describe("Nöbetçi eczane — İzmir (resmî API)", () => {
  it("bölge/ilçe filtresi Türkçe karakter duyarsız", async () => {
    mockFetch([
      {
        match: "openapi.izmir.bel.tr/api/ibb/nobetcieczaneler",
        ...f("izmir-api.json", "application/json"),
      },
    ]);
    const s = await getOnDuty({ il: "izmir", ilce: "altindag", limit: 200 });
    expect(s.veri.length).toBeGreaterThan(0);
    expect(
      s.veri.every(
        (e) => e.ilce === "ALTINDAĞ" || /ALTINDA/.test(e.adres) || /ALTINDA/.test(e.nobet ?? ""),
      ),
    ).toBe(true);
  });
});

describe("Nöbetçi eczane — Ankara", () => {
  it("tarihli JSON uç noktasından HTML parçasını ayrıştırır", async () => {
    const { calls } = mockFetch([
      { match: "aeo.org.tr/getPharmacies/", ...f("ankara.json", "application/json") },
    ]);
    const s = await getOnDuty({ il: "ankara", limit: 200 });
    expect(calls[0]?.url).toMatch(/getPharmacies\/\d{4}-\d{2}-\d{2}$/);
    expect(s.veri).toHaveLength(12);
    expect(s.veri.find((e) => e.ad === "BEYZAM ECZANESİ")).toEqual({
      ad: "BEYZAM ECZANESİ",
      ilce: "Çankaya",
      adres: "Cevizlidere Mah. 1066.Cad. No:36/C Balgat/ Çankaya/ ANKARA",
      telefon: "03124720266",
      konum: { enlem: 39.88384095894, boylam: 32.820024490356 },
      tarif: null,
      nobet: expect.stringContaining("nöbeti"),
    });
  });

  it("ilçe filtresi", async () => {
    mockFetch([{ match: "aeo.org.tr/getPharmacies/", ...f("ankara.json", "application/json") }]);
    const s = await getOnDuty({ il: "ankara", ilce: "cankaya" });
    expect(s.veri).toHaveLength(6);
  });
});

describe("Desteklenmeyen il", () => {
  it("desteklenmiyor hatası ve desteklenen iller", async () => {
    await expect(getOnDuty({ il: "Bursa" })).rejects.toMatchObject({
      tur: "desteklenmiyor",
      message: expect.stringMatching(/İstanbul.*Ankara.*İzmir.*Adana.*Mersin/),
    });
  });
});

describe("eczane_get_on_duty aracı", () => {
  it("özet ad, adres, telefon ve harita linki içerir", async () => {
    const { saglik } = await import("../../../src/sources/saglik/index.js");
    const a = saglik.tools.find((t) => t.name === "eczane_get_on_duty");
    if (!a) throw new Error("yok");
    mockFetch([{ match: "aeo.org.tr/getPharmacies/", ...f("ankara.json", "application/json") }]);
    const g = a.inputSchema.parse({ il: "Ankara", ilce: "Çankaya" });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("BEYZAM ECZANESİ");
    expect(ozet).toContain("03124720266");
    expect(ozet).toContain("https://www.google.com/maps?q=39.88384095894,32.820024490356");
  });
});
