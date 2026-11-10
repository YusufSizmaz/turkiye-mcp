import * as z from "zod";
import { trZaman } from "../../core/format.js";
import { gunAdi } from "../../core/tarih.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool, type KategoriModulu } from "../../mcp/tool.js";
import * as namaz from "./namaz.js";
import * as tatiller from "./tatiller.js";

const araclar = [
  defineTool({
    name: "takvim_get_holidays",
    title: "Resmî tatiller",
    description:
      "Official public holidays in Türkiye for a year, including religious holidays (Ramazan/Kurban Bayramı) — resmî tatil, bayram günleri.",
    inputSchema: z.object({
      yil: z.number().int().min(2000).max(2100).optional().describe("Yıl. Boşsa bu yıl."),
    }),
    sources: [tatiller.meta],
    ornekSorular: [
      "Bu yıl Kurban Bayramı ne zaman?",
      "2027 resmî tatilleri hangi günlere denk geliyor?",
    ],
    run: ({ yil }) => tatiller.getHolidays(yil),
    ozet(s: Sonuc<tatiller.Tatil[]>) {
      return s.veri.map((t) => `- ${trZaman(t.tarih)} ${t.gun}: ${t.ad}`).join("\n");
    },
  }),
  defineTool({
    name: "takvim_get_prayer_times",
    title: "Namaz vakitleri",
    description:
      "Islamic prayer times (namaz vakitleri, ezan, iftar/sahur) for any Turkish province/district from Diyanet data: imsak, güneş, öğle, ikindi, akşam, yatsı. Uses the official Diyanet API if DIYANET_EMAIL/DIYANET_PASSWORD are set, otherwise a keyless Diyanet mirror.",
    inputSchema: z.object({
      il: z.string().describe("İl"),
      ilce: z.string().optional().describe("İlçe. Boşsa il merkezi."),
      gunSayisi: z
        .number()
        .int()
        .min(1)
        .max(30)
        .default(1)
        .describe("Bugünden itibaren kaç gün (1–30)"),
    }),
    sources: [namaz.ezanMeta],
    ornekSorular: [
      "İstanbul'da bugün akşam ezanı kaçta?",
      "Üsküdar için bu haftanın namaz vakitleri",
    ],
    run: ({ il, ilce, gunSayisi }, env) => namaz.getPrayerTimes({ il, ilce, gunSayisi }, env),
    ozet(s: Sonuc<namaz.Vakit[]>) {
      if (!s.veri.length) return "Vakit bulunamadı.";
      return `${s.veri[0]?.yer}\n${s.veri
        .map(
          (v) =>
            `${gunAdi(v.tarih)} ${trZaman(v.tarih)} (${v.hicri}): İmsak ${v.imsak} · Güneş ${v.gunes} · Öğle ${v.ogle} · İkindi ${v.ikindi} · Akşam ${v.aksam} · Yatsı ${v.yatsi}`,
        )
        .join("\n")}`;
    },
  }),
];

export const takvim: KategoriModulu = {
  kategori: "takvim",
  ad: "Takvim & Vakitler",
  ikon: "📅",
  aciklama: "Resmî tatiller ve dinî bayramlar; il/ilçe bazında namaz vakitleri (Diyanet verisi).",
  sources: [tatiller.meta, namaz.ezanMeta, namaz.diyanetMeta],
  tools: araclar,
  probes: {
    [tatiller.meta.id]: async () => {
      const s = await tatiller.getHolidays();
      if (!s.veri.length) throw new Error("tatil yok");
    },
    [namaz.ezanMeta.id]: async () => {
      const s = await namaz.getPrayerTimes({ il: "Ankara" }, {});
      if (!s.veri.length) throw new Error("vakit yok");
    },
    [namaz.diyanetMeta.id]: async () => {
      const { kaynakAktif } = await import("../../mcp/tool.js");
      const { KaynakHatasi } = await import("../../core/errors.js");
      if (!kaynakAktif(namaz.diyanetMeta, process.env)) {
        throw new KaynakHatasi(
          namaz.diyanetMeta.id,
          "anahtar-yok",
          "DIYANET_EMAIL/DIYANET_PASSWORD yok",
        );
      }
      const s = await namaz.getPrayerTimes({ il: "Ankara" }, process.env);
      if (s.kaynak.id !== namaz.diyanetMeta.id || !s.veri.length)
        throw new Error("Diyanet vakti yok");
    },
  },
};
