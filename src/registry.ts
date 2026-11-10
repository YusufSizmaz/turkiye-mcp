import type { Kategori, SourceMeta } from "./core/types.js";
import type { KategoriModulu } from "./mcp/tool.js";
import { cografya } from "./sources/cografya/index.js";
import { deprem } from "./sources/deprem/index.js";
import { enerji } from "./sources/enerji/index.js";
import { finans } from "./sources/finans/index.js";
import { havaCevre } from "./sources/hava-cevre/index.js";
import { resmi } from "./sources/resmi/index.js";
import { saglik } from "./sources/saglik/index.js";
import { sehir } from "./sources/sehir/index.js";
import { takvim } from "./sources/takvim/index.js";

export const KATEGORILER: KategoriModulu[] = [
  finans,
  deprem,
  resmi,
  havaCevre,
  enerji,
  saglik,
  sehir,
  cografya,
  takvim,
];

export const TUM_KAYNAKLAR: SourceMeta[] = KATEGORILER.flatMap((k) => k.sources);

const TUM_KATEGORI_ADLARI: Kategori[] = [
  "finans",
  "deprem",
  "resmi",
  "hava-cevre",
  "enerji",
  "saglik",
  "sehir",
  "cografya",
  "takvim",
];

export function secilenKategoriler(env: NodeJS.ProcessEnv): Kategori[] {
  const ham = env.TURKIYE_MCP_CATEGORIES?.trim();
  if (!ham) return [...TUM_KATEGORI_ADLARI];
  const secilen: Kategori[] = [];
  for (const parca of ham.split(",")) {
    const ad = parca.trim();
    if (!ad) continue;
    if ((TUM_KATEGORI_ADLARI as string[]).includes(ad)) secilen.push(ad as Kategori);
    else
      console.error(
        `[turkiye-mcp] Bilinmeyen kategori yok sayıldı: "${ad}". Geçerli: ${TUM_KATEGORI_ADLARI.join(", ")}`,
      );
  }
  return secilen;
}
