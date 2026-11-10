import type { KategoriModulu } from "../../mcp/tool.js";
import { araclar } from "./arac.js";
import * as ckan from "./ckan.js";
import * as ibb from "./ibb.js";
import * as izmir from "./izmir.js";

export const sehir: KategoriModulu = {
  kategori: "sehir",
  ad: "Şehir Verileri",
  ikon: "🏙️",
  aciklama:
    "İstanbul trafik endeksi ve İSPARK; İzmir hal fiyatları, İZBAN/vapur saatleri ve kent rehberi; İBB ve İzmir açık veri portallarında arama.",
  sources: [
    ibb.trafikMeta,
    ibb.isparkMeta,
    izmir.halMeta,
    izmir.ulasimMeta,
    izmir.yerlerMeta,
    ckan.portalMeta.ibb,
    ckan.portalMeta.izmir,
  ],
  tools: [...araclar, ...izmir.araclar],
  probes: {
    [izmir.halMeta.id]: async () => {
      const s = await izmir.getMarketPrices({ tur: "sebzemeyve" });
      if (!s.veri.urunler.length) throw new Error("ürün yok");
    },
    [izmir.ulasimMeta.id]: async () => {
      const s = await izmir.getFerryTimes({ iskele: "Konak" });
      if (!s.veri.seferler.length) throw new Error("sefer yok");
    },
    [izmir.yerlerMeta.id]: async () => {
      const s = await izmir.findPlaces({ kategori: "hastaneler", limit: 1 });
      if (!s.veri.yerler.length) throw new Error("kayıt yok");
    },
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
