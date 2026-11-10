import { describe, expect, it } from "vitest";
import { eslesir, normalizeTr } from "../../../src/core/metin.js";

describe("normalizeTr", () => {
  it.each(["İSTANBUL", "istanbul", "Istanbul", " istanbul ", "ıstanbul"])("%s → istanbul", (v) => {
    expect(normalizeTr(v)).toBe("istanbul");
  });

  it("çoklu boşlukları tekler", () => {
    expect(normalizeTr("Kahraman   Maraş")).toBe("kahraman maras");
  });
});

describe("eslesir", () => {
  it("Türkçe karaktersiz ve büyük harfli girdiyi eşler", () => {
    expect(eslesir("Kadıköy", "KADIKOY")).toBe(true);
    expect(eslesir("Şişli", "sisli")).toBe(true);
    expect(eslesir("Üsküdar", "uskudar")).toBe(true);
    expect(eslesir("Çankaya", "CANKAYA")).toBe(true);
  });

  it("farklı yerleri eşlemez", () => {
    expect(eslesir("Kadıköy", "Kartal")).toBe(false);
  });
});
