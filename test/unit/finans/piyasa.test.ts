import { describe, expect, it } from "vitest";
import * as btcturk from "../../../src/sources/finans/btcturk.js";
import * as isyatirim from "../../../src/sources/finans/isyatirim.js";
import * as paribu from "../../../src/sources/finans/paribu.js";
import * as truncgil from "../../../src/sources/finans/truncgil.js";
import { fixture, mockFetch } from "../../helpers.js";

const json = (p: string) => ({ body: fixture(p), contentType: "application/json" });

describe("Truncgil altın", () => {
  it("varsayılan olarak yalnız değerli metalleri, Türkçe adlarla döndürür", async () => {
    mockFetch([{ match: "finans.truncgil.com", ...json("finans/truncgil.json") }]);
    const s = await truncgil.getGoldAndMarket();
    expect(s.veri.guncelleme).toBe("2026-11-10T21:41:01+03:00");
    const gram = s.veri.kalemler.find((k) => k.kod === "GRA");
    expect(gram).toEqual({
      kod: "GRA",
      ad: "Gram Altın",
      tur: "Altın",
      alis: 6507.36,
      satis: 6508.32,
      degisimYuzde: -2.6,
    });
    const kodlar = s.veri.kalemler.map((k) => k.kod);
    expect(kodlar).toContain("CEYREKALTIN");
    expect(kodlar).toContain("GUMUS");
    expect(kodlar).not.toContain("USD");
    expect(kodlar).not.toContain("XU100"); // alış fiyatı olmayan endeks
    expect(kodlar).not.toContain("ONS"); // değeri 0
  });

  it("kodlar verilirse yalnız onlar (döviz dahil)", async () => {
    mockFetch([{ match: "finans.truncgil.com", ...json("finans/truncgil.json") }]);
    const s = await truncgil.getGoldAndMarket({ kodlar: ["ceyrekaltin", "usd"] });
    expect(s.veri.kalemler.map((k) => k.kod)).toEqual(["USD", "CEYREKALTIN"]);
  });
});

describe("İş Yatırım hisse geçmişi", () => {
  it("tarihleri DD-MM-YYYY gönderir, satırları ayrıştırır", async () => {
    const { calls } = mockFetch([{ match: "HisseTekil", ...json("finans/isyatirim-thyao.json") }]);
    const s = await isyatirim.getStockHistory({
      hisse: "thyao",
      baslangic: "2026-11-01",
      bitis: "2026-11-10",
    });
    const u = new URL(calls[0]?.url ?? "");
    expect(u.searchParams.get("hisse")).toBe("THYAO");
    expect(u.searchParams.get("startdate")).toBe("01-11-2026");
    expect(u.searchParams.get("enddate")).toBe("10-11-2026");
    expect(s.veri[0]).toEqual({
      tarih: "2026-11-02",
      kapanis: 261,
      min: 243.2,
      max: 261.25,
      ortalama: 252.992,
      hacimTl: 12373925452,
      piyasaDegeriTl: 360180000000,
    });
  });

  it("ok:false → bulunamadi", async () => {
    mockFetch([{ match: "HisseTekil", body: { ok: false, value: [] } }]);
    await expect(
      isyatirim.getStockHistory({ hisse: "XXXX", baslangic: "2026-11-01", bitis: "2026-11-10" }),
    ).rejects.toMatchObject({ tur: "bulunamadi" });
  });
});

describe("Kripto", () => {
  it("BtcTurk varsayılan pariteler", async () => {
    mockFetch([{ match: "api.btcturk.com", ...json("finans/btcturk.json") }]);
    const s = await btcturk.getTickers();
    expect(s.veri.map((k) => k.parite)).toEqual(["BTC_TRY", "ETH_TRY", "USDT_TRY"]);
    expect(s.veri[0]).toMatchObject({
      son: 3694278,
      alis: 3695067,
      satis: 3695980,
      degisimYuzde: -1.25,
    });
  });

  it("Paribu BTC_TL → BTC_TRY ve 270 kaydın tamamını değil yalnız istenenleri döndürür", async () => {
    mockFetch([{ match: "paribu.com", ...json("finans/paribu.json") }]);
    const s = await paribu.getTickers();
    expect(s.veri).toHaveLength(3);
    expect(s.veri[0]).toMatchObject({
      parite: "BTC_TRY",
      son: 3696359,
      alis: 3692703,
      satis: 3699214,
      degisimYuzde: -1.21,
    });
  });

  it("parite girişi esnek: btc, BTCTRY, btc_tl", async () => {
    mockFetch([{ match: "paribu.com", ...json("finans/paribu.json") }]);
    const s = await paribu.getTickers({ pariteler: ["btc", "ETHTRY", "usdt_tl"] });
    expect(s.veri.map((k) => k.parite)).toEqual(["BTC_TRY", "ETH_TRY", "USDT_TRY"]);
  });
});

describe("finans_get_crypto_prices aracı", () => {
  it("borsa seçimi kaynağı belirler, özet TL fiyatı içerir", async () => {
    const { finans } = await import("../../../src/sources/finans/index.js");
    const arac = finans.tools.find((t) => t.name === "finans_get_crypto_prices");
    if (!arac) throw new Error("araç yok");
    mockFetch([{ match: "paribu.com", ...json("finans/paribu.json") }]);
    const s = await arac.run(arac.inputSchema.parse({ borsa: "paribu", pariteler: ["btc"] }), {});
    expect(s.kaynak.id).toBe("paribu");
    expect(arac.ozet(s)).toContain("BTC/TRY");
    expect(arac.ozet(s)).toContain("3.696.359");
  });
});
