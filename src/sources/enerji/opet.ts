import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { ilBulVeyaHata } from "../../core/iller.js";
import { eslesir } from "../../core/metin.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export const meta: SourceMeta = {
  id: "opet",
  ad: "Opet Akaryakıt Fiyatları",
  kategori: "enerji",
  rozet: "birinci-taraf",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.opet.com.tr/akaryakit-fiyatlari",
  aciklama:
    "Opet'in il/ilçe bazında güncel pompa fiyatları: benzin, motorin, LPG, gazyağı. İstanbul Anadolu ve Avrupa yakaları birleşik verilir.",
  ttlSaniye: 3600,
  ucNoktalar: [
    "GET https://api.opet.com.tr/api/fuelprices/provinces",
    "GET https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode={plaka}   (İstanbul: 34 Anadolu + 934 Avrupa)",
  ],
  kutuphaneOrnegi: `import { opet } from "turkiye-mcp";

const { veri } = await opet.getFuelPrices({ il: "İstanbul", ilce: "Kadıköy" });
console.log(veri.ilceler[0]?.urunler);`,
};

export interface IlceFiyat {
  il: string;
  ilce: string;
  urunler: Array<{ ad: string; fiyat: number }>;
}

interface Ham {
  provinceName: string;
  districtName: string;
  prices: Array<{ productName: string; amount: number }>;
}

const VARSAYILAN_ILCE = 10;

export async function getFuelPrices(o: {
  il: string | number;
  ilce?: string;
}): Promise<Sonuc<{ ilceler: IlceFiyat[]; toplamIlce: number }>> {
  const il = ilBulVeyaHata(o.il, meta.id);
  const kodlar = il.plaka === 34 ? [34, 934] : [il.plaka];
  const urller = kodlar.map(
    (k) => `https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode=${k}`,
  );
  const listeler = await Promise.all(
    urller.map((u) =>
      cached(u, meta.ttlSaniye, () => fetchJson<Ham[]>(u, { sourceId: meta.id, browserUA: true })),
    ),
  );
  const tum = listeler.flat();
  if (!tum.length || !Array.isArray(listeler[0])) {
    throw new KaynakHatasi(meta.id, "bulunamadi", `${il.ad} için Opet fiyatı bulunamadı.`);
  }
  const ilceler = tum
    .filter((d) => !o.ilce || eslesir(d.districtName, o.ilce))
    .map((d) => ({
      il: d.provinceName,
      ilce: d.districtName,
      urunler: d.prices.map((p) => ({ ad: p.productName, fiyat: p.amount })),
    }));
  if (o.ilce && !ilceler.length) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${il.ad} ilinde "${o.ilce}" ilçesi için fiyat bulunamadı.`,
    );
  }
  const kisa = o.ilce ? ilceler : ilceler.slice(0, VARSAYILAN_ILCE);
  const not =
    !o.ilce && ilceler.length > VARSAYILAN_ILCE
      ? `${ilceler.length} ilçeden ilk ${VARSAYILAN_ILCE} tanesi gösterildi; belirli bir ilçe için ilçe adını verin.`
      : undefined;
  return sonuc(meta, urller[0] as string, { ilceler: kisa, toplamIlce: ilceler.length }, not);
}
