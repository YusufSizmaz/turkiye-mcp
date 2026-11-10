import * as z from "zod";
import { trSayi, trZaman } from "../../core/format.js";
import { limitSema } from "../../core/sema.js";
import { gunAdi } from "../../core/tarih.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import * as hk from "./hava-kalitesi.js";
import * as mgm from "./mgm.js";

const yerSema = {
  il: z.string().min(2).describe('İl adı veya plaka, ör. "İstanbul", "izmir", "6"'),
  ilce: z
    .string()
    .optional()
    .describe('İlçe, ör. "Kadıköy" (Türkçe karakter şart değil). Boşsa il merkezi.'),
};

const derece = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `${trSayi(n, 1)} °C`;

export const araclar = [
  defineTool({
    name: "hava_get_current",
    title: "Anlık hava durumu (MGM)",
    description:
      "Current observed weather (hava durumu, sıcaklık) for a Turkish province/district from the Turkish State Meteorological Service (MGM): temperature, feels-like, humidity, wind, pressure, precipitation, condition.",
    inputSchema: z.object(yerSema),
    sources: [mgm.meta],
    ornekSorular: ["Kadıköy'de hava şu an nasıl?", "Ankara'da şu an kaç derece?"],
    run: ({ il, ilce }) => mgm.getCurrent(il, ilce),
    ozet(s: Sonuc<mgm.AnlikHava>) {
      const v = s.veri;
      return `${v.yer} — ${trZaman(v.zaman)}\n${derece(v.sicaklik)} (hissedilen ${derece(v.hissedilen)}), ${v.hadise}\nNem %${v.nem ?? "—"} · Rüzgâr ${trSayi(v.ruzgarKmh, 1)} km/sa · Basınç ${trSayi(v.basinc, 1)} hPa${v.yagis24SaatMm ? ` · Son 24 saat yağış ${trSayi(v.yagis24SaatMm, 1)} mm` : ""}`;
    },
  }),
  defineTool({
    name: "hava_get_forecast",
    title: "Hava tahmini (MGM)",
    description:
      "Weather forecast (hava tahmini) for a Turkish province/district from MGM: 5-day daily min/max and condition, or 3-hourly forecast.",
    inputSchema: z.object({
      ...yerSema,
      tur: z
        .enum(["gunluk", "saatlik"])
        .default("gunluk")
        .describe("gunluk: 5 gün · saatlik: 3 saatlik"),
    }),
    sources: [mgm.meta],
    ornekSorular: ["İzmir'de hafta sonu hava nasıl olacak?", "Yarın Bursa'da yağmur var mı?"],
    run: ({ il, ilce, tur }) => mgm.getForecast(il, ilce, tur),
    ozet(s: Sonuc<mgm.TahminGunu[]>, g) {
      return s.veri
        .map((t) =>
          g.tur === "gunluk"
            ? `- ${gunAdi(t.tarih)} ${trZaman(t.tarih)}: ${trSayi(t.enDusuk, 1)} / ${trSayi(t.enYuksek, 1)} °C, ${t.hadise}`
            : `- ${trZaman(t.tarih)}: ${derece(t.sicaklik)}, ${t.hadise}, nem %${t.nem ?? "—"}`,
        )
        .join("\n");
    },
  }),
  defineTool({
    name: "hava_get_air_quality",
    title: "Hava kalitesi",
    description:
      "Air quality (hava kalitesi, kirlilik, PM10, PM2.5) from Türkiye's National Air Quality Monitoring Network: latest hourly AQI, category and dominant pollutant per station, worst first. Filter by province.",
    inputSchema: z.object({
      il: z.string().optional().describe("İl adı. Boşsa tüm Türkiye (en kötüden iyiye)."),
      limit: limitSema,
    }),
    sources: [hk.meta],
    ornekSorular: [
      "Ankara'da hava kalitesi nasıl?",
      "Şu an Türkiye'de havası en kirli yerler neresi?",
    ],
    run: ({ il, limit }) => hk.getAirQuality({ il, limit }),
    ozet(s: Sonuc<hk.IstasyonOlcumu[]>) {
      if (!s.veri.length) return "Bu ilde istasyon bulunamadı.";
      return s.veri
        .map(
          (x) =>
            `- ${x.istasyon}: ${x.indeks ?? "—"} (${x.kategori}${x.baskinKirletici ? `, baskın ${x.baskinKirletici}` : ""})`,
        )
        .join("\n");
    },
  }),
];
