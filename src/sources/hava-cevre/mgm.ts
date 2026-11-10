import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { ilBulVeyaHata } from "../../core/iller.js";
import { eslesir } from "../../core/metin.js";
import { sonuc } from "../../core/sonuc.js";
import { istanbulIso } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { hadiseAdi } from "./hadise.js";

export const meta: SourceMeta = {
  id: "mgm",
  ad: "Meteoroloji Genel Müdürlüğü (MGM)",
  kategori: "hava-cevre",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.mgm.gov.tr",
  aciklama:
    "MGM'nin il/ilçe bazında anlık gözlemleri (sıcaklık, hissedilen, nem, rüzgâr, basınç, yağış), 5 günlük ve 3 saatlik tahminleri. mgm.gov.tr'nin kullandığı servis; Origin başlığı gerektirir.",
  ttlSaniye: 600,
  ucNoktalar: [
    "GET https://servis.mgm.gov.tr/web/merkezler?il={İl}            (Origin: https://www.mgm.gov.tr)",
    "GET https://servis.mgm.gov.tr/web/merkezler/ililcesi?il={İl}",
    "GET https://servis.mgm.gov.tr/web/sondurumlar?merkezid={merkezId}",
    "GET https://servis.mgm.gov.tr/web/tahminler/gunluk?istno={gunlukTahminIstNo}",
    "GET https://servis.mgm.gov.tr/web/tahminler/saatlik?istno={saatlikTahminIstNo}",
  ],
  kutuphaneOrnegi: `import { mgm } from "turkiye-mcp";

const simdi = await mgm.getCurrent("İstanbul", "Kadıköy");
const tahmin = await mgm.getForecast("ankara");               // 5 günlük
const saatlik = await mgm.getForecast("izmir", undefined, "saatlik");`,
};

const TABAN = "https://servis.mgm.gov.tr/web";
const ISTEK = { sourceId: meta.id, headers: { Origin: "https://www.mgm.gov.tr" } } as const;
const yok = (v: unknown): number | null => (typeof v !== "number" || v === -9999 ? null : v);

export interface Istasyon {
  merkezId: number;
  sondurumIstNo: number;
  gunlukTahminIstNo: number;
  saatlikTahminIstNo: number;
  il: string;
  ilce: string;
  enlem: number;
  boylam: number;
}

interface HamMerkez {
  merkezId: number;
  sondurumIstNo: number;
  gunlukTahminIstNo: number;
  saatlikTahminIstNo: number;
  il: string;
  ilce: string;
  enlem: number;
  boylam: number;
}

const istasyon = (m: HamMerkez): Istasyon => ({
  merkezId: m.merkezId,
  sondurumIstNo: m.sondurumIstNo,
  gunlukTahminIstNo: m.gunlukTahminIstNo,
  saatlikTahminIstNo: m.saatlikTahminIstNo,
  il: m.il,
  ilce: m.ilce,
  enlem: m.enlem,
  boylam: m.boylam,
});

export async function findStation(il: string, ilce?: string): Promise<Istasyon> {
  const ilAd = ilBulVeyaHata(il, meta.id).ad;
  if (!ilce) {
    const url = `${TABAN}/merkezler?il=${encodeURIComponent(ilAd)}`;
    const liste = await cached(url, 86_400, () => fetchJson<HamMerkez[]>(url, ISTEK));
    const m = Array.isArray(liste) ? liste[0] : undefined;
    if (!m) throw new KaynakHatasi(meta.id, "bulunamadi", `${ilAd} için MGM istasyonu bulunamadı.`);
    return istasyon(m);
  }
  const url = `${TABAN}/merkezler/ililcesi?il=${encodeURIComponent(ilAd)}`;
  const liste = await cached(url, 86_400, () => fetchJson<HamMerkez[]>(url, ISTEK));
  const m = Array.isArray(liste) ? liste.find((x) => eslesir(x.ilce, ilce)) : undefined;
  if (!m)
    throw new KaynakHatasi(meta.id, "bulunamadi", `${ilAd} ilinde "${ilce}" ilçesi bulunamadı.`);
  return istasyon(m);
}

