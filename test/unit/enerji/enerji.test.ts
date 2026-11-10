import { describe, expect, it } from "vitest";
import * as epias from "../../../src/sources/enerji/epias.js";
import * as opet from "../../../src/sources/enerji/opet.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`enerji/${p}`), contentType: "application/json" });

describe("Opet akaryakıt", () => {
  it("il adı → plaka (izmir → 35), ilçe filtresi Türkçe karakter duyarsız", async () => {
    const { calls } = mockFetch([{ match: "ProvinceCode=35", ...j("opet-35.json") }]);
    const s = await opet.getFuelPrices({ il: "izmir", ilce: "aliaga" });
    expect(new URL(calls[0]?.url ?? "").searchParams.get("ProvinceCode")).toBe("35");
    expect(s.veri.ilceler).toHaveLength(1);
    expect(s.veri.ilceler[0]).toMatchObject({ il: "İZMİR", ilce: "ALİAĞA" });
    expect(s.veri.ilceler[0]?.urunler[0]).toEqual({ ad: "Kurşunsuz Benzin 95", fiyat: 75.92 });
  });

  it("plaka sayı olarak da çalışır", async () => {
    const { calls } = mockFetch([{ match: "ProvinceCode=35", ...j("opet-35.json") }]);
    await opet.getFuelPrices({ il: 35 });
    expect(calls[0]?.url).toContain("ProvinceCode=35");
  });

  it("İstanbul Anadolu (34) ve Avrupa (934) birleştirilir", async () => {
    const { calls } = mockFetch([
      { match: "ProvinceCode=934", ...j("opet-934.json") },
      { match: "ProvinceCode=34", ...j("opet-34.json") },
    ]);
    const s = await opet.getFuelPrices({ il: "İstanbul", ilce: "kadikoy" });
    expect(calls.map((c) => new URL(c.url).searchParams.get("ProvinceCode")).sort()).toEqual([
      "34",
      "934",
    ]);
    expect(s.veri.ilceler.map((x) => x.ilce)).toEqual(["KADIKÖY"]);
  });

  it("ilçe verilmezse en fazla 10 ilçe ve not", async () => {
    mockFetch([{ match: "ProvinceCode=35", ...j("opet-35.json") }]);
    const s = await opet.getFuelPrices({ il: "izmir" });
    expect(s.veri.ilceler).toHaveLength(10);
    expect(s.veri.toplamIlce).toBe(30);
    expect(s.not).toContain("ilçe");
  });

  it("bilinmeyen il", async () => {
    await expect(opet.getFuelPrices({ il: "Atlantis" })).rejects.toMatchObject({
      tur: "bulunamadi",
    });
  });
});

describe("EPİAŞ (deneysel)", () => {
  const env = { EPIAS_USERNAME: "u@x.com", EPIAS_PASSWORD: "p" };

  it("anahtar yoksa anahtar-yok", async () => {
    await expect(epias.getMarketClearingPrice({ tarih: "2026-11-10" }, {})).rejects.toMatchObject({
      tur: "anahtar-yok",
    });
  });

  it("önce TGT alır, veri isteğine TGT header'ı koyar, ikinci çağrıda TGT'yi yeniden almaz", async () => {
    const { calls } = mockFetch([
      {
        match: "giris.epias.com.tr/cas/v1/tickets",
        body: "TGT-123-abc",
        contentType: "text/plain",
      },
      { match: "markets/dam/data/mcp", ...j("epias-mcp.json") },
      { match: "realtime-consumption", ...j("epias-tuketim.json") },
    ]);
    const s = await epias.getMarketClearingPrice({ tarih: "2026-11-10" }, env);
    expect(calls[0]?.init?.body).toBe("username=u%40x.com&password=p");
    const veriIstegi = calls[1];
    expect(new Headers(veriIstegi?.init?.headers).get("tgt")).toBe("TGT-123-abc");
    expect(JSON.parse(String(veriIstegi?.init?.body))).toEqual({
      startDate: "2026-11-10T00:00:00+03:00",
      endDate: "2026-11-10T23:00:00+03:00",
    });
    expect(s.veri[0]).toEqual({ saat: "00:00", ptfTl: 2850.5, ptfUsd: 56.89, ptfEur: 50.88 });
    const t = await epias.getRealtimeConsumption({ tarih: "2026-11-10" }, env);
    expect(t.veri[0]).toEqual({ saat: "00:00", tuketimMwh: 31250.42 });
    expect(calls.filter((c) => c.url.includes("tickets"))).toHaveLength(1);
  });
});

describe("enerji araçları", () => {
  it("enerji_get_fuel_prices özeti", async () => {
    const { enerji } = await import("../../../src/sources/enerji/index.js");
    const a = enerji.tools.find((t) => t.name === "enerji_get_fuel_prices");
    if (!a) throw new Error("yok");
    mockFetch([{ match: "ProvinceCode=35", ...j("opet-35.json") }]);
    const g = a.inputSchema.parse({ il: "izmir", ilce: "Aliağa" });
    expect(a.ozet(await a.run(g, {}), g)).toContain("Kurşunsuz Benzin 95: 75,92 TL");
  });

  it("enerji_get_electricity_market env yoksa kayıt dışı kalır (anahtarlı)", async () => {
    const { enerji } = await import("../../../src/sources/enerji/index.js");
    const { toolAktif } = await import("../../../src/mcp/tool.js");
    const a = enerji.tools.find((t) => t.name === "enerji_get_electricity_market");
    if (!a) throw new Error("yok");
    expect(toolAktif(a, {})).toBe(false);
    expect(toolAktif(a, { EPIAS_USERNAME: "u", EPIAS_PASSWORD: "p" })).toBe(true);
  });
});
