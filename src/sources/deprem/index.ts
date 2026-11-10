import type { KategoriModulu } from "../../mcp/tool.js";
import * as afad from "./afad.js";
import { araclar } from "./arac.js";
import * as kandilli from "./kandilli.js";

export const deprem: KategoriModulu = {
  kategori: "deprem",
  ad: "Deprem & Afet",
  ikon: "🌍",
  aciklama: "AFAD ve Kandilli Rasathanesi'nden son depremler.",
  sources: [afad.meta, kandilli.meta],
  tools: [...araclar],
  probes: {
    [afad.meta.id]: async () => {
      const s = await afad.getEarthquakes({ saat: 72, limit: 1 });
      if (!s.veri.toplam) throw new Error("son 72 saatte AFAD kaydı yok");
    },
    [kandilli.meta.id]: async () => {
      const s = await kandilli.getEarthquakes({ saat: 72, limit: 1 });
      if (!s.veri.toplam) throw new Error("son 72 saatte Kandilli kaydı yok");
    },
  },
};
