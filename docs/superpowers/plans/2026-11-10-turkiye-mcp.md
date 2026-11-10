# turkiye-mcp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Türkiye'nin güncel kamu verilerini (9 kategori, ~25 kaynak) hem MCP sunucusu (stdio, 27 araç) hem tipli TypeScript kütüphanesi olarak sunan, kaynak sağlığı canlı izlenen açık kaynak repo.

**Architecture:** `src/core` ortak HTTP/önbellek/hata/tarih katmanı; `src/sources/<kategori>/` altında her kaynak saf fonksiyonlar + `SourceMeta` dışa aktarır, her kategori `index.ts`'i `{ sources, tools, probes }` verir; `src/registry.ts` hepsini toplar; `src/mcp/server.ts` registry'den araçları env/kategori filtresine göre kaydeder. Health script aynı `probes`'u koşturup GitHub Pages'e status JSON + shields rozetleri yayınlar.

**Tech Stack:** Node ≥ 20, TypeScript (strict, ESM), `@modelcontextprotocol/server` 2.x (+ `@modelcontextprotocol/client` dev, testler için), zod 4, cheerio, fast-xml-parser, iconv-lite, tsup, vitest, Biome, tsx.

**Spec:** `docs/superpowers/specs/2026-11-10-turkiye-mcp-design.md` — uç noktalar, rozetler, TTL'ler ve kararlar oradadır; executor ikisini birlikte okur.

## Global Constraints

- Git author/committer yalnız `YusufSizmaz <yusuf.sizmaz11@gmail.com>`; commit mesajlarında **hiçbir** `Co-Authored-By` veya Claude satırı yok. Bot commit'i yok.
- Node `>=20`, `"type": "module"`, TS `strict: true`, `module/moduleResolution: NodeNext`, import'lar `.js` uzantılı.
- MCP import'ları: `import { McpServer, InMemoryTransport } from "@modelcontextprotocol/server"`, `import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"`, `import { Client } from "@modelcontextprotocol/client"`; zod: `import * as z from "zod"` (v4).
- Paket adı `turkiye-mcp`, `bin: { "turkiye-mcp": "dist/cli.js" }`, `files: ["dist"]`, lisans MIT. npm'e **yayınlanmaz**.
- Araç adları İngilizce snake_case + kategori öneki; açıklamalar İngilizce + Türkçe anahtar kelimeler; özet metni, alan adları ve hata mesajları Türkçe.
- HTTP: zaman aşımı 15000 ms, ağ hatası/5xx'te 1 tekrar; UA `turkiye-mcp/<version> (+https://github.com/YusufSizmaz/turkiye-mcp)`, gerektiğinde kaynak bazında tarayıcı UA'sı.
- TTL'ler (sn): deprem 30, kripto 30, kurlar 300, KAP 120, akaryakıt 3600, Resmî Gazete 3600, hava 600, eczane 1800, şehir canlı (trafik/İSPARK) 60, açık veri 3600, coğrafya 86400, takvim 86400.
- Env: `TCMB_EVDS_KEY`, `EPIAS_USERNAME`, `EPIAS_PASSWORD`, `DIYANET_EMAIL`, `DIYANET_PASSWORD`, `TURKIYE_MCP_CATEGORIES`. Repoya secret girmez; `.env.example` var.
- PR CI ağa çıkmaz (yalnız fixture'lı unit). Canlı istekler yalnız `test:live` / `health`.
- Makine fansız M4 Air: vitest `pool: "threads"`, `maxWorkers: 2`; health sırayla koşar.

## Review Focus

1. **Türkiye saat dilimi:** CI ve kullanıcı makinesi UTC olabilir; "bugün" daima `Europe/Istanbul`'a göre hesaplanmalı (UTC 21:30 = TR ertesi gün). → Task 1 `bugunTr` testi.
2. **Türkçe karakter / büyük-küçük harf girdisi:** `"istanbul"`, `"İSTANBUL"`, `"Kadikoy"`, `"kadıköy"` aynı yere eşlenmeli. → Task 1 `normalizeTr` testi; Task 8, 9, 10, 12 bunu kullanır ve birer testle sabitler.
3. **Tatil/hafta sonu ve yayımlanmamış gün:** TCMB hafta sonu XML'i 404, Resmî Gazete gece yarısından sonra henüz yok → önceki geçerli günü döndür ve döndürülen gerçek tarihi bildir. → Task 3 ve Task 7 testleri.
4. **Kaynak HTML hata sayfası / beklenmeyen şekil döndürür:** çökme veya boş "başarı" değil, Türkçe `KaynakHatasi("ayristirma")` → araçta `isError: true`. → Task 1 `fetchJson` testi + Task 2 araç hata testi.
5. **Bağlamı boğan büyük yanıtlar:** İSPARK ~54 KB, Paribu ~49 KB, KAP yüzlerce kayıt → her liste aracında `limit` (varsayılan 20, max 200). → Task 4 ve Task 11 testleri.

---

## Dosya haritası

```
src/core/{types,http,cache,errors,tarih,metin,sonuc,version}.ts
src/mcp/{tool,server}.ts
src/sources/<kategori>/{<kaynak>.ts,index.ts,README.md}
src/registry.ts  src/index.ts  src/cli.ts
test/helpers.ts  test/fixtures/<kategori>/*  test/unit/**  test/live/probes.live.test.ts
scripts/{health.ts,gen-readme.ts,record-fixtures.sh}
site/index.html (şablon)  .github/workflows/{ci.yml,health.yml}  .github/ISSUE_TEMPLATE/*
README.md CONTRIBUTING.md LICENSE CHANGELOG.md .env.example
```

---

### Task 1: İskelet, araç zinciri ve core katmanı

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsup.config.ts`, `biome.json`, `vitest.config.ts`, `vitest.live.config.ts`, `.gitignore`, `.nvmrc` (`20`), `.github/workflows/ci.yml`
- Create: `src/core/types.ts`, `src/core/errors.ts`, `src/core/http.ts`, `src/core/cache.ts`, `src/core/tarih.ts`, `src/core/metin.ts`, `src/core/sonuc.ts`, `src/core/version.ts`
- Create: `test/helpers.ts`, `test/unit/core/*.test.ts`

**Interfaces — Produces:**
```ts
// types.ts
export type Kategori = "finans"|"deprem"|"resmi"|"hava-cevre"|"enerji"|"saglik"|"sehir"|"cografya"|"takvim";
export type Rozet = "resmi"|"birinci-taraf"|"topluluk";
export interface SourceMeta {
  id: string; ad: string; kategori: Kategori; rozet: Rozet;
  anahtarGerekli: boolean; envVars: string[]; resmiUrl: string; aciklama: string;
  ttlSaniye: number; deneysel?: boolean; geoKisitli?: boolean;
  anahtarNasilAlinir?: string;           // anahtarGerekli ise Türkçe talimat + URL
  ucNoktalar: string[];                  // README'de gösterilen ham uç noktalar (ör. "GET https://www.tcmb.gov.tr/kurlar/today.xml")
  kutuphaneOrnegi: string;               // README'de gösterilen TS kullanım örneği (2–6 satır)
}
export interface KaynakBilgisi { id: string; ad: string; rozet: Rozet; url: string; alinmaZamani: string /* ISO */ }
export interface Sonuc<T> { veri: T; kaynak: KaynakBilgisi; not?: string }
export const ROZET_ETIKET: Record<Rozet,string> = { resmi:"🏛️ Resmî", "birinci-taraf":"✅ Birinci taraf", topluluk:"🌐 Topluluk" };
// errors.ts
export type HataTuru = "zaman-asimi"|"http"|"ayristirma"|"anahtar-yok"|"desteklenmiyor"|"bulunamadi";
export class KaynakHatasi extends Error { constructor(public sourceId: string, public tur: HataTuru, message: string, public status?: number) }
// http.ts
export interface HttpOptions { sourceId: string; method?: "GET"|"POST"; headers?: Record<string,string>;
  json?: unknown; form?: Record<string,string>; encoding?: "utf-8"|"windows-1254"; timeoutMs?: number; retries?: number; browserUA?: boolean }
