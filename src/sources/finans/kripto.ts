export interface KriptoFiyat {
  parite: string;
  son: number;
  alis: number | null;
  satis: number | null;
  enDusuk24s: number | null;
  enYuksek24s: number | null;
  degisimYuzde: number;
  hacim: number;
}

export const VARSAYILAN_PARITELER = ["BTC_TRY", "ETH_TRY", "USDT_TRY"];

/** "btc" → "BTC_TRY", "ETHTRY" → "ETH_TRY", "usdt_tl" → "USDT_TRY", "BTC_USDT" → "BTC_USDT" */
export function pariteNormalize(p: string): string {
  const s = p.trim().toUpperCase().replace(/[-/ ]/g, "_");
  if (s.includes("_")) {
    const [a, b] = s.split("_");
    return `${a}_${b === "TL" ? "TRY" : b}`;
  }
  for (const karsi of ["USDT", "TRY", "TL", "USD", "EUR", "BTC"]) {
    if (s.length > karsi.length && s.endsWith(karsi)) {
      return `${s.slice(0, -karsi.length)}_${karsi === "TL" ? "TRY" : karsi}`;
    }
  }
  return `${s}_TRY`;
}
