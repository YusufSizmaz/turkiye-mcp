import * as cheerio from "cheerio";
import { cached } from "../../../core/cache.js";
import { KaynakHatasi } from "../../../core/errors.js";
import { fetchText } from "../../../core/http.js";
import { icerir } from "../../../core/metin.js";
import { sonuc } from "../../../core/sonuc.js";
import type { SourceMeta } from "../../../core/types.js";
import { type Eczane, type EczaneAdaptoru, konumAyristir, temiz } from "./tipler.js";

export const meta: SourceMeta = {
  id: "eczane-izmir",
  geoKisitli: true,
  ad: "İzmir Eczacı Odası — Nöbetçi Eczaneler",
  kategori: "saglik",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.izmireczaciodasi.org.tr/nobetci-eczaneler",
  aciklama: "İzmir'deki bugünkü nöbetçi eczaneler: ad, semt, adres, telefon ve harita konumu.",
  ttlSaniye: 1800,
  ucNoktalar: ["GET https://www.izmireczaciodasi.org.tr/nobetci-eczaneler   (HTML)"],
  kutuphaneOrnegi: `import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İzmir", ilce: "Bornova" });`,
};

const URL_ = "https://www.izmireczaciodasi.org.tr/nobetci-eczaneler";

export function ayristir(html: string): Eczane[] {
  const $ = cheerio.load(html);
  const out: Eczane[] = [];
  $("h4.red").each((_, el) => {
    const baslik = temiz($(el).text());
    const m = /^(.*?ECZANES[İI])\s*-\s*(.+)$/i.exec(baslik);
    if (!m) return;
    const paragraflar = $(el).nextAll("p");
    const notlar = paragraflar
      .filter((_, x) => $(x).hasClass("red"))
      .map((_, x) => temiz($(x).text()))
      .get()
      .filter(Boolean);
    const p = paragraflar.filter((_, x) => !$(x).hasClass("red")).first();
    const adres = temiz(p.contents().first().text()) || temiz(p.text().split(/\d{10,11}/)[0]);
    const tel = p.find('a[href^="tel:"]').first().attr("href")?.replace("tel:", "").trim();
    out.push({
      ad: temiz(m[1]),
      ilce: temiz(m[2]),
      adres,
      telefon: tel || null,
      konum: konumAyristir(p.find('a[href*="google.com/maps"]').first().attr("href")),
      tarif: null,
      nobet: notlar.length ? notlar.join(" · ") : null,
    });
  });
  if (!out.length)
    throw new KaynakHatasi(meta.id, "ayristirma", "İzmir Eczacı Odası listesi ayrıştırılamadı.");
  return out;
}

export const adaptor: EczaneAdaptoru = {
  plakalar: [35],
  meta,
  async getir(_plaka, ilce) {
    const tum = await cached("eczane:izmir", meta.ttlSaniye, async () =>
      ayristir(await fetchText(URL_, { sourceId: meta.id, browserUA: true })),
    );
    const veri = ilce ? tum.filter((e) => icerir(e.ilce, ilce) || icerir(e.adres, ilce)) : tum;
    return sonuc(meta, URL_, veri);
  },
};
