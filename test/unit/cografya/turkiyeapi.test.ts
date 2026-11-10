import { describe, expect, it } from "vitest";
import {
  getDistricts,
  getNeighborhoods,
  getProvinces,
} from "../../../src/sources/cografya/turkiyeapi.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`cografya/${p}`), contentType: "application/json" });

describe("turkiyeapi", () => {
  it("il bilgisi: Türkçe alanlar", async () => {
    const { calls } = mockFetch([{ match: "/v1/provinces", ...j("provinces-ankara.json") }]);
    const s = await getProvinces({ ad: "ankara" });
    expect(new URL(calls[0]?.url ?? "").searchParams.get("name")).toBe("Ankara");
    expect(s.veri[0]).toEqual({
      plaka: 6,
      ad: "Ankara",
      nufus: 5910320,
      alanKm2: 25632,
      rakim: 905,
      bolge: "İç Anadolu",
      buyuksehir: true,
      kiyi: false,
      telefonKodu: [312],
      enlem: 39.92077,
      boylam: 32.85411,
      ilceSayisi: expect.any(Number),
    });
  });

  it("ilçeler il kaydından gelir, nüfusa göre azalan", async () => {
    mockFetch([{ match: "/v1/provinces", ...j("provinces-ankara.json") }]);
    const s = await getDistricts("Ankara");
    expect(s.veri.length).toBe(25);
    expect(s.veri[0]?.nufus).toBeGreaterThan(s.veri[1]?.nufus ?? 0);
    expect(s.veri.find((d) => d.ad === "Akyurt")).toEqual({
      id: 1872,
      ad: "Akyurt",
      nufus: 46956,
      alanKm2: 369,
    });
  });

  it("mahalleler il+ilçe ile sorgulanır", async () => {
    const { calls } = mockFetch([
      { match: "/v1/neighborhoods", ...j("neighborhoods-kadikoy.json") },
    ]);
    const s = await getNeighborhoods({ il: "istanbul", ilce: "Kadıköy", limit: 5 });
    const u = new URL(calls[0]?.url ?? "");
    expect(u.searchParams.get("province")).toBe("İstanbul");
    expect(u.searchParams.get("district")).toBe("Kadıköy");
    expect(s.veri[0]).toEqual({ id: 40528, ad: "19 Mayıs", nufus: 31515 });
  });
});
