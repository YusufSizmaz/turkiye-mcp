import * as cheerio from "cheerio";
import { cached } from "../../../core/cache.js";
import { KaynakHatasi } from "../../../core/errors.js";
import { fetchJson } from "../../../core/http.js";
import { eslesir } from "../../../core/metin.js";
import { sonuc } from "../../../core/sonuc.js";
import { bugunTr, noktaliTarih, oncekiGun, trSaat } from "../../../core/tarih.js";
import type { SourceMeta } from "../../../core/types.js";
import { type Eczane, type EczaneAdaptoru, konumAyristir, temiz } from "./tipler.js";

export const meta: SourceMeta = {
  id: "eczane-ankara",
  ad: "Ankara Eczacı Odası — Nöbetçi Eczaneler",
  kategori: "saglik",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.aeo.org.tr/nobetci-eczaneler",
  aciklama: "Ankara'daki bugünkü nöbetçi eczaneler: ad, ilçe, adres, telefon ve harita konumu.",
  ttlSaniye: 1800,
  ucNoktalar: [
    "GET https://www.aeo.org.tr/getPharmacies/{YYYY-MM-DD}   (JSON içinde HTML parçası)",
  ],
  kutuphaneOrnegi: `import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });`,
};

export function ayristir(html: string): Eczane[] {
  const $ = cheerio.load(html);
  const out: Eczane[] = [];
  $("div.inline-box").each((_, el) => {
    const kutu = $(el);
    const p = kutu.find(".text p").first();
    const telefon = temiz(p.find("span").first().text()) || null;
    p.find("span").remove();
    out.push({
      ad: temiz(kutu.find(".text h4").first().text()),
      ilce: temiz(kutu.attr("data-district")),
      adres: temiz(p.text()),
      telefon,
      konum: konumAyristir(kutu.find('a[href*="google.com/maps"]').first().attr("href")),
      tarif: null,
      nobet: null,
    });
  });
  const bulunan = out.filter((e) => e.ad);
  if (!bulunan.length) {
    throw new KaynakHatasi(meta.id, "ayristirma", "Ankara Eczacı Odası listesi ayrıştırılamadı.");
  }
  return bulunan;
}

/** Nöbet akşam başlar, ertesi sabah ~08:30–09:00'da biter: sabah 09:00'dan önce aktif nöbet önceki günündür. */
export function nobetGunu(now: Date = new Date()): string {
  const bugun = bugunTr(now);
  return trSaat(now) < 9 ? oncekiGun(bugun) : bugun;
}

export const adaptor: EczaneAdaptoru = {
  plakalar: [6],
  meta,
  async getir(_plaka, ilce) {
    const gun = nobetGunu();
    const url = `https://www.aeo.org.tr/getPharmacies/${gun}`;
    const tum = await cached(url, meta.ttlSaniye, async () => {
      const ham = await fetchJson<{ status?: string; html?: string }>(url, {
        sourceId: meta.id,
        browserUA: true,
      });
      if (ham?.status !== "success" || typeof ham.html !== "string") {
        throw new KaynakHatasi(
          meta.id,
          "ayristirma",
          "Ankara Eczacı Odası yanıtı beklenen biçimde değil.",
        );
      }
      return ayristir(ham.html);
    });
    const nobet = `${noktaliTarih(gun)} nöbeti (ertesi sabaha kadar)`;
    const veri = (ilce ? tum.filter((e) => eslesir(e.ilce, ilce)) : tum).map((e) => ({
      ...e,
      nobet,
    }));
    return sonuc(meta, url, veri);
  },
};