export interface AnlikHava {
  yer: string;
  zaman: string;
  sicaklik: number | null;
  hissedilen: number | null;
  nem: number | null;
  ruzgarKmh: number | null;
  ruzgarYon: number | null;
  basinc: number | null;
  yagis24SaatMm: number | null;
  karYuksekligiCm: number | null;
  hadiseKodu: string;
  hadise: string;
}

export async function getCurrent(il: string, ilce?: string): Promise<Sonuc<AnlikHava>> {
  const ist = await findStation(il, ilce);
  const url = `${TABAN}/sondurumlar?merkezid=${ist.merkezId}`;
  const ham = await cached(url, meta.ttlSaniye, () =>
    fetchJson<Array<Record<string, unknown>>>(url, ISTEK),
  );
  const d = Array.isArray(ham) ? ham[0] : undefined;
  if (!d)
    throw new KaynakHatasi(meta.id, "bulunamadi", `${ist.il} / ${ist.ilce} için anlık gözlem yok.`);
  const kod = String(d.hadiseKodu ?? "");
  return sonuc(meta, url, {
    yer: `${ist.il} / ${ist.ilce}`,
    zaman: istanbulIso(new Date(String(d.veriZamani))),
    sicaklik: yok(d.sicaklik),
    hissedilen: yok(d.hissedilenSicaklik),
    nem: yok(d.nem),
    ruzgarKmh: yok(d.ruzgarHiz) === null ? null : Math.round((d.ruzgarHiz as number) * 10) / 10,
    ruzgarYon: yok(d.ruzgarYon),
    basinc: yok(d.denizeIndirgenmisBasinc),
    yagis24SaatMm: yok(d.yagis24Saat),
    karYuksekligiCm: yok(d.karYukseklik),
    hadiseKodu: kod,
    hadise: hadiseAdi(kod),
  });
}

export interface TahminGunu {
  tarih: string;
  enDusuk?: number | null;
  enYuksek?: number | null;
  sicaklik?: number | null;
  hissedilen?: number | null;
  nem?: number | null;
  ruzgarKmh: number | null;
  hadiseKodu: string;
  hadise: string;
}

export async function getForecast(
  il: string,
  ilce?: string,
  tur: "gunluk" | "saatlik" = "gunluk",
): Promise<Sonuc<TahminGunu[]>> {
  const ist = await findStation(il, ilce);
  const istno = tur === "gunluk" ? ist.gunlukTahminIstNo : ist.saatlikTahminIstNo;
  const url = `${TABAN}/tahminler/${tur}?istno=${istno}`;
  const ham = await cached(url, meta.ttlSaniye, () =>
    fetchJson<Array<Record<string, unknown>>>(url, ISTEK),
  );
  const d = Array.isArray(ham) ? ham[0] : undefined;
  if (!d) throw new KaynakHatasi(meta.id, "bulunamadi", `${ist.il} / ${ist.ilce} için tahmin yok.`);
  if (tur === "gunluk") {
    const gunler: TahminGunu[] = [];
    for (let i = 1; i <= 5; i++) {
      const tarih = d[`tarihGun${i}`];
      if (typeof tarih !== "string") continue;
      const kod = String(d[`hadiseGun${i}`] ?? "");
      gunler.push({
        tarih: tarih.slice(0, 10),
        enDusuk: yok(d[`enDusukGun${i}`]),
        enYuksek: yok(d[`enYuksekGun${i}`]),
        hadiseKodu: kod,
        hadise: hadiseAdi(kod),
        ruzgarKmh: yok(d[`ruzgarHizGun${i}`]),
      });
    }
    return sonuc(meta, url, gunler);
  }
  const tahmin = Array.isArray(d.tahmin) ? (d.tahmin as Array<Record<string, unknown>>) : [];
  return sonuc(
    meta,
    url,
    tahmin.map((t) => {
      const kod = String(t.hadise ?? "");
      return {
        tarih: istanbulIso(new Date(String(t.tarih))),
        sicaklik: yok(t.sicaklik),
        hissedilen: yok(t.hissedilenSicaklik),
        nem: yok(t.nem),
        ruzgarKmh: yok(t.ruzgarHizi),
        hadiseKodu: kod,
        hadise: hadiseAdi(kod),
      };
    }),
  );
}
