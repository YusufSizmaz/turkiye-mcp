import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, vi } from "vitest";
import { clearCache } from "../src/core/cache.js";

export interface MockRoute {
  match: string | RegExp;
  body: string | Buffer | object;
  status?: number;
  contentType?: string;
}

export interface MockCall {
  url: string;
  init?: RequestInit;
}

/**
 * `fetch`'i sahte yanıtlarla değiştirir. Rotalar sırayla denenir. Aynı `match` ile
 * birden fazla rota verilirse her eşleşmede ilki tüketilir (art arda farklı yanıtlar için);
 * tek kalan rota sınırsız kez eşleşir.
 */
export function mockFetch(routes: MockRoute[]): { calls: MockCall[] } {
  const calls: MockCall[] = [];
  const kalan = [...routes];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      calls.push({ url, init });
      const idx = kalan.findIndex((r) =>
        typeof r.match === "string" ? url.includes(r.match) : r.match.test(url),
      );
      if (idx === -1) throw new Error(`mockFetch: eşleşmeyen URL ${url}`);
      const route = kalan[idx] as MockRoute;
      // Aynı match'e sahip başka rota varsa bu rotayı tüket (sıralı yanıtlar için).
      const ayniMatchVar = kalan.some(
        (r, i) => i !== idx && String(r.match) === String(route.match),
      );
      if (ayniMatchVar) kalan.splice(idx, 1);
      const body =
        typeof route.body === "string" || Buffer.isBuffer(route.body)
          ? route.body
          : JSON.stringify(route.body);
      const contentType =
        route.contentType ??
        (typeof route.body === "object" && !Buffer.isBuffer(route.body)
          ? "application/json"
          : "text/plain");
      const bosGovde = route.status === 204 || route.status === 304;
      return new Response(bosGovde ? null : (body as ConstructorParameters<typeof Response>[0]), {
        status: route.status ?? 200,
        headers: { "content-type": contentType },
      });
    }),
  );
  return { calls };
}

export function fixture(path: string): Buffer {
  return readFileSync(join(import.meta.dirname, "fixtures", path));
}

export function fixtureText(path: string): string {
  return fixture(path).toString("utf-8");
}

export function fixtureJson<T = unknown>(path: string): T {
  return JSON.parse(fixtureText(path)) as T;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  clearCache();
});
