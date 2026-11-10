import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trZaman } from "../../core/format.js";
import { fetchJson } from "../../core/http.js";
import { limitSema, tarihSema } from "../../core/sema.js";
import { sinirla, sonuc } from "../../core/sonuc.js";
import { bugunTr, noktaliTarih, trZamanToIso } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "kap",
  ad: "KAP — Kamuyu Aydınlatma Platformu",
  kategori: "finans",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.kap.org.tr",
  aciklama:
    "Borsa İstanbul şirketlerinin özel durum açıklamaları, finansal raporları ve diğer bildirimleri. Son bildirimler, tarih aralığı + hisse kodu filtresi ve şirket arama. (Sitenin kendi web arayüzünün kullandığı uç noktalar.)",
  ttlSaniye: 120,
  ucNoktalar: [
    "GET  https://www.kap.org.tr/tr/api/disclosure/list/light",
    'POST https://www.kap.org.tr/tr/api/disclosure/list/main  {"fromDate":"DD.MM.YYYY","toDate":"DD.MM.YYYY","memberTypes":["IGS"],"disclosureClass":""}',
    'POST https://www.kap.org.tr/tr/api/search/combined  {"keyword":"türk hava"}',
  ],
  kutuphaneOrnegi: `import { kap } from "turkiye-mcp";

const son = await kap.getLatestDisclosures({ limit: 10 });
const thy = await kap.getDisclosures({ baslangic: "2026-11-01", bitis: "2026-11-10", hisseKodu: "THYAO" });
const sirket = await kap.searchCompanies("türk hava");`,
};

const TABAN = "https://www.kap.org.tr/tr";
const ISTEK = {
  sourceId: meta.id,
  browserUA: true,
  headers: { Referer: `${TABAN}/bildirim-sorgu`, "Accept-Language": "tr" },
} as const;

export interface Bildirim {
  index: number;
  baslik: string;
  ozet: string | null;
  sirket: string;
  hisseKodu: string | null;
  ilgiliHisseler: string[];
  tarih: string;
  tur: string | null;
  url: string;
}

const bildirimUrl = (i: number) => `${TABAN}/Bildirim/${i}`;

/** "mıgrs" → "MIGRS", "isctr" → "ISCTR" (tr-TR büyütme i→İ yapacağı için kullanılmaz). */
export function kodBuyuk(kod: string): string {
  return kod.replace(/ı/g, "i").replace(/İ/g, "I").toUpperCase();
}

const kodListesi = (s: string | null | undefined) =>
  (s ?? "")
    .split(",")
    .map((x) => kodBuyuk(x.trim()))
    .filter(Boolean);

interface HamLight {
  subject: string;
  summary: string | null;
  title: string;
  publishDate: string;
  disclosureIndex: number;
}

interface HamMain {
  disclosureBasic: {
    title: string;
    companyTitle: string;
    stockCode: string | null;
    relatedStocks: string | null;
    disclosureCategory: string | null;
    publishDate: string;
    disclosureIndex: number;
    summary: string | null;
  };
}

function diziMi<T>(v: unknown, ne: string): T[] {
  if (!Array.isArray(v))
    throw new KaynakHatasi(meta.id, "ayristirma", `KAP ${ne} yanıtı beklenen biçimde değil.`);
  return v as T[];
}

export async function getLatestDisclosures(
  opts: { limit?: number } = {},
): Promise<Sonuc<Bildirim[]>> {
  const url = `${TABAN}/api/disclosure/list/light`;
  const tum = await cached("kap:light", meta.ttlSaniye, async () =>
    diziMi<HamLight>(await fetchJson(url, ISTEK), "son bildirimler").map(
      (b): Bildirim => ({
        index: b.disclosureIndex,
        baslik: b.subject?.trim(),
        ozet: b.summary?.trim() || null,
        sirket: b.title?.trim(),
        hisseKodu: null,
        ilgiliHisseler: [],
        tarih: trZamanToIso(b.publishDate),
        tur: null,
        url: bildirimUrl(b.disclosureIndex),
      }),
    ),
  );
  return sonuc(meta, url, sinirla(tum, opts.limit));
}

export async function getDisclosures(opts: {
  baslangic: string;
  bitis: string;
  hisseKodu?: string;
  limit?: number;
}): Promise<Sonuc<Bildirim[]>> {
  const url = `${TABAN}/api/disclosure/list/main`;
  const govde = {
    fromDate: noktaliTarih(opts.baslangic),
    toDate: noktaliTarih(opts.bitis),
    memberTypes: ["IGS"],
    disclosureClass: "",
  };
  const tum = await cached(`kap:main:${govde.fromDate}:${govde.toDate}`, meta.ttlSaniye, async () =>
    diziMi<HamMain>(
      await fetchJson(url, { ...ISTEK, method: "POST", json: govde }),
      "bildirim sorgu",
    ).map(
      ({ disclosureBasic: b }): Bildirim => ({
        index: b.disclosureIndex,
        baslik: b.title?.trim(),
        ozet: b.summary?.trim() || null,
        sirket: b.companyTitle?.trim(),
        hisseKodu: kodListesi(b.stockCode)[0] ?? null,
        ilgiliHisseler: kodListesi(b.relatedStocks),
        tarih: trZamanToIso(b.publishDate),
        tur: b.disclosureCategory,
        url: bildirimUrl(b.disclosureIndex),
      }),
    ),
  );
  const kod = opts.hisseKodu ? kodBuyuk(opts.hisseKodu.trim()) : null;
  const filtreli = kod
    ? tum.filter((b) => b.hisseKodu === kod || b.ilgiliHisseler.includes(kod))
    : tum;
  return sonuc(meta, url, sinirla(filtreli, opts.limit));
}

