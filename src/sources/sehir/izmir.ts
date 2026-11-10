import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trSayi, trZaman } from "../../core/format.js";
import { fetchJson, fetchText } from "../../core/http.js";
import { eslesir, icerir } from "../../core/metin.js";
import { limitSema, tarihSema } from "../../core/sema.js";
import { sinirla, sonuc } from "../../core/sonuc.js";
import { bugunTr, gunAdi, noktaliTarih, oncekiGun } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

const API = "https://openapi.izmir.bel.tr/api";

const ortak = {
  kategori: "sehir",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [] as string[],
  resmiUrl: "https://acikveri.bizizmir.com",
} satisfies Partial<SourceMeta>;

export const halMeta: SourceMeta = {
  ...ortak,
  id: "izmir-hal",
  kisaAd: "İzmir BB (hal)",
  ad: "İzmir Büyükşehir — Hal Fiyatları",
  aciklama:
    "İzmir sebze-meyve ve balık hallerinin günlük fiyat bülteni: ürün, birim, en düşük / en yüksek / ortalama fiyat.",
  ttlSaniye: 3600,
  ucNoktalar: [
    `GET ${API}/ibb/halfiyatlari/sebzemeyve/{YYYY-MM-DD}`,
    `GET ${API}/ibb/halfiyatlari/balik/{YYYY-MM-DD}`,
  ],
  kutuphaneOrnegi: `import { izmir } from "turkiye-mcp";

const { veri } = await izmir.getMarketPrices({ tur: "sebzemeyve", urun: "domates" });`,
};

export const ulasimMeta: SourceMeta = {
  ...ortak,
  id: "izmir-ulasim",
  kisaAd: "İzmir BB (ulaşım)",
  ad: "İzmir Büyükşehir — İZBAN ve Vapur Seferleri",
  aciklama:
    "İZBAN banliyö istasyonları arası kalkış/varış saatleri ve İzdeniz vapur iskelelerinin günlük sefer saatleri.",
  ttlSaniye: 3600,
  ucNoktalar: [
    `GET ${API}/izban/istasyonlar`,
    `GET ${API}/izban/sefersaatleri/{kalkisId}/{varisId}`,
    `GET ${API}/izdeniz/iskeleler`,
    `GET ${API}/izdeniz/iskelesefersaatleri/{iskeleId}/{gunId}`,
  ],
  kutuphaneOrnegi: `import { izmir } from "turkiye-mcp";

const izban = await izmir.getIzbanTimes({ kalkis: "Alsancak", varis: "Cumaovası" });
const vapur = await izmir.getFerryTimes({ iskele: "Karşıyaka" });`,
};

export const yerlerMeta: SourceMeta = {
  ...ortak,
  id: "izmir-yerler",
  kisaAd: "İzmir BB (kent rehberi)",
  ad: "İzmir Büyükşehir — Kent Rehberi (CBS)",
  aciklama:
    "İzmir'de hastaneler, afet toplanma alanları, plajlar, müzeler, kütüphaneler, noterler, vergi daireleri, terminaller, taksi durakları, ücretsiz WizmirNet noktaları ve daha fazlası: ad, ilçe, mahalle, adres ve koordinat.",
  ttlSaniye: 86_400,
  ucNoktalar: [`GET ${API}/ibb/cbs/{kategori}   (ör. hastaneler, afetaciltoplanmaalani, plajlar…)`],
  kutuphaneOrnegi: `import { izmir } from "turkiye-mcp";

const { veri } = await izmir.findPlaces({ kategori: "afetaciltoplanmaalani", ilce: "Bornova" });`,
};

// ── Hal fiyatları ──────────────────────────────────────────────────────────

export interface HalUrunu {
  ad: string;
  tip: string;
  birim: string;
  enDusuk: number;
  enYuksek: number;
  ortalama: number;
}

const HAL_GERI = 5;

