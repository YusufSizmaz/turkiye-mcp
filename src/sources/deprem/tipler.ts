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

export interface DepremListesi {
  /** Filtrelere uyan toplam deprem (limit uygulanmadan önce) */
  toplam: number;
  /** Filtrelere uyan en büyük deprem (limit uygulanmadan önce) */
  enBuyuk: Deprem | null;
  /** En yeniden eskiye, limit uygulanmış */
  depremler: Deprem[];
}

export function listele(tum: Deprem[], limit = 20): DepremListesi {
  return {
    toplam: tum.length,
    enBuyuk: tum.reduce<Deprem | null>((a, b) => (!a || b.buyukluk > a.buyukluk ? b : a), null),
    depremler: tum.slice(0, limit),
  };
}

export interface DepremSorgusu {
  /** Son kaç saat (varsayılan 24) */
  saat?: number;
  minBuyukluk?: number;
  il?: string;
  limit?: number;
}
