import type { Sonuc, SourceMeta } from "../../../core/types.js";

export interface Eczane {
  ad: string;
  ilce: string;
  adres: string;
  telefon: string | null;
  konum: { enlem: number; boylam: number } | null;
  tarif: string | null;
  /** Nöbet saatleri, ör. "19:00–09:00" (kaynak veriyorsa) */
  nobet: string | null;
}

export interface EczaneAdaptoru {
  /** Bu adaptörün desteklediği illerin plakaları */
  plakalar: number[];
  meta: SourceMeta;
  getir(plaka: number, ilce?: string): Promise<Sonuc<Eczane[]>>;
}

export const temiz = (s: string | undefined | null) =>
  (s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

export function konumAyristir(href: string | undefined): Eczane["konum"] {
  const m = /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/.exec(href ?? "");
  return m ? { enlem: Number(m[1]), boylam: Number(m[2]) } : null;
}