export async function getMarketPrices(o: {
  tur?: "sebzemeyve" | "balik";
  tarih?: string;
  urun?: string;
  limit?: number;
}): Promise<Sonuc<{ tarih: string; tur: string; toplam: number; urunler: HalUrunu[] }>> {
  const tur = o.tur ?? "sebzemeyve";
  const istenen = o.tarih ?? bugunTr();
  let gun = istenen;
  for (let i = 0; i < HAL_GERI; i++) {
    const url = `${API}/ibb/halfiyatlari/${tur}/${gun}`;
    const metin = await cached(url, halMeta.ttlSaniye, () =>
      fetchText(url, { sourceId: halMeta.id }),
    );
    if (!metin.trim()) {
      gun = oncekiGun(gun);
      continue;
    }
    let h: { HalFiyatListesi?: Array<Record<string, unknown>> };
    try {
      h = JSON.parse(metin);
    } catch {
      throw new KaynakHatasi(halMeta.id, "ayristirma", "İzmir hal bülteni beklenen biçimde değil.");
    }
    if (!Array.isArray(h?.HalFiyatListesi)) {
      throw new KaynakHatasi(halMeta.id, "ayristirma", "İzmir hal bülteni beklenen biçimde değil.");
    }
    const tum = h.HalFiyatListesi.map((r) => ({
      ad: String(r.MalAdi ?? "")
        .replace(/\s+/g, " ")
        .trim(),
      tip: String(r.MalTipAdi ?? "").trim(),
      birim: String(r.Birim ?? "").trim(),
      enDusuk: Number(r.AsgariUcret),
      enYuksek: Number(r.AzamiUcret),
      ortalama: Number(r.OrtalamaUcret),
    })).filter((u) => !o.urun || icerir(u.ad, o.urun));
    const not =
      gun !== istenen
        ? `${noktaliTarih(istenen)} için bülten yok; ${noktaliTarih(gun)} bülteni döndürüldü.`
        : undefined;
    return sonuc(
      halMeta,
      url,
      { tarih: gun, tur, toplam: tum.length, urunler: sinirla(tum, o.limit ?? 50) },
      not,
    );
  }
  throw new KaynakHatasi(
    halMeta.id,
    "bulunamadi",
    `${noktaliTarih(istenen)} ve önceki günler için hal bülteni bulunamadı.`,
  );
}

// ── İZBAN ve vapur ─────────────────────────────────────────────────────────

const kisaSaat = (s: unknown) => String(s ?? "").slice(0, 5);

async function liste<T>(yol: string, meta: SourceMeta): Promise<T[]> {
  const url = `${API}${yol}`;
  const h = await cached(url, 86_400, () => fetchJson<T[]>(url, { sourceId: meta.id }));
  if (!Array.isArray(h))
    throw new KaynakHatasi(
      meta.id,
      "ayristirma",
      `İzmir API yanıtı beklenen biçimde değil (${yol}).`,
    );
  return h;
}

function adIleBul<T>(kayitlar: T[], ad: (x: T) => string, aranan: string, ne: string): T {
  const x =
    kayitlar.find((k) => eslesir(ad(k), aranan)) ?? kayitlar.find((k) => icerir(ad(k), aranan));
  if (!x) {
    throw new KaynakHatasi(
      ulasimMeta.id,
      "bulunamadi",
      `"${aranan}" adında ${ne} bulunamadı. Seçenekler: ${kayitlar.map(ad).join(", ")}`,
    );
  }
  return x;
}

export async function getIzbanTimes(o: {
  kalkis: string;
  varis: string;
  limit?: number;
}): Promise<
  Sonuc<{ kalkis: string; varis: string; seferler: Array<{ kalkis: string; varis: string }> }>
> {
  const ist = await liste<{ IstasyonId: number; IstasyonAdi: string }>(
    "/izban/istasyonlar",
    ulasimMeta,
  );
  const k = adIleBul(ist, (x) => x.IstasyonAdi, o.kalkis, "İZBAN istasyonu");
  const v = adIleBul(ist, (x) => x.IstasyonAdi, o.varis, "İZBAN istasyonu");
  const url = `${API}/izban/sefersaatleri/${k.IstasyonId}/${v.IstasyonId}`;
  const h = await cached(url, ulasimMeta.ttlSaniye, () =>
    fetchText(url, { sourceId: ulasimMeta.id }),
  );
  const seferler = h.trim() ? (JSON.parse(h) as Array<Record<string, unknown>>) : [];
  return sonuc(ulasimMeta, url, {
    kalkis: k.IstasyonAdi,
    varis: v.IstasyonAdi,
    seferler: sinirla(
      seferler.map((s) => ({ kalkis: kisaSaat(s.HareketSaati), varis: kisaSaat(s.VarisSaati) })),
      o.limit,
    ),
  });
}

