import * as z from "zod";
import { trSayi } from "../../core/format.js";
import { limitSema } from "../../core/sema.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool, type KategoriModulu } from "../../mcp/tool.js";
import * as t from "./turkiyeapi.js";

const araclar = [
  defineTool({
    name: "cografya_get_provinces",
    title: "İl bilgileri",
    description:
      "Turkish provinces (il) facts: plate code, population (nüfus), area, altitude, region, metropolitan/coastal, phone area code, coordinates. One province by name or all 81.",
    inputSchema: z.object({
      ad: z.string().optional().describe("İl adı veya plaka. Boşsa 81 il."),
    }),
    sources: [t.meta],
    ornekSorular: ["Ankara'nın nüfusu ve yüzölçümü ne?", "Kıyısı olan büyükşehirler hangileri?"],
    run: ({ ad }) => t.getProvinces({ ad }),
    ozet(s: Sonuc<t.IlBilgisi[]>) {
      return s.veri
        .map(
          (i) =>
            `- ${i.ad} (${String(i.plaka).padStart(2, "0")}) · ${i.bolge} · nüfus ${trSayi(i.nufus)} · ${trSayi(i.alanKm2)} km² · rakım ${i.rakim} m · tel ${i.telefonKodu.join("/")}${i.buyuksehir ? " · büyükşehir" : ""}${i.kiyi ? " · kıyı" : ""}`,
        )
        .join("\n");
    },
  }),
  defineTool({
    name: "cografya_get_districts",
    title: "İlçeler",
    description:
      "Districts (ilçe) of a Turkish province with population and area, most populous first.",
    inputSchema: z.object({ il: z.string().describe("İl adı veya plaka") }),
    sources: [t.meta],
    ornekSorular: ["İzmir'in en kalabalık ilçeleri hangileri?"],
    run: ({ il }) => t.getDistricts(il),
    ozet(s: Sonuc<t.IlceBilgisi[]>) {
      return `${s.veri.length} ilçe:\n${s.veri.map((d) => `- ${d.ad}: ${trSayi(d.nufus)} kişi, ${trSayi(d.alanKm2)} km²`).join("\n")}`;
    },
  }),
  defineTool({
    name: "cografya_get_neighborhoods",
    title: "Mahalleler",
    description: "Neighborhoods (mahalle) of a district with population.",
    inputSchema: z.object({
      il: z.string().describe("İl"),
      ilce: z.string().describe("İlçe"),
      limit: limitSema,
    }),
    sources: [t.meta],
    ornekSorular: ["Kadıköy'ün mahalleleri ve nüfusları"],
    run: ({ il, ilce, limit }) => t.getNeighborhoods({ il, ilce, limit }),
    ozet(s: Sonuc<Array<{ ad: string; nufus: number }>>) {
      return s.veri.map((m) => `- ${m.ad}: ${trSayi(m.nufus)}`).join("\n");
    },
  }),
];

export const cografya: KategoriModulu = {
  kategori: "cografya",
  ad: "Coğrafya",
  ikon: "🗺️",
  aciklama:
    "81 il, ilçe ve mahalle bilgileri: nüfus, yüzölçümü, rakım, bölge, plaka, telefon kodu, koordinat.",
  sources: [t.meta],
  tools: araclar,
  probes: {
    [t.meta.id]: async () => {
      const s = await t.getProvinces({ ad: "Ankara" });
      if (!s.veri.length) throw new Error("il yok");
    },
  },
};
