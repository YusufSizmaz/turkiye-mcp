import * as z from "zod";
import { limitSema } from "../../core/sema.js";
import type { Sonuc } from "../../core/types.js";
import { defineTool, type KategoriModulu } from "../../mcp/tool.js";
import * as ankara from "./eczane/ankara.js";
import { DESTEKLENEN_ILLER, type Eczane, getOnDuty, metalar } from "./eczane/index.js";
import * as istanbul from "./eczane/istanbul.js";
import * as izmir from "./eczane/izmir.js";

const haritaLinki = (e: Eczane) =>
  e.konum ? `https://www.google.com/maps?q=${e.konum.enlem},${e.konum.boylam}` : null;

const arac = defineTool({
  name: "eczane_get_on_duty",
  title: "Nöbetçi eczaneler",
  description: `On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: ${DESTEKLENEN_ILLER}. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.`,
  inputSchema: z.object({
    il: z.string().describe(`İl: ${DESTEKLENEN_ILLER}`),
    ilce: z
      .string()
      .optional()
      .describe('İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova"'),
    limit: limitSema,
  }),
  sources: metalar,
  ornekSorular: ["Kadıköy'de bugün nöbetçi eczane hangisi?", "Çankaya'da açık eczane var mı?"],
  run: ({ il, ilce, limit }) => getOnDuty({ il, ilce, limit }),
  ozet(s: Sonuc<Eczane[]>) {
    if (!s.veri.length) return "Bu bölgede nöbetçi eczane bulunamadı.";
    return s.veri
      .map((e) =>
        [
          `• ${e.ad} (${e.ilce})${e.nobet ? ` · nöbet ${e.nobet}` : ""}`,
          `  ${e.adres}`,
          e.tarif ? `  Tarif: ${e.tarif}` : null,
          e.telefon ? `  Tel: ${e.telefon}` : null,
          haritaLinki(e) ? `  Harita: ${haritaLinki(e)}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      )
      .join("\n");
  },
});

export const saglik: KategoriModulu = {
  kategori: "saglik",
  ad: "Sağlık",
  ikon: "💊",
  aciklama: `Eczacı odalarından bugünkü nöbetçi eczaneler (${DESTEKLENEN_ILLER}). Yeni il adaptörlerine katkıya açık.`,
  sources: metalar,
  tools: [arac],
  probes: {
    [istanbul.meta.id]: async () => {
      const s = await getOnDuty({ il: "İstanbul", ilce: "Kadıköy" });
      if (!s.veri.length) throw new Error("Kadıköy'de nöbetçi eczane yok");
    },
    [izmir.meta.id]: async () => {
      const s = await getOnDuty({ il: "İzmir" });
      if (!s.veri.length) throw new Error("liste boş");
    },
    [ankara.meta.id]: async () => {
      const s = await getOnDuty({ il: "Ankara" });
      if (!s.veri.length) throw new Error("liste boş");
    },
  },
};