/** Pazartesi=1 … Pazar=7 */
const gunId = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

export interface VapurSeferi {
  saat: string;
  varis: string[];
  arabali: boolean;
  iptal: boolean;
  aciklama: string | null;
}

export async function getFerryTimes(o: {
  iskele: string;
  tarih?: string;
  limit?: number;
}): Promise<Sonuc<{ iskele: string; gun: string; seferler: VapurSeferi[] }>> {
  const iskeleler = await liste<{ IskeleId: number; Adi: string }>(
    "/izdeniz/iskeleler",
    ulasimMeta,
  );
  const isk = adIleBul(iskeleler, (x) => x.Adi, o.iskele, "iskele");
  const tarih = o.tarih ?? bugunTr();
  const url = `${API}/izdeniz/iskelesefersaatleri/${isk.IskeleId}/${gunId(tarih)}`;
  const h = await cached(url, ulasimMeta.ttlSaniye, () =>
    fetchJson<{ seferler?: Array<Record<string, unknown>> }>(url, { sourceId: ulasimMeta.id }),
  );
  if (!Array.isArray(h?.seferler))
    throw new KaynakHatasi(
      ulasimMeta.id,
      "ayristirma",
      "Vapur sefer yanıtı beklenen biçimde değil.",
    );
  return sonuc(ulasimMeta, url, {
    iskele: isk.Adi,
    gun: gunAdi(tarih),
    seferler: sinirla(
      h.seferler.map((s) => ({
        saat: kisaSaat(s.KalkisSaati),
        varis: Array.isArray(s.VarisYerleri)
          ? (s.VarisYerleri as Array<{ iskeleAdi: string }>).map((v) => v.iskeleAdi)
          : [],
        arabali: Boolean(s.arabaliVapurSeferi),
        iptal: Boolean(s.IptalMi),
        aciklama: (s.IptalAciklama as string) || (s.Aciklama as string) || null,
      })),
      o.limit ?? 50,
    ),
  });
}

// ── Kent rehberi ───────────────────────────────────────────────────────────

export const YER_KATEGORILERI = {
  hastaneler: "Hastaneler",
  ailesagligimerkezleri: "Aile sağlığı merkezleri",
  kanmerkezleri: "Kan merkezleri",
  veterinerlikler: "Veteriner klinikleri",
  afetaciltoplanmaalani: "Afet ve acil durum toplanma alanları",
  itfaiyegruplari: "İtfaiye grupları",
  plajlar: "Plajlar",
  mavibayrakplajlar: "Mavi bayraklı plajlar",
  muzeler: "Müzeler",
  kutuphaneler: "Kütüphaneler",
  sinemalar: "Sinemalar",
  tiyatrolar: "Tiyatrolar",
  kaplicalar: "Kaplıcalar",
  pazaryerleri: "Semt pazarları",
  otobusterminalleri: "Otobüs terminalleri",
  trengarlari: "Tren garları",
  taksiduraklari: "Taksi durakları",
  wizmirnetnoktalari: "Ücretsiz WizmirNET noktaları",
  noterler: "Noterler",
  vergidaireleri: "Vergi daireleri",
  nufusmudurlukleri: "Nüfus müdürlükleri",
  ptt: "PTT şubeleri",
  universiteler: "Üniversiteler",
  muhtarliklar: "Muhtarlıklar",
  aracmuayeneistasyonlari: "Araç muayene istasyonları",
} as const;
export type YerKategorisi = keyof typeof YER_KATEGORILERI;

export interface Yer {
  ad: string;
  ilce: string;
  mahalle: string | null;
  adres: string | null;
  aciklama: string | null;
  enlem: number | null;
  boylam: number | null;
}

