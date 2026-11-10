import { describe, expect, it, vi } from "vitest";
import { toolAktif } from "../../../src/mcp/tool.js";
import { cografya } from "../../../src/sources/cografya/index.js";
import { takvim } from "../../../src/sources/takvim/index.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(p), contentType: "application/json" });

describe("coğrafya + takvim araçları", () => {
  it("araç adları", () => {
    expect(cografya.tools.map((t) => t.name)).toEqual([
      "cografya_get_provinces",
      "cografya_get_districts",
      "cografya_get_neighborhoods",
    ]);
    expect(takvim.tools.map((t) => t.name)).toEqual([
      "takvim_get_holidays",
      "takvim_get_prayer_times",
    ]);
  });

  it("namaz aracı Diyanet anahtarı olmadan da kayıtlı", () => {
    const a = takvim.tools.find((t) => t.name === "takvim_get_prayer_times");
    expect(a && toolAktif(a, {})).toBe(true);
  });

  it("namaz özeti", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    mockFetch([
      { match: "/sehirler/2", ...j("takvim/ezan-sehirler-2.json") },
      { match: "/ilceler/540", ...j("takvim/ezan-ilceler-izmir.json") },
      { match: "/vakitler/9560", ...j("takvim/ezan-vakitler-izmir.json") },
    ]);
    const a = takvim.tools.find((t) => t.name === "takvim_get_prayer_times");
    if (!a) throw new Error("yok");
    const g = a.inputSchema.parse({ il: "izmir" });
    const ozet = a.ozet(await a.run(g, {}), g);
    expect(ozet).toContain("İZMİR / İZMİR");
    expect(ozet).toContain("İmsak 06:16");
    expect(ozet).toContain("Akşam 18:10");
  });

  it("il özeti", async () => {
    mockFetch([{ match: "/v1/provinces", ...j("cografya/provinces-ankara.json") }]);
    const a = cografya.tools[0];
    if (!a) throw new Error("yok");
    const g = a.inputSchema.parse({ ad: "Ankara" });
    expect(a.ozet(await a.run(g, {}), g)).toContain("Ankara (06) · İç Anadolu · nüfus 5.910.320");
  });
});
