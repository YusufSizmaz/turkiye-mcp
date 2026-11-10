import * as z from "zod";
import { limitSema } from "../../core/sema.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import * as ckan from "./ckan.js";
import * as ibb from "./ibb.js";

const yogunluk = (n: number) =>
  n < 30 ? "akıcı" : n < 50 ? "orta" : n < 70 ? "yoğun" : "çok yoğun";
const portalSema = z
  .enum(["ibb", "izmir"])
  .describe("ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com)");

export const araclar = [
  defineTool({
    name: "istanbul_get_traffic_index",
    title: "İstanbul trafik endeksi",
    description:
      "Live Istanbul traffic congestion index 0–100 (trafik yoğunluğu) overall and for the Asian (Anadolu) and European (Avrupa) sides, from İBB.",
    inputSchema: z.object({}),
    sources: [ibb.trafikMeta],
    ornekSorular: ["İstanbul'da trafik şu an nasıl?", "Anadolu yakasında trafik yoğun mu?"],
    run: () => ibb.getTrafficIndex(),
    ozet(s: Sonuc<{ genel: number; anadolu: number; avrupa: number }>) {
      const v = s.veri;
      return `İstanbul trafik endeksi\nGenel: ${v.genel}/100 (${yogunluk(v.genel)})\nAnadolu: ${v.anadolu}/100 (${yogunluk(v.anadolu)}) · Avrupa: ${v.avrupa}/100 (${yogunluk(v.avrupa)})`;
    },
  }),
  defineTool({
    name: "istanbul_get_parking",
    title: "İSPARK boş otoparklar",
    description:
      "Live İSPARK car park availability in Istanbul (otopark, boş yer): free spaces, capacity, type, hours, free minutes, location. Sorted by most free spaces.",
    inputSchema: z.object({
      ilce: z.string().optional().describe('İlçe, ör. "Kadıköy", "Şişli"'),
      sadeceAcik: z.boolean().default(true).describe("Yalnız şu an açık otoparklar"),
      limit: limitSema,
    }),
    sources: [ibb.isparkMeta],
    ornekSorular: ["Kadıköy'de boş yeri olan İSPARK otoparkları hangileri?"],
    run: ({ ilce, sadeceAcik, limit }) => ibb.getParking({ ilce, sadeceAcik, limit }),
    ozet(s: Sonuc<ibb.Otopark[]>) {
      if (!s.veri.length) return "Uygun otopark bulunamadı.";
      return s.veri
        .map(
          (p) =>
            `- ${p.ad} (${p.ilce}): ${p.bos}/${p.kapasite} boş · ${p.tur} · ${p.calismaSaatleri}${p.ucretsizDakika ? ` · ilk ${p.ucretsizDakika} dk ücretsiz` : ""}`,
        )
        .join("\n");
    },
  }),
  defineTool({
    name: "opendata_search",
    title: "Belediye açık veri arama",
    description:
      "Search open datasets of Istanbul (İBB) or İzmir metropolitan municipalities (açık veri): transport, dams/baraj, markets/hal, environment, disaster areas… Returns datasets and their resource ids; resources marked queryable can be read with opendata_query.",
    inputSchema: z.object({
      portal: portalSema,
      sorgu: z
        .string()
        .min(2)
        .describe('Arama, ör. "baraj doluluk", "hal fiyat", "toplanma alanı"'),
      limit: z.number().int().min(1).max(50).default(10),
    }),
    sources: [ckan.portalMeta.ibb, ckan.portalMeta.izmir],
    ornekSorular: [
      "İBB açık veride baraj doluluk verisi var mı?",
      "İzmir'de afet toplanma alanları veri seti",
    ],
    run: ({ portal, sorgu, limit }) => ckan.searchDatasets(portal, sorgu, limit),
    ozet(s: Sonuc<{ toplam: number; sonuclar: ckan.VeriSeti[] }>) {
      if (!s.veri.sonuclar.length) return "Eşleşen veri seti yok.";
      return `${s.veri.toplam} veri seti bulundu:\n${s.veri.sonuclar
        .map(
          (d) =>
            `• ${d.baslik}${d.kurum ? ` — ${d.kurum}` : ""}${d.guncelleme ? ` (güncelleme ${d.guncelleme})` : ""}\n  ${d.url}\n${d.kaynaklar
              .map(
                (r) =>
                  `  - [${r.format || "?"}] ${r.ad}${r.datastore ? ` · sorgulanabilir: ${r.id}` : ""}`,
              )
              .join("\n")}`,
        )
        .join("\n")}`;
    },
  }),
  defineTool({
    name: "opendata_query",
    title: "Belediye açık veri tablosu sorgula",
    description:
      "Read rows from a queryable (datastore) resource of İBB or İzmir open data portals. Use opendata_search first to find the resource id. Supports full-text filter and sorting.",
    inputSchema: z.object({
      portal: portalSema,
      kaynakId: z.string().describe("opendata_search sonucundaki 'sorgulanabilir' kaynak id'si"),
      sorgu: z.string().optional().describe("Tablo içinde tam metin arama"),
      sirala: z.string().optional().describe('Sıralama, ör. "_id desc" (en yeni kayıtlar)'),
      limit: limitSema,
    }),
    sources: [ckan.portalMeta.ibb, ckan.portalMeta.izmir],
    ornekSorular: ["Bu veri setinin son 10 kaydını getir"],
    run: ({ portal, kaynakId, sorgu, sirala, limit }) =>
      ckan.queryDatastore(portal, kaynakId, { q: sorgu, sirala, limit }),
    ozet(s: Sonuc<ckan.TabloSonucu>) {
      const v = s.veri;
      return `${v.toplam} kayıttan ${v.kayitlar.length} tanesi. Alanlar: ${v.alanlar.join(", ")}\n${v.kayitlar
        .slice(0, 10)
        .map((r) => `- ${v.alanlar.map((a) => `${a}=${String(r[a] ?? "")}`).join(" · ")}`)
        .join("\n")}`;
    },
  }),
];
