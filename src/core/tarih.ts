const TZ = "Europe/Istanbul";

function parcalar(now: Date): Record<string, string> {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  return Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
}

/** Türkiye'de şu anki saat (0–23). */
export function trSaat(now: Date = new Date()): number {
  return Number(parcalar(now).hour);
}

/** Türkiye'de bugünün tarihi, "YYYY-MM-DD". */
export function bugunTr(now: Date = new Date()): string {
  const p = parcalar(now);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Türkiye yerel saatiyle, +03:00 ofsetli ISO zaman damgası. */
export function istanbulIso(now: Date = new Date()): string {
  const p = parcalar(now);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+03:00`;
}

export function trTarihParcalari(iso: string): { yil: string; ay: string; gun: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) throw new Error(`Geçersiz tarih: ${iso} (YYYY-MM-DD bekleniyor)`);
  return { yil: m[1] as string, ay: m[2] as string, gun: m[3] as string };
}

export function gunEkle(iso: string, gun: number): string {
  const { yil, ay, gun: g } = trTarihParcalari(iso);
  const d = new Date(Date.UTC(Number(yil), Number(ay) - 1, Number(g) + gun));
  return d.toISOString().slice(0, 10);
}

export function oncekiGun(iso: string): string {
  return gunEkle(iso, -1);
}

/** "2026-11-06" → "06.11.2026" */
export function noktaliTarih(iso: string): string {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return `${gun}.${ay}.${yil}`;
}

/** "10.11.2026 20:58:52" → "2026-11-10T20:58:52+03:00" */
export function trZamanToIso(s: string): string {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s.trim());
  if (!m) return s;
  return `${m[3]}-${m[2]}-${m[1]}T${m[4] ?? "00"}:${m[5] ?? "00"}:${m[6] ?? "00"}+03:00`;
}

export function gecerliIsoTarih(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export function gunAdi(iso: string): string {
  const { yil, ay, gun } = trTarihParcalari(iso);
  return GUNLER[new Date(Date.UTC(Number(yil), Number(ay) - 1, Number(gun))).getUTCDay()] as string;
}
