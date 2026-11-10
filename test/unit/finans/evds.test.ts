import { describe, expect, it } from "vitest";
import { getSeries } from "../../../src/sources/finans/evds.js";
import { fixture, mockFetch } from "../../helpers.js";

const env = { TCMB_EVDS_KEY: "gizli" };

describe("TCMB EVDS (deneysel)", () => {
  it("anahtar yoksa anahtar-yok hatası ve env adını söyler", async () => {
    await expect(
      getSeries({ seriler: ["TP.DK.USD.A"], baslangic: "2026-11-06", bitis: "2026-11-10" }, {}),
    ).rejects.toMatchObject({
      tur: "anahtar-yok",
      message: expect.stringContaining("TCMB_EVDS_KEY"),
    });
  });

  it("key header'ı, URL biçimi ve seri adı eşlemesi", async () => {
    const { calls } = mockFetch([
      {
        match: "evds3.tcmb.gov.tr",
        body: fixture("finans/evds-series.json"),
        contentType: "application/json",
      },
    ]);
    const s = await getSeries(
      {
        seriler: ["TP.DK.USD.A", "TP.DK.EUR.A"],
        baslangic: "2026-11-06",
        bitis: "2026-11-10",
        frekans: "gunluk",
      },
      env,
    );
    expect(calls[0]?.url).toBe(
      "https://evds3.tcmb.gov.tr/igmevdsms-dis/series=TP.DK.USD.A-TP.DK.EUR.A&startDate=06-11-2026&endDate=10-11-2026&type=json&frequency=1",
    );
    expect(new Headers(calls[0]?.init?.headers).get("key")).toBe("gizli");
    expect(s.veri).toHaveLength(3);
    expect(s.veri[1]).toEqual({
      tarih: "2026-11-09",
      degerler: { "TP.DK.USD.A": 50.0412, "TP.DK.EUR.A": null },
    });
  });

  it("aylık tarih biçimi (YYYY-M) ayrıştırılır", async () => {
    mockFetch([
      {
        match: "evds3",
        body: { totalCount: 1, items: [{ Tarih: "2026-9", TP_FG_J0: "3120.55" }] },
      },
    ]);
    const s = await getSeries(
      { seriler: ["TP.FG.J0"], baslangic: "2026-01-01", bitis: "2026-10-01", frekans: "aylik" },
      env,
    );
    expect(s.veri[0]).toEqual({ tarih: "2026-09", degerler: { "TP.FG.J0": 3120.55 } });
  });
});
