export interface Deprem {
  id: string;
  /** ISO 8601, +03:00 */
  tarih: string;
  buyukluk: number;
  tip: string;
  derinlikKm: number;
  enlem: number;
  boylam: number;
  yer: string;
  il: string | null;
  kaynak: "afad" | "kandilli";
}

export interface DepremSorgusu {
  /** Son kaç saat (varsayılan 24) */
  saat?: number;
  minBuyukluk?: number;
  il?: string;
  limit?: number;
}
