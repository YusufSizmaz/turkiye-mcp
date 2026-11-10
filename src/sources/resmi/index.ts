import type { KategoriModulu } from "../../mcp/tool.js";
import * as resmiGazete from "./resmi-gazete.js";

export const resmi: KategoriModulu = {
  kategori: "resmi",
  ad: "Resmî Yayınlar",
  ikon: "📜",
  aciklama: "Resmî Gazete'nin günlük sayıları ve içerik başlıkları.",
  sources: [resmiGazete.meta],
  tools: [...resmiGazete.araclar],
  probes: {
    [resmiGazete.meta.id]: async () => {
      const s = await resmiGazete.getIssue();
      if (!s.veri.bolumler.length) throw new Error("içindekiler boş");
    },
  },
};
