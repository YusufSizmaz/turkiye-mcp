import { describe, expect, it } from "vitest";
import { havaCevre } from "../../../src/sources/hava-cevre/index.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`hava-cevre/${p}`), contentType: "application/json" });
const arac = (ad: string) => {
  const a = havaCevre.tools.find((t) => t.name === ad);
  if (!a) throw new Error(`${ad} yok`);
  return a;
};

describe("hava araçları", () => {
  it("hava_get_current özeti", async () => {
    mockFetch([
      { match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") },
      { match: "sondurumlar", ...j("mgm-sondurum.json") },
    ]);
    const a = arac("hava_get_current");
    const g = a.inputSchema.parse({ il: "ankara" });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("Ankara / Keçiören");
    expect(ozet).toContain("2,9 °C");
    expect(ozet).toContain("Puslu");
  });

  it("hava_get_forecast özeti gün adlarıyla", async () => {
    mockFetch([
      { match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") },
      { match: "tahminler/gunluk", ...j("mgm-gunluk.json") },
    ]);
    const a = arac("hava_get_forecast");
    const g = a.inputSchema.parse({ il: "Ankara" });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("Çarşamba 11.11.2026: -1 / 10 °C, Puslu");
  });

  it("hava_get_air_quality özeti", async () => {
    mockFetch([
      { match: "GetAirQualityStatus", ...j("hk-status.json") },
      { match: "GetAirQualityStations", ...j("hk-stations.json") },
    ]);
    const a = arac("hava_get_air_quality");
    const g = a.inputSchema.parse({ il: "Ankara", limit: 3 });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("Ankara - Ulus: 85 (Orta, baskın NO2)");
  });
});
