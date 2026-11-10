import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { describe, expect, it } from "vitest";
import * as z from "zod";
import { KaynakHatasi } from "../../../src/core/errors.js";
import { sonuc } from "../../../src/core/sonuc.js";
import type { SourceMeta } from "../../../src/core/types.js";
import { buildServer } from "../../../src/mcp/server.js";
import { defineTool, type KategoriModulu } from "../../../src/mcp/tool.js";
import { secilenKategoriler } from "../../../src/registry.js";
import "../../helpers.js";

const acik: SourceMeta = {
  id: "sahte-afad",
  ad: "Sahte AFAD",
  kategori: "deprem",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://afad.test",
  aciklama: "test",
  ttlSaniye: 30,
  ucNoktalar: [],
  kutuphaneOrnegi: "",
};

const anahtarli: SourceMeta = {
  ...acik,
  id: "sahte-evds",
  ad: "Sahte EVDS",
  kategori: "finans",
  anahtarGerekli: true,
  envVars: ["TCMB_EVDS_KEY"],
  anahtarNasilAlinir: "evds sitesinden alın",
};

const moduller: KategoriModulu[] = [
  {
    kategori: "deprem",
    ad: "Deprem & Afet",
    ikon: "🌍",
    aciklama: "",
    sources: [acik],
    probes: {},
    tools: [
      defineTool({
        name: "deprem_get_recent",
        title: "Son depremler",
        description: "test",
        inputSchema: z.object({ bozuk: z.boolean().default(false) }),
        sources: [acik],
        ornekSorular: [],
        async run({ bozuk }) {
          if (bozuk) throw new KaynakHatasi("sahte-afad", "ayristirma", "AFAD beklenmeyen yanıt");
          return sonuc(acik, "https://afad.test/x", [{ buyukluk: 4.2 }]);
        },
        ozet: () => "1 deprem",
      }),
    ],
  },
  {
    kategori: "finans",
    ad: "Finans",
    ikon: "💱",
    aciklama: "",
    sources: [anahtarli],
    probes: {},
    tools: [
      defineTool({
        name: "finans_get_evds_series",
        title: "EVDS",
        description: "test",
        inputSchema: z.object({}),
        sources: [anahtarli],
        ornekSorular: [],
        run: async () => sonuc(anahtarli, "https://evds.test", []),
        ozet: () => "",
      }),
    ],
  },
];

async function baglan(env: NodeJS.ProcessEnv) {
  const server = buildServer(moduller, env);
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(a), client.connect(b)]);
  return client;
}

const adlar = async (c: Client) => (await c.listTools()).tools.map((t) => t.name).sort();

describe("MCP sunucusu", () => {
  it("list_sources her zaman kayıtlı, anahtarlı araç env yoksa kayıtlı değil", async () => {
    const c = await baglan({});
    expect(await adlar(c)).toEqual(["deprem_get_recent", "list_sources"]);
  });

  it("anahtar env'i varsa anahtarlı araç kaydedilir", async () => {
    const c = await baglan({ TCMB_EVDS_KEY: "x" });
    expect(await adlar(c)).toContain("finans_get_evds_series");
  });

  it("TURKIYE_MCP_CATEGORIES yalnız seçilen kategorileri yükler", async () => {
    const c = await baglan({ TURKIYE_MCP_CATEGORIES: "finans", TCMB_EVDS_KEY: "x" });
    expect(await adlar(c)).toEqual(["finans_get_evds_series", "list_sources"]);
  });

  it("başarılı çağrı kaynak bloğu ve structuredContent döndürür", async () => {
    const c = await baglan({});
    const r = await c.callTool({ name: "deprem_get_recent", arguments: {} });
    expect(r.isError).toBeFalsy();
    const metin = (r.content as Array<{ text: string }>)[0]?.text ?? "";
    expect(metin).toContain("1 deprem");
    expect(metin).toContain("Kaynak: 🏛️ Resmî Sahte AFAD — https://afad.test/x");
    expect((r.structuredContent as { kaynak: { id: string } }).kaynak.id).toBe("sahte-afad");
  });

  it("KaynakHatasi isError ve Türkçe mesaj döndürür", async () => {
    const c = await baglan({});
    const r = await c.callTool({ name: "deprem_get_recent", arguments: { bozuk: true } });
    expect(r.isError).toBe(true);
    expect((r.content as Array<{ text: string }>)[0]?.text).toContain("AFAD beklenmeyen yanıt");
  });

  it("list_sources aktiflik ve açma talimatını verir", async () => {
    const c = await baglan({});
    const r = await c.callTool({ name: "list_sources", arguments: {} });
    const veri = (r.structuredContent as { veri: Array<Record<string, unknown>> }).veri;
    expect(veri.find((k) => k.id === "sahte-afad")).toMatchObject({ aktif: true, rozet: "resmi" });
    const evds = veri.find((k) => k.id === "sahte-evds");
    expect(evds).toMatchObject({ aktif: false });
    expect(String(evds?.nasilAcilir)).toContain("TCMB_EVDS_KEY");
  });
});

describe("secilenKategoriler", () => {
  it("boşsa hepsi", () => {
    expect(secilenKategoriler({})).toHaveLength(9);
  });
  it("virgüllü liste ve boşluklar", () => {
    expect(secilenKategoriler({ TURKIYE_MCP_CATEGORIES: " finans , deprem" })).toEqual([
      "finans",
      "deprem",
    ]);
  });
  it("bilinmeyen ad yok sayılır", () => {
    expect(secilenKategoriler({ TURKIYE_MCP_CATEGORIES: "finans,uydurma" })).toEqual(["finans"]);
  });
});
