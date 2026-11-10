import * as z from "zod";
import { trSayi } from "../../core/format.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";
import * as btcturk from "./btcturk.js";
import type { KriptoFiyat } from "./kripto.js";
import * as paribu from "./paribu.js";

// ── MCP aracı (BtcTurk + Paribu ortak) ─────────────────────────────────────

export const araclar = [
  defineTool({
    name: "finans_get_crypto_prices",
    title: "Kripto para fiyatları (TL)",
    description:
      "Live cryptocurrency prices in TRY from Turkish exchanges BtcTurk or Paribu (kripto, bitcoin, ethereum, USDT). Default pairs BTC_TRY, ETH_TRY, USDT_TRY.",
    inputSchema: z.object({
      borsa: z.enum(["btcturk", "paribu"]).default("btcturk").describe("Borsa"),
      pariteler: z
        .array(z.string())
        .optional()
        .describe('Pariteler, ör. ["BTC","ETH_TRY","AVAXTRY"]. Boşsa BTC, ETH, USDT.'),
    }),
    sources: [btcturk.meta, paribu.meta],
    ornekSorular: ["Bitcoin şu an kaç TL?", "Paribu'da ETH ve AVAX fiyatları ne?"],
    run: ({ borsa, pariteler }) =>
      (borsa === "paribu" ? paribu : btcturk).getTickers({ pariteler }),
    ozet(s: Sonuc<KriptoFiyat[]>) {
      if (!s.veri.length) return "İstenen pariteler bu borsada bulunamadı.";
      return s.veri
        .map(
          (k) =>
            `- ${k.parite.replace("_", "/")}: ${trSayi(k.son, 4)} (24s ${k.degisimYuzde >= 0 ? "+" : ""}${trSayi(k.degisimYuzde, 2)}%)`,
        )
        .join("\n");
    },
  }),
];
