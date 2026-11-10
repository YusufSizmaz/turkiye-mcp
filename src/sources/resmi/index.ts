import type { KategoriModulu } from "../../mcp/tool.js";
import * as mevzuat from "./mevzuat.js";
import * as resmiGazete from "./resmi-gazete.js";

export const resmi: KategoriModulu = {
  kategori: "resmi",
  ad: "Resmî Yayınlar",
  ikon: "📜",
  aciklama:
    "Resmî Gazete'nin günlük sayıları ve Mevzuat Bilgi Sistemi'nde kanun, yönetmelik ve tebliğ araması.",
  sources: [resmiGazete.meta, mevzuat.meta],
  tools: [...resmiGazete.araclar, ...mevzuat.araclar],
  probes: {
    [mevzuat.meta.id]: async () => {
      const s = await mevzuat.search({ sorgu: "vergi", limit: 1 });
      if (!s.veri.sonuclar.length) throw new Error("sonuç yok");
    },
    [resmiGazete.meta.id]: async () => {
      const s = await resmiGazete.getIssue();
      if (!s.veri.bolumler.length) throw new Error("içindekiler boş");
    },
  },
};
