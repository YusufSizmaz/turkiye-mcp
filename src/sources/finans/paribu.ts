import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { type KriptoFiyat, pariteNormalize, VARSAYILAN_PARITELER } from "./kripto.js";

export const meta: SourceMeta = {
  id: "paribu",
  ad: "Paribu",
  kategori: "finans",
  rozet: "birinci-taraf",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.paribu.com",
  aciklama: "Paribu kripto borsasının herkese açık fiyat (ticker) uç noktası. TL pariteleri.",
  ttlSaniye: 30,
  ucNoktalar: ["GET https://www.paribu.com/ticker"],
  kutuphaneOrnegi: `import { paribu } from "turkiye-mcp";

const { veri } = await paribu.getTickers({ pariteler: ["BTC", "AVAX"] });`,
};

const URL_ = "https://www.paribu.com/ticker";

interface Ham {
  last: number;
  highestBid: number;
  lowestAsk: number;
  low24hr: number;
  high24hr: number;
  percentChange: number;
  volume: number;
}

/** Paribu anahtarları "BTC_TL" biçimindedir. */
const paribuAnahtari = (p: string) => p.replace(/_TRY$/, "_TL");

export async function getTickers(o: { pariteler?: string[] } = {}): Promise<Sonuc<KriptoFiyat[]>> {
  const ham = await cached("paribu", meta.ttlSaniye, () =>
    fetchJson<Record<string, Ham>>(URL_, { sourceId: meta.id, browserUA: true }),
  );
  if (!ham || typeof ham !== "object" || Array.isArray(ham)) {
    throw new KaynakHatasi(meta.id, "ayristirma", "Paribu yanıtı beklenen biçimde değil.");
  }
  const istenen = (o.pariteler?.length ? o.pariteler : VARSAYILAN_PARITELER).map(pariteNormalize);
  const veri = istenen.flatMap((p) => {
    const d = ham[paribuAnahtari(p)];
    if (!d) return [];
    return [
      {
        parite: p,
        son: d.last,
        alis: d.highestBid ?? null,
        satis: d.lowestAsk ?? null,
        enDusuk24s: d.low24hr ?? null,
        enYuksek24s: d.high24hr ?? null,
        degisimYuzde: d.percentChange,
        hacim: d.volume,
      },
    ];
  });
  return sonuc(meta, URL_, veri);
}
