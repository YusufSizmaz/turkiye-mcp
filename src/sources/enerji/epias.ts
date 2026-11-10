import { anahtarlar } from "../../core/anahtar.js";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson, fetchText } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import { bugunTr } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export const meta: SourceMeta = {
  id: "epias",
  kisaAd: "EPİAŞ",
  ad: "EPİAŞ Şeffaflık Platformu",
  kategori: "enerji",
  rozet: "resmi",
  anahtarGerekli: true,
  envVars: ["EPIAS_USERNAME", "EPIAS_PASSWORD"],
  anahtarNasilAlinir:
    "Ücretsiz üyelik: https://kayit.epias.com.tr adresinden Şeffaflık Platformu kullanıcısı oluşturun; kullanıcı adı (e-posta) ve şifrenizi kullanın.",
  resmiUrl: "https://seffaflik.epias.com.tr",
  aciklama:
    "Enerji Piyasaları İşletme A.Ş. verileri: gün öncesi piyasası saatlik Piyasa Takas Fiyatı (PTF, TL/USD/EUR per MWh) ve gerçek zamanlı elektrik tüketimi.",
  ttlSaniye: 3600,
  deneysel: true,
  ucNoktalar: [
    "POST https://giris.epias.com.tr/cas/v1/tickets   (form: username, password → TGT)",
    'POST https://seffaflik.epias.com.tr/electricity-service/v1/markets/dam/data/mcp   (header: TGT) {"startDate":"…+03:00","endDate":"…+03:00"}',
    "POST https://seffaflik.epias.com.tr/electricity-service/v1/consumption/data/realtime-consumption",
  ],
  kutuphaneOrnegi: `import { epias } from "turkiye-mcp";

const ptf = await epias.getMarketClearingPrice({ tarih: "2026-11-10" }, process.env);`,
};

const TGT_SURESI = 2 * 3600;
const TABAN = "https://seffaflik.epias.com.tr/electricity-service/v1";

async function tgt(env: NodeJS.ProcessEnv): Promise<string> {
  const { EPIAS_USERNAME, EPIAS_PASSWORD } = anahtarlar(meta, env);
  return cached(`epias:tgt:${EPIAS_USERNAME}`, TGT_SURESI, async () => {
    const t = (
      await fetchText("https://giris.epias.com.tr/cas/v1/tickets", {
        sourceId: meta.id,
        method: "POST",
        headers: { Accept: "text/plain" },
        form: { username: EPIAS_USERNAME as string, password: EPIAS_PASSWORD as string },
      })
    ).trim();
    if (!t.startsWith("TGT-"))
      throw new KaynakHatasi(meta.id, "anahtar-yok", "EPİAŞ girişi başarısız (TGT alınamadı).");
    return t;
  });
}

async function veriIste<T>(
  yol: string,
  tarih: string,
  env: NodeJS.ProcessEnv,
): Promise<{ url: string; items: T[] }> {
  const url = `${TABAN}${yol}`;
  const govde = { startDate: `${tarih}T00:00:00+03:00`, endDate: `${tarih}T23:00:00+03:00` };
  const bilet = await tgt(env);
  const ham = await cached(`${url}:${tarih}`, meta.ttlSaniye, () =>
    fetchJson<{ items?: T[] }>(url, {
      sourceId: meta.id,
      method: "POST",
      json: govde,
      headers: { TGT: bilet },
    }),
  );
  if (!Array.isArray(ham?.items))
    throw new KaynakHatasi(meta.id, "ayristirma", "EPİAŞ yanıtı beklenen biçimde değil.");
  return { url, items: ham.items };
}

export interface PtfSaati {
  saat: string;
  ptfTl: number;
  ptfUsd: number | null;
  ptfEur: number | null;
}

export async function getMarketClearingPrice(
  o: { tarih?: string },
  env: NodeJS.ProcessEnv,
): Promise<Sonuc<PtfSaati[]>> {
  const { url, items } = await veriIste<{
    hour: string;
    price: number;
    priceUsd?: number;
    priceEur?: number;
  }>("/markets/dam/data/mcp", o.tarih ?? bugunTr(), env);
  return sonuc(
    meta,
    url,
    items.map((i) => ({
      saat: i.hour,
      ptfTl: i.price,
      ptfUsd: i.priceUsd ?? null,
      ptfEur: i.priceEur ?? null,
    })),
  );
}

export interface TuketimSaati {
  saat: string;
  tuketimMwh: number;
}

export async function getRealtimeConsumption(
  o: { tarih?: string },
  env: NodeJS.ProcessEnv,
): Promise<Sonuc<TuketimSaati[]>> {
  const { url, items } = await veriIste<{ time?: string; hour?: string; consumption: number }>(
    "/consumption/data/realtime-consumption",
    o.tarih ?? bugunTr(),
    env,
  );
  return sonuc(
    meta,
    url,
    items.map((i) => ({ saat: i.time ?? i.hour ?? "", tuketimMwh: i.consumption })),
  );
}
