#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { VERSION } from "./core/version.js";
import { createServer } from "./mcp/server.js";

async function main(): Promise<void> {
  const server = createServer({ env: process.env });
  await server.connect(new StdioServerTransport());
  console.error(`[turkiye-mcp] v${VERSION} stdio üzerinden çalışıyor.`);
}

main().catch((e) => {
  console.error("[turkiye-mcp] Başlatılamadı:", e);
  process.exit(1);
});
