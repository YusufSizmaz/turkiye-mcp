import { cached } from "../../../core/cache.js";
import { KaynakHatasi } from "../../../core/errors.js";
import { fetchJson } from "../../../core/http.js";
import { icerir } from "../../../core/metin.js";
import { sonuc } from "../../../core/sonuc.js";
import type { SourceMeta } from "../../../core/types.js";
import { type Eczane, type EczaneAdaptoru, temiz } from "./tipler.js";

export const meta: SourceMeta = {
  id: "eczane-izmir",
  kisaAd: "İzmir BB",
  ad: "İzmir Büyükşehir Belediyesi — Nöbetçi Eczaneler",
  kategori: "saglik",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://acikveri.bizizmir.com/tr/dataset/nobetci-eczaneler-ve-eczane-listesi",
  aciklama:
    "İzmir'in bugünkü nöbetçi eczaneleri, İzmir Büyükşehir Belediyesi açık veri API'sinden: ad, bölge, adres, telefon, konum ve nöbet notu (ör. 24:00'den sonra hangi eczane).",
  ttlSaniye: 1800,
  ucNoktalar: ["GET https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler"],
  kutuphaneOrnegi: `import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İzmir", ilce: "Bornova" });`,
};

const URL_ = "https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler";

interface Ham {
  Adi: string;
  Bolge?: string;
  Adres?: string;
  Telefon?: string;
  LokasyonX?: string;
  LokasyonY?: string;
  BolgeAciklama?: string;
}

export function donustur(h: Ham): Eczane {
  const enlem = Number(h.LokasyonX);
  const boylam = Number(h.LokasyonY);
  return {
    ad: temiz(h.Adi),
    ilce: temiz(h.Bolge),
    adres: temiz(h.Adres),
    telefon: temiz(h.Telefon) || null,
    konum:
      Number.isFinite(enlem) && Number.isFinite(boylam) && enlem && boylam
        ? { enlem, boylam }
        : null,
    tarif: null,
    nobet: temiz(h.BolgeAciklama) || null,
  };
}

export const adaptor: EczaneAdaptoru = {
  plakalar: [35],
  meta,
  async getir(_plaka, ilce) {
    const tum = await cached("eczane:izmir:api", meta.ttlSaniye, async () => {
      const h = await fetchJson<Ham[]>(URL_, { sourceId: meta.id });
      if (!Array.isArray(h) || !h.length) {
        throw new KaynakHatasi(
          meta.id,
          "ayristirma",
          "İzmir nöbetçi eczane yanıtı beklenen biçimde değil.",
        );
      }
      return h.map(donustur);
    });
    const veri = ilce
      ? tum.filter(
          (e) => icerir(e.ilce, ilce) || icerir(e.adres, ilce) || icerir(e.nobet ?? "", ilce),
        )
      : tum;
    return sonuc(meta, URL_, veri);
  },
};
