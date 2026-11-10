import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { eslesir } from "../../core/metin.js";
import { sinirla, sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

const ortak = {
  kategori: "sehir",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [] as string[],
  ttlSaniye: 60,
} satisfies Partial<SourceMeta>;

export const trafikMeta: SourceMeta = {
  ...ortak,
  id: "ibb-trafik",
  ad: "İBB Trafik Endeksi",
  resmiUrl: "https://uym.ibb.gov.tr",
  aciklama:
    "İstanbul'un anlık trafik yoğunluk endeksi (0–100): genel, Anadolu yakası ve Avrupa yakası.",
  ucNoktalar: ["GET https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont"],
  kutuphaneOrnegi: `import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getTrafficIndex(); // { genel, anadolu, avrupa }`,
};

export const isparkMeta: SourceMeta = {
  ...ortak,
  id: "ispark",
  ad: "İSPARK Otopark Doluluk",
  resmiUrl: "https://ispark.istanbul",
  aciklama:
    "İSPARK otoparklarının anlık boş/toplam kapasitesi, türü, çalışma saatleri, ücretsiz süre ve konumu.",
  ucNoktalar: ["GET https://api.ibb.gov.tr/ispark/Park"],
  kutuphaneOrnegi: `import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getParking({ ilce: "Kadıköy" });`,
};

export async function getTrafficIndex(): Promise<
  Sonuc<{ genel: number; anadolu: number; avrupa: number }>
> {
  const url = "https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont";
  const h = await cached(url, trafikMeta.ttlSaniye, () =>
    fetchJson<{ TI?: number; TI_An?: number; TI_Av?: number }>(url, { sourceId: trafikMeta.id }),
  );
  if (typeof h?.TI !== "number") {
    throw new KaynakHatasi(trafikMeta.id, "ayristirma", "İBB trafik endeksi alınamadı.");
  }
  return sonuc(trafikMeta, url, { genel: h.TI, anadolu: h.TI_An ?? 0, avrupa: h.TI_Av ?? 0 });
}

export interface Otopark {
  id: number;
  ad: string;
  ilce: string;
  kapasite: number;
  bos: number;
  tur: string;
  calismaSaatleri: string;
  acik: boolean;
  ucretsizDakika: number;
  enlem: number;
  boylam: number;
}

interface HamPark {
  parkID: number;
  parkName: string;
  lat: string;
  lng: string;
  capacity: number;
  emptyCapacity: number;
  workHours: string;
  parkType: string;
  freeTime: number;
  district: string;
  isOpen: number;
}

export async function getParking(
  o: { ilce?: string; limit?: number; sadeceAcik?: boolean } = {},
): Promise<Sonuc<Otopark[]>> {
  const url = "https://api.ibb.gov.tr/ispark/Park";
  const ham = await cached(url, isparkMeta.ttlSaniye, () =>
    fetchJson<HamPark[]>(url, { sourceId: isparkMeta.id }),
  );
  if (!Array.isArray(ham))
    throw new KaynakHatasi(isparkMeta.id, "ayristirma", "İSPARK listesi alınamadı.");
  const veri = ham
    .map(
      (p): Otopark => ({
        id: p.parkID,
        ad: p.parkName,
        ilce: p.district,
        kapasite: p.capacity,
        bos: p.emptyCapacity,
        tur: p.parkType,
        calismaSaatleri: p.workHours,
        acik: p.isOpen === 1,
        ucretsizDakika: p.freeTime,
        enlem: Number(p.lat),
        boylam: Number(p.lng),
      }),
    )
    .filter((p) => ((o.sadeceAcik ?? true) ? p.acik : true))
    .filter((p) => !o.ilce || eslesir(p.ilce, o.ilce))
    .sort((a, b) => b.bos - a.bos);
  return sonuc(isparkMeta, url, sinirla(veri, o.limit));
}