export interface SirketAramaSonucu {
  ad: string;
  kod: string;
  tur: "sirket" | "fon";
  kapUrl: string;
}

export async function searchCompanies(sorgu: string): Promise<Sonuc<SirketAramaSonucu[]>> {
  const url = `${TABAN}/api/search/combined`;
  const ham = await cached(`kap:ara:${sorgu}`, meta.ttlSaniye, () =>
    fetchJson<Array<{ category: string; results: Array<Record<string, string | null>> }>>(url, {
      ...ISTEK,
      method: "POST",
      json: { keyword: sorgu },
    }),
  );
  const sonuclar = diziMi<{ category: string; results: Array<Record<string, string | null>> }>(
    ham,
    "arama",
  )
    .find((c) => c.category === "companyOrFunds")
    ?.results.map(
      (r): SirketAramaSonucu => ({
        ad: String(r.searchValue ?? "").trim(),
        kod: kodBuyuk(String(r.cmpOrFundCode ?? "")),
        tur: r.searchType === "F" ? "fon" : "sirket",
        kapUrl: `${TABAN}/sirket-bilgileri/ozet/${r.memberOrFundOid}`,
      }),
    );
  return sonuc(meta, url, sonuclar ?? []);
}

// ── MCP araçları ───────────────────────────────────────────────────────────

export const araclar = [
  defineTool({
    name: "finans_get_kap_disclosures",
    title: "KAP bildirimleri",
    description:
      "Public disclosures from KAP (Kamuyu Aydınlatma Platformu) for Borsa Istanbul companies: material event disclosures (özel durum açıklaması), financial reports etc. Latest disclosures, or a date range optionally filtered by stock ticker (hisse kodu).",
    inputSchema: z.object({
      baslangic: tarihSema
        .optional()
        .describe("Başlangıç tarihi (YYYY-MM-DD). Boşsa en son bildirimler."),
      bitis: tarihSema.optional().describe("Bitiş tarihi (YYYY-MM-DD). Boşsa bugün."),
      hisseKodu: z
        .string()
        .optional()
        .describe(
          "Hisse kodu, ör. THYAO. Verilirse tarih aralığı kullanılır (varsayılan son 7 gün).",
        ),
      limit: limitSema,
    }),
    sources: [meta],
    ornekSorular: ["KAP'a son düşen bildirimler neler?", "THYAO bu hafta KAP'a ne açıkladı?"],
    async run({ baslangic, bitis, hisseKodu, limit }) {
      if (!baslangic && !hisseKodu) return getLatestDisclosures({ limit });
      const son = bitis ?? bugunTr();
      const ilk =
        baslangic ?? new Date(Date.parse(son) - 6 * 86_400_000).toISOString().slice(0, 10);
      return getDisclosures({ baslangic: ilk, bitis: son, hisseKodu, limit });
    },
    ozet(s: Sonuc<Bildirim[]>) {
      if (!s.veri.length) return "Bu ölçütlere uyan KAP bildirimi bulunamadı.";
      return `${s.veri.length} KAP bildirimi:\n${s.veri
        .map(
          (b) =>
            `- ${trZaman(b.tarih)} · ${b.hisseKodu ? `${b.hisseKodu} · ` : ""}${b.sirket}: ${b.baslik}${b.ozet ? ` — ${b.ozet}` : ""} (${b.url})`,
        )
        .join("\n")}`;
    },
  }),
  defineTool({
    name: "finans_search_kap_companies",
    title: "KAP şirket/fon arama",
    description:
      "Search companies and funds on KAP by name or ticker (şirket ara, hisse kodu bul). Returns name, ticker and KAP company page link.",
    inputSchema: z.object({
      sorgu: z.string().min(2).describe('Şirket adı veya kod, ör. "türk hava", "aselsan"'),
    }),
    sources: [meta],
    ornekSorular: ["Aselsan'ın hisse kodu ne?", "KAP'ta 'enerji' geçen şirketleri bul"],
    run: ({ sorgu }) => searchCompanies(sorgu),
    ozet(s: Sonuc<SirketAramaSonucu[]>) {
      if (!s.veri.length) return "Eşleşen şirket/fon bulunamadı.";
      return s.veri.map((r) => `- ${r.kod} — ${r.ad}${r.tur === "fon" ? " (fon)" : ""}`).join("\n");
    },
  }),
];
