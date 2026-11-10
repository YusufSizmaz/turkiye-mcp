import type { KategoriModulu } from "../../mcp/tool.js";
import { araclar } from "./arac.js";
import * as ckan from "./ckan.js";
import * as ibb from "./ibb.js";

export const sehir: KategoriModulu = {
  kategori: "sehir",
  ad: "Şehir Verileri",
  ikon: "🏙️",
  aciklama:
    "İstanbul'un canlı trafik endeksi ve İSPARK doluluğu; İBB ve İzmir açık veri portallarında arama ve tablo sorgusu (barajlar, hal, ulaşım, afet ve yüzlercesi).",
  sources: [ibb.trafikMeta, ibb.isparkMeta, ckan.portalMeta.ibb, ckan.portalMeta.izmir],
  tools: [...araclar],
  probes: {
    [ibb.trafikMeta.id]: () => ibb.getTrafficIndex(),
    [ibb.isparkMeta.id]: async () => {
      const s = await ibb.getParking({ limit: 1 });
      if (!s.veri.length) throw new Error("otopark yok");
    },
    [ckan.portalMeta.ibb.id]: async () => {
      const s = await ckan.searchDatasets("ibb", "baraj", 1);
      if (!s.veri.sonuclar.length) throw new Error("sonuç yok");
    },
    [ckan.portalMeta.izmir.id]: async () => {
      const s = await ckan.searchDatasets("izmir", "eczane", 1);
      if (!s.veri.sonuclar.length) throw new Error("sonuç yok");
    },
  },
};
