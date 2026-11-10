import type { KategoriModulu } from "../../mcp/tool.js";
import { araclar } from "./arac.js";
import * as epias from "./epias.js";
import * as opet from "./opet.js";

export const enerji: KategoriModulu = {
  kategori: "enerji",
  ad: "Enerji & Akaryakıt",
  ikon: "⛽",
  aciklama: "İl/ilçe bazında akaryakıt pompa fiyatları ve EPİAŞ elektrik piyasası verileri.",
  sources: [opet.meta, epias.meta],
  tools: [...araclar],
  probes: {
    [opet.meta.id]: async () => {
      const s = await opet.getFuelPrices({ il: "Ankara" });
      if (!s.veri.ilceler.length) throw new Error("fiyat yok");
    },
    [epias.meta.id]: async () => {
      const s = await epias.getMarketClearingPrice({}, process.env);
      if (!s.veri.length) throw new Error("PTF yok");
    },
  },
};
