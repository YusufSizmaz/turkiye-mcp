export type Kategori =
  | "finans"
  | "deprem"
  | "resmi"
  | "hava-cevre"
  | "enerji"
  | "saglik"
  | "sehir"
  | "cografya"
  | "takvim";

/** resmi: kamu kurumu · birinci-taraf: şirketin kendi API'si · topluluk: üçüncü taraf */
export type Rozet = "resmi" | "birinci-taraf" | "topluluk";

export interface SourceMeta {
  id: string;
  ad: string;
  kategori: Kategori;
  rozet: Rozet;
  anahtarGerekli: boolean;
  envVars: string[];
  resmiUrl: string;
  aciklama: string;
  ttlSaniye: number;
  deneysel?: boolean;
  geoKisitli?: boolean;
  /** anahtarGerekli ise: anahtarın nasıl alınacağına dair Türkçe talimat */
  anahtarNasilAlinir?: string;
  /** README'de gösterilen ham uç noktalar */
  ucNoktalar: string[];
  /** README'de gösterilen TypeScript kullanım örneği */
  kutuphaneOrnegi: string;
}

export interface KaynakBilgisi {
  id: string;
  ad: string;
  rozet: Rozet;
  url: string;
  /** ISO 8601, +03:00 */
  alinmaZamani: string;
}

export interface Sonuc<T> {
  veri: T;
  kaynak: KaynakBilgisi;
  not?: string;
}

export const ROZET_ETIKET: Record<Rozet, string> = {
  resmi: "🏛️ Resmî",
  "birinci-taraf": "✅ Birinci taraf",
  topluluk: "🌐 Topluluk",
};
