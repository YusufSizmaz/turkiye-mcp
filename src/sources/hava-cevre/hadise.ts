/** MGM hadise (hava olayı) kodları → Türkçe açıklama */
export const HADISE: Record<string, string> = {
  A: "Açık",
  AB: "Az Bulutlu",
  PB: "Parçalı Bulutlu",
  CB: "Çok Bulutlu",
  HY: "Hafif Yağmurlu",
  Y: "Yağmurlu",
  KY: "Kuvvetli Yağmurlu",
  KKY: "Karla Karışık Yağmurlu",
  HKY: "Hafif Kar Yağışlı",
  K: "Kar Yağışlı",
  YKY: "Yoğun Kar Yağışlı",
  HSY: "Hafif Sağanak Yağışlı",
  SY: "Sağanak Yağışlı",
  KSY: "Kuvvetli Sağanak Yağışlı",
  MSY: "Mevzi Sağanak Yağışlı",
  DY: "Dolu",
  GSY: "Gökgürültülü Sağanak Yağışlı",
  KGSY: "Kuvvetli Gökgürültülü Sağanak Yağışlı",
  SIS: "Sisli",
  PUS: "Puslu",
  DMN: "Dumanlı",
  KF: "Toz veya Kum Fırtınası",
  R: "Rüzgarlı",
  GKR: "Güneyli Kuvvetli Rüzgar",
  KKR: "Kuzeyli Kuvvetli Rüzgar",
  SCK: "Sıcak",
  SGK: "Soğuk",
  HHY: "Yağışlı",
};

export const hadiseAdi = (kod: string | null | undefined): string =>
  kod ? (HADISE[kod] ?? kod) : "—";