export async function findPlaces(o: {
  kategori: YerKategorisi;
  ilce?: string;
  arama?: string;
  limit?: number;
}): Promise<Sonuc<{ kategori: string; toplam: number; yerler: Yer[] }>> {
  const url = `${API}/ibb/cbs/${o.kategori}`;
  const h = await cached(url, yerlerMeta.ttlSaniye, () =>
    fetchJson<{ onemliyer?: Array<Record<string, unknown>> }>(url, { sourceId: yerlerMeta.id }),
  );
  if (!Array.isArray(h?.onemliyer))
    throw new KaynakHatasi(
      yerlerMeta.id,
      "ayristirma",
      "İzmir kent rehberi yanıtı beklenen biçimde değil.",
    );
  const metin = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const tum = h.onemliyer
    .map((r) => ({
      ad: String(r.ADI ?? "").trim(),
      ilce: String(r.ILCE ?? "").trim(),
      mahalle: metin(r.MAHALLE),
      adres: [metin(r.YOL), metin(r.KAPINO)].filter(Boolean).join(" No:") || null,
      aciklama: metin(r.ACIKLAMA),
      enlem: typeof r.ENLEM === "number" ? r.ENLEM : null,
      boylam: typeof r.BOYLAM === "number" ? r.BOYLAM : null,
    }))
    .filter((y) => (!o.ilce || eslesir(y.ilce, o.ilce)) && (!o.arama || icerir(y.ad, o.arama)));
  return sonuc(yerlerMeta, url, {
    kategori: YER_KATEGORILERI[o.kategori],
    toplam: tum.length,
    yerler: sinirla(tum, o.limit),
  });
}

// ── MCP araçları ───────────────────────────────────────────────────────────

const haritaLinki = (y: { enlem: number | null; boylam: number | null }) =>
  y.enlem !== null && y.boylam !== null
    ? ` · https://www.google.com/maps?q=${y.enlem},${y.boylam}`
    : "";

