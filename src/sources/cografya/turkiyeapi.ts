import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { ilBul, ilBulVeyaHata } from "../../core/iller.js";
import { basHarfBuyuk, eslesir } from "../../core/metin.js";
import { sinirla, sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export const meta: SourceMeta = {
  id: "turkiyeapi",
  ad: "TurkiyeAPI",
  kategori: "cografya",
  rozet: "topluluk",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://turkiyeapi.dev",
  aciklama:
    "Açık kaynak Türkiye idari bölümler API'si: 81 il, 973 ilçe ve mahalleler; nüfus, yüzölçümü, rakım, bölge, NUTS kodları, telefon kodu, koordinat.",
  ttlSaniye: 86_400,
  ucNoktalar: [
    "GET https://api.turkiyeapi.dev/v1/provinces?name={İl}",
    "GET https://api.turkiyeapi.dev/v1/neighborhoods?province={İl}&district={İlçe}&limit={n}",
  ],
  kutuphaneOrnegi: `import { turkiyeapi } from "turkiye-mcp";

const { veri } = await turkiyeapi.getProvinces({ ad: "Ankara" });
const ilceler = await turkiyeapi.getDistricts("İzmir");`,
};

const TABAN = "https://api.turkiyeapi.dev/v1";

export interface IlBilgisi {
  plaka: number;
  ad: string;
  nufus: number;
  alanKm2: number;
  rakim: number;
  bolge: string;
  buyuksehir: boolean;
  kiyi: boolean;
  telefonKodu: number[];
  enlem: number;
  boylam: number;
  ilceSayisi: number;
}

interface HamIl {
  id: number;
  name: string;
  population: number;
  area: number;
  altitude: number;
  areaCode: number[];
  isCoastal: boolean;
  isMetropolitan: boolean;
  region?: { tr?: string };
  coordinates?: { latitude: number; longitude: number };
  districts?: Array<{ id: number; name: string; population: number; area: number }>;
}

async function iller(ad?: string): Promise<{ url: string; data: HamIl[] }> {
  const url = ad ? `${TABAN}/provinces?name=${encodeURIComponent(ad)}` : `${TABAN}/provinces`;
  const h = await cached(url, meta.ttlSaniye, () =>
    fetchJson<{ status: string; data?: HamIl[] }>(url, { sourceId: meta.id }),
  );
  if (!Array.isArray(h?.data))
    throw new KaynakHatasi(meta.id, "ayristirma", "TurkiyeAPI yanıtı beklenen biçimde değil.");
  return { url, data: h.data };
}

export async function getProvinces(o: { ad?: string } = {}): Promise<Sonuc<IlBilgisi[]>> {
  const ad = o.ad ? (ilBul(o.ad)?.ad ?? basHarfBuyuk(o.ad)) : undefined;
  const { url, data } = await iller(ad);
  return sonuc(
    meta,
    url,
    data.map((i) => ({
      plaka: i.id,
      ad: i.name,
      nufus: i.population,
      alanKm2: i.area,
      rakim: i.altitude,
      bolge: i.region?.tr ?? "",
      buyuksehir: i.isMetropolitan,
      kiyi: i.isCoastal,
      telefonKodu: i.areaCode,
      enlem: i.coordinates?.latitude ?? 0,
      boylam: i.coordinates?.longitude ?? 0,
      ilceSayisi: i.districts?.length ?? 0,
    })),
  );
}

export interface IlceBilgisi {
  id: number;
  ad: string;
  nufus: number;
  alanKm2: number;
}

export async function getDistricts(il: string): Promise<Sonuc<IlceBilgisi[]>> {
  const ad = ilBulVeyaHata(il, meta.id).ad;
  const { url, data } = await iller(ad);
  const kayit = data[0];
  if (!kayit?.districts)
    throw new KaynakHatasi(meta.id, "bulunamadi", `${ad} için ilçe listesi bulunamadı.`);
  return sonuc(
    meta,
    url,
    kayit.districts
      .map((d) => ({ id: d.id, ad: d.name, nufus: d.population, alanKm2: d.area }))
      .sort((a, b) => b.nufus - a.nufus),
  );
}

export async function getNeighborhoods(o: {
  il: string;
  ilce: string;
  limit?: number;
}): Promise<Sonuc<Array<{ id: number; ad: string; nufus: number }>>> {
  const il = ilBulVeyaHata(o.il, meta.id).ad;
  const ilceler = (await getDistricts(il)).veri;
  const bulunan = ilceler.find((d) => eslesir(d.ad, o.ilce));
  if (!bulunan) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${il} ilinde "${o.ilce}" ilçesi bulunamadı. İlçeler: ${ilceler.map((d) => d.ad).join(", ")}`,
    );
  }
  const ilce = bulunan.ad;
  const url = `${TABAN}/neighborhoods?province=${encodeURIComponent(il)}&district=${encodeURIComponent(ilce)}&limit=1000`;
  const h = await cached(url, meta.ttlSaniye, () =>
    fetchJson<{ data?: Array<{ id: number; name: string; population: number }> }>(url, {
      sourceId: meta.id,
    }),
  );
  if (!Array.isArray(h?.data)) {
    throw new KaynakHatasi(
      meta.id,
      "ayristirma",
      "TurkiyeAPI mahalle yanıtı beklenen biçimde değil.",
    );
  }
  if (!h.data.length)
    throw new KaynakHatasi(meta.id, "bulunamadi", `${il} / ${ilce} için mahalle bulunamadı.`);
  return sonuc(
    meta,
    url,
    sinirla(
      h.data.map((m) => ({ id: m.id, ad: m.name, nufus: m.population })),
      o.limit,
    ),
  );
}
