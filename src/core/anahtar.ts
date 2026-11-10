import { KaynakHatasi } from "./errors.js";
import type { SourceMeta } from "./types.js";

/** Kaynağın env değişkenlerini döndürür; eksik varsa Türkçe açıklamalı anahtar-yok hatası. */
export function anahtarlar(meta: SourceMeta, env: NodeJS.ProcessEnv): Record<string, string> {
  const eksik = meta.envVars.filter((v) => !env[v]);
  if (eksik.length) {
    throw new KaynakHatasi(
      meta.id,
      "anahtar-yok",
      `${meta.ad} için şu ortam değişkenleri gerekli: ${eksik.join(", ")}. ${meta.anahtarNasilAlinir ?? ""}`.trim(),
    );
  }
  return Object.fromEntries(meta.envVars.map((v) => [v, env[v] as string]));
}
