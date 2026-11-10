import { describe, expect, it } from "vitest";
import { bugunTr, istanbulIso, oncekiGun, trTarihParcalari } from "../../../src/core/tarih.js";

describe("tarih (Europe/Istanbul)", () => {
  it("UTC 21:30 Türkiye'de ertesi gündür", () => {
    expect(bugunTr(new Date("2026-11-10T21:30:00Z"))).toBe("2026-11-11");
  });

  it("UTC 20:59 Türkiye'de aynı gündür", () => {
    expect(bugunTr(new Date("2026-11-10T20:59:00Z"))).toBe("2026-11-10");
  });

  it("önceki gün ay ve yıl sınırını geçer", () => {
    expect(oncekiGun("2026-03-01")).toBe("2026-02-28");
    expect(oncekiGun("2026-01-01")).toBe("2025-12-31");
  });

  it("tarih parçaları", () => {
    expect(trTarihParcalari("2026-11-06")).toEqual({ yil: "2026", ay: "11", gun: "06" });
  });

  it("istanbulIso +03:00 ofsetlidir", () => {
    expect(istanbulIso(new Date("2026-11-10T21:30:05Z"))).toBe("2026-11-11T00:30:05+03:00");
  });
});
