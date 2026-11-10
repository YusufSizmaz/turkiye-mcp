import { istanbulIso } from "./tarih.js";
import type { Sonuc, SourceMeta } from "./types.js";

export function sonuc<T>(meta: SourceMeta, url: string, veri: T, not?: string): Sonuc<T> {
  return {
    veri,
    kaynak: { id: meta.id, ad: meta.ad, rozet: meta.rozet, url, alinmaZamani: istanbulIso() },
    ...(not ? { not } : {}),
  };
}

/** Limit uygula (varsayılan 20). */
export function sinirla<T>(liste: T[], limit = 20): T[] {
  return liste.slice(0, limit);
}
