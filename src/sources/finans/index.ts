import type { KategoriModulu } from "../../mcp/tool.js";
import * as kap from "./kap.js";
import * as tcmb from "./tcmb.js";

export const finans: KategoriModulu = {
  kategori: "finans",
  ad: "Finans & Piyasalar",
  ikon: "💱",
  aciklama:
    "Döviz kurları, altın, BIST hisseleri, kripto paralar, KAP bildirimleri ve TCMB EVDS serileri.",
  sources: [tcmb.meta, kap.meta],
  tools: [...tcmb.araclar, ...kap.araclar],
  probes: {
    [tcmb.meta.id]: async () => {
      const s = await tcmb.getRates();
      if (!s.veri.kurlar.length) throw new Error("kur listesi boş");
    },
    [kap.meta.id]: async () => {
      const s = await kap.getLatestDisclosures({ limit: 1 });
      if (!s.veri.length) throw new Error("bildirim listesi boş");
    },
  },
};
