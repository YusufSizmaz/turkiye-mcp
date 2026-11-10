import { describe, expect, it } from "vitest";
import {
  getDisclosures,
  getLatestDisclosures,
  searchCompanies,
} from "../../../src/sources/finans/kap.js";
import { fixture, mockFetch } from "../../helpers.js";

const json = (p: string) => ({ body: fixture(p), contentType: "application/json" });

describe("KAP", () => {
  it("son bildirimleri ayrıştırır ve varsayılan 20 ile sınırlar", async () => {
    const { calls } = mockFetch([
      { match: "api/disclosure/list/light", ...json("finans/kap-light.json") },
    ]);
    const s = await getLatestDisclosures();
    expect(calls[0]?.url).toBe("https://www.kap.org.tr/tr/api/disclosure/list/light");
    expect(s.veri).toHaveLength(20);
    expect(s.veri[0]).toMatchObject({
      index: 1696754,
      baslik: "Kredi Derecelendirmesi",
      ozet: "Kredi Derecelendirme Notunun Askıya Alınması",
      sirket: "İSTANBUL ULUSLARARASI DERECELENDİRME HİZMETLERİ A.Ş.",
      tarih: "2026-11-10T20:58:52+03:00",
      url: "https://www.kap.org.tr/tr/Bildirim/1696754",
    });
  });

  it("tarih aralığında POST gövdesi DD.MM.YYYY ve hisse filtresi", async () => {
    const { calls } = mockFetch([
      { match: "api/disclosure/list/main", ...json("finans/kap-main.json") },
    ]);
    const s = await getDisclosures({
      baslangic: "2026-11-09",
      bitis: "2026-11-10",
      hisseKodu: "thyao",
    });
    expect(calls[0]?.init?.method).toBe("POST");
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({
      fromDate: "09.11.2026",
      toDate: "10.11.2026",
    });
    expect(s.veri.map((b) => b.index).sort()).toEqual([1694972, 1695077, 1695191]);
    expect(s.veri.find((b) => b.index === 1695191)?.hisseKodu).toBe("THYAO");
  });

  it("limit uygulanır", async () => {
    mockFetch([{ match: "api/disclosure/list/main", ...json("finans/kap-main.json") }]);
    const s = await getDisclosures({ baslangic: "2026-11-09", bitis: "2026-11-10", limit: 5 });
    expect(s.veri).toHaveLength(5);
  });

  it("şirket arama: kodlar büyük harf (ı → I) ve KAP linki", async () => {
    const { calls } = mockFetch([
      { match: "api/search/combined", ...json("finans/kap-search-turk-hava.json") },
    ]);
    const s = await searchCompanies("türk hava");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ keyword: "türk hava" });
    expect(s.veri[0]).toEqual({
      ad: "TÜRK HAVA YOLLARI A.O.",
      kod: "THYAO",
      tur: "sirket",
      kapUrl: "https://www.kap.org.tr/tr/sirket-bilgileri/ozet/4028e4a140f2ed720140f376bebb01a7",
    });
    expect(s.veri.find((x) => x.ad.startsWith("MİGROS"))?.kod).toBe("MIGRS");
  });
});
