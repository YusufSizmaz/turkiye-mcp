import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trSayi, trZaman } from "../../core/format.js";
import { fetchJson } from "../../core/http.js";
import { tarihSema } from "../../core/sema.js";
import { sonuc } from "../../core/sonuc.js";
import { bugunTr, gunEkle, trTarihParcalari } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import { kodBuyuk } from "./kap.js";

export const meta: SourceMeta = {
  id: "isyatirim",
  ad: "İş Yatırım — BIST hisse geçmişi",
  kategori: "finans",
  rozet: "topluluk",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/default.aspx",
  aciklama:
    "Borsa İstanbul hisselerinin günlük kapanış, en düşük/en yüksek, ağırlıklı ortalama fiyat, işlem hacmi ve piyasa değeri. İş Yatırım'ın web sitesinin kullandığı veri servisi; gün sonu verisidir, anlık değildir.",
  ttlSaniye: 300,
  ucNoktalar: [
    "GET https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=THYAO&startdate=DD-MM-YYYY&enddate=DD-MM-YYYY",
  ],
  kutuphaneOrnegi: `import { isyatirim } from "turkiye-mcp";

const { veri } = await isyatirim.getStockHistory({ hisse: "THYAO", baslangic: "2026-10-01", bitis: "2026-11-10" });
console.log(veri.at(-1)?.kapanis);`,
};

export interface HisseGunu {
  tarih: string;
  kapanis: number;
  min: number;
  max: number;
  ortalama: number;
  hacimTl: number;
  piyasaDegeriTl: number | null;
}

const tireli = (iso: string) => {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return `${gun}-${ay}-${yil}`;
};

export async function getStockHistory(o: {
  hisse: string;
  baslangic: string;
  bitis: string;
}): Promise<Sonuc<HisseGunu[]>> {
  const hisse = kodBuyuk(o.hisse.trim());
  const url = `https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=${encodeURIComponent(hisse)}&startdate=${tireli(o.baslangic)}&enddate=${tireli(o.bitis)}`;
  const ham = await cached(url, meta.ttlSaniye, () =>
    fetchJson<{ ok: boolean; value?: Array<Record<string, number | string>> }>(url, {
      sourceId: meta.id,
      browserUA: true,
    }),
  );
  if (!ham?.ok || !Array.isArray(ham.value) || !ham.value.length) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${hisse} için bu tarih aralığında veri bulunamadı.`,
    );
  }
  const veri = ham.value.map((r): HisseGunu => {
    const [g, a, y] = String(r.HGDG_TARIH).split("-");
    return {
      tarih: `${y}-${a}-${g}`,
      kapanis: Number(r.HGDG_KAPANIS),
      min: Number(r.HGDG_MIN),
      max: Number(r.HGDG_MAX),
      ortalama: Number(r.HGDG_AOF),
      hacimTl: Number(r.HGDG_HACIM),
      piyasaDegeriTl: r.PD === undefined ? null : Number(r.PD),
    };
  });
  return sonuc(meta, url, veri);
}

export const araclar = [
  defineTool({
    name: "finans_get_stock_history",
    title: "BIST hisse fiyat geçmişi",
    description:
      "Daily end-of-day price history for a Borsa Istanbul stock (hisse, BIST): close, low, high, weighted average, volume, market cap. Default last 30 days.",
    inputSchema: z.object({
      hisse: z.string().min(2).describe("Hisse kodu, ör. THYAO, ASELS"),
      baslangic: tarihSema.optional().describe("Başlangıç (YYYY-MM-DD). Boşsa 30 gün önce."),
      bitis: tarihSema.optional().describe("Bitiş (YYYY-MM-DD). Boşsa bugün."),
    }),
    sources: [meta],
    ornekSorular: ["THYAO son bir ayda nasıl gitti?", "ASELS'in dünkü kapanışı neydi?"],
    run({ hisse, baslangic, bitis }) {
      const son = bitis ?? bugunTr();
      return getStockHistory({ hisse, baslangic: baslangic ?? gunEkle(son, -30), bitis: son });
    },
    ozet(s: Sonuc<HisseGunu[]>) {
      const v = s.veri;
      const ilk = v[0];
      const son = v.at(-1);
      if (!ilk || !son) return "Veri yok.";
      const degisim = ((son.kapanis - ilk.kapanis) / ilk.kapanis) * 100;
      const enDusuk = Math.min(...v.map((g) => g.min));
      const enYuksek = Math.max(...v.map((g) => g.max));
      return `${trZaman(ilk.tarih)} → ${trZaman(son.tarih)} (${v.length} işlem günü)\nSon kapanış: ${trSayi(son.kapanis, 2)} TL · Dönem değişimi: ${degisim >= 0 ? "+" : ""}${trSayi(degisim, 2)}%\nDönem en düşük/en yüksek: ${trSayi(enDusuk, 2)} / ${trSayi(enYuksek, 2)} TL`;
    },
  }),
];
