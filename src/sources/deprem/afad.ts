import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { eslesir } from "../../core/metin.js";
import { sonuc } from "../../core/sonuc.js";
import { istanbulIso } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { type Deprem, type DepremListesi, type DepremSorgusu, listele } from "./tipler.js";

export const meta: SourceMeta = {
  id: "afad",
  kisaAd: "AFAD",
  ad: "AFAD Deprem Dairesi",
  kategori: "deprem",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://deprem.afad.gov.tr",
  aciklama:
    "Afet ve Acil Durum Yönetimi Başkanlığı'nın deprem kataloğu: büyüklük, derinlik, koordinat, il/ilçe. Zaman aralığı, en küçük büyüklük ve il filtresi.",
  ttlSaniye: 30,
  ucNoktalar: [
    "GET https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=…&end=…&minmag=…&orderby=timedesc&limit=…  (zamanlar UTC)",
  ],
  kutuphaneOrnegi: `import { afad } from "turkiye-mcp";

const { veri } = await afad.getEarthquakes({ saat: 24, minBuyukluk: 3 });
console.log(veri[0]?.yer, veri[0]?.buyukluk);`,
};

interface Ham {
  eventID: string;
  location: string;
  latitude: string;
  longitude: string;
  depth: string;
  type: string;
  magnitude: string;
  province: string | null;
  date: string;
}

const AFAD_SINIRI = 1000;

/** Saniyeleri atılmış UTC zaman, "YYYY-MM-DDTHH:mm:00" */
const utcDakika = (d: Date) => `${d.toISOString().slice(0, 16)}:00`;

export async function getEarthquakes(o: DepremSorgusu = {}): Promise<Sonuc<DepremListesi>> {
  const saat = o.saat ?? 24;
  const bitis = new Date();
  const baslangic = new Date(bitis.getTime() - saat * 3_600_000);
  const params = new URLSearchParams({
    start: utcDakika(baslangic),
    end: utcDakika(bitis),
    minmag: String(o.minBuyukluk ?? 0),
    orderby: "timedesc",
    limit: String(AFAD_SINIRI),
  });
  const url = `https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?${params}`;
  const ham = await cached(url, meta.ttlSaniye, () => fetchJson<Ham[]>(url, { sourceId: meta.id }));
  if (!Array.isArray(ham))
    throw new KaynakHatasi(meta.id, "ayristirma", "AFAD yanıtı beklenen biçimde değil.");
  let veri = ham.map(
    (d): Deprem => ({
      id: `afad-${d.eventID}`,
      // AFAD "date" alanı UTC'dir (aynı depremler Kandilli'de +3 saat görünür).
      tarih: istanbulIso(new Date(`${d.date}Z`)),
      buyukluk: Number(d.magnitude),
      tip: d.type,
      derinlikKm: Number(d.depth),
      enlem: Number(d.latitude),
      boylam: Number(d.longitude),
      yer: d.location,
      il: d.province || null,
      kaynak: "afad",
    }),
  );
  if (o.minBuyukluk) veri = veri.filter((d) => d.buyukluk >= (o.minBuyukluk ?? 0));
  if (o.il) veri = veri.filter((d) => d.il !== null && eslesir(d.il, o.il as string));
  const not =
    ham.length >= AFAD_SINIRI
      ? `AFAD sorgusu ${AFAD_SINIRI} kayıt sınırına ulaştı; daha eski depremler eksik olabilir. minBuyukluk'u artırın veya süreyi kısaltın.`
      : undefined;
  return sonuc(meta, url, listele(veri, o.limit), not);
}