export function fetchText(url: string, o: HttpOptions): Promise<string>;
export function fetchJson<T>(url: string, o: HttpOptions): Promise<T>;
export const BROWSER_UA: string;
// cache.ts
export function cached<T>(key: string, ttlSaniye: number, fn: () => Promise<T>): Promise<T>; // eşzamanlı aynı key tek istek
export function clearCache(): void;
// tarih.ts  (hepsi Europe/Istanbul)
export function bugunTr(now?: Date): string;               // "YYYY-MM-DD"
export function trTarihParcalari(iso: string): { yil: string; ay: string; gun: string };
export function oncekiGun(iso: string): string;
export function istanbulIso(now?: Date): string;            // "+03:00" ofsetli ISO
// metin.ts
export function normalizeTr(s: string): string;            // trim, tr-TR lowercase, ı→i ğ→g ü→u ş→s ö→o ç→c, boşlukları tekle
export function eslesir(a: string, b: string): boolean;     // normalizeTr(a) === normalizeTr(b)
// sonuc.ts
export function sonuc<T>(meta: SourceMeta, url: string, veri: T, not?: string): Sonuc<T>;
// version.ts
export const VERSION: string; // package.json'dan build zamanında değil, sabit "0.1.0" (release task'ında güncellenir)
// test/helpers.ts
export function mockFetch(routes: Array<{ match: string|RegExp; body: string|Buffer|object; status?: number; contentType?: string }>): { calls: Array<{url:string; init?: RequestInit}> }; // vi.stubGlobal("fetch", …); eşleşmeyen URL → throw
export function fixture(path: string): Buffer;              // test/fixtures altından
```

- [ ] **Step 1:** `npm init` yerine `package.json`'ı elle yaz: name `turkiye-mcp`, version `0.1.0`, description "Türkiye'nin güncel kamu verileri için MCP sunucusu ve TypeScript kütüphanesi — TCMB, KAP, AFAD, Kandilli, Resmî Gazete, MGM, nöbetçi eczane ve daha fazlası.", `type: module`, `engines.node: ">=20"`, `main/types/exports` → `dist/index.js` / `dist/index.d.ts`, `bin`, `files`, `license: MIT`, `author: "Yusuf Sızmaz (https://github.com/YusufSizmaz)"`, `repository`, `keywords` (spec §5.9 topics). Scripts: `build: tsup`, `dev: tsx src/cli.ts`, `test: vitest run`, `test:live: vitest run -c vitest.live.config.ts`, `health: tsx scripts/health.ts`, `readme: tsx scripts/gen-readme.ts`, `lint: biome check .`, `typecheck: tsc --noEmit`. Kur: `npm i @modelcontextprotocol/server zod cheerio fast-xml-parser iconv-lite` ve `npm i -D typescript tsup vitest @biomejs/biome tsx @types/node @modelcontextprotocol/client`.
- [ ] **Step 2:** tsup: entry `src/index.ts`, `src/cli.ts`; format esm; dts; target node20; `cli.js`'e `#!/usr/bin/env node` banner (yalnız cli). vitest: `include: ["test/unit/**/*.test.ts"]`, `pool: "threads"`, `maxWorkers: 2`; live config `include: ["test/live/**/*.live.test.ts"]`, `testTimeout: 30000`, `fileParallelism: false`. `.gitignore`: `node_modules dist .env coverage site-dist`.
- [ ] **Step 3: Failing testler yaz** (`test/unit/core/`):
```ts
// tarih.test.ts
expect(bugunTr(new Date("2026-11-10T21:30:00Z"))).toBe("2026-11-11");
expect(bugunTr(new Date("2026-11-10T20:59:00Z"))).toBe("2026-11-10");
expect(oncekiGun("2026-03-01")).toBe("2026-02-28");
// metin.test.ts
for (const v of ["İSTANBUL","istanbul","Istanbul"," istanbul "]) expect(normalizeTr(v)).toBe("istanbul");
expect(eslesir("Kadıköy","KADIKOY")).toBe(true);
expect(eslesir("Şişli","sisli")).toBe(true);
// http.test.ts
mockFetch([{ match: "x.test/json", body: "<html>Hata</html>", contentType: "text/html" }]);
await expect(fetchJson("https://x.test/json",{sourceId:"t"})).rejects.toMatchObject({ tur: "ayristirma", sourceId: "t" });
mockFetch([{ match: "x.test/404", body: "", status: 404 }]);
await expect(fetchText("https://x.test/404",{sourceId:"t"})).rejects.toMatchObject({ tur: "http", status: 404 });
// windows-1254: Buffer.from([0xDD,0xFE,0xF0]) → "İşğ"
mockFetch([{ match: "x.test/w", body: Buffer.from([0xdd,0xfe,0xf0]) }]);
expect(await fetchText("https://x.test/w",{sourceId:"t",encoding:"windows-1254"})).toBe("İşğ");
// 503 sonra 200 → tek tekrar ile başarı; calls.length === 2
// User-Agent header'ı /^turkiye-mcp\/0\.1\.0/ ; browserUA:true iken BROWSER_UA
// cache.test.ts: aynı key ile eşzamanlı 2 çağrı → fn 1 kez; ttl dolunca (vi.useFakeTimers) tekrar çağrılır
```
- [ ] **Step 4:** `npx vitest run test/unit/core` → FAIL (modüller yok).
- [ ] **Step 5:** Core modülleri yaz. `fetchText` zaman aşımı için `AbortSignal.timeout`; abort → `KaynakHatasi(tur:"zaman-asimi", "… kaynağı 15 sn içinde yanıt vermedi")`; `fetchJson` gövdeyi `JSON.parse` eder, başarısızsa `ayristirma` ("… kaynağı beklenmeyen bir yanıt döndürdü (JSON değil)"). `json` verilirse `content-type: application/json`, `form` verilirse urlencoded. Tarih için `Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Istanbul"})`.
- [ ] **Step 6:** `npx vitest run test/unit/core` → PASS; `npm run typecheck && npm run lint` → temiz.
- [ ] **Step 7:** `ci.yml`: push/PR'da ubuntu-latest, Node 20 ve 22 matrisi, `npm ci`, `lint`, `typecheck`, `test`, `build`.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "chore: proje iskeleti ve core katmanı"`

---

### Task 2: Araç tanımı, MCP sunucusu, registry, CLI, `list_sources`

