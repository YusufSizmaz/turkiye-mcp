import * as z from "zod";
import { trSayi } from "../../core/format.js";
import { tarihSema } from "../../core/sema.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import * as epias from "./epias.js";
import * as opet from "./opet.js";

export const araclar = [
  defineTool({
    name: "enerji_get_fuel_prices",
    title: "Akaryakıt fiyatları (Opet)",
    description:
      "Current fuel pump prices in Türkiye by province/district from Opet (akaryakıt, benzin, motorin, mazot, LPG fiyatı).",
    inputSchema: z.object({
      il: z.union([z.string(), z.number()]).describe('İl adı veya plaka, ör. "İstanbul" ya da 34'),
      ilce: z.string().optional().describe("İlçe adı. Boşsa ilk 10 ilçe."),
    }),
    sources: [opet.meta],
    ornekSorular: ["Kadıköy'de benzin litresi kaç TL?", "Ankara'da motorin fiyatı ne?"],
    run: ({ il, ilce }) => opet.getFuelPrices({ il, ilce }),
    ozet(s: Sonuc<{ ilceler: opet.IlceFiyat[]; toplamIlce: number }>) {
      return s.veri.ilceler
        .map(
          (i) =>
            `${i.il} / ${i.ilce}\n${i.urunler.map((u) => `  ${u.ad}: ${trSayi(u.fiyat, 2)} TL`).join("\n")}`,
        )
        .join("\n");
    },
  }),
  defineTool({
    name: "enerji_get_electricity_market",
    title: "Elektrik piyasası (EPİAŞ)",
    description:
      "Turkish electricity market data from EPİAŞ Transparency Platform: hourly day-ahead market clearing price (PTF, elektrik fiyatı) or real-time consumption (tüketim). Requires EPIAS_USERNAME and EPIAS_PASSWORD.",
    inputSchema: z.object({
      veri: z
        .enum(["ptf", "tuketim"])
        .default("ptf")
        .describe("ptf: piyasa takas fiyatı · tuketim: gerçek zamanlı tüketim"),
      tarih: tarihSema.optional().describe("Tarih (YYYY-MM-DD). Boşsa bugün."),
    }),
    sources: [epias.meta],
    ornekSorular: ["Bugün elektrik piyasa takas fiyatı saatlik ne kadar?"],
    run: ({ veri, tarih }, env) =>
      veri === "tuketim"
        ? epias.getRealtimeConsumption({ tarih }, env)
        : epias.getMarketClearingPrice({ tarih }, env),
    ozet(s: Sonuc<Array<epias.PtfSaati | epias.TuketimSaati>>, g) {
      if (!s.veri.length) return "Veri yok.";
      if (g.veri === "tuketim") {
        return (s.veri as epias.TuketimSaati[])
          .map((x) => `- ${x.saat}: ${trSayi(x.tuketimMwh, 0)} MWh`)
          .join("\n");
      }
      const v = s.veri as epias.PtfSaati[];
      const ort = v.reduce((t, x) => t + x.ptfTl, 0) / v.length;
      return `Ortalama PTF ${trSayi(ort, 2)} TL/MWh\n${v.map((x) => `- ${x.saat}: ${trSayi(x.ptfTl, 2)} TL/MWh`).join("\n")}`;
    },
  }),
];
