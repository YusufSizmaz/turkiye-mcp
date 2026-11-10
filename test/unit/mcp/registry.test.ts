import { describe, expect, it } from "vitest";
import { KATEGORILER, TUM_KAYNAKLAR } from "../../../src/registry.js";

describe("registry tutarlılığı", () => {
  it.each(KATEGORILER.map((k) => [k.kategori, k] as const))(
    "%s: araçların kaynakları kategoride listeli",
    (_, k) => {
      const idler = new Set(k.sources.map((s) => s.id));
      for (const t of k.tools)
        for (const s of t.sources) expect(idler, `${t.name} → ${s.id}`).toContain(s.id);
    },
  );

  it.each(KATEGORILER.map((k) => [k.kategori, k] as const))(
    "%s: her kaynağın canlı kontrolü (probe) var",
    (_, k) => {
      for (const s of k.sources) expect(Object.keys(k.probes), s.id).toContain(s.id);
    },
  );

  it("kaynak id'leri benzersiz", () => {
    const ids = TUM_KAYNAKLAR.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("araç adları benzersiz", () => {
    const adlar = KATEGORILER.flatMap((k) => k.tools.map((t) => t.name));
    expect(new Set(adlar).size).toBe(adlar.length);
  });
});
