/**
 * Uçtan uca duman testi: derlenmiş sunucuyu (dist/cli.js) gerçek bir MCP istemcisiyle
 * stdio üzerinden başlatır, araçları listeler ve her aracı gerçek kaynaklara karşı çağırır.
 * Başarılı çıktıların ilk satırlarını docs/ornek-ciktilar.json'a yazar (README kataloğu için).
 * Kullanım: npm run build && npx tsx scripts/smoke.ts
 */
import { writeFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const CAGRILAR: Array<[string, Record<string, unknown>]> = [
  ["list_sources", {}],
  ["finans_get_exchange_rates", { kodlar: ["USD", "EUR", "GBP"] }],
  ["finans_get_kap_disclosures", { limit: 3 }],
  ["finans_search_kap_companies", { sorgu: "aselsan" }],
  ["finans_get_gold_prices", { kodlar: ["GRA", "CEYREKALTIN", "TAMALTIN"] }],
  ["finans_get_stock_history", { hisse: "THYAO" }],
  ["finans_get_crypto_prices", {}],
  ["deprem_get_recent", { minBuyukluk: 2.5, limit: 3 }],
  ["resmi_gazete_get_issue", {}],
  ["hava_get_current", { il: "Ankara" }],
  ["hava_get_forecast", { il: "İzmir" }],
  ["hava_get_air_quality", { il: "İstanbul", limit: 3 }],
  ["enerji_get_fuel_prices", { il: "İstanbul", ilce: "Kadıköy" }],
  ["eczane_get_on_duty", { il: "İzmir", ilce: "Bornova", limit: 2 }],
  ["istanbul_get_traffic_index", {}],
  ["istanbul_get_parking", { ilce: "Kadıköy", limit: 3 }],
  ["opendata_search", { portal: "ibb", sorgu: "baraj", limit: 2 }],
  ["cografya_get_provinces", { ad: "Eskişehir" }],
  ["cografya_get_districts", { il: "Muğla" }],
  ["cografya_get_neighborhoods", { il: "İstanbul", ilce: "Beşiktaş", limit: 3 }],
  ["takvim_get_holidays", {}],
  ["takvim_get_prayer_times", { il: "İstanbul", ilce: "Üsküdar" }],
];

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/cli.js"],
  env: { ...process.env } as Record<string, string>,
});
const client = new Client({ name: "smoke", version: "0" });
await client.connect(transport);

const araclar = (await client.listTools()).tools.map((t) => t.name);
console.log(`${araclar.length} araç kayıtlı`);

const ornekler: Record<string, string> = {};
let hata = 0;
for (const [ad, args] of CAGRILAR) {
  if (!araclar.includes(ad)) {
    console.log(`❌ ${ad}: kayıtlı değil`);
    hata++;
    continue;
  }
  const r = await client.callTool({ name: ad, arguments: args });
  const metin = (r.content as Array<{ type: string; text?: string }>)[0]?.text ?? "";
  if (r.isError) {
    console.log(`❌ ${ad}: ${metin}`);
    hata++;
    continue;
  }
  const kisa = metin.split("\n").slice(0, 14).join("\n");
  ornekler[ad] = kisa;
  console.log(`✅ ${ad}\n${kisa.replace(/^/gm, "   ")}\n`);
}
await client.close();
writeFileSync("docs/ornek-ciktilar.json", `${JSON.stringify(ornekler, null, 2)}\n`);
console.log(`${CAGRILAR.length - hata}/${CAGRILAR.length} çağrı başarılı`);
process.exit(hata ? 1 : 0);
