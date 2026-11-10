import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { type KriptoFiyat, pariteNormalize, VARSAYILAN_PARITELER } from "./kripto.js";

export const meta: SourceMeta = {
  id: "btcturk",
  ad: "BtcTurk",
  kategori: "finans",
  rozet: "birinci-taraf",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://docs.btcturk.com",
  aciklama:
    "Türkiye'nin en büyük kripto borsalarından BtcTurk'ün herkese açık fiyat (ticker) API'si.",
  ttlSaniye: 30,
  ucNoktalar: ["GET https://api.btcturk.com/api/v2/ticker"],
  kutuphaneOrnegi: `import { btcturk } from "turkiye-mcp";

const { veri } = await btcturk.getTickers({ pariteler: ["BTC_TRY", "ETH_TRY"] });`,
};

const URL_ = "https://api.btcturk.com/api/v2/ticker";

interface Ham {
  pairNormalized: string;
  last: number;
  bid: number;
  ask: number;
  low: number;
  high: number;
  dailyPercent: number;
  volume: number;
}

export async function getTickers(o: { pariteler?: string[] } = {}): Promise<Sonuc<KriptoFiyat[]>> {
  const ham = await cached("btcturk", meta.ttlSaniye, () =>
    fetchJson<{ data?: Ham[] }>(URL_, { sourceId: meta.id }),
  );
  if (!Array.isArray(ham?.data)) {
    throw new KaynakHatasi(meta.id, "ayristirma", "BtcTurk yanıtı beklenen biçimde değil.");
  }
  const istenen = (o.pariteler?.length ? o.pariteler : VARSAYILAN_PARITELER).map(pariteNormalize);
  const harita = new Map(ham.data.map((d) => [d.pairNormalized, d]));
  const veri = istenen.flatMap((p) => {
    const d = harita.get(p);
    if (!d) return [];
    return [
      {
        parite: p,
        son: d.last,
        alis: d.bid ?? null,
        satis: d.ask ?? null,
        enDusuk24s: d.low ?? null,
        enYuksek24s: d.high ?? null,
        degisimYuzde: d.dailyPercent,
        hacim: d.volume,
      },
    ];
  });
  return sonuc(meta, URL_, veri);
}
