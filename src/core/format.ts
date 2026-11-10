/** Türkçe sayı biçimi: 50.1981 → "50,1981" */
export function trSayi(n: number | null | undefined, enFazlaBasamak = 4): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("tr-TR", { maximumFractionDigits: enFazlaBasamak });
}

/** "2026-11-10T14:03:00+03:00" → "10.11.2026 14:03" */
export function trZaman(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${m[1]}${m[4] ? ` ${m[4]}:${m[5]}` : ""}`;
}

export function sayiVeyaNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
