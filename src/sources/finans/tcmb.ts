import { XMLParser } from "fast-xml-parser";
import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { sayiVeyaNull, trSayi, trZaman } from "../../core/format.js";
import { fetchText } from "../../core/http.js";
import { tarihSema } from "../../core/sema.js";
import { sonuc } from "../../core/sonuc.js";
import { gecerliIsoTarih, noktaliTarih, oncekiGun, trTarihParcalari } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "tcmb-kurlar",
  geoKisitli: true,
  ad: "TCMB Gösterge Niteliğindeki Döviz Kurları",
  kategori: "finans",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.tcmb.gov.tr/kurlar/kurlar_tr.html",
  aciklama:
    "Türkiye Cumhuriyet Merkez Bankası'nın her iş günü 15:30'da yayımladığı döviz alış/satış ve efektif kurları. Geçmiş tarihler desteklenir; tatil ve hafta sonunda önceki iş gününün bülteni döner.",
  ttlSaniye: 300,
  ucNoktalar: [
    "GET https://www.tcmb.gov.tr/kurlar/today.xml",
    "GET https://www.tcmb.gov.tr/kurlar/{YYYYMM}/{DDMMYYYY}.xml",
  ],
  kutuphaneOrnegi: `import { tcmb } from "turkiye-mcp";

const { veri } = await tcmb.getRates();                 // bugünün bülteni
const usd = veri.kurlar.find((k) => k.kod === "USD");
const gecmis = await tcmb.getRates({ tarih: "2026-01-02" });`,
};

export interface Kur {
  kod: string;
  ad: string;
  birim: number;
  dovizAlis: number | null;
  dovizSatis: number | null;
  efektifAlis: number | null;
  efektifSatis: number | null;
}

export interface KurBulteni {
  tarih: string;
  bultenNo: string;
  kurlar: Kur[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  parseTagValue: false,
  isArray: (name) => name === "Currency",
});

const HAM_DEGER = (v: unknown) => (typeof v === "string" ? v : "");

export function ayristir(xml: string): KurBulteni {
  // biome-ignore lint/suspicious/noExplicitAny: ham XML ağacı
  const kok = (parser.parse(xml) as any)?.Tarih_Date;
  if (!kok?.Currency)
    throw new KaynakHatasi(meta.id, "ayristirma", "TCMB kur bülteni ayrıştırılamadı.");
  const [g, a, y] = String(kok["@Tarih"]).split(".");
  return {
    tarih: `${y}-${a}-${g}`,
    bultenNo: String(kok["@Bulten_No"] ?? ""),
    // biome-ignore lint/suspicious/noExplicitAny: ham XML düğümü
    kurlar: kok.Currency.map((c: any) => ({
      kod: String(c["@Kod"]),
      ad: HAM_DEGER(c.Isim).trim(),
      birim: Number(c.Unit ?? 1),
      dovizAlis: sayiVeyaNull(c.ForexBuying),
      dovizSatis: sayiVeyaNull(c.ForexSelling),
      efektifAlis: sayiVeyaNull(c.BanknoteBuying),
      efektifSatis: sayiVeyaNull(c.BanknoteSelling),
    })),
  };
}

function arsivUrl(iso: string): string {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return `https://www.tcmb.gov.tr/kurlar/${yil}${ay}/${gun}${ay}${yil}.xml`;
}

const GERI_GIDIS = 7;

export async function getRates(opts: { tarih?: string } = {}): Promise<Sonuc<KurBulteni>> {
  const { tarih } = opts;
  if (tarih !== undefined && !gecerliIsoTarih(tarih)) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `Geçersiz tarih "${tarih}" (YYYY-MM-DD bekleniyor).`,
    );
  }
  if (!tarih) {
    const url = "https://www.tcmb.gov.tr/kurlar/today.xml";
    return cached(`tcmb:today`, meta.ttlSaniye, async () =>
      sonuc(meta, url, ayristir(await fetchText(url, { sourceId: meta.id }))),
    );
  }
  return cached(`tcmb:${tarih}`, meta.ttlSaniye, async () => {
    let gun = tarih;
    for (let i = 0; i < GERI_GIDIS; i++) {
      const url = arsivUrl(gun);
      try {
        const bulten = ayristir(await fetchText(url, { sourceId: meta.id }));
        const not =
          gun === tarih
            ? undefined
            : `${noktaliTarih(tarih)} için bülten yok (hafta sonu/tatil); ${noktaliTarih(gun)} bülteni döndürüldü.`;
        return sonuc(meta, url, bulten, not);
      } catch (e) {
        if (e instanceof KaynakHatasi && e.status === 404) {
          gun = oncekiGun(gun);
          continue;
        }
        throw e;
      }
    }
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${noktaliTarih(tarih)} ve önceki ${GERI_GIDIS - 1} gün için TCMB kur bülteni bulunamadı.`,
    );
  });
}

// ── MCP aracı ──────────────────────────────────────────────────────────────

const OZET_EN_FAZLA = 8;

export const araclar = [
  defineTool({
    name: "finans_get_exchange_rates",
    title: "TCMB döviz kurları",
    description:
      "Official Central Bank of Türkiye (TCMB) exchange rates (döviz kuru, dolar, euro, sterlin) for today or a past date. Returns forex and banknote buying/selling rates in TRY.",
    inputSchema: z.object({
      tarih: tarihSema.optional().describe("Geçmiş tarih (YYYY-MM-DD). Boşsa bugünün bülteni."),
      kodlar: z
        .array(z.string())
        .optional()
        .describe('Yalnız bu döviz kodları, ör. ["USD","EUR"]. Boşsa hepsi.'),
    }),
    sources: [meta],
    ornekSorular: ["Dolar ve euro bugün kaç TL?", "1 Ocak 2026'da TCMB sterlin satış kuru neydi?"],
    async run({ tarih, kodlar }) {
      const s = await getRates({ tarih });
      if (!kodlar?.length) return s;
      const istenen = new Set(kodlar.map((k) => k.toUpperCase()));
      return { ...s, veri: { ...s.veri, kurlar: s.veri.kurlar.filter((k) => istenen.has(k.kod)) } };
    },
    ozet(s: Sonuc<KurBulteni>) {
      const { tarih, bultenNo, kurlar } = s.veri;
      const satirlar = kurlar
        .slice(0, OZET_EN_FAZLA)
        .map(
          (k) =>
            `${k.kod} (${k.birim} ${k.ad}): alış ${trSayi(k.dovizAlis)} · satış ${trSayi(k.dovizSatis)}`,
        );
      const fazla =
        kurlar.length > OZET_EN_FAZLA ? `\n… ve ${kurlar.length - OZET_EN_FAZLA} kur daha` : "";
      return `TCMB kurları — ${trZaman(tarih)} (bülten ${bultenNo})\n${satirlar.join("\n")}${fazla}`;
    },
  }),
];
