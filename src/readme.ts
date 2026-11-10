import * as z from "zod";
import { ROZET_ETIKET, type SourceMeta } from "./core/types.js";
import type { KategoriModulu, ToolDef } from "./mcp/tool.js";

const PAGES = "https://yusufsizmaz.github.io/turkiye-mcp";

const rozetUrl = (id: string) =>
  `https://img.shields.io/endpoint?url=${encodeURIComponent(`${PAGES}/badges/${id}.json`)}`;

export const durumRozeti = (id: string) => `![durum](${rozetUrl(id)})`;
/** HTML içinde (ör. <summary>) markdown işlenmediği için <img>. */
export const durumRozetiHtml = (id: string) =>
  `<img src="${rozetUrl(id)}" alt="durum" align="top">`;

/** GitHub başlık çapası (github-slugger ile uyumlu). */
export function capa(baslik: string): string {
  return `#${baslik
    .toLocaleLowerCase("tr-TR")
    .replace(/\p{Extended_Pictographic}|️/gu, "")
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-")}`;
}

interface JsonOzellik {
  type?: string | string[];
  enum?: unknown[];
  anyOf?: JsonOzellik[];
  items?: JsonOzellik;
  default?: unknown;
  description?: string;
}

function tipAdi(p: JsonOzellik): string {
  if (p.enum) return p.enum.map((e) => `\`${e}\``).join(" \\| ");
  if (p.anyOf) return [...new Set(p.anyOf.map(tipAdi))].join(" / ");
  const t = Array.isArray(p.type) ? p.type[0] : p.type;
  switch (t) {
    case "string":
      return "metin";
    case "number":
    case "integer":
      return "sayı";
    case "boolean":
      return "evet/hayır";
    case "array":
      return `${p.items ? tipAdi(p.items) : "değer"} listesi`;
    default:
      return t ?? "—";
  }
}

const hucre = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function parametreTablosu(t: ToolDef): string {
  const sema = z.toJSONSchema(t.inputSchema, { io: "input" }) as {
    properties?: Record<string, JsonOzellik>;
    required?: string[];
  };
  const props = Object.entries(sema.properties ?? {});
  if (!props.length) return "_Parametre yok._";
  const zorunlu = new Set(sema.required ?? []);
  return [
    "| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |",
    "|---|---|---|---|---|",
    ...props.map(
      ([ad, p]) =>
        `| \`${ad}\` | ${tipAdi(p)} | ${zorunlu.has(ad) && p.default === undefined ? "✔" : "—"} | ${p.default === undefined ? "—" : `\`${JSON.stringify(p.default)}\``} | ${hucre(p.description ?? "")} |`,
    ),
  ].join("\n");
}

function rozetMetni(s: SourceMeta): string {
  return `${ROZET_ETIKET[s.rozet]}${s.anahtarGerekli ? " · 🔑 Anahtar" : ""}${s.deneysel ? " · 🧪 Deneysel" : ""}`;
}

function kaynakDetayi(s: SourceMeta, araclar: ToolDef[], ornekler: Record<string, string>): string {
  const satirlar: string[] = [];
  satirlar.push(`<details>`);
  satirlar.push(
    `<summary><b>${s.ad}</b> — ${rozetMetni(s)} ${durumRozetiHtml(s.id)}</summary>`,
    "",
  );
  satirlar.push(s.aciklama, "");
  satirlar.push(`- **Resmî site:** ${s.resmiUrl}`);
  satirlar.push(
    `- **Önbellek:** ${s.ttlSaniye >= 3600 ? `${s.ttlSaniye / 3600} saat` : s.ttlSaniye >= 60 ? `${s.ttlSaniye / 60} dakika` : `${s.ttlSaniye} saniye`}`,
  );
  if (s.anahtarGerekli) {
    satirlar.push(
      `- **Gerekli ortam değişkenleri:** ${s.envVars.map((v) => `\`${v}\``).join(", ")}`,
    );
    if (s.anahtarNasilAlinir) satirlar.push(`- **Anahtar nasıl alınır:** ${s.anahtarNasilAlinir}`);
  }
  if (s.deneysel)
    satirlar.push(
      "- 🧪 **Deneysel:** resmî belgelere göre yazıldı, henüz gerçek anahtarla doğrulanmadı.",
    );
  satirlar.push("", "**Uç noktalar**", "", "```text", ...s.ucNoktalar, "```", "");
  for (const t of araclar) {
    satirlar.push(`**MCP aracı: \`${t.name}\`** — ${t.title}`, "", `> ${t.description}`, "");
    satirlar.push(parametreTablosu(t), "");
    if (t.ornekSorular.length) {
      satirlar.push("Örnek sorular:", "", ...t.ornekSorular.map((q) => `- “${q}”`), "");
    }
    const ornek = ornekler[t.name];
    if (ornek) satirlar.push("Gerçek örnek çıktı:", "", "```text", ornek, "```", "");
  }
  satirlar.push("**Kütüphane olarak**", "", "```ts", s.kutuphaneOrnegi, "```", "");
  satirlar.push(`</details>`, "");
  return satirlar.join("\n");
}

export function renderKategori(k: KategoriModulu, ornekler: Record<string, string> = {}): string {
  const out: string[] = [];
  out.push(`## ${k.ikon} ${k.ad}`, "", k.aciklama, "");
  out.push("| Kaynak | Rozet | MCP araçları | Durum |", "|---|---|---|---|");
  const araclari = (s: SourceMeta) => k.tools.filter((t) => t.sources.some((m) => m.id === s.id));
  for (const s of k.sources) {
    const a =
      araclari(s)
        .map((t) => `\`${t.name}\``)
        .join("<br>") || "—";
    out.push(`| ${s.ad} | ${rozetMetni(s)} | ${a} | ${durumRozeti(s.id)} |`);
  }
  out.push("");
  for (const s of k.sources) out.push(kaynakDetayi(s, araclari(s), ornekler));
  return out.join("\n");
}

export function renderKatalog(
  moduller: KategoriModulu[],
  ornekler: Record<string, string> = {},
): string {
  return moduller.map((k) => renderKategori(k, ornekler)).join("\n");
}

export function renderIcindekiler(moduller: KategoriModulu[]): string {
  return moduller
    .map((k) => {
      const baslik = `${k.ikon} ${k.ad}`;
      const kaynakSay = k.sources.length;
      return `- [${baslik}](${capa(baslik)}) — ${kaynakSay} kaynak, ${k.tools.length} araç`;
    })
    .join("\n");
}

export function readmeGuncelle(readme: string, isaret: string, icerik: string): string {
  const bas = `<!-- ${isaret}:BASLA -->`;
  const son = `<!-- ${isaret}:BITIR -->`;
  const i = readme.indexOf(bas);
  const j = readme.indexOf(son);
  if (i === -1 || j === -1 || j < i)
    throw new Error(`README'de ${bas} … ${son} işaretleri bulunamadı`);
  return `${readme.slice(0, i + bas.length)}\n${icerik}\n${readme.slice(j)}`;
}
