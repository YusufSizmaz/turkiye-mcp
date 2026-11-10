import * as cheerio from "cheerio";
import { cached } from "../../../core/cache.js";
import { KaynakHatasi } from "../../../core/errors.js";
import { fetchText } from "../../../core/http.js";
import { eslesir, icerir } from "../../../core/metin.js";
import { sonuc } from "../../../core/sonuc.js";
import type { SourceMeta } from "../../../core/types.js";
import { type Eczane, type EczaneAdaptoru, konumAyristir, temiz } from "./tipler.js";

/**
 * Birçok eczacı odasının kullandığı ortak site altyapısı (Adana, Mersin…) için ayrıştırıcı:
 * <h4 class="red"><strong>AD</strong> - İLÇE</h4> ve ardından adres/tarif/telefon/harita/saat içeren <p>.
 * İlçe başlıkta yoksa önceki "<İLÇE> BUGÜN NÖBETÇİ ECZANELER" başlığından alınır.
 */
export function odaSayfasiAyristir(html: string, sourceId: string): Eczane[] {
  const $ = cheerio.load(html);
  const out: Eczane[] = [];
  let bolumIlce = "";
  $("h4").each((_, el) => {
    const h4 = $(el);
    const metin = temiz(h4.text());
    if (!h4.hasClass("red")) {
      const m = /^(.+?)\s+BUGÜN NÖBETÇİ ECZANELER/i.exec(metin);
      if (m) bolumIlce = temiz(m[1]);
      return;
    }
    const ad = temiz(h4.find("strong").first().text()) || temiz(metin.split(" - ")[0]);
    if (!/ECZANE/i.test(ad)) return;
    const ilce =
      temiz(metin.slice(metin.indexOf(ad) + ad.length).replace(/^\s*-\s*/, "")) || bolumIlce;
    const kardesler = h4.nextAll("p");
    const notlar = kardesler
      .filter((_, x) => $(x).hasClass("red"))
      .map((_, x) => temiz($(x).text()))
      .get();
    const p = kardesler.filter((_, x) => !$(x).hasClass("red")).first();
    // <br> ile ayrılmış satırlar; ikon sınıfı satırın ne olduğunu söyler.
    const satirlar = (p.html() ?? "").split(/<br\s*\/?>/i).map((parca) => {
      const $p = cheerio.load(`<div>${parca}</div>`);
      return { html: parca, metin: temiz($p("div").text()) };
    });
    const satirBul = (ikon: string) => satirlar.find((s) => s.html.includes(ikon))?.metin || null;
    const adres =
      satirBul("fa-home") ??
      satirlar.find((s) => s.metin && !/^\d{10,11}$/.test(s.metin))?.metin ??
      "";
    const tarif = satirBul("fa-arrows");
    const saat = temiz(p.find(".fa-clock-o").parent().text()) || null;
    const tel = p
      .find('a[href^="tel:"]')
      .first()
      .attr("href")
      ?.replace("tel:", "")
      .replace(/\s/g, "");
    out.push({
      ad,
      ilce,
      adres: adres.replace(/\s*\d{10,11}\s*$/, "").trim(),
      telefon: tel || null,
      konum: konumAyristir(p.find('a[href*="google.com/maps"]').first().attr("href")),
      tarif,
      nobet: [saat, ...notlar].filter(Boolean).join(" · ") || null,
    });
  });
  if (!out.length)
    throw new KaynakHatasi(
      sourceId,
      "ayristirma",
      "Eczacı odası sayfası ayrıştırılamadı (sayfa biçimi değişmiş olabilir).",
    );
  return out;
}

export function odaAdaptoru(o: { plaka: number; meta: SourceMeta; url: string }): EczaneAdaptoru {
  return {
    plakalar: [o.plaka],
    meta: o.meta,
    async getir(_plaka, ilce) {
      const tum = await cached(`eczane:${o.meta.id}`, o.meta.ttlSaniye, async () =>
        odaSayfasiAyristir(
          await fetchText(o.url, { sourceId: o.meta.id, browserUA: true }),
          o.meta.id,
        ),
      );
      const veri = ilce
        ? tum.filter((e) => eslesir(e.ilce, ilce) || icerir(e.ilce, ilce) || icerir(e.adres, ilce))
        : tum;
      return sonuc(o.meta, o.url, veri);
    },
  };
}

const odaMeta = (id: string, il: string, url: string): SourceMeta => ({
  id,
  ad: `${il} Eczacı Odası — Nöbetçi Eczaneler`,
  kategori: "saglik",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: url,
  aciklama: `${il}'daki bugünkü nöbetçi eczaneler: ad, ilçe, adres, tarif, telefon, harita konumu ve nöbet saatleri.`,
  ttlSaniye: 1800,
  ucNoktalar: [`GET ${url}   (HTML)`],
  kutuphaneOrnegi: `import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "${il}" });`,
});

const ADANA_URL = "https://www.adanaeo.org.tr/nobetci-eczaneler";
const MERSIN_URL = "https://www.mersineczaciodasi.org.tr/nobetci-eczaneler";

export const adana = odaAdaptoru({
  plaka: 1,
  meta: odaMeta("eczane-adana", "Adana", ADANA_URL),
  url: ADANA_URL,
});
export const mersin = odaAdaptoru({
  plaka: 33,
  meta: odaMeta("eczane-mersin", "Mersin", MERSIN_URL),
  url: MERSIN_URL,
});
