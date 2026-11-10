import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import { bugunTr, gunAdi } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export const meta: SourceMeta = {
  id: "nager-tatiller",
  ad: "Nager.Date — Resmî Tatiller",
  kategori: "takvim",
  rozet: "topluluk",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://date.nager.at",
  aciklama:
    "Türkiye'nin resmî tatilleri ve dinî bayramlar (Ramazan ve Kurban Bayramı günleri dahil), yıl bazında.",
  ttlSaniye: 86_400,
  ucNoktalar: ["GET https://date.nager.at/api/v3/PublicHolidays/{yıl}/TR"],
  kutuphaneOrnegi: `import { tatiller } from "turkiye-mcp";

const { veri } = await tatiller.getHolidays(2027);`,
};

export interface Tatil {
  tarih: string;
  ad: string;
  gun: string;
}

export async function getHolidays(yil?: number): Promise<Sonuc<Tatil[]>> {
  const y = yil ?? Number(bugunTr().slice(0, 4));
  const url = `https://date.nager.at/api/v3/PublicHolidays/${y}/TR`;
  const h = await cached(url, meta.ttlSaniye, () =>
    fetchJson<Array<{ date: string; localName: string }>>(url, { sourceId: meta.id }),
  );
  if (!Array.isArray(h)) throw new KaynakHatasi(meta.id, "ayristirma", "Tatil listesi alınamadı.");
  return sonuc(
    meta,
    url,
    h.map((t) => ({ tarih: t.date, ad: t.localName, gun: gunAdi(t.date) })),
  );
}
