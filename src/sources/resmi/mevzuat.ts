import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trZaman } from "../../core/format.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "mevzuat",
  kisaAd: "Mevzuat Bilgi Sistemi",
  ad: "Mevzuat Bilgi Sistemi",
  kategori: "resmi",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.mevzuat.gov.tr",
  aciklama:
    "Cumhurbaşkanlığı Mevzuat Bilgi Sistemi'nde başlıkta arama: kanunlar, KHK'lar, tüzükler, yönetmelikler, tebliğler. Kabul ve Resmî Gazete tarihi, sayısı ve tam metin linki.",
  ttlSaniye: 3600,
  ucNoktalar: [
    'POST https://www.mevzuat.gov.tr/anasayfa/MevzuatDatatable  {"draw":1,"start":0,"length":n,"parameters":{"MevzuatTur":"Kanun","AranacakIfade":"…","AranacakYer":2,"TamCumle":false,"GenelArama":false}}',
  ],
  kutuphaneOrnegi: `import { mevzuat } from "turkiye-mcp";

const { veri } = await mevzuat.search({ sorgu: "kişisel veri", tur: "yonetmelik" });`,
};

export const TURLER = {
  kanun: "Kanun",
  khk: "KHK",
  tuzuk: "Tuzuk",
  yonetmelik: "Yonetmelik",
  "kurum-yonetmeligi": "KurumVeKurulusYonetmeligi",
  "universite-yonetmeligi": "UniversiteYonetmeligi",
  teblig: "Teblig",
} as const;
export type MevzuatTuru = keyof typeof TURLER;

export interface MevzuatKaydi {
  no: string;
  ad: string;
  tur: string;
  kabulTarihi: string | null;
  resmiGazeteTarihi: string | null;
  resmiGazeteSayisi: string | null;
  url: string;
}

const iso = (s: string | null | undefined) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s ?? "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

export async function search(o: {
  sorgu: string;
  tur?: MevzuatTuru;
  limit?: number;
}): Promise<Sonuc<{ toplam: number; sonuclar: MevzuatKaydi[] }>> {
  const url = "https://www.mevzuat.gov.tr/anasayfa/MevzuatDatatable";
  const govde = {
    draw: 1,
    start: 0,
    length: o.limit ?? 20,
    // AranacakYer 2 = başlıkta ara (sitenin kendi arama formu); tam metin araması oturum gerektiriyor.
    parameters: {
      AranacakIfade: o.sorgu,
      AranacakYer: 2,
      TamCumle: false,
      MevzuatTur: TURLER[o.tur ?? "kanun"],
      GenelArama: false,
    },
  };
  const h = await cached(`mevzuat:${JSON.stringify(govde)}`, meta.ttlSaniye, () =>
    fetchJson<{ recordsTotal?: number; data?: Array<Record<string, string | null>> }>(url, {
      sourceId: meta.id,
      method: "POST",
      json: govde,
      browserUA: true,
    }),
  );
  if (!Array.isArray(h?.data))
    throw new KaynakHatasi(meta.id, "ayristirma", "Mevzuat arama yanıtı beklenen biçimde değil.");
  return sonuc(meta, url, {
    toplam: h.recordsTotal ?? h.data.length,
    sonuclar: h.data.map((r) => ({
      no: String(r.mevzuatNo ?? ""),
      ad: String(r.mevAdi ?? "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim(),
      tur: String(r.mevzuatTurEnumString ?? ""),
      kabulTarihi: iso(r.kabulTarih),
      resmiGazeteTarihi: iso(r.resmiGazeteTarihi),
      resmiGazeteSayisi: r.resmiGazeteSayisi ?? null,
      url: `https://www.mevzuat.gov.tr/${r.url ?? ""}`,
    })),
  });
}

export const araclar = [
  defineTool({
    name: "resmi_mevzuat_search",
    title: "Mevzuat arama",
    description:
      "Search Turkish legislation in the official Mevzuat Bilgi Sistemi: laws (kanun), decree-laws (KHK), regulations (yönetmelik), communiqués (tebliğ). Returns number, title, adoption and Official Gazette dates and full-text link.",
    inputSchema: z.object({
      sorgu: z.string().min(2).describe('Aranacak ifade, ör. "kişisel veri", "vergi usul"'),
      tur: z
        .enum([
          "kanun",
          "khk",
          "tuzuk",
          "yonetmelik",
          "kurum-yonetmeligi",
          "universite-yonetmeligi",
          "teblig",
        ])
        .default("kanun")
        .describe("Mevzuat türü"),
      limit: z.number().int().min(1).max(100).default(10).describe("En fazla kaç kayıt (1–100)"),
    }),
    sources: [meta],
    ornekSorular: [
      "Kişisel verilerle ilgili yönetmelikler hangileri?",
      "Vergi usul kanunu hangi Resmî Gazete'de yayımlandı?",
    ],
    run: ({ sorgu, tur, limit }) => search({ sorgu, tur, limit }),
    ozet(s: Sonuc<{ toplam: number; sonuclar: MevzuatKaydi[] }>) {
      if (!s.veri.sonuclar.length) return "Eşleşen mevzuat bulunamadı.";
      return `${s.veri.toplam} kayıttan ${s.veri.sonuclar.length} tanesi:\n${s.veri.sonuclar
        .map(
          (m) =>
            `- ${m.no} sayılı ${m.ad}${m.resmiGazeteTarihi ? ` (RG ${trZaman(m.resmiGazeteTarihi)}, sayı ${m.resmiGazeteSayisi})` : ""}\n  ${m.url}`,
        )
        .join("\n")}`;
    },
  }),
];
