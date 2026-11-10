import { cached } from "../../../core/cache.js";
import { KaynakHatasi } from "../../../core/errors.js";
import { fetchJson, fetchText } from "../../../core/http.js";
import { eslesir } from "../../../core/metin.js";
import { sonuc } from "../../../core/sonuc.js";
import type { SourceMeta } from "../../../core/types.js";
import type { Eczane, EczaneAdaptoru } from "./tipler.js";

export const meta: SourceMeta = {
  id: "eczane-istanbul",
  ad: "İstanbul Eczacı Odası — Nöbetçi Eczaneler",
  kategori: "saglik",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/",
  aciklama:
    "İstanbul ve Yalova'daki nöbetçi eczaneler: ad, adres, tarif, konum ve nöbet saatleri. Telefon numaraları oda tarafından tek tek gösterildiği için toplu verilmez; resmî sayfadan bakılabilir.",
  ttlSaniye: 1800,
  ucNoktalar: [
    "GET https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/   (gömülü boot JSON: token + ilçe listesi)",
    "GET https://www.istanbuleczaciodasi.org.tr/api/nobetci-eczane-web/?action=district&id={ilceId}   (X-Web-Token, Referer)",
  ],
  kutuphaneOrnegi: `import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İstanbul", ilce: "Kadıköy" });`,
};

const SAYFA = "https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/";
const API = "https://www.istanbuleczaciodasi.org.tr/api/nobetci-eczane-web/";

interface Boot {
  token: string;
  districts: Array<{ ilceId: number; ilceAd: string; ilId: number }>;
}

async function boot(): Promise<Boot> {
  // Token kısa ömürlü olduğu için kısa önbellek.
  return cached("ieo:boot", 300, async () => {
    const html = await fetchText(SAYFA, { sourceId: meta.id, browserUA: true });
    const m = /<script type="application\/json" id="boot">([\s\S]*?)<\/script>/.exec(html);
    try {
      const b = JSON.parse(m?.[1] ?? "") as Boot;
      if (!b.token || !Array.isArray(b.districts)) throw new Error();
      return b;
    } catch {
      throw new KaynakHatasi(
        meta.id,
        "ayristirma",
        "İstanbul Eczacı Odası sayfasından oturum bilgisi alınamadı.",
      );
    }
  });
}

interface Ham {
  ad: string;
  ilce: string;
  adres: string;
  tarif?: string | null;
  lat?: number | null;
  lng?: number | null;
  nobetBaslangic?: string;
  nobetBitis?: string;
}

export const adaptor: EczaneAdaptoru = {
  plakalar: [34, 77],
  meta,
  async getir(plaka, ilce) {
    const b = await boot();
    const ilceler = b.districts.filter((d) => d.ilId === plaka);
    const ilceAdlari = ilceler.map((d) => d.ilceAd).join(", ");
    if (!ilce) {
      throw new KaynakHatasi(
        meta.id,
        "bulunamadi",
        `${plaka === 34 ? "İstanbul" : "Yalova"} için ilçe belirtin. İlçeler: ${ilceAdlari}`,
      );
    }
    const d = ilceler.find((x) => eslesir(x.ilceAd, ilce));
    if (!d)
      throw new KaynakHatasi(
        meta.id,
        "bulunamadi",
        `"${ilce}" ilçesi bulunamadı. İlçeler: ${ilceAdlari}`,
      );
    const url = `${API}?action=district&id=${d.ilceId}`;
    const ham = await cached(url, meta.ttlSaniye, () =>
      fetchJson<{ success: boolean; data?: Ham[]; error?: { message?: string } }>(url, {
        sourceId: meta.id,
        browserUA: true,
        headers: { Accept: "application/json", "X-Web-Token": b.token, Referer: SAYFA },
      }),
    );
    if (!ham?.success || !Array.isArray(ham.data)) {
      throw new KaynakHatasi(
        meta.id,
        "ayristirma",
        `İstanbul Eczacı Odası: ${ham?.error?.message ?? "beklenmeyen yanıt"}`,
      );
    }
    const veri = ham.data.map(
      (e): Eczane => ({
        ad: e.ad,
        ilce: e.ilce,
        adres: e.adres,
        telefon: null,
        konum:
          typeof e.lat === "number" && typeof e.lng === "number"
            ? { enlem: e.lat, boylam: e.lng }
            : null,
        tarif: e.tarif?.trim() || null,
        nobet: e.nobetBaslangic && e.nobetBitis ? `${e.nobetBaslangic}–${e.nobetBitis}` : null,
      }),
    );
    return sonuc(meta, SAYFA, veri);
  },
};
