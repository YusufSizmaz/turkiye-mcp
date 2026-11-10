import * as cheerio from "cheerio";
import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trZaman } from "../../core/format.js";
import { fetchText } from "../../core/http.js";
import { icerir } from "../../core/metin.js";
import { tarihSema } from "../../core/sema.js";
import { sonuc } from "../../core/sonuc.js";
import {
  bugunTr,
  gecerliIsoTarih,
  noktaliTarih,
  oncekiGun,
  trTarihParcalari,
} from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "resmi-gazete",
  ad: "T.C. Resmî Gazete",
  kategori: "resmi",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.resmigazete.gov.tr",
  aciklama:
    "Günlük Resmî Gazete sayısının içindekiler listesi: yürütme ve idare bölümü (yönetmelikler, tebliğler, kararlar, genelgeler…), yargı bölümü ve ilân bölümü; her madde için tam metin linki. Anahtar kelime ile filtrelenebilir.",
  ttlSaniye: 3600,
  ucNoktalar: [
    "GET https://www.resmigazete.gov.tr/eskiler/{YYYY}/{MM}/{YYYYMMDD}.htm  (windows-1254)",
  ],
  kutuphaneOrnegi: `import { resmiGazete } from "turkiye-mcp";

const { veri } = await resmiGazete.getIssue();                       // bugünkü sayı
const vergi = await resmiGazete.getIssue({ tarih: "2026-11-10", arama: "vergi" });`,
};

export interface Madde {
  baslik: string;
  url: string;
}

export interface Bolum {
  bolum: string;
  altBaslik: string | null;
  maddeler: Madde[];
}

export interface GazeteSayisi {
  tarih: string;
  sayi: string;
  bolumler: Bolum[];
}

const temiz = (s: string) => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
const buyukHarfMi = (s: string) => /\p{L}/u.test(s) && s === s.toLocaleUpperCase("tr-TR");

function maddeBasligi(s: string): string {
  return temiz(s)
    .replace(/^[–—-]+\s*/, "")
    .replace(/^[a-zçğıöşü]\s+-\s+/i, "")
    .trim();
}

function mutlakUrl(href: string, sayfaUrl: string): string {
  const u = new URL(href, sayfaUrl);
  const main = u.searchParams.get("main"); // ilan linkleri main.aspx?home=…&main=<asıl sayfa>
  return main ?? u.href;
}

export function ayristir(html: string, tarih: string, sayfaUrl: string): GazeteSayisi {
  const $ = cheerio.load(html);
  const govde = temiz($("body").text());
  const sayi = /Tarihli ve\s+(\d+)\s+Sayılı/.exec(govde)?.[1];
  if (!sayi)
    throw new KaynakHatasi(meta.id, "ayristirma", "Resmî Gazete sayı numarası bulunamadı.");

  const bolumler: Bolum[] = [];
  let bolum = "";
  let grup: Bolum | null = null;
  $("p").each((_, el) => {
    const p = $(el);
    const metin = temiz(p.text());
    if (!metin) return;
    const a = p.find("a").first();
    if (a.length) {
      const href = a.attr("href");
      if (!href || !grup) return;
      grup.maddeler.push({ baslik: maddeBasligi(a.text()), url: mutlakUrl(href, sayfaUrl) });
      return;
    }
    if (!buyukHarfMi(metin)) return;
    if (metin.endsWith("BÖLÜMÜ")) {
      bolum = metin;
      grup = { bolum, altBaslik: null, maddeler: [] };
    } else {
      grup = { bolum, altBaslik: metin, maddeler: [] };
    }
    bolumler.push(grup);
  });
  return { tarih, sayi, bolumler: bolumler.filter((b) => b.maddeler.length) };
}

const sayfaUrl = (iso: string) => {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return `https://www.resmigazete.gov.tr/eskiler/${yil}/${ay}/${yil}${ay}${gun}.htm`;
};

const GERI_GIDIS = 3;

async function sayiGetir(tarih: string): Promise<{ url: string; sayi: GazeteSayisi }> {
  const url = sayfaUrl(tarih);
  return cached(`rg:${tarih}`, meta.ttlSaniye, async () => ({
    url,
    sayi: ayristir(
      await fetchText(url, { sourceId: meta.id, encoding: "windows-1254" }),
      tarih,
      url,
    ),
  }));
}

export async function getIssue(
  o: { tarih?: string; arama?: string } = {},
): Promise<Sonuc<GazeteSayisi>> {
  if (o.tarih !== undefined && !gecerliIsoTarih(o.tarih)) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `Geçersiz tarih "${o.tarih}" (YYYY-MM-DD bekleniyor).`,
    );
  }
  const istenen = o.tarih ?? bugunTr();
  let gun = istenen;
  let bulunan: { url: string; sayi: GazeteSayisi } | null = null;
  // Belirli tarih istenmişse yalnız o gün; "bugün" ise henüz yayımlanmamış olabilir → geri git.
  const deneme = o.tarih ? 1 : GERI_GIDIS;
  for (let i = 0; i < deneme; i++) {
    try {
      bulunan = await sayiGetir(gun);
      break;
    } catch (e) {
      if (e instanceof KaynakHatasi && e.status === 404) {
        gun = oncekiGun(gun);
        continue;
      }
      throw e;
    }
  }
  if (!bulunan) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${noktaliTarih(istenen)} tarihli Resmî Gazete bulunamadı.`,
    );
  }
  let { sayi } = bulunan;
  if (o.arama) {
    const q = o.arama;
    sayi = {
      ...sayi,
      bolumler: sayi.bolumler
        .map((b) => ({ ...b, maddeler: b.maddeler.filter((m) => icerir(m.baslik, q)) }))
        .filter((b) => b.maddeler.length),
    };
  }
  const not =
    gun !== istenen
      ? `${noktaliTarih(istenen)} sayısı henüz yayımlanmamış; ${noktaliTarih(gun)} sayısı döndürüldü.`
      : undefined;
  return sonuc(meta, bulunan.url, sayi, not);
}

export const araclar = [
  defineTool({
    name: "resmi_gazete_get_issue",
    title: "Resmî Gazete günlük sayı",
    description:
      "Table of contents of the Official Gazette of Türkiye (Resmî Gazete) for today or a given date: regulations (yönetmelik), communiqués (tebliğ), presidential decisions (karar), circulars (genelge), announcements (ilan) with links. Optional keyword filter.",
    inputSchema: z.object({
      tarih: tarihSema.optional().describe("Tarih (YYYY-MM-DD). Boşsa bugünkü sayı."),
      arama: z
        .string()
        .optional()
        .describe('Başlıklarda aranacak kelime, ör. "vergi", "yönetmelik"'),
    }),
    sources: [meta],
    ornekSorular: [
      "Bugünkü Resmî Gazete'de neler var?",
      "Bu haftaki Resmî Gazete'lerde vergiyle ilgili bir düzenleme çıktı mı?",
    ],
    run: ({ tarih, arama }) => getIssue({ tarih, arama }),
    ozet(s: Sonuc<GazeteSayisi>) {
      const v = s.veri;
      const toplam = v.bolumler.reduce((n, b) => n + b.maddeler.length, 0);
      const govde = v.bolumler
        .map(
          (b) =>
            `${b.altBaslik ?? b.bolum}\n${b.maddeler.map((m) => `  – ${m.baslik}`).join("\n")}`,
        )
        .join("\n");
      return `Resmî Gazete — ${trZaman(v.tarih)}, Sayı ${v.sayi} (${toplam} madde)\n${govde || "Eşleşen madde yok."}`;
    },
  }),
];
