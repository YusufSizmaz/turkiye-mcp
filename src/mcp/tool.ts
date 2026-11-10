import type * as z from "zod";
import type { Kategori, Sonuc, SourceMeta } from "../core/types.js";

export interface ToolDef<S extends z.ZodObject = z.ZodObject> {
  name: string;
  title: string;
  description: string;
  inputSchema: S;
  /** Aracın dayandığı kaynaklar: anahtar kontrolü ve kaynak gösterimi için. */
  sources: SourceMeta[];
  /** README için 1–3 Türkçe doğal dil sorusu. */
  ornekSorular: string[];
  run(input: z.infer<S>, env: NodeJS.ProcessEnv): Promise<Sonuc<unknown>>;
  /** Türkçe, kısa, insan okunur özet. */
  // biome-ignore lint/suspicious/noExplicitAny: her aracın veri tipi farklıdır
  ozet(s: Sonuc<any>): string;
}

export interface KategoriModulu {
  kategori: Kategori;
  ad: string;
  ikon: string;
  aciklama: string;
  sources: SourceMeta[];
  // biome-ignore lint/suspicious/noExplicitAny: heterojen araç listesi
  tools: ToolDef<any>[];
  /** Kaynak id → en ucuz canlı kontrol (health için). */
  probes: Record<string, () => Promise<unknown>>;
}

export function defineTool<S extends z.ZodObject>(t: ToolDef<S>): ToolDef<S> {
  return t;
}

export function kaynakAktif(meta: SourceMeta, env: NodeJS.ProcessEnv): boolean {
  return !meta.anahtarGerekli || meta.envVars.every((v) => Boolean(env[v]));
}

/** Aracın tüm anahtarlı kaynaklarının env değişkenleri dolu mu? */
export function toolAktif(t: ToolDef, env: NodeJS.ProcessEnv): boolean {
  return t.sources.every((s) => kaynakAktif(s, env));
}
