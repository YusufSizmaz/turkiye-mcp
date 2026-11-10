const HARITA: Record<string, string> = {
  ı: "i",
  ğ: "g",
  ü: "u",
  ş: "s",
  ö: "o",
  ç: "c",
  â: "a",
  î: "i",
  û: "u",
};

/** Karşılaştırma için: kırp, tr-TR küçült, Türkçe karakterleri ASCII'ye indir, boşlukları tekle. */
export function normalizeTr(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFC")
    .replace(/[ığüşöçâîû]/g, (c) => HARITA[c] ?? c)
    .replace(/\s+/g, " ");
}

export function eslesir(a: string, b: string): boolean {
  return normalizeTr(a) === normalizeTr(b);
}

/** a, b'yi (normalize edilmiş hâliyle) içeriyor mu? */
export function icerir(a: string, b: string): boolean {
  return normalizeTr(a).includes(normalizeTr(b));
}

/** "kadıköy" → "Kadıköy" (tr-TR baş harf büyütme, kelime bazında) */
export function basHarfBuyuk(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase("tr-TR")
    .split(/(\s+|-)/)
    .map((p) => (p.length ? p.charAt(0).toLocaleUpperCase("tr-TR") + p.slice(1) : p))
    .join("");
}
