import * as z from "zod";
import { trSayi, trZaman } from "../../core/format.js";
import { limitSema } from "../../core/sema.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import * as afad from "./afad.js";
import * as kandilli from "./kandilli.js";
import type { DepremListesi } from "./tipler.js";

const girdi = z.object({
  kaynak: z.enum(["afad", "kandilli"]).default("afad").describe("Veri kaynağı: AFAD veya Kandilli"),
  saat: z.number().min(1).max(720).default(24).describe("Son kaç saat (1–720, varsayılan 24)"),
  minBuyukluk: z.number().min(0).max(10).default(0).describe("En küçük büyüklük, ör. 3"),
  il: z.string().optional().describe('İl filtresi, ör. "İzmir" (Türkçe karakter şart değil)'),
  limit: limitSema,
});

export const araclar = [
  defineTool({
    name: "deprem_get_recent",
    title: "Son depremler",
    description:
      "Recent earthquakes in and around Türkiye (son depremler, deprem listesi) from AFAD or Kandilli Observatory, newest first. Filter by hours, minimum magnitude and province (il).",
    inputSchema: girdi,
    sources: [afad.meta, kandilli.meta],
    ornekSorular: [
      "Son 24 saatte 4'ten büyük deprem oldu mu?",
      "Kandilli'ye göre İzmir'de bugün deprem var mı?",
    ],
    run(g) {
      const { kaynak, ...sorgu } = g;
      return (kaynak === "kandilli" ? kandilli : afad).getEarthquakes(sorgu);
    },
    ozet(s: Sonuc<DepremListesi>, g) {
      const { saat, minBuyukluk: min } = g;
      const nerede = g.il ? ` ${g.il} ilinde` : "";
      const kapsam = `Son ${saat} saatte${nerede}${min ? ` ${trSayi(min, 1)}+ büyüklüğünde` : ""}`;
      const { toplam, enBuyuk, depremler } = s.veri;
      if (!toplam || !enBuyuk) return `${kapsam} deprem kaydedilmedi.`;
      const liste = depremler
        .map(
          (d) =>
            `- ${trZaman(d.tarih)} · ${trSayi(d.buyukluk, 1)} ${d.tip} · ${trSayi(d.derinlikKm, 1)} km · ${d.yer}`,
        )
        .join("\n");
      const kesik =
        depremler.length < toplam ? ` Aşağıda en yeni ilk ${depremler.length} tanesi var.` : "";
      return `${kapsam} ${toplam} deprem.${kesik}\nEn büyüğü: ${trSayi(enBuyuk.buyukluk, 1)} ${enBuyuk.tip} — ${enBuyuk.yer}, ${trZaman(enBuyuk.tarih)}\n${liste}`;
    },
  }),
];
