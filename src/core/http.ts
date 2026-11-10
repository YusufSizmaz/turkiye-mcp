import iconv from "iconv-lite";
import { KaynakHatasi } from "./errors.js";
import { REPO_URL, VERSION } from "./version.js";

export const PROJECT_UA = `turkiye-mcp/${VERSION} (+${REPO_URL})`;
export const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export interface HttpOptions {
  sourceId: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  json?: unknown;
  form?: Record<string, string>;
  encoding?: "utf-8" | "windows-1254";
  timeoutMs?: number;
  retries?: number;
  browserUA?: boolean;
}

const VARSAYILAN_ZAMAN_ASIMI = 15_000;

function yenidenDenenebilir(e: unknown): boolean {
  // Ağ hatası (status yok) veya 5xx → tekrar denenir; 4xx, zaman aşımı ve ayrıştırma hataları denenmez.
  if (e instanceof KaynakHatasi)
    return e.tur === "http" && (e.status === undefined || e.status >= 500);
  return true; // ağ hatası
}

async function tekIstek(url: string, o: HttpOptions): Promise<Buffer> {
  const headers = new Headers(o.headers);
  if (!headers.has("user-agent")) headers.set("user-agent", o.browserUA ? BROWSER_UA : PROJECT_UA);
  let body: string | undefined;
  if (o.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(o.json);
  } else if (o.form) {
    headers.set("content-type", "application/x-www-form-urlencoded");
    body = new URLSearchParams(o.form).toString();
  }
  const timeoutMs = o.timeoutMs ?? VARSAYILAN_ZAMAN_ASIMI;
  let res: Response;
  try {
    res = await fetch(url, {
      method: o.method ?? (body !== undefined ? "POST" : "GET"),
      headers,
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const ad = (e as { name?: string })?.name;
    if (ad === "TimeoutError" || ad === "AbortError") {
      throw new KaynakHatasi(
        o.sourceId,
        "zaman-asimi",
        `${o.sourceId} kaynağı ${Math.round(timeoutMs / 1000)} sn içinde yanıt vermedi.`,
      );
    }
    throw new KaynakHatasi(
      o.sourceId,
      "http",
      `${o.sourceId} kaynağına bağlanılamadı: ${(e as Error)?.message ?? String(e)}`,
    );
  }
  if (!res.ok) {
    throw new KaynakHatasi(
      o.sourceId,
      "http",
      `${o.sourceId} kaynağı HTTP ${res.status} döndürdü.`,
      res.status,
    );
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function fetchBuffer(url: string, o: HttpOptions): Promise<Buffer> {
  const deneme = 1 + (o.retries ?? 1);
  let sonHata: unknown;
  for (let i = 0; i < deneme; i++) {
    try {
      return await tekIstek(url, o);
    } catch (e) {
      sonHata = e;
      if (!yenidenDenenebilir(e) || i === deneme - 1) break;
      await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  if (sonHata instanceof KaynakHatasi) throw sonHata;
  throw new KaynakHatasi(o.sourceId, "http", String(sonHata));
}

export async function fetchText(url: string, o: HttpOptions): Promise<string> {
  const buf = await fetchBuffer(url, o);
  return o.encoding === "windows-1254" ? iconv.decode(buf, "win1254") : buf.toString("utf-8");
}

export async function fetchJson<T>(url: string, o: HttpOptions): Promise<T> {
  const text = await fetchText(url, o);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new KaynakHatasi(
      o.sourceId,
      "ayristirma",
      `${o.sourceId} kaynağı beklenmeyen bir yanıt döndürdü (JSON değil).`,
    );
  }
}
