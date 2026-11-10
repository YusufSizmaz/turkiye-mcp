import type { KategoriModulu } from "../../mcp/tool.js";
import { araclar } from "./arac.js";
import * as hk from "./hava-kalitesi.js";
import * as mgm from "./mgm.js";

export const havaCevre: KategoriModulu = {
  kategori: "hava-cevre",
  ad: "Hava & Çevre",
  ikon: "🌤️",
  aciklama: "MGM anlık hava durumu ve tahminleri, Ulusal Hava Kalitesi İzleme Ağı ölçümleri.",
  sources: [mgm.meta, hk.meta],
  tools: [...araclar],
  probes: {
    [mgm.meta.id]: async () => {
      const s = await mgm.getCurrent("Ankara");
      if (s.veri.sicaklik === null) throw new Error("sıcaklık yok");
    },
    [hk.meta.id]: async () => {
      const s = await hk.getAirQuality({ limit: 1 });
      if (!s.veri.length) throw new Error("istasyon yok");
    },
  },
};
