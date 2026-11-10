import { describe, expect, it } from "vitest";
import { BROWSER_UA, fetchJson, fetchText } from "../../../src/core/http.js";
import { mockFetch } from "../../helpers.js";

describe("http", () => {
  it("JSON beklenirken HTML gelirse ayristirma hatası verir", async () => {
    mockFetch([{ match: "x.test/json", body: "<html>Hata</html>", contentType: "text/html" }]);
    await expect(fetchJson("https://x.test/json", { sourceId: "t" })).rejects.toMatchObject({
      tur: "ayristirma",
      sourceId: "t",
    });
  });

  it("404 http hatasıdır ve status taşır", async () => {
    mockFetch([{ match: "x.test/404", body: "", status: 404 }]);
    await expect(fetchText("https://x.test/404", { sourceId: "t" })).rejects.toMatchObject({
      tur: "http",
      status: 404,
    });
  });

  it("404'te tekrar denemez", async () => {
    const { calls } = mockFetch([{ match: "x.test/404", body: "", status: 404 }]);
    await expect(fetchText("https://x.test/404", { sourceId: "t" })).rejects.toThrow();
    expect(calls).toHaveLength(1);
  });

  it("windows-1254 çözer", async () => {
    mockFetch([{ match: "x.test/w", body: Buffer.from([0xdd, 0xfe, 0xf0]) }]);
    expect(await fetchText("https://x.test/w", { sourceId: "t", encoding: "windows-1254" })).toBe(
      "İşğ",
    );
  });

  it("503 sonrası bir kez tekrar dener", async () => {
    const { calls } = mockFetch([
      { match: "x.test/r", body: "", status: 503 },
      { match: "x.test/r", body: { ok: true } },
    ]);
    expect(await fetchJson("https://x.test/r", { sourceId: "t" })).toEqual({ ok: true });
    expect(calls).toHaveLength(2);
  });

  it("varsayılan UA projeyi tanıtır, browserUA tarayıcı UA'sı kullanır", async () => {
    const { calls } = mockFetch([{ match: "x.test/ua", body: "ok" }]);
    await fetchText("https://x.test/ua", { sourceId: "t" });
    await fetchText("https://x.test/ua", { sourceId: "t", browserUA: true });
    const ua = (i: number) => new Headers(calls[i]?.init?.headers).get("user-agent");
    expect(ua(0)).toMatch(/^turkiye-mcp\/\d+\.\d+\.\d+ /);
    expect(ua(1)).toBe(BROWSER_UA);
  });

  it("json gövdesi POST olarak ve content-type ile gönderilir", async () => {
    const { calls } = mockFetch([{ match: "x.test/p", body: { ok: 1 } }]);
    await fetchJson("https://x.test/p", { sourceId: "t", method: "POST", json: { a: 1 } });
    expect(calls[0]?.init?.method).toBe("POST");
    expect(calls[0]?.init?.body).toBe('{"a":1}');
    expect(new Headers(calls[0]?.init?.headers).get("content-type")).toBe("application/json");
  });

  it("zaman aşımı zaman-asimi hatasıdır", async () => {
    mockFetch([{ match: "x.test/slow", body: "x" }]);
    const yavas = globalThis.fetch;
    globalThis.fetch = ((_u: string, init?: RequestInit) =>
      new Promise((_res, rej) => {
        init?.signal?.addEventListener("abort", () =>
          rej(new DOMException("aborted", "TimeoutError")),
        );
      })) as typeof fetch;
    await expect(
      fetchText("https://x.test/slow", { sourceId: "t", timeoutMs: 20, retries: 0 }),
    ).rejects.toMatchObject({ tur: "zaman-asimi" });
    globalThis.fetch = yavas;
  });
});

describe("http tekrar", () => {
  it("ağ hatası (fetch failed) bir kez tekrar denenir", async () => {
    let n = 0;
    const { vi } = await import("vitest");
    vi.stubGlobal("fetch", async () => {
      n++;
      if (n === 1) throw new TypeError("fetch failed");
      return new Response("ok");
    });
    expect(await fetchText("https://x.test/a", { sourceId: "t" })).toBe("ok");
    expect(n).toBe(2);
  });
});