**Files:** Create `src/mcp/tool.ts`, `src/mcp/server.ts`, `src/registry.ts`, `src/index.ts`, `src/cli.ts`, `src/sources/*/index.ts` (9 kategori, şimdilik boş `{sources:[],tools:[],probes:{}}`), `test/unit/mcp/server.test.ts`

**Interfaces — Consumes:** Task 1 tipleri. **Produces:**
```ts
// mcp/tool.ts
export interface ToolDef<S extends z.ZodObject = z.ZodObject> {
  name: string; title: string; description: string; inputSchema: S;
  sources: SourceMeta[];                                   // gating + kaynak gösterimi
  ornekSorular: string[];                                  // README için 1–3 Türkçe doğal dil sorusu
  run(input: z.infer<S>, env: NodeJS.ProcessEnv): Promise<Sonuc<unknown>>;
  ozet(s: Sonuc<any>): string;                             // Türkçe, kısa, insan okunur
}
export function defineTool<S extends z.ZodObject>(t: ToolDef<S>): ToolDef<S>;
export function toolAktif(t: ToolDef, env: NodeJS.ProcessEnv): boolean; // tüm anahtarGerekli kaynakların envVars'ı dolu mu
// kategori index.ts şekli
export interface KategoriModulu { kategori: Kategori; ad: string; ikon: string; sources: SourceMeta[]; tools: ToolDef[]; probes: Record<string, () => Promise<unknown>> }
// registry.ts
export const KATEGORILER: KategoriModulu[];  // sıra: finans, deprem, resmi, hava-cevre, enerji, saglik, sehir, cografya, takvim
export const TUM_KAYNAKLAR: SourceMeta[];
export function secilenKategoriler(env: NodeJS.ProcessEnv): Kategori[]; // TURKIYE_MCP_CATEGORIES virgüllü; boş/yoksa hepsi; bilinmeyen ad → stderr uyarı, yok sayılır
// mcp/server.ts
export function createServer(opts?: { env?: NodeJS.ProcessEnv }): McpServer;
```
Kategori adları/ikonları: finans "Finans & Piyasalar" 💱, deprem "Deprem & Afet" 🌍, resmi "Resmî Yayınlar" 📜, hava-cevre "Hava & Çevre" 🌤️, enerji "Enerji & Akaryakıt" ⛽, saglik "Sağlık" 💊, sehir "Şehir Verileri" 🏙️, cografya "Coğrafya" 🗺️, takvim "Takvim & Vakitler" 📅.

Araç yanıt sözleşmesi (her araç): başarı → `{ content: [{type:"text", text: ozet + "\n\nKaynak: " + ROZET_ETIKET + (🔑?) + " " + ad + " — " + url + " (alındı " + alinmaZamani + ")" + (not? "\nNot: "+not) }, {type:"text", text: JSON.stringify(sonuc.veri)}], structuredContent: sonuc }`; `KaynakHatasi` → `{ isError: true, content:[{type:"text", text: hata.message}] }`; diğer hata → `isError` + "Beklenmeyen hata: …".

- [ ] **Step 1: Failing test** (`server.test.ts`) — `InMemoryTransport.createLinkedPair()` + `Client`; test için sahte bir kategori modülü enjekte edebilmek adına `createServer` iç olarak `buildServer(moduller: KategoriModulu[], env)` kullanır (o da export edilir):
```ts
// list_sources her zaman var
expect((await client.listTools()).tools.map(t=>t.name)).toContain("list_sources");
// anahtarlı kaynağın aracı env yoksa kayıtlı değil, varsa kayıtlı
// TURKIYE_MCP_CATEGORIES="deprem" → yalnız deprem_* + list_sources
// sahte araç KaynakHatasi("ayristirma") fırlatınca → result.isError === true && text içerir "beklenmeyen"
// başarıda content[0].text "Kaynak: 🏛️ Resmî" içerir; structuredContent.kaynak.id doğru
// list_sources structuredContent.veri: [{id, ad, kategori, rozet, aktif:false, nasilAcilir:"TCMB_EVDS_KEY …"}] anahtarsız kaynakta aktif:true
```
- [ ] **Step 2:** Çalıştır → FAIL.
- [ ] **Step 3:** Yaz. `list_sources` girdisi `{ kategori?: Kategori }`, `sources` boş (kaynak bloğu "turkiye-mcp kayıt defteri"). `cli.ts`: `createServer({env: process.env})` + stdio; log yalnız stderr. `index.ts`: `createServer`, `KATEGORILER`, `TUM_KAYNAKLAR`, tipler, `KaynakHatasi`, ve her kaynak modülü namespace olarak (`export * as tcmb from "./sources/finans/tcmb.js"` — kaynak task'larında eklenir).
- [ ] **Step 4:** Test → PASS; `npm run build && echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' | node dist/cli.js` → stdout'ta `"serverInfo":{"name":"turkiye-mcp"`.
- [ ] **Step 5: Commit** — `feat: MCP sunucusu, registry ve list_sources`

---

### Kaynak task'ları için ortak kalıp (Task 3–13)

Her kaynak task'ı şu döngüyü izler; aşağıda yalnız kaynağa özgü kararlar verilir:
1. **Fixture kaydet:** spec §4'teki uç noktadan gerçek yanıtı `test/fixtures/<kategori>/<ad>.<ext>` olarak kaydet (komutu `scripts/record-fixtures.sh`'a ekle ki tekrarlanabilsin). windows-1254 kaynaklar ham byte olarak saklanır. ⚠️ uç noktalar için önce keşif: sitenin JS'inden parametreleri çıkar; bulunamazsa kaynağı `deneysel: true` yap veya çıkar ve `CHANGELOG`/kategori README'sine not düş.
2. **Failing unit test** (`test/unit/<kategori>/<ad>.test.ts`): `mockFetch` + fixture → fonksiyonun döndürdüğü `Sonuc.veri` şekli ve fixture'dan bilinen somut bir değer (ör. fixture'daki ilk kaydın adı/değeri) assert edilir; ayrıca istek URL'si/header'ları `calls` üzerinden assert edilir.
3. Çalıştır → FAIL. 4. Kaynağı + `SourceMeta` + araç(lar) + probe yaz; `cached(key, meta.ttlSaniye, …)` ile sar. 5. Çalıştır → PASS, `lint`/`typecheck` temiz. 6. Kategori `README.md`'sini (kaynaklar, rozetler, araçlar, örnek soru) yaz/güncelle. 7. `src/index.ts`'e namespace export ekle. 8. Commit `feat(<kategori>): <kaynaklar>`.

Probe = en ucuz canlı çağrı (ör. `getRates()`), sonuçta en az bir kayıt olduğunu doğrular, yoksa throw.

Liste döndüren her araç `limit: z.number().int().min(1).max(200).default(20)` alır.

---

### Task 3: finans — TCMB kurları

**Files:** `src/sources/finans/tcmb.ts`, `src/sources/finans/index.ts`, `test/unit/finans/tcmb.test.ts`, fixtures `tcmb-today.xml`

