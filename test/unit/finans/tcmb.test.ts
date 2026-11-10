import { describe, expect, it } from "vitest";
import { getRates } from "../../../src/sources/finans/tcmb.js";
import { fixture, mockFetch } from "../../helpers.js";

const xml = (b: Buffer) => ({ body: b, contentType: "application/xml" });

describe("TCMB kurları", () => {
  it("bugünün bültenini ayrıştırır", async () => {
    const { calls } = mockFetch([
      { match: "kurlar/today.xml", ...xml(fixture("finans/tcmb-today.xml")) },
    ]);
    const s = await getRates();
    expect(calls[0]?.url).toBe("https://www.tcmb.gov.tr/kurlar/today.xml");
    expect(s.veri.tarih).toBe("2026-11-10");
    expect(s.veri.bultenNo).toBe("2026/211");
    expect(s.veri.kurlar).toHaveLength(22);
    expect(s.veri.kurlar[0]).toEqual({
      kod: "USD",
      ad: "ABD DOLARI",
      birim: 1,
      dovizAlis: 50.1078,
      dovizSatis: 50.1981,
      efektifAlis: 50.0727,
      efektifSatis: 50.2733,
    });
    expect(s.kaynak.id).toBe("tcmb-kurlar");
    expect(s.kaynak.rozet).toBe("resmi");
  });

  it("boş alanlar null olur ve isimler kırpılır", async () => {
    mockFetch([{ match: "today.xml", ...xml(fixture("finans/tcmb-today.xml")) }]);
    const xdr = (await getRates()).veri.kurlar.find((k) => k.kod === "XDR");
    expect(xdr).toMatchObject({
      ad: "ÖZEL ÇEKME HAKKI (SDR)",
      dovizSatis: null,
      efektifAlis: null,
    });
  });

  it("tatil/hafta sonu için önceki iş gününe düşer ve not ekler", async () => {
    const { calls } = mockFetch([
      { match: "202611/08112026.xml", body: "", status: 404 },
      { match: "202611/07112026.xml", body: "", status: 404 },
      { match: "202611/06112026.xml", ...xml(fixture("finans/tcmb-06112026.xml")) },
    ]);
    const s = await getRates({ tarih: "2026-11-08" });
    expect(calls.map((c) => c.url.split("/").pop())).toEqual([
      "08112026.xml",
      "07112026.xml",
      "06112026.xml",
    ]);
    expect(s.veri.tarih).toBe("2026-11-06");
    expect(s.veri.kurlar[0]?.dovizAlis).toBe(49.9824);
    expect(s.not).toContain("08.11.2026");
    expect(s.not).toContain("06.11.2026");
  });

  it("7 gün boyunca bülten yoksa bulunamadi hatası", async () => {
    mockFetch([{ match: /kurlar\/\d+\/\d+\.xml/, body: "", status: 404 }]);
    await expect(getRates({ tarih: "2026-11-08" })).rejects.toMatchObject({ tur: "bulunamadi" });
  });

  it("geçersiz tarih reddedilir", async () => {
    await expect(getRates({ tarih: "08-11-2026" })).rejects.toThrow(/YYYY-MM-DD/);
  });
});

describe("finans_get_exchange_rates aracı", () => {
  it("kodlar filtresi büyük/küçük harf duyarsız ve özet Türkçe sayı biçimli", async () => {
    const { finans } = await import("../../../src/sources/finans/index.js");
    const arac = finans.tools.find((t) => t.name === "finans_get_exchange_rates");
    if (!arac) throw new Error("araç yok");
    mockFetch([{ match: "today.xml", ...xml(fixture("finans/tcmb-today.xml")) }]);
    const s = await arac.run(arac.inputSchema.parse({ kodlar: ["usd", "EUR"] }), {});
    expect((s.veri as { kurlar: unknown[] }).kurlar).toHaveLength(2);
    const ozet = arac.ozet(s);
    expect(ozet).toContain("10.11.2026");
    expect(ozet).toContain("USD");
    expect(ozet).toContain("50,1981");
  });
});
