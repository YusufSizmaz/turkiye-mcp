/**
 * Tüm kaynakların canlı sağlık kontrolü.
 * Kullanım: npm run health -- [çıktı-klasörü]   (varsayılan: site-dist)
 * Çıktı: status.json, badges/<id>.json (shields.io endpoint), index.html, bozuk.txt
 * Bozuk kaynak olsa bile çıkış kodu 0'dır (Pages her gün yayınlansın); bozuklar bozuk.txt'de.
 */
import { runHealth } from "../src/health.js";

const out = process.argv[2] ?? "site-dist";
const kayitlar = await runHealth(out);
const say = (d: string) => kayitlar.filter((k) => k.durum === d).length;
console.log(
  `\n${kayitlar.length} kaynak: ${say("calisiyor")} çalışıyor, ${say("bozuk")} bozuk, ${say("anahtar-yok")} anahtar gerekli, ${say("geo-kisitli")} yalnızca TR → ${out}/`,
);