**Produces:**
```ts
export const meta: SourceMeta; // id "tcmb-kurlar", rozet resmi, ttl 300
export interface Kur { kod: string; ad: string; birim: number; dovizAlis: number|null; dovizSatis: number|null; efektifAlis: number|null; efektifSatis: number|null }
export function getRates(opts?: { tarih?: string /* YYYY-MM-DD */ }): Promise<Sonuc<{ tarih: string; bultenNo: string; kurlar: Kur[] }>>;
```
Araç `finans_get_exchange_rates` — girdi `{ tarih?: string (YYYY-MM-DD), kodlar?: string[] }` (kodlar verilirse filtre, büyük harf). Özet: "TCMB 10.11.2026 (2026/211): USD alış 50,23 / satış 50,32 …" (en fazla 6 kur).

- [ ] Tarih yoksa `today.xml`; varsa `kurlar/YYYYMM/DDMMYYYY.xml`. 404 → `oncekiGun` ile en fazla 7 gün geri git; sonuç `veri.tarih` gerçek bülten tarihidir ve `not: "10.11.2026 için bülten yok (hafta sonu/tatil); 06.11.2026 bülteni döndürüldü"`. Boş alanlar (`<ForexBuying/>`) → `null`.
- [ ] Testler: fixture'dan USD satırı `kod==="USD"` ve `dovizSatis>0`; mock'ta `08112026.xml` 404, `07112026.xml` 404, `06112026.xml` fixture → `veri.tarih==="2026-11-06"` ve `not` dolu; 7 gün hep 404 → `KaynakHatasi tur "bulunamadi"`.

### Task 4: finans — KAP

**Files:** `src/sources/finans/kap.ts`, test, fixtures `kap-light.json`, `kap-main.json`

**Produces:**
```ts
export const meta: SourceMeta; // id "kap", resmi, ttl 120
export interface Bildirim { index: number; baslik: string; ozet: string|null; sirket: string; hisseKodu: string|null; tarih: string /* ISO, +03:00 */; tur: string|null; url: string /* https://www.kap.org.tr/tr/Bildirim/<index> */ }
export function getLatestDisclosures(opts?: { limit?: number }): Promise<Sonuc<Bildirim[]>>;
export function getDisclosures(opts: { baslangic: string; bitis: string; hisseKodu?: string; limit?: number }): Promise<Sonuc<Bildirim[]>>;
export function searchCompanies(q: string): Promise<Sonuc<Array<{ ad: string; hisseKodu: string|null; kapUrl: string }>>>; // ⚠️ keşif
```
Araçlar: `finans_get_kap_disclosures` `{ baslangic?, bitis?, hisseKodu?, limit }` (tarih yoksa light uç noktası; hisseKodu → main + istemci filtresi `stockCode`/`relatedStocks` içinde, büyük harf), `finans_search_kap_companies` `{ sorgu }`. `main` POST body spec §4.1'deki gibi `DD.MM.YYYY`. KAP için `browserUA: true` + `Referer: https://www.kap.org.tr/tr/bildirim-sorgu`.
- [ ] Testler: light fixture → ilk kayıt `baslik` fixture'daki `subject`; `"10.11.2026 20:58:52"` → `"2026-11-10T20:58:52+03:00"`; `hisseKodu:"thyao"` filtresi yalnız THYAO içeren kayıtları döndürür; 300 kayıtlı mock + `limit` verilmez → 20 kayıt.

### Task 5: finans — altın, BIST, kripto

**Files:** `src/sources/finans/{truncgil,isyatirim,btcturk,paribu}.ts`, testler, fixtures

**Produces:**
```ts
// truncgil.ts  id "truncgil", topluluk, ttl 300
export function getGoldAndMarket(): Promise<Sonuc<{ guncelleme: string; kalemler: Array<{ kod: string; tur: string; alis: number; satis: number; degisimYuzde: number }> }>>;
// isyatirim.ts id "isyatirim", topluluk, ttl 300
export function getStockHistory(o: { hisse: string; baslangic: string; bitis: string }): Promise<Sonuc<Array<{ tarih: string; kapanis: number; min: number; max: number; ortalama: number; hacim: number }>>>;
// btcturk.ts id "btcturk", birinci-taraf, ttl 30 ; paribu.ts id "paribu", birinci-taraf, ttl 30
export interface KriptoFiyat { parite: string /* "BTC_TRY" */; son: number; alis: number|null; satis: number|null; degisimYuzde: number; hacim: number }
export function getTickers(o?: { pariteler?: string[] }): Promise<Sonuc<KriptoFiyat[]>>; // her iki modülde aynı imza
```
Araçlar: `finans_get_gold_prices` `{ kodlar?: string[] }` (yalnız `Type` Gold olanlar varsayılan, `kodlar` verilirse onlar), `finans_get_stock_history` `{ hisse, baslangic?, bitis? }` (varsayılan son 30 gün), `finans_get_crypto_prices` `{ borsa: "btcturk"|"paribu" = "btcturk", pariteler?: string[] = ["BTC_TRY","ETH_TRY","USDT_TRY"], limit }`. Paribu anahtarları `BTC_TL` → normalize `BTC_TRY`. İş Yatırım tarih formatı `DD-MM-YYYY`, `ok:false` → `KaynakHatasi "bulunamadi"` ("<HISSE> için veri bulunamadı").
- [ ] Testler: Truncgil fixture'da `USD.Selling` değeri parse; Paribu `"BTC_TL"` → `parite "BTC_TRY"`; pariteler verilmezse Paribu 3 kayıt döndürür (49 KB'lık tüm liste değil).

### Task 6: finans — TCMB EVDS (🔑 deneysel)

