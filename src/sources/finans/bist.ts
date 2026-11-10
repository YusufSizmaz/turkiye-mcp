import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchText } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import { kodBuyuk } from "./kap.js";

export const meta: SourceMeta = {
  id: "bist-endeks",
  kisaAd: "Borsa İstanbul",
  ad: "Borsa İstanbul — Endeks Bileşenleri",
  kategori: "finans",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.borsaistanbul.com/tr/endeksler",
  aciklama:
    "Borsa İstanbul'un yayımladığı güncel endeks bileşenleri: BIST 30, BIST 100, banka, sanayi, katılım… 80'den fazla endeks ve hangi hissenin hangi endekste olduğu.",
  ttlSaniye: 86_400,
  ucNoktalar: [
    "GET https://www.borsaistanbul.com/datum/hisse_endeks_ds.csv   (noktalı virgüllü CSV)",
  ],
  kutuphaneOrnegi: `import { bist } from "turkiye-mcp";

const { veri } = await bist.getIndex({ endeks: "XU030" });   // BIST 30 hisseleri
const endeksler = await bist.getStockIndices("ASELS");        // ASELS hangi endekslerde?`,
};

const URL_ = "https://www.borsaistanbul.com/datum/hisse_endeks_ds.csv";

interface Satir {
  hisse: string;
  hisseAd: string;
  endeks: string;
  endeksAd: string;
  tarih: string;
}

async function satirlar(): Promise<Satir[]> {
  return cached("bist:endeks", meta.ttlSaniye, async () => {
    const metin = await fetchText(URL_, { sourceId: meta.id, browserUA: true });
    const out: Satir[] = [];
    for (const l of metin.split(/\r?\n/).slice(2)) {
      const [kod, ad, endeks, endeksAd, , tarih] = l.split(";");
      if (!kod || !endeks || !tarih) continue;
      const [g, a, y] = tarih.trim().split("/");
      out.push({
        hisse: kod.replace(/\.E$/, "").trim(),
        hisseAd: (ad ?? "").trim(),
        endeks: endeks.trim(),
        endeksAd: (endeksAd ?? "").trim(),
        tarih: `${y}-${a}-${g}`,
      });
    }
    if (!out.length)
      throw new KaynakHatasi(
        meta.id,
        "ayristirma",
        "Borsa İstanbul endeks dosyası ayrıştırılamadı.",
      );
    return out;
  });
}

export interface EndeksBilgisi {
  endeks: { kod: string; ad: string };
  tarih: string;
  hisseler: Array<{ kod: string; ad: string }>;
}

export async function getIndex(o: { endeks: string }): Promise<Sonuc<EndeksBilgisi>> {
  const kod = kodBuyuk(o.endeks.trim());
  const tum = await satirlar();
  const s = tum.filter((x) => x.endeks === kod);
  const ilk = s[0];
  if (!ilk) {
    const ornek = [...new Set(tum.map((x) => x.endeks))].slice(0, 15).join(", ");
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `"${kod}" endeksi bulunamadı. Örnekler: ${ornek}…`,
    );
  }
  return sonuc(meta, URL_, {
    endeks: { kod, ad: ilk.endeksAd },
    tarih: ilk.tarih,
    hisseler: s.map((x) => ({ kod: x.hisse, ad: x.hisseAd })),
  });
}

export async function getStockIndices(
  hisse: string,
): Promise<Sonuc<Array<{ kod: string; ad: string }>>> {
  const kod = kodBuyuk(hisse.trim()).replace(/\.E$/, "");
  const s = (await satirlar()).filter((x) => x.hisse === kod);
  if (!s.length)
    throw new KaynakHatasi(meta.id, "bulunamadi", `${kod} hiçbir BIST endeksinde bulunamadı.`);
  return sonuc(
    meta,
    URL_,
    s.map((x) => ({ kod: x.endeks, ad: x.endeksAd })),
  );
}

export const araclar = [
  defineTool({
    name: "finans_get_bist_index",
    title: "BIST endeks bileşenleri",
    description:
      "Borsa Istanbul index constituents (endeks bileşenleri: BIST 30/XU030, BIST 100/XU100, XBANK…) or, given a ticker, which indices that stock belongs to.",
    inputSchema: z.object({
      endeks: z.string().optional().describe('Endeks kodu, ör. "XU030", "XU100", "XBANK"'),
      hisse: z
        .string()
        .optional()
        .describe('Hisse kodu verilirse dahil olduğu endeksler, ör. "ASELS"'),
    }),
    sources: [meta],
    ornekSorular: ["BIST 30'da hangi hisseler var?", "ASELS hangi endekslerde?"],
    run: ({ endeks, hisse }) =>
      hisse ? getStockIndices(hisse) : getIndex({ endeks: endeks ?? "XU030" }),
    ozet(s: Sonuc<EndeksBilgisi | Array<{ kod: string; ad: string }>>) {
      if (Array.isArray(s.veri))
        return `${s.veri.length} endeks: ${s.veri.map((e) => `${e.kod} (${e.ad})`).join(", ")}`;
      const v = s.veri;
      return `${v.endeks.ad} (${v.endeks.kod}) — ${v.hisseler.length} hisse:\n${v.hisseler.map((h) => `${h.kod} ${h.ad}`).join(" · ")}`;
    },
  }),
];
