/**
 * README.md'deki işaretli bölümleri ve src/sources/<kategori>/README.md dosyalarını registry'den üretir.
 * Kullanım: npm run readme
 * Gerçek örnek çıktılar varsa (docs/ornek-ciktilar.json, scripts/smoke.ts üretir) kataloğa eklenir.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import {
  readmeGuncelle,
  renderAracKatalogu,
  renderKategori,
  renderKategoriSatiri,
} from "../src/readme.js";
import { KATEGORILER, TUM_KAYNAKLAR } from "../src/registry.js";

const ornekler: Record<string, string> = existsSync("docs/ornek-ciktilar.json")
  ? JSON.parse(readFileSync("docs/ornek-ciktilar.json", "utf-8"))
  : {};

const aracSayisi = KATEGORILER.reduce((n, k) => n + k.tools.length, 0) + 1; // + list_sources
const resmi = TUM_KAYNAKLAR.filter((s) => s.rozet === "resmi").length;
const sayilar = `**${KATEGORILER.length} kategori · ${TUM_KAYNAKLAR.length} kaynak (${resmi} resmî) · ${aracSayisi} MCP aracı**`;

let readme = readFileSync("README.md", "utf-8");
readme = readmeGuncelle(readme, "SAYILAR", `\n${sayilar}\n`);
readme = readmeGuncelle(readme, "KATEGORILER", `\n${renderKategoriSatiri(KATEGORILER)}\n`);
readme = readmeGuncelle(readme, "ARACLAR", `\n${renderAracKatalogu(KATEGORILER)}`);
writeFileSync("README.md", readme);

for (const k of KATEGORILER) {
  const yol = `src/sources/${k.kategori}/README.md`;
  writeFileSync(
    yol,
    `<!-- Bu dosya \`npm run readme\` ile üretilir; elle düzenlemeyin. -->\n\n[← turkiye-mcp](../../../README.md#-araçlar)\n\n${renderKategori(k, ornekler)}\n[← Tüm kategoriler](../../../README.md#-araçlar)\n`,
  );
}
console.log(`README güncellendi: ${sayilar.replace(/\*/g, "")}`);