**Files:** `src/sources/finans/evds.ts`, test, fixture `evds-series.json` (EVDS belgesindeki örnek yanıt biçimiyle elle yazılmış; dosya başında yorum yok, JSON — `README`'de "belgeden türetildi" notu)

**Produces:** `meta` (id "tcmb-evds", resmi, anahtarGerekli, envVars `["TCMB_EVDS_KEY"]`, deneysel, `anahtarNasilAlinir: "evds3.tcmb.gov.tr → üye ol → profil → API anahtarı"`); `getSeries(o: { seriler: string[]; baslangic: string; bitis: string; frekans?: "gunluk"|"aylik"|"yillik" }, env): Promise<Sonuc<Array<{ tarih: string; degerler: Record<string, number|null> }>>>` → `GET https://evds3.tcmb.gov.tr/igmevdsms-dis/series=A-B&startDate=DD-MM-YYYY&endDate=DD-MM-YYYY&type=json` header `key`. Araç `finans_get_evds_series`.
- [ ] Testler: env yoksa `KaynakHatasi "anahtar-yok"` mesajı `TCMB_EVDS_KEY` içerir; istek header'ında `key` var; seri adındaki `.` yanıt alanında `_` olur (`TP.DK.USD.A` → `TP_DK_USD_A`) ve geri eşlenir.
- [ ] Probe yalnız env varsa çalışır, yoksa `"anahtar-yok"` fırlatır (health bunu "anahtar-yok" durumu sayar).

### Task 7: resmi — Resmî Gazete

**Files:** `src/sources/resmi/{resmi-gazete.ts,index.ts}`, test, fixture `rg-20261110.htm` (ham windows-1254)

**Produces:** `meta` (id "resmi-gazete", resmi, ttl 3600); `getIssue(o?: { tarih?: string; arama?: string }): Promise<Sonuc<{ tarih: string; sayi: string; mukerrer: boolean; bolumler: Array<{ bolum: string; altBaslik: string|null; maddeler: Array<{ baslik: string; url: string }> }> }>>`. Araç `resmi_gazete_get_issue` `{ tarih?, arama? }` (arama → `eslesir`-tabanlı içerir filtresi, normalizeTr ile).
- [ ] Ayrıştırma: başlık "10 Kasım 2026 Tarihli ve 33426 Sayılı" → `sayi "33426"`; büyük harf bölüm başlıkları (YÜRÜTME VE İDARE BÖLÜMÜ, İLÂN BÖLÜMÜ) `bolum`, altındaki büyük harf başlıklar (YÖNETMELİKLER, KURUL KARARLARI…) `altBaslik`, `––` ile başlayan linkli satırlar `maddeler`; göreli linkler mutlak URL'ye çevrilir. Aynı gün mükerrer sayı (`…-1.htm`) varsa onu da `mukerrer:true` olarak birleştirmek **gerekmez**, `not` ile belirtilir.
- [ ] Tarih verilmemiş ve bugünün sayfası 404 → önceki gün (en fazla 3), `not` ile.
- [ ] Testler: fixture → `sayi==="33426"`, en az bir bölüm `"YÖNETMELİKLER"` altBaslığına ve "Gençlik ve Spor Bakanlığı Yurt Hizmetleri" ile başlayan maddeye sahip; `arama:"genclik"` yalnız eşleşen maddeleri bırakır; bugün 404 → dünkü fixture + `not`.

### Task 8: deprem — AFAD ve Kandilli

**Files:** `src/sources/deprem/{afad,kandilli,index}.ts`, testler, fixtures `afad.json`, `kandilli.html` (ham windows-1254)

**Produces:**
```ts
export interface Deprem { id: string; tarih: string /* ISO +03:00 */; buyukluk: number; tip: string; derinlikKm: number; enlem: number; boylam: number; yer: string; il: string|null; kaynak: "afad"|"kandilli" }
// afad.ts  id "afad", resmi, ttl 30
export function getEarthquakes(o: { saat?: number /*24*/; minBuyukluk?: number /*0*/; il?: string; limit?: number }): Promise<Sonuc<Deprem[]>>;
// kandilli.ts id "kandilli", resmi, ttl 30 — aynı imza
```
Araç `deprem_get_recent` `{ kaynak: "afad"|"kandilli" = "afad", saat: 1..720 = 24, minBuyukluk = 0, il?, limit }`, sıralama yeniden eskiye. Özet: "Son 24 saatte 3.0+ 4 deprem; en büyüğü 4.2 — Sındırgı (Balıkesir), 10.11.2026 14:03".
- [ ] AFAD: `https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=…&end=…&minmag=…&orderby=timedesc&limit=…` (start/end TR yerel saatle `YYYY-MM-DDTHH:mm:ss`). İl filtresi `province` alanında `eslesir`. AFAD `date` alanı UTC değilse +03:00 ekle — fixture'daki bir kaydı AFAD web sitesiyle karşılaştırarak doğrula ve kararı kodda yorumla.
- [ ] Kandilli: `<pre>` içindeki satırlar `YYYY.MM.DD HH:MM:SS  enlem boylam derinlik MD ML Mw yer çözüm`; büyüklük = ML (yoksa Mw, yoksa MD; `-.-` atlanır); il = yer metnindeki parantez içi (`(BALIKESIR)` → "Balıkesir" değil olduğu gibi "BALIKESIR"; filtre `eslesir` ile).
- [ ] Testler: Kandilli fixture ilk satırı doğru alanlara ayrılır; `il:"kahramanmaras"` ↔ `"KAHRAMANMARAS"` eşleşir; `minBuyukluk:3` 3'ün altını eler.

### Task 9: hava-cevre — MGM ve hava kalitesi

**Files:** `src/sources/hava-cevre/{mgm,hava-kalitesi,hadise,index}.ts`, testler, fixtures

**Produces:**
```ts
// mgm.ts id "mgm", resmi, ttl 600 ; tüm isteklerde header Origin: https://www.mgm.gov.tr
export function findStation(il: string, ilce?: string): Promise<{ merkezId: number; sondurumIstNo: number; gunlukTahminIstNo: number; saatlikTahminIstNo: number; il: string; ilce: string }>; // il/ilçe MGM'ye Türkçe karakterli, baş harfi büyük gönderilir ("Kadıköy"); ilçe yoksa merkezler?il= ilk kayıt
export function getCurrent(il: string, ilce?: string): Promise<Sonuc<{ yer: string; zaman: string; sicaklik: number; hissedilen: number|null; nem: number; ruzgarKmh: number; ruzgarYon: number; basinc: number; hadise: string; hadiseKodu: string }>>;
export function getForecast(il: string, ilce?: string, tur?: "gunluk"|"saatlik"): Promise<Sonuc<Array<{ tarih: string; enDusuk?: number; enYuksek?: number; sicaklik?: number; hadise: string }>>>;
// hadise.ts
export const HADISE: Record<string,string>; // MGM kodları → Türkçe (A "Açık", AB "Az Bulutlu", PB "Parçalı Bulutlu", CB "Çok Bulutlu", HY "Hafif Yağmurlu", Y "Yağmurlu", KY "Kuvvetli Yağmurlu", KKY "Karla Karışık Yağmurlu", HKY "Hafif Kar Yağışlı", K "Kar Yağışlı", SIS "Sisli", PUS "Puslu", GSY "Gökgürültülü Sağanak Yağışlı", ...; bilinmeyen kod → kodun kendisi)
// hava-kalitesi.ts id "hava-kalitesi", resmi, ttl 600
export function getAirQuality(o?: { il?: string; limit?: number }): Promise<Sonuc<Array<{ istasyon: string; il: string; indeks: number|null; kategori: string; zaman: string }>>>;
```
Araçlar: `hava_get_current` `{ il, ilce? }`, `hava_get_forecast` `{ il, ilce?, tur = "gunluk" }`, `hava_get_air_quality` `{ il?, limit }`. MGM'de `-9999` → `null`; `ruzgarHiz` m/s değil km/s'dir → olduğu gibi km/h, fixture'ı MGM sitesiyle karşılaştırıp doğrula.
- [ ] Kullanıcı girdisi Türkçe karaktersiz olabilir ("kadikoy") → `findStation` önce `merkezler?il=` ile ilin tüm ilçelerini çeker, `eslesir` ile eşleştirir (Review Focus 2).
- [ ] Hava kalitesi istasyon/ölçüm uç noktası ⚠️ keşif (`sim.csb.gov.tr` sayfa JS'i, `/Services/…`); bulunamazsa `hava_get_air_quality` aracı ve kaynağı v1'den çıkarılır (yalnız kategori eşiklerini döndüren yarım bir araç yayınlanmaz), README'de "yakında" notu düşülür.
- [ ] Testler: `getCurrent("ankara")` mock'ta `merkezler?il=Ankara` çağrılır; `hadiseKodu "PUS"` → `hadise "Puslu"`; `-9999` → `null`; `"kadikoy"` → merkezId Kadıköy kaydı.

### Task 10: enerji — Opet akaryakıt, EPİAŞ (🔑 deneysel)

**Files:** `src/sources/enerji/{opet,epias,index}.ts`, testler, fixtures

**Produces:**
```ts
// opet.ts id "opet", birinci-taraf, ttl 3600, browserUA
export function getFuelPrices(o: { il: string|number /* ad veya plaka */; ilce?: string }): Promise<Sonuc<Array<{ il: string; ilce: string; urunler: Array<{ ad: string; fiyat: number }> }>>>;
// epias.ts id "epias", resmi, anahtarGerekli, envVars ["EPIAS_USERNAME","EPIAS_PASSWORD"], deneysel, ttl 3600
export function getMarketClearingPrice(o: { tarih?: string }, env): Promise<Sonuc<Array<{ saat: string; ptfTl: number; ptfUsd: number|null; ptfEur: number|null }>>>;
export function getRealtimeConsumption(o: { tarih?: string }, env): Promise<Sonuc<Array<{ saat: string; tuketimMwh: number }>>>;
```
Araçlar: `enerji_get_fuel_prices` `{ il, ilce? }`, `enerji_get_electricity_market` `{ veri: "ptf"|"tuketim" = "ptf", tarih? }`.
- [ ] Opet: il adı → plaka için `src/core/iller.ts` (81 il, `{ plaka, ad }` sabit liste) ekle ve `eslesir` ile çöz; İstanbul için hem `ProvinceCode=34` (Anadolu) hem Avrupa yakası kodunu keşfet ve birleştir; ilçe verilmezse tüm ilçelerin ilk 10'u + not "ilçe belirtin".
- [ ] EPİAŞ: TGT `POST https://giris.epias.com.tr/cas/v1/tickets` (form `username`, `password`, header `Accept: text/plain`) → TGT, uç noktalara header `TGT`; TGT 2 saat önbellekte. Gövde `{ startDate: "YYYY-MM-DDT00:00:00+03:00", endDate: "…T23:00:00+03:00" }`, PTF yolu `/electricity-service/v1/markets/dam/data/mcp`, tüketim yolu `/electricity-service/v1/consumption/data/realtime-consumption`; yanıt `items[]`. Belgeye (seffaflik.epias.com.tr/electricity-service/technical/tr/index.html) göre doğrula.
- [ ] Testler: `il:"izmir"` → `ProvinceCode=35`; `il:35` aynı; EPİAŞ env yok → `anahtar-yok`; env var → önce ticket isteği, sonra `TGT` header'lı veri isteği; ikinci çağrıda ticket tekrar alınmaz.

### Task 11: saglik — nöbetçi eczane adaptörleri

**Files:** `src/sources/saglik/eczane/{tipler,istanbul,izmir,ankara,index}.ts`, `src/sources/saglik/index.ts`, testler, fixtures

**Produces:**
```ts
export interface Eczane { ad: string; ilce: string; adres: string; telefon: string|null; konum: { enlem: number; boylam: number }|null; tarif: string|null }
export interface EczaneAdaptoru { il: string /* normalize edilmiş: "istanbul" */; meta: SourceMeta; getir(ilce?: string): Promise<Sonuc<Eczane[]>> }
export const ADAPTORLER: EczaneAdaptoru[];
export function getOnDuty(o: { il: string; ilce?: string; limit?: number }): Promise<Sonuc<Eczane[]>>;
```
Meta id'leri: `eczane-istanbul` (İstanbul Eczacı Odası), `eczane-izmir`, `eczane-ankara`; hepsi resmi, ttl 1800. Araç `eczane_get_on_duty` `{ il, ilce?, limit }`. Desteklenmeyen il → `KaynakHatasi("desteklenmiyor", "Şimdilik yalnız İstanbul, İzmir, Ankara destekleniyor. Yeni il eklemek için: CONTRIBUTING.md")`.
- [ ] İstanbul ⚠️: `/nobetci-eczane/yeni/js/main.js`'ten `/api/nobetci-eczane-web/` çağrı parametrelerini (ilçe id, tarih, token vb.) çıkar; ilçe adı → `ilceId` sayfadaki gömülü `districts` JSON'undan, `eslesir` ile.
- [ ] İzmir: HTML'den (cheerio) "<AD> ECZANESİ - <SEMT>" blokları + adres/telefon. İlçe filtresi semt/ilçe alanında `eslesir`.
- [ ] Ankara ⚠️: sayfanın `fetch(url…)` çağrısının uç noktasını bul.
- [ ] Bir adaptör keşifte çözülemezse `ADAPTORLER`'dan çıkarılır, destek listesi ve README buna göre güncellenir (en az 2 il şartı; ikisi de çözülemezse durumu kullanıcıya bildir).
- [ ] Testler: her adaptör fixture'ından ≥1 eczane, alanlar dolu; `il:"İZMİR"` izmir adaptörüne gider; `il:"bursa"` → `desteklenmiyor`; `ilce:"kadikoy"` yalnız Kadıköy.

### Task 12: sehir — CKAN, İBB canlı, İzmir

**Files:** `src/sources/sehir/{ckan,ibb,index}.ts`, testler, fixtures

**Produces:**
```ts
// ckan.ts
export type Portal = "ibb"|"izmir"; // ibb → https://data.ibb.gov.tr, izmir → https://acikveri.bizizmir.com
export const portalMeta: Record<Portal, SourceMeta>; // id "ibb-acik-veri", "izmir-acik-veri"; resmi; ttl 3600
export function searchDatasets(portal: Portal, q: string, limit?: number): Promise<Sonuc<Array<{ id: string; baslik: string; aciklama: string; kurum: string|null; kaynaklar: Array<{ id: string; ad: string; format: string; url: string; datastore: boolean }> }>>>;
export function queryDatastore(portal: Portal, resourceId: string, o?: { q?: string; limit?: number }): Promise<Sonuc<{ alanlar: string[]; kayitlar: Record<string,unknown>[]; toplam: number }>>;
// ibb.ts
export const trafikMeta: SourceMeta; // "ibb-trafik", ttl 60
export function getTrafficIndex(): Promise<Sonuc<{ genel: number; anadolu: number; avrupa: number }>>;
export const isparkMeta: SourceMeta; // "ispark", ttl 60
export function getParking(o?: { ilce?: string; limit?: number; sadeceAcik?: boolean }): Promise<Sonuc<Array<{ ad: string; ilce: string; kapasite: number; bos: number; tur: string; acik: boolean; ucretsizDakika: number; enlem: number; boylam: number }>>>;
export function getDamLevels(): Promise<Sonuc<Array<{ baraj: string; dolulukYuzde: number; tarih: string }>>>;   // İSKİ CKAN veri seti (resource id keşfedilip sabitlenir), en güncel tarih
export function getMarketPrices(o?: { urun?: string; limit?: number }): Promise<Sonuc<Array<{ urun: string; birim: string; enDusuk: number; enYuksek: number; tarih: string }>>>; // İBB hal veri seti, en güncel tarih
```
Araçlar: `istanbul_get_traffic_index`, `istanbul_get_parking` `{ ilce?, sadeceAcik = true, limit }` (bos kapasiteye göre azalan), `istanbul_get_dam_levels`, `istanbul_get_market_prices` `{ urun?, limit }`, `opendata_search` `{ portal, sorgu, limit }`, `opendata_query` `{ portal, kaynakId, sorgu?, limit }`.
- [ ] Baraj ve hal: CKAN'da veri setini bul, datastore destekli kaynağın id'sini sabitle (kodda yorumla: veri seti adı + bulunduğu tarih); datastore yoksa CSV'yi indirip ayrıştır (`src/core/csv.ts`, tırnaklı alanları destekleyen küçük ayrıştırıcı + testi).
- [ ] Testler: İSPARK fixture'ı (yüzlerce kayıt) → `limit` verilmezse 20; `ilce:"umraniye"` ↔ `"ÜMRANİYE"`; trafik `{"TI":27,"TI_An":17,"TI_Av":35}` → `{genel:27,anadolu:17,avrupa:35}`; CKAN `success:false` → `KaynakHatasi`.

### Task 13: cografya + takvim

**Files:** `src/sources/cografya/{turkiyeapi,index}.ts`, `src/sources/takvim/{tatiller,namaz,index}.ts`, testler, fixtures

**Produces:**
```ts
// turkiyeapi.ts id "turkiyeapi", topluluk, ttl 86400
export function getProvinces(o?: { ad?: string }): Promise<Sonuc<Array<{ plaka: number; ad: string; nufus: number; alanKm2: number; rakim: number; bolge: string; buyuksehir: boolean; kiyi: boolean; telefonKodu: number[]; enlem: number; boylam: number }>>>;
export function getDistricts(il: string): Promise<Sonuc<Array<{ id: number; ad: string; nufus: number; alanKm2: number }>>>;
export function getNeighborhoods(o: { il: string; ilce: string; limit?: number }): Promise<Sonuc<Array<{ id: number; ad: string; nufus: number }>>>;
// tatiller.ts id "nager-tatiller", topluluk, ttl 86400
export function getHolidays(yil?: number): Promise<Sonuc<Array<{ tarih: string; ad: string; gun: string /* "Perşembe" */ }>>>;
// namaz.ts — iki meta: "diyanet-namaz" (resmi, 🔑 DIYANET_EMAIL/DIYANET_PASSWORD, deneysel) ve "ezanvakti" (topluluk)
export interface Vakit { tarih: string; imsak: string; gunes: string; ogle: string; ikindi: string; aksam: string; yatsi: string; hicri: string }
export function getPrayerTimes(o: { il: string; ilce?: string; gunSayisi?: number /*1..30, 1*/ }, env): Promise<Sonuc<Vakit[]>>; // Diyanet env varsa Diyanet, yoksa Ezan Vakti
```
Araçlar: `cografya_get_provinces` `{ ad? }`, `cografya_get_districts` `{ il }`, `cografya_get_neighborhoods` `{ il, ilce, limit }`, `takvim_get_holidays` `{ yil? }` (varsayılan TR'deki bu yıl), `takvim_get_prayer_times` `{ il, ilce?, gunSayisi }`. `takvim_get_prayer_times` aracı her zaman kayıtlıdır (`sources` yalnız ezanvakti ile gate'lenir); kaynak bloğu fiilen kullanılan kaynağı gösterir.
- [ ] Ezan Vakti zinciri: `ulkeler` → TÜRKİYE (`UlkeID "2"`) → `sehirler/2` → il `eslesir` → `ilceler/{sehirId}` → ilçe yoksa il merkezi (il adıyla aynı ilçe) → `vakitler/{ilceId}`; ülke/şehir/ilçe listeleri 86400 sn önbellek; `gunSayisi` kadar bugünden (TR) itibaren kayıt.
- [ ] Diyanet: `POST /Auth/Login {email,password}` → `data.accessToken`; vakit uç noktası ve şehir id'leri belgeye göre (awqatsalah.diyanet.gov.tr swagger) doğrulanır.
- [ ] Testler: `il:"izmir"` ezan zincirinde doğru sehirId'ye gider; ilçe verilmezse il merkezi; Diyanet env varsa login çağrısı yapılır, `structuredContent.kaynak.id==="diyanet-namaz"`; tatil fixture'ı → "Ramazan Bayramı 1. Gün" içerir, `gun` Türkçe.

---

### Task 14: Canlı testler, health script, health.yml, Pages durum sitesi

**Files:** `test/live/probes.live.test.ts`, `scripts/health.ts`, `site/index.html`, `.github/workflows/health.yml`, `test/unit/scripts/health.test.ts`

**Interfaces — Consumes:** `KATEGORILER[*].probes`, `TUM_KAYNAKLAR`. **Produces:**
```ts
export type Durum = "calisiyor"|"bozuk"|"geo-kisitli"|"anahtar-yok";
export interface DurumKaydi { id: string; ad: string; kategori: Kategori; rozet: Rozet; durum: Durum; sureMs: number; hata?: string; deneysel: boolean }
export function durumBelirle(meta: SourceMeta, hata: unknown|null): Durum;   // hata yok → calisiyor; KaynakHatasi "anahtar-yok" → anahtar-yok; meta.geoKisitli && hata → geo-kisitli; diğer → bozuk
export function shieldsJson(k: DurumKaydi): { schemaVersion: 1; label: "durum"; message: string; color: string }; // calisiyor "çalışıyor" brightgreen; bozuk "bozuk" red; geo-kisitli "yalnızca TR" lightgrey; anahtar-yok "anahtar gerekli" blue
export async function runHealth(outDir: string): Promise<DurumKaydi[]>; // probes sırayla, her biri 30 sn sınırlı; outDir/status.json, outDir/badges/<id>.json, outDir/index.html (site/index.html şablonu, status.json'ı fetch eder), outDir/bozuk.txt (satır başına id)
```
- [ ] Unit test: `durumBelirle` dört durumu; `shieldsJson` renk/metin. `probes.live.test.ts`: her probe için `it.skipIf(anahtar eksik)` ile bir test.
- [ ] `site/index.html`: tek dosya, bağımlılıksız; kategori başlıkları + kaynak kartları (rozet, durum noktası, süre, son kontrol zamanı), açık/koyu tema, mobilde düzgün.
- [ ] `health.yml`: `schedule: cron "0 6 * * *"` + `workflow_dispatch`; `permissions: { contents: read, pages: write, id-token: write, issues: write }`; adımlar: checkout, Node 22, `npm ci`, `npx tsx scripts/health.ts site-dist` (secret'lar env olarak: `TCMB_EVDS_KEY`, `EPIAS_USERNAME`, `EPIAS_PASSWORD`, `DIYANET_EMAIL`, `DIYANET_PASSWORD`), job summary'ye tablo, `actions/upload-pages-artifact` (path `site-dist`) + ayrı `deploy` job'u `actions/deploy-pages`; `bozuk.txt`'deki her id için `gh issue list --search "Kaynak bozuldu: <id> in:title" --state open` yoksa `gh issue create --title "Kaynak bozuldu: <id>" --label kaynak-bozuk`, varsa yorum ekle. Health komutunun kendisi bozuk kaynak olsa da exit 0 (Pages her gün yayınlansın); issue adımı bozuk varsa çalışır.
- [ ] Yerelde `npm run health -- site-dist` → tüm kaynaklar için kayıt; `calisiyor` olmayanları listele ve Türkiye'den bozuk olanları düzelt (Task 3–13'e geri dönüş) — bu adım "her araç bugün veri döndürüyor" hedefinin kanıtıdır.
- [ ] Commit `feat: kaynak sağlık kontrolü ve durum sitesi`.

### Task 15: README, topluluk dosyaları

**Files:** `scripts/gen-readme.ts`, `test/unit/scripts/gen-readme.test.ts`, `README.md`, `CONTRIBUTING.md`, `LICENSE`, `CHANGELOG.md`, `.env.example`, `.github/ISSUE_TEMPLATE/{kaynak-oner.yml,kaynak-bozuk.yml,config.yml}`, `.github/pull_request_template.md`

**Produces:** `export function renderKatalog(moduller: KategoriModulu[], ornekCiktilar?: Record<string,string>): string;` `export function renderIcindekiler(moduller): string;` `export function readmeGuncelle(readme: string, isaret: "KATALOG"|"ICINDEKILER", icerik: string): string;` (`<!-- KATALOG:BASLA -->`…`<!-- KATALOG:BITIR -->` gibi işaretler arasını değiştirir; işaret yoksa throw). `ornekCiktilar` = `docs/ornek-ciktilar.json` (Task 16 smoke'tan, araç adı → gerçek özet metni), yoksa bölüm atlanır.

**Katalog yapısı (kullanıcının isteği: kategori başlıkları → altında tüm API'ler → tıklayınca tüm detay):**
```
## 💱 Finans & Piyasalar
Kısa kategori açıklaması. | Kaynak | Rozet | Araçlar | Durum |  ← özet tablo (tüm kaynaklar)
<details><summary><b>TCMB Günlük Kurlar</b> · 🏛️ Resmî · <img durum rozeti></summary>
  açıklama · resmî site linki · TTL ("5 dk önbellek") · 🔑/🧪 notu + anahtar alma talimatı
  #### Uç noktalar        → ucNoktalar kod bloğu
  #### MCP araçları       → her araç: `ad` — açıklama; parametre tablosu (ad | tip | zorunlu | varsayılan | açıklama) z.toJSONSchema(inputSchema)'dan
  #### Örnek sorular      → ornekSorular madde listesi
  #### Kütüphane kullanımı → kutuphaneOrnegi ts kod bloğu
  #### Örnek çıktı        → ornekCiktilar[araç] (varsa) text kod bloğu
</details>
```
Kategori sırası ve ikonları registry'den. Ayrıca `src/sources/<kategori>/README.md` dosyaları da aynı üreticiyle (yalnız o kategori) üretilir — elle yazılmaz.
- [ ] Test: çıktı her kategori için `## 💱 Finans & Piyasalar` başlığı, her kaynak için bir `<details>` bloğu, rozet etiketi, araç adları `` `finans_get_exchange_rates` ``, parametre tablosunda zorunlu/varsayılan sütunları (ör. `limit` varsayılan `20`), 🔑 kaynaklarda env adı, 🧪 deneysellerde işaret ve `https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2F<id>.json` içerir; `readmeGuncelle` idempotent; içindekiler her kategoriye çapa linki verir.
- [ ] `README.md` spec §5.6 + §5.9 sırasıyla: hero (ad, tek cümle, rozet satırı: CI, Kaynak sağlığı (health.yml), lisans, Node ≥20, MCP), "Ne sorabilirsin?" (6 örnek, Türkçe), "30 saniyede kur" (Claude Code `claude mcp add turkiye -- npx -y github:YusufSizmaz/turkiye-mcp`, Claude Desktop JSON, Cursor JSON; npm yayınlanınca `npx -y turkiye-mcp`), örnek konuşma bloğu (gerçek bir health/live çıktısından), kaynak tablosu (üretilmiş), rozetlerin anlamı, kategori filtreleme (`TURKIYE_MCP_CATEGORIES`), anahtarlı kaynaklar, kütüphane olarak kullanım (`import { tcmb, afad } from "turkiye-mcp"`), yerel geliştirme, elenen kaynaklar ve nedenleri (spec §4 son bölüm), sorumluluk reddi, English section. `npx github:` kurulumu `prepare: "npm run build"` script'ini gerektirir — package.json'a ekle.
- [ ] `CONTRIBUTING.md`: yeni kaynak ekleme (Task 3–13 ortak kalıbı adım adım), yeni il eczane adaptörü, fixture kaydı, commit kuralları.
- [ ] `npm run readme` → README kataloğu ve kategori README'leri üretildi; `npm test` PASS.
- [ ] Commit `docs: README, katkı rehberi ve şablonlar`.

### Task 16: Uçtan uca doğrulama ve yayın

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` → hepsi temiz.
- [ ] Gerçek stdio uçtan uca: küçük bir `scripts/smoke.ts` (`@modelcontextprotocol/client` + `StdioClientTransport` ile `node dist/cli.js`'i başlatır), `listTools` → 27'ye yakın araç (anahtarsız ortamda 🔑 araçlar hariç) ve şu çağrılar `isError` olmadan döner: `finans_get_exchange_rates`, `deprem_get_recent`, `resmi_gazete_get_issue`, `hava_get_current {il:"Ankara"}`, `eczane_get_on_duty {il:"İzmir"}`, `takvim_get_prayer_times {il:"İstanbul"}`. Her aracın gerçek özet metnini `docs/ornek-ciktilar.json`'a yaz (araç adı → metin), `npm run readme` ile kataloğa işle ve README örnek konuşmasında kullan.
- [ ] `git log --format='%an <%ae>%n%b' | grep -i -E 'claude|co-authored'` → boş çıktı.
- [ ] `git push origin main`; GitHub'da CI yeşil (`gh run watch`).
- [ ] Pages'i Actions modunda aç: `gh api -X POST repos/YusufSizmaz/turkiye-mcp/pages -f build_type=workflow` (zaten varsa `PUT`); `gh workflow run health.yml`; tamamlanınca `https://yusufsizmaz.github.io/turkiye-mcp/status.json` erişilebilir.
- [ ] İlk CI health koşusunda Türkiye'den çalışan ama Actions'ta düşen kaynaklara `geoKisitli: true` ver, commit + push, health'i tekrar tetikle; açılmış yanlış "Kaynak bozuldu" issue'larını açıklamayla kapat.
- [ ] Repo meta: `gh repo edit YusufSizmaz/turkiye-mcp --description "🇹🇷 Türkiye'nin güncel kamu verileri için MCP sunucusu: TCMB, KAP, AFAD, Kandilli, Resmî Gazete, MGM, nöbetçi eczane ve daha fazlası" --homepage https://yusufsizmaz.github.io/turkiye-mcp --add-topic mcp,model-context-protocol,turkey,turkiye,tcmb,deprem,kap,open-data,typescript,claude`; `gh label create kaynak-bozuk`.
- [ ] `CHANGELOG.md` 0.1.0 girdisi; `git tag v0.1.0 && git push --tags`; `gh release create v0.1.0 --title "v0.1.0 — İlk sürüm" --notes-file <CHANGELOG'dan 0.1.0 bölümü>`.