export const araclar = [
  defineTool({
    name: "izmir_get_market_prices",
    title: "İzmir hal fiyatları",
    description:
      "Daily wholesale market prices in İzmir (hal fiyatları): fruits & vegetables (sebze-meyve) or fish (balık) with min/max/average price per unit. Falls back to the latest bulletin.",
    inputSchema: z.object({
      tur: z.enum(["sebzemeyve", "balik"]).default("sebzemeyve").describe("sebzemeyve veya balik"),
      urun: z.string().optional().describe('Ürün adı, ör. "domates", "çipura"'),
      tarih: tarihSema.optional().describe("Bülten tarihi (YYYY-MM-DD). Boşsa en güncel."),
      limit: z.number().int().min(1).max(300).default(50),
    }),
    sources: [halMeta],
    ornekSorular: ["İzmir halinde domatesin kilosu kaç lira?", "Bugün halde çipura fiyatı ne?"],
    run: (g) => getMarketPrices(g),
    ozet(s: Sonuc<{ tarih: string; tur: string; toplam: number; urunler: HalUrunu[] }>) {
      const v = s.veri;
      if (!v.urunler.length) return `İzmir hali ${trZaman(v.tarih)}: eşleşen ürün yok.`;
      return `İzmir ${v.tur === "balik" ? "balık" : "sebze-meyve"} hali — ${trZaman(v.tarih)} (${v.toplam} ürün)\n${v.urunler
        .map(
          (u) =>
            `- ${u.ad}${u.tip ? ` (${u.tip})` : ""}: ${trSayi(u.enDusuk, 2)}–${trSayi(u.enYuksek, 2)} TL/${u.birim.toLocaleLowerCase("tr-TR")}, ort. ${trSayi(u.ortalama, 2)}`,
        )
        .join("\n")}`;
    },
  }),
  defineTool({
    name: "izmir_get_izban_times",
    title: "İZBAN sefer saatleri",
    description:
      "İZBAN commuter rail (banliyö) departure and arrival times between two stations in İzmir.",
    inputSchema: z.object({
      kalkis: z.string().describe('Kalkış istasyonu, ör. "Alsancak"'),
      varis: z.string().describe('Varış istasyonu, ör. "Cumaovası"'),
      limit: limitSema,
    }),
    sources: [ulasimMeta],
    ornekSorular: ["Alsancak'tan Menemen'e bir sonraki İZBAN kaçta?"],
    run: (g) => getIzbanTimes(g),
    ozet(
      s: Sonuc<{
        kalkis: string;
        varis: string;
        seferler: Array<{ kalkis: string; varis: string }>;
      }>,
    ) {
      const v = s.veri;
      if (!v.seferler.length) return `${v.kalkis} → ${v.varis}: bugün için kalan sefer yok.`;
      return `İZBAN ${v.kalkis} → ${v.varis}\n${v.seferler.map((x) => `- ${x.kalkis} → ${x.varis}`).join("\n")}`;
    },
  }),
  defineTool({
    name: "izmir_get_ferry_times",
    title: "İzmir vapur saatleri",
    description:
      "İzdeniz ferry departures from a pier in İzmir (vapur saatleri: Konak, Karşıyaka, Bostanlı, Alsancak, Üçkuyular…) for today or a given date.",
    inputSchema: z.object({
      iskele: z.string().describe('İskele, ör. "Karşıyaka", "Konak"'),
      tarih: tarihSema.optional().describe("Tarih (YYYY-MM-DD). Boşsa bugün."),
      limit: z.number().int().min(1).max(200).default(50),
    }),
    sources: [ulasimMeta],
    ornekSorular: [
      "Karşıyaka'dan Konak'a vapur saatleri",
      "Bostanlı iskelesinden pazar günü vapur var mı?",
    ],
    run: (g) => getFerryTimes(g),
    ozet(s: Sonuc<{ iskele: string; gun: string; seferler: VapurSeferi[] }>) {
      const v = s.veri;
      return `${v.iskele} iskelesi — ${v.gun} (${v.seferler.length} sefer)\n${v.seferler
        .map(
          (x) =>
            `- ${x.saat} → ${x.varis.join(", ")}${x.arabali ? " (arabalı)" : ""}${x.iptal ? " ❌ İPTAL" : ""}${x.aciklama ? ` — ${x.aciklama}` : ""}`,
        )
        .join("\n")}`;
    },
  }),
  defineTool({
    name: "izmir_find_places",
    title: "İzmir kent rehberi",
    description:
      "Find places in İzmir by category from the municipality's GIS: hospitals, disaster assembly areas (toplanma alanı), beaches, museums, libraries, notaries, tax offices, bus terminals, taxi stands, free Wi-Fi points and more. Filter by district (ilçe) or name.",
    inputSchema: z.object({
      kategori: z
        .enum(Object.keys(YER_KATEGORILERI) as [YerKategorisi, ...YerKategorisi[]])
        .describe(
          `Kategori: ${Object.entries(YER_KATEGORILERI)
            .map(([k, v]) => `${k} (${v})`)
            .join(", ")}`,
        ),
      ilce: z.string().optional().describe('İlçe, ör. "Bornova"'),
      arama: z.string().optional().describe("Ad içinde ara"),
      limit: limitSema,
    }),
    sources: [yerlerMeta],
    ornekSorular: [
      "Bornova'daki afet toplanma alanları nerede?",
      "Karşıyaka'da hangi hastaneler var?",
    ],
    run: (g) => findPlaces(g),
    ozet(s: Sonuc<{ kategori: string; toplam: number; yerler: Yer[] }>) {
      const v = s.veri;
      if (!v.yerler.length) return `${v.kategori}: eşleşen kayıt yok.`;
      const kesik =
        v.yerler.length < v.toplam ? ` (${v.toplam} kayıttan ilk ${v.yerler.length})` : "";
      return `${v.kategori}${kesik}\n${v.yerler
        .map(
          (y) =>
            `- ${y.ad} — ${y.ilce}${y.mahalle ? `, ${y.mahalle}` : ""}${y.adres ? `, ${y.adres}` : ""}${haritaLinki(y)}`,
        )
        .join("\n")}`;
    },
  }),
];
