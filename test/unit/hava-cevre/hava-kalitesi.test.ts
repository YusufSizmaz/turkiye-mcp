import { describe, expect, it } from "vitest";
import { getAirQuality } from "../../../src/sources/hava-cevre/hava-kalitesi.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`hava-cevre/${p}`), contentType: "application/json" });

describe("Hava kalitesi", () => {
  it("istasyonları kategori adıyla döndürür, il filtresi ve POST Date gövdesi", async () => {
    const { calls } = mockFetch([
      { match: "GetAirQualityStatus", ...j("hk-status.json") },
      { match: "GetAirQualityStations", ...j("hk-stations.json") },
    ]);
    const s = await getAirQuality({ il: "ankara", limit: 50 });
    const post = calls.find((c) => c.url.includes("Stations"));
    expect(post?.init?.method).toBe("POST");
    expect(JSON.parse(String(post?.init?.body)).Date).toMatch(
      /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/,
    );
    expect(s.veri.every((x) => x.il === "Ankara")).toBe(true);
    const ulus = s.veri.find((x) => x.istasyon === "Ankara - Ulus");
    expect(ulus).toMatchObject({
      indeks: 85,
      kategori: "Orta",
      baskinKirletici: "NO2",
      ilce: expect.any(String),
    });
    expect(ulus?.zaman).toMatch(/\+03:00$/);
    expect(s.veri[0]?.indeks).toBeGreaterThanOrEqual(s.veri.at(-1)?.indeks ?? 0); // kötüden iyiye sıralı
  });
});
