import { describe, expect, it } from "vitest";
import { ILLER, ilBul } from "../../../src/core/iller.js";

describe("iller", () => {
  it("81 il", () => expect(ILLER).toHaveLength(81));
  it.each([
    ["istanbul", 34],
    ["İZMİR", 35],
    ["34", 34],
    [6, 6],
    ["Afyon", 3],
    ["urfa", 63],
    ["kahramanmaras", 46],
    ["igdir", 76],
  ])("%s → %i", (g, plaka) => expect(ilBul(g)?.plaka).toBe(plaka));
  it("bilinmeyen il", () => expect(ilBul("Atlantis")).toBeUndefined());
});
