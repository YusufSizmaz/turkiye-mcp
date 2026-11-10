import * as z from "zod";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trSayi, trZaman } from "../../core/format.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { defineTool } from "../../mcp/tool.js";

export const meta: SourceMeta = {
  id: "truncgil",
  ad: "Truncgil Finans (altın ve serbest piyasa)",
  kategori: "finans",
  rozet: "topluluk",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://finans.truncgil.com",
  aciklama:
    "Kapalıçarşı/serbest piyasa altın fiyatları (gram, çeyrek, yarım, tam, Cumhuriyet, 22/18/14 ayar), gümüş, platin, paladyum ve serbest piyasa döviz. Altın için ücretsiz resmî bir kaynak olmadığından topluluk kaynağıdır.",
  ttlSaniye: 300,
  ucNoktalar: ["GET https://finans.truncgil.com/v4/today.json"],
  kutuphaneOrnegi: `import { truncgil } from "turkiye-mcp";

const { veri } = await truncgil.getGoldAndMarket();
const ceyrek = veri.kalemler.find((k) => k.kod === "CEYREKALTIN");`,
};

const AD: Record<string, string> = {
  GRA: "Gram Altın",
  HAS: "Gram Has Altın",
  CEYREKALTIN: "Çeyrek Altın",
  YARIMALTIN: "Yarım Altın",
  TAMALTIN: "Tam Altın",
  CUMHURIYETALTINI: "Cumhuriyet Altını",
  ATAALTIN: "Ata Altın",
  RESATALTIN: "Reşat Altın",
  HAMITALTIN: "Hamit Altın",
  IKIBUCUKALTIN: "İkibuçuk Altın",
  BESLIALTIN: "Beşli Altın",
  GREMSEALTIN: "Gremse Altın",
  "14AYARALTIN": "14 Ayar Altın (gram)",
  "18AYARALTIN": "18 Ayar Altın (gram)",
  YIA: "22 Ayar Bilezik (gram)",
  GUMUS: "Gram Gümüş",
  GPL: "Gram Platin",
  PAL: "Gram Paladyum",
};

const TUR: Record<string, string> = {
  Gold: "Altın",
  Platinum: "Platin",
  Palladium: "Paladyum",
  Currency: "Döviz",
};

export interface PiyasaKalemi {
  kod: string;
  ad: string;
  tur: string;
  alis: number;
  satis: number;
  degisimYuzde: number;
}

interface HamKalem {
  Buying?: number;
  Selling?: number;
  Type?: string;
  Name?: string;
  Change?: number;
}

const URL_ = "https://finans.truncgil.com/v4/today.json";

export async function getGoldAndMarket(
  opts: { kodlar?: string[] } = {},
): Promise<Sonuc<{ guncelleme: string; kalemler: PiyasaKalemi[] }>> {
  const ham = await cached("truncgil", meta.ttlSaniye, () =>
    fetchJson<Record<string, HamKalem | string>>(URL_, { sourceId: meta.id }),
  );
  if (typeof ham !== "object" || !ham || typeof ham.Update_Date !== "string") {
    throw new KaynakHatasi(meta.id, "ayristirma", "Truncgil yanıtı beklenen biçimde değil.");
  }
  const istenen = opts.kodlar?.length ? new Set(opts.kodlar.map((k) => k.toUpperCase())) : null;
  const kalemler: PiyasaKalemi[] = [];
  for (const [kod, v] of Object.entries(ham)) {
    if (typeof v !== "object" || !v?.Type) continue;
    if (istenen ? !istenen.has(kod) : v.Type === "Currency") continue;
    if (!istenen && !(v.Buying && v.Selling)) continue; // endeks/boş kalemler
    kalemler.push({
      kod,
      ad: AD[kod] ?? v.Name ?? kod,
      tur: kod === "GUMUS" ? "Gümüş" : (TUR[v.Type] ?? v.Type),
      alis: v.Buying ?? 0,
      satis: v.Selling ?? 0,
      degisimYuzde: v.Change ?? 0,
    });
  }
  const guncelleme = `${ham.Update_Date.replace(" ", "T")}+03:00`;
  return sonuc(meta, URL_, { guncelleme, kalemler });
}

export const araclar = [
  defineTool({
    name: "finans_get_gold_prices",
    title: "Altın ve değerli metal fiyatları",
    description:
      "Turkish free-market gold prices (altın fiyatları: gram, çeyrek, yarım, tam, Cumhuriyet, 22/18/14 ayar), silver, platinum and palladium in TRY. Optionally any code from the feed (e.g. USD, EUR for free-market FX).",
    inputSchema: z.object({
      kodlar: z
        .array(z.string())
        .optional()
        .describe('Yalnız bu kodlar, ör. ["GRA","CEYREKALTIN","USD"]. Boşsa tüm değerli metaller.'),
    }),
    sources: [meta],
    ornekSorular: ["Gram altın ve çeyrek altın şu an kaç TL?", "Gümüşün gramı ne kadar?"],
    run: ({ kodlar }) => getGoldAndMarket({ kodlar }),
    ozet(s: Sonuc<{ guncelleme: string; kalemler: PiyasaKalemi[] }>) {
      return `Serbest piyasa — ${trZaman(s.veri.guncelleme)}\n${s.veri.kalemler
        .map(
          (k) =>
            `- ${k.ad}: alış ${trSayi(k.alis, 2)} · satış ${trSayi(k.satis, 2)} TL (${k.degisimYuzde >= 0 ? "+" : ""}${trSayi(k.degisimYuzde, 2)}%)`,
        )
        .join("\n")}`;
    },
  }),
];
