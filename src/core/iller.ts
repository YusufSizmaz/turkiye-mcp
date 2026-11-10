import { KaynakHatasi } from "./errors.js";
import { eslesir } from "./metin.js";

export interface Il {
  plaka: number;
  ad: string;
}

export const ILLER: Il[] = [
  { plaka: 1, ad: "Adana" },
  { plaka: 2, ad: "Adıyaman" },
  { plaka: 3, ad: "Afyonkarahisar" },
  { plaka: 4, ad: "Ağrı" },
  { plaka: 5, ad: "Amasya" },
  { plaka: 6, ad: "Ankara" },
  { plaka: 7, ad: "Antalya" },
  { plaka: 8, ad: "Artvin" },
  { plaka: 9, ad: "Aydın" },
  { plaka: 10, ad: "Balıkesir" },
  { plaka: 11, ad: "Bilecik" },
  { plaka: 12, ad: "Bingöl" },
  { plaka: 13, ad: "Bitlis" },
  { plaka: 14, ad: "Bolu" },
  { plaka: 15, ad: "Burdur" },
  { plaka: 16, ad: "Bursa" },
  { plaka: 17, ad: "Çanakkale" },
  { plaka: 18, ad: "Çankırı" },
  { plaka: 19, ad: "Çorum" },
  { plaka: 20, ad: "Denizli" },
  { plaka: 21, ad: "Diyarbakır" },
  { plaka: 22, ad: "Edirne" },
  { plaka: 23, ad: "Elazığ" },
  { plaka: 24, ad: "Erzincan" },
  { plaka: 25, ad: "Erzurum" },
  { plaka: 26, ad: "Eskişehir" },
  { plaka: 27, ad: "Gaziantep" },
  { plaka: 28, ad: "Giresun" },
  { plaka: 29, ad: "Gümüşhane" },
  { plaka: 30, ad: "Hakkari" },
  { plaka: 31, ad: "Hatay" },
  { plaka: 32, ad: "Isparta" },
  { plaka: 33, ad: "Mersin" },
  { plaka: 34, ad: "İstanbul" },
  { plaka: 35, ad: "İzmir" },
  { plaka: 36, ad: "Kars" },
  { plaka: 37, ad: "Kastamonu" },
  { plaka: 38, ad: "Kayseri" },
  { plaka: 39, ad: "Kırklareli" },
  { plaka: 40, ad: "Kırşehir" },
  { plaka: 41, ad: "Kocaeli" },
  { plaka: 42, ad: "Konya" },
  { plaka: 43, ad: "Kütahya" },
  { plaka: 44, ad: "Malatya" },
  { plaka: 45, ad: "Manisa" },
  { plaka: 46, ad: "Kahramanmaraş" },
  { plaka: 47, ad: "Mardin" },
  { plaka: 48, ad: "Muğla" },
  { plaka: 49, ad: "Muş" },
  { plaka: 50, ad: "Nevşehir" },
  { plaka: 51, ad: "Niğde" },
  { plaka: 52, ad: "Ordu" },
  { plaka: 53, ad: "Rize" },
  { plaka: 54, ad: "Sakarya" },
  { plaka: 55, ad: "Samsun" },
  { plaka: 56, ad: "Siirt" },
  { plaka: 57, ad: "Sinop" },
  { plaka: 58, ad: "Sivas" },
  { plaka: 59, ad: "Tekirdağ" },
  { plaka: 60, ad: "Tokat" },
  { plaka: 61, ad: "Trabzon" },
  { plaka: 62, ad: "Tunceli" },
  { plaka: 63, ad: "Şanlıurfa" },
  { plaka: 64, ad: "Uşak" },
  { plaka: 65, ad: "Van" },
  { plaka: 66, ad: "Yozgat" },
  { plaka: 67, ad: "Zonguldak" },
  { plaka: 68, ad: "Aksaray" },
  { plaka: 69, ad: "Bayburt" },
  { plaka: 70, ad: "Karaman" },
  { plaka: 71, ad: "Kırıkkale" },
  { plaka: 72, ad: "Batman" },
  { plaka: 73, ad: "Şırnak" },
  { plaka: 74, ad: "Bartın" },
  { plaka: 75, ad: "Ardahan" },
  { plaka: 76, ad: "Iğdır" },
  { plaka: 77, ad: "Yalova" },
  { plaka: 78, ad: "Karabük" },
  { plaka: 79, ad: "Kilis" },
  { plaka: 80, ad: "Osmaniye" },
  { plaka: 81, ad: "Düzce" },
];

/** "istanbul", "İSTANBUL", "34", 34 → { plaka: 34, ad: "İstanbul" } */
export function ilBul(girdi: string | number): Il | undefined {
  const s = String(girdi).trim();
  if (/^\d{1,2}$/.test(s)) return ILLER.find((i) => i.plaka === Number(s));
  const ad =
    s === "Afyon" || eslesir(s, "afyon")
      ? "Afyonkarahisar"
      : s === "Maraş" || eslesir(s, "maras")
        ? "Kahramanmaraş"
        : s === "Urfa" || eslesir(s, "urfa")
          ? "Şanlıurfa"
          : s;
  return ILLER.find((i) => eslesir(i.ad, ad));
}

export function ilBulVeyaHata(girdi: string | number, sourceId: string): Il {
  const il = ilBul(girdi);
  if (!il) throw new KaynakHatasi(sourceId, "bulunamadi", `"${girdi}" adında bir il bulunamadı.`);
  return il;
}
