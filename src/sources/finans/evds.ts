import * as z from "zod";
import { anahtarlar } from "../../core/anahtar.js";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { sayiVeyaNull, trSayi } from "../../core/format.js";
import { fetchJson } from "../../core/http.js";
import { tarihSema } from "../../core/sema.js";
import { sonuc } from "../../core/sonuc.js";
import { bugunTr, gunEkle, trTarihParcalari } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "tcmb-evds",
  kisaAd: "TCMB EVDS",
  ad: "TCMB EVDS — Elektronik Veri Dağıtım Sistemi",
  kategori: "finans",
  rozet: "resmi",
  anahtarGerekli: true,
  envVars: ["TCMB_EVDS_KEY"],
  anahtarNasilAlinir:
    "Ücretsiz anahtar: https://evds3.tcmb.gov.tr adresinde üye olun → Profil → API Anahtarı.",
  resmiUrl: "https://evds3.tcmb.gov.tr",
  aciklama:
    "TCMB'nin on binlerce ekonomik zaman serisi: enflasyon (TÜFE/ÜFE), faizler, rezervler, kredi/mevduat, dış ticaret, kurlar… Seri kodlarını EVDS sitesindeki veri ağacından bulabilirsiniz (ör. TP.DK.USD.A, TP.FG.J0).",
  ttlSaniye: 3600,
  deneysel: true,
  ucNoktalar: [
    "GET https://evds3.tcmb.gov.tr/igmevdsms-dis/series={KOD1-KOD2}&startDate=DD-MM-YYYY&endDate=DD-MM-YYYY&type=json[&frequency=1..8]  (header: key)",
  ],
  kutuphaneOrnegi: `import { evds } from "turkiye-mcp";

const { veri } = await evds.getSeries(
  { seriler: ["TP.FG.J0"], baslangic: "2025-01-01", bitis: "2026-10-01", frekans: "aylik" },
  process.env, // TCMB_EVDS_KEY
);`,
};

const FREKANS = {
  gunluk: 1,
  isgunu: 2,
  haftalik: 3,
  aylik: 5,
  ceyreklik: 6,
  yillik: 8,
} as const;
export type Frekans = keyof typeof FREKANS;

export interface SeriGozlemi {
  tarih: string;
  degerler: Record<string, number | null>;
}

const tireli = (iso: string) => {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return `${gun}-${ay}-${yil}`;
};

/** "10-11-2026" → "2026-11-10", "2026-9" → "2026-09", "2026-Q3" ve "2026" olduğu gibi */
function tarihCevir(t: string): string {
  let m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(t);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = /^(\d{4})-(\d{1,2})$/.exec(t);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}`;
  return t;
}

export async function getSeries(
  o: { seriler: string[]; baslangic: string; bitis: string; frekans?: Frekans },
  env: NodeJS.ProcessEnv,
): Promise<Sonuc<SeriGozlemi[]>> {
  const { TCMB_EVDS_KEY } = anahtarlar(meta, env);
  const seriler = o.seriler.map((s) => s.trim().toUpperCase());
  let url = `https://evds3.tcmb.gov.tr/igmevdsms-dis/series=${seriler.join("-")}&startDate=${tireli(o.baslangic)}&endDate=${tireli(o.bitis)}&type=json`;
  if (o.frekans) url += `&frequency=${FREKANS[o.frekans]}`;
  const ham = await cached(url, meta.ttlSaniye, () =>
    fetchJson<{ items?: Array<Record<string, unknown>> }>(url, {
      sourceId: meta.id,
      headers: { key: TCMB_EVDS_KEY as string },
    }),
  );
  if (!Array.isArray(ham?.items)) {
    throw new KaynakHatasi(meta.id, "ayristirma", "EVDS yanıtı beklenen biçimde değil.");
  }
  const veri = ham.items.map((it) => ({
    tarih: tarihCevir(String(it.Tarih)),
    degerler: Object.fromEntries(seriler.map((s) => [s, sayiVeyaNull(it[s.replace(/\./g, "_")])])),
  }));
  return sonuc(meta, url.replace(/key=[^&]*/, ""), veri);
}

export const araclar = [
  defineTool({
    name: "finans_get_evds_series",
    title: "TCMB EVDS zaman serileri",
    description:
      "Economic time series from the Central Bank of Türkiye EVDS (inflation/enflasyon TÜFE, interest rates/faiz, reserves/rezerv, credit, FX). Requires TCMB_EVDS_KEY. Pass EVDS series codes like TP.DK.USD.A or TP.FG.J0.",
    inputSchema: z.object({
      seriler: z.array(z.string()).min(1).max(10).describe('EVDS seri kodları, ör. ["TP.FG.J0"]'),
      baslangic: tarihSema.optional().describe("Başlangıç (YYYY-MM-DD). Boşsa 1 yıl önce."),
      bitis: tarihSema.optional().describe("Bitiş (YYYY-MM-DD). Boşsa bugün."),
      frekans: z.enum(["gunluk", "isgunu", "haftalik", "aylik", "ceyreklik", "yillik"]).optional(),
    }),
    sources: [meta],
    ornekSorular: ["TÜFE endeksi (TP.FG.J0) son 12 ayda nasıl değişti?"],
    run({ seriler, baslangic, bitis, frekans }, env) {
      const son = bitis ?? bugunTr();
      return getSeries(
        { seriler, baslangic: baslangic ?? gunEkle(son, -365), bitis: son, frekans },
        env,
      );
    },
    ozet(s: Sonuc<SeriGozlemi[]>) {
      const son = s.veri.slice(-12);
      return `${s.veri.length} gözlem (son ${son.length}):\n${son
        .map(
          (g) =>
            `- ${g.tarih}: ${Object.entries(g.degerler)
              .map(([k, v]) => `${k}=${trSayi(v)}`)
              .join(", ")}`,
        )
        .join("\n")}`;
    },
  }),
];
