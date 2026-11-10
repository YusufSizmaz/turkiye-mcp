/**
 * Gerçek kaynaklara istek atan testler. PR CI'ında çalışmaz: `npm run test:live`.
 * Anahtar gerektiren kaynaklar ilgili env değişkenleri yoksa atlanır.
 */
import { describe, it } from "vitest";
import { kaynakAktif } from "../../src/mcp/tool.js";
import { KATEGORILER } from "../../src/registry.js";

for (const kat of KATEGORILER) {
  describe(`${kat.ikon} ${kat.ad}`, () => {
    for (const meta of kat.sources) {
      const probe = kat.probes[meta.id];
      it.skipIf(!probe || !kaynakAktif(meta, process.env))(
        `${meta.id} canlı veri döndürür`,
        async () => {
          await probe?.();
        },
      );
    }
  });
}
