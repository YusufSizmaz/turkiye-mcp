import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod";
import { KaynakHatasi } from "../core/errors.js";
import { istanbulIso } from "../core/tarih.js";
import { ROZET_ETIKET, type Sonuc } from "../core/types.js";
import { VERSION } from "../core/version.js";
import { KATEGORILER, secilenKategoriler } from "../registry.js";
import { type KategoriModulu, kaynakAktif, type ToolDef, toolAktif } from "./tool.js";

function kaynakSatiri(s: Sonuc<unknown>, anahtarli: boolean): string {
  const k = s.kaynak;
  const rozet = ROZET_ETIKET[k.rozet] + (anahtarli ? " 🔑" : "");
  let satir = `Kaynak: ${rozet} ${k.ad} — ${k.url} (alındı ${k.alinmaZamani})`;
  if (s.not) satir += `\nNot: ${s.not}`;
  return satir;
}

function hataSonucu(mesaj: string) {
  return { isError: true, content: [{ type: "text" as const, text: mesaj }] };
}

function aracKaydet(server: McpServer, t: ToolDef, env: NodeJS.ProcessEnv): void {
  server.registerTool(
    t.name,
    { title: t.title, description: t.description, inputSchema: t.inputSchema },
    // biome-ignore lint/suspicious/noExplicitAny: girdi şeması araca göre değişir
    async (input: any) => {
      try {
        const s = await t.run(input, env);
        const anahtarli = t.sources.find((m) => m.id === s.kaynak.id)?.anahtarGerekli ?? false;
        return {
          content: [
            { type: "text" as const, text: `${t.ozet(s, input)}\n\n${kaynakSatiri(s, anahtarli)}` },
            { type: "text" as const, text: JSON.stringify(s.veri) },
          ],
          structuredContent: s as unknown as Record<string, unknown>,
        };
      } catch (e) {
        if (e instanceof KaynakHatasi) return hataSonucu(e.message);
        return hataSonucu(`Beklenmeyen hata: ${(e as Error)?.message ?? String(e)}`);
      }
    },
  );
}

function listSourcesKaydet(
  server: McpServer,
  moduller: KategoriModulu[],
  env: NodeJS.ProcessEnv,
): void {
  const kategoriler = moduller.map((m) => m.kategori) as [string, ...string[]];
  server.registerTool(
    "list_sources",
    {
      title: "Kaynakları listele",
      description:
        "List all Turkish data sources in turkiye-mcp (kaynaklar, rozet: resmî/birinci taraf/topluluk), whether each is active, and how to enable key-gated ones.",
      inputSchema: z.object({
        kategori: z.enum(kategoriler).optional().describe("Yalnız bu kategori"),
      }),
    },
    async ({ kategori }) => {
      const veri = moduller
        .filter((m) => !kategori || m.kategori === kategori)
        .flatMap((m) =>
          m.sources.map((s) => {
            const aktif = kaynakAktif(s, env);
            return {
              id: s.id,
              ad: s.ad,
              kategori: s.kategori,
              rozet: s.rozet,
              rozetEtiket: ROZET_ETIKET[s.rozet] + (s.anahtarGerekli ? " 🔑" : ""),
              anahtarGerekli: s.anahtarGerekli,
              deneysel: Boolean(s.deneysel),
              aktif,
              aciklama: s.aciklama,
              resmiUrl: s.resmiUrl,
              ...(aktif
                ? {}
                : {
                    nasilAcilir:
                      `Şu ortam değişkenlerini tanımlayın: ${s.envVars.join(", ")}. ${s.anahtarNasilAlinir ?? ""}`.trim(),
                  }),
            };
          }),
        );
      const s = {
        veri,
        kaynak: {
          id: "turkiye-mcp",
          ad: "turkiye-mcp kayıt defteri",
          rozet: "topluluk" as const,
          url: "https://github.com/YusufSizmaz/turkiye-mcp",
          alinmaZamani: istanbulIso(),
        },
      };
      const aktifSayi = veri.filter((v) => v.aktif).length;
      const ozet = `${veri.length} kaynak (${aktifSayi} aktif):\n${veri
        .map((v) => `- ${v.aktif ? "●" : "○"} ${v.ad} [${v.rozetEtiket}]${v.deneysel ? " 🧪" : ""}`)
        .join("\n")}`;
      return {
        content: [
          { type: "text" as const, text: ozet },
          { type: "text" as const, text: JSON.stringify(veri) },
        ],
        structuredContent: s as unknown as Record<string, unknown>,
      };
    },
  );
}

export function buildServer(moduller: KategoriModulu[], env: NodeJS.ProcessEnv): McpServer {
  const server = new McpServer({ name: "turkiye-mcp", version: VERSION });
  const secilen = new Set(secilenKategoriler(env));
  const aktifModuller = moduller.filter((m) => secilen.has(m.kategori));
  for (const m of aktifModuller) {
    for (const t of m.tools) if (toolAktif(t, env)) aracKaydet(server, t, env);
  }
  listSourcesKaydet(server, aktifModuller, env);
  return server;
}

export function createServer(opts: { env?: NodeJS.ProcessEnv } = {}): McpServer {
  return buildServer(KATEGORILER, opts.env ?? process.env);
}
