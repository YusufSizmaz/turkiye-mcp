import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { ilBul } from "../../core/iller.js";
import { eslesir } from "../../core/metin.js";
import { sinirla, sonuc } from "../../core/sonuc.js";
import { istanbulIso } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export const meta: SourceMeta = {
  id: "hava-kalitesi",
  ad: "Ulusal Hava Kalitesi İzleme Ağı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı)",
  kategori: "hava-cevre",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://sim.csb.gov.tr/Services/AirQuality",
  aciklama:
    "Türkiye genelindeki ~335 istasyonun son saatlik hava kalitesi indeksi (HKİ), kategori (İyi/Orta/Hassas/Sağlıksız/Kötü/Tehlikeli) ve baskın kirletici (PM10, PM2.5, NO2, SO2, O3, CO).",
  ttlSaniye: 600,
  ucNoktalar: [
    "GET  https://sim.csb.gov.tr/Services/GetAirQualityStatus?type=0",
    'POST https://sim.csb.gov.tr/Services/GetAirQualityStations?type=0  {"Location":null,"Date":"DD.MM.YYYY HH:mm:ss"}',
  ],
  kutuphaneOrnegi: `import { havaKalitesi } from "turkiye-mcp";

const { veri } = await havaKalitesi.getAirQuality({ il: "Ankara" });
console.log(veri[0]?.istasyon, veri[0]?.indeks, veri[0]?.kategori);`,
};

const TABAN = "https://sim.csb.gov.tr/Services";

export interface IstasyonOlcumu {
  istasyon: string;
  il: string;
  ilce: string | null;
  indeks: number | null;
  kategori: string;
  baskinKirletici: string | null;
  degerler: Record<string, number | null>;
  zaman: string | null;
  enlem: number | null;
  boylam: number | null;
}

interface Kategori {
  Key: number;
  Value: string;
}

function trZamanDamgasi(): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}:${p.second}`;
}

const KIRLETICILER = ["PM10", "PM25", "NO2", "SO2", "O3", "CO"] as const;

export async function getAirQuality(
  o: { il?: string; limit?: number } = {},
): Promise<Sonuc<IstasyonOlcumu[]>> {
  const url = `${TABAN}/GetAirQualityStations?type=0`;
  const [kategoriler, istasyonlar] = await Promise.all([
    cached("hk:status", 86_400, () =>
      fetchJson<{ objects?: Kategori[] }>(`${TABAN}/GetAirQualityStatus?type=0`, {
        sourceId: meta.id,
      }),
    ),
    cached("hk:stations", meta.ttlSaniye, () =>
      fetchJson<{ result?: boolean; objects?: Array<Record<string, unknown>> }>(url, {
        sourceId: meta.id,
        method: "POST",
        json: { Location: null, Date: trZamanDamgasi() },
      }),
    ),
  ]);
  if (!Array.isArray(istasyonlar?.objects)) {
    throw new KaynakHatasi(meta.id, "ayristirma", "Hava kalitesi istasyon listesi alınamadı.");
  }
  const kat = new Map((kategoriler?.objects ?? []).map((k) => [k.Key, k.Value]));
  const ilAd = o.il ? (ilBul(o.il)?.ad ?? o.il) : null;
  const veri = istasyonlar.objects
    .filter((s) => !ilAd || eslesir(String(s.City_Title ?? ""), ilAd))
    .map((s): IstasyonOlcumu => {
      const v = (s.Values ?? {}) as Record<string, unknown>;
      const nokta = /POINT \(([-\d.]+) ([-\d.]+)\)/.exec(String(s.Location ?? ""));
      const indeks = typeof v.AQIIndex === "number" ? Math.round(v.AQIIndex) : null;
      return {
        istasyon: String(s.Name),
        il: String(s.City_Title),
        ilce: (s.Town_Title as string) || null,
        indeks,
        kategori: indeks === null ? "Ölçüm Yok" : (kat.get(Number(v.AQIStatus)) ?? "—"),
        baskinKirletici: (v.ContaminantParameter as string) || null,
        degerler: Object.fromEntries(
          KIRLETICILER.map((k) => [
            k === "PM25" ? "PM2.5" : k,
            typeof v[k] === "number" ? (v[k] as number) : null,
          ]),
        ),
        zaman: typeof v.Date === "string" ? istanbulIso(new Date(`${v.Date}+03:00`)) : null,
        enlem: nokta ? Number(nokta[2]) : null,
        boylam: nokta ? Number(nokta[1]) : null,
      };
    })
    .sort((a, b) => (b.indeks ?? -1) - (a.indeks ?? -1));
  return sonuc(meta, url, sinirla(veri, o.limit));
}
