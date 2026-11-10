import { anahtarlar } from "../../core/anahtar.js";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { ilBulVeyaHata } from "../../core/iller.js";
import { eslesir } from "../../core/metin.js";
import { sonuc } from "../../core/sonuc.js";
import { bugunTr } from "../../core/tarih.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { kaynakAktif } from "../../mcp/tool.js";
import { getDistricts } from "../cografya/turkiyeapi.js";

export const ezanMeta: SourceMeta = {
  id: "ezanvakti",
  geoKisitli: true,
  ad: "Ezan Vakti API (Diyanet verisi)",
  kategori: "takvim",
  rozet: "topluluk",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "https://ezanvakti.emushaf.net",
  aciklama:
    "Diyanet İşleri Başkanlığı'nın il/ilçe bazlı namaz vakitlerini anahtarsız sunan topluluk aynası; ~30 günlük vakit, hicri tarih.",
  ttlSaniye: 86_400,
  ucNoktalar: [
    "GET https://ezanvakti.emushaf.net/sehirler/2",
    "GET https://ezanvakti.emushaf.net/ilceler/{sehirId}",
    "GET https://ezanvakti.emushaf.net/vakitler/{ilceId}",
  ],
  kutuphaneOrnegi: `import { namaz } from "turkiye-mcp";

const { veri } = await namaz.getPrayerTimes({ il: "İstanbul", ilce: "Üsküdar", gunSayisi: 7 }, process.env);`,
};

export const diyanetMeta: SourceMeta = {
  id: "diyanet-namaz",
  ad: "Diyanet İşleri Başkanlığı Namaz Vakti API",
  kategori: "takvim",
  rozet: "resmi",
  anahtarGerekli: true,
  envVars: ["DIYANET_EMAIL", "DIYANET_PASSWORD"],
  anahtarNasilAlinir: "Ücretsiz üyelik: https://awqatsalah.diyanet.gov.tr adresinden kayıt olun.",
  resmiUrl: "https://awqatsalah.diyanet.gov.tr",
  aciklama:
    "Diyanet'in resmî namaz vakti servisi. Anahtar tanımlıysa namaz vakitleri doğrudan buradan alınır; yoksa Ezan Vakti aynası kullanılır.",
  ttlSaniye: 86_400,
  deneysel: true,
  ucNoktalar: [
    'POST https://awqatsalah.diyanet.gov.tr/Auth/Login  {"email","password"} → accessToken',
    "GET  https://awqatsalah.diyanet.gov.tr/api/PrayerTime/Daily/{ilceId}   (Authorization: Bearer)",
  ],
  kutuphaneOrnegi: `import { namaz } from "turkiye-mcp";

// DIYANET_EMAIL ve DIYANET_PASSWORD tanımlıysa otomatik olarak Diyanet kullanılır
const { veri, kaynak } = await namaz.getPrayerTimes({ il: "Ankara" }, process.env);`,
};

export interface Vakit {
  tarih: string;
  yer: string;
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  hicri: string;
}

const EZAN = "https://ezanvakti.emushaf.net";
const TURKIYE = "2";

async function ilceBul(
  il: string,
  ilce?: string,
): Promise<{ id: string; yer: string; not?: string }> {
  const ilAd = ilBulVeyaHata(il, ezanMeta.id).ad;
  const sehirler = await cached("ezan:sehirler", 86_400 * 7, () =>
    fetchJson<Array<{ SehirAdi: string; SehirID: string }>>(`${EZAN}/sehirler/${TURKIYE}`, {
      sourceId: ezanMeta.id,
    }),
  );
  if (!Array.isArray(sehirler)) {
    throw new KaynakHatasi(
      ezanMeta.id,
      "ayristirma",
      "Ezan Vakti şehir listesi beklenen biçimde değil.",
    );
  }
  const sehir = sehirler.find((s) => eslesir(s.SehirAdi, ilAd));
  if (!sehir)
    throw new KaynakHatasi(ezanMeta.id, "bulunamadi", `${ilAd} için şehir kaydı bulunamadı.`);
  const ilceler = await cached(`ezan:ilceler:${sehir.SehirID}`, 86_400 * 7, () =>
    fetchJson<Array<{ IlceAdi: string; IlceID: string }>>(`${EZAN}/ilceler/${sehir.SehirID}`, {
      sourceId: ezanMeta.id,
    }),
  );
  if (!Array.isArray(ilceler)) {
    throw new KaynakHatasi(
      ezanMeta.id,
      "ayristirma",
      "Ezan Vakti ilçe listesi beklenen biçimde değil.",
    );
  }
  const bul = (ad: string) => ilceler.find((x) => eslesir(x.IlceAdi, ad));
  const yerOf = (x: { IlceAdi: string }) => `${sehir.SehirAdi} / ${x.IlceAdi}`;
  const istenen = ilce ? bul(ilce) : undefined;
  if (istenen) return { id: istenen.IlceID, yer: yerOf(istenen) };
  // Diyanet merkez ilçeleri (Kadıköy, Üsküdar, Bornova…) ayrı listelemez; il merkezinin vakti geçerlidir.
  // Ama yalnız girdi gerçekten o ilin bir ilçesiyse: yazım hatası sessizce il merkezine düşmemeli.
  const merkez = bul(ilAd);
  const gercekIlce = ilce ? await ilinIlcesiMi(ilAd, ilce) : true;
  if (!merkez || !gercekIlce) {
    throw new KaynakHatasi(
      ezanMeta.id,
      "bulunamadi",
      `${ilAd} ilinde "${ilce ?? ilAd}" bulunamadı. İlçeler: ${ilceler.map((x) => x.IlceAdi).join(", ")}`,
    );
  }
  return {
    id: merkez.IlceID,
    yer: yerOf(merkez),
    ...(ilce
      ? {
          not: `Diyanet "${ilce}" için ayrı vakit yayımlamıyor (merkez ilçe); ${ilAd} merkez vakitleri verildi.`,
        }
      : {}),
  };
}

/** TurkiyeAPI'ye göre ilçe o ilin ilçesi mi? TurkiyeAPI'ye ulaşılamazsa doğrulanamadığı için kabul edilir. */
async function ilinIlcesiMi(il: string, ilce: string): Promise<boolean> {
  try {
    const { veri } = await getDistricts(il);
    return veri.some((d) => eslesir(d.ad, ilce));
  } catch {
    return true;
  }
}

const noktaliToIso = (s: string) => {
  const [g, a, y] = s.split(".");
  return `${y}-${a}-${g}`;
};

async function ezanVakti(id: string, yer: string): Promise<{ url: string; vakitler: Vakit[] }> {
  const url = `${EZAN}/vakitler/${id}`;
  const ham = await cached(url, ezanMeta.ttlSaniye, () =>
    fetchJson<Array<Record<string, string>>>(url, { sourceId: ezanMeta.id }),
  );
  if (!Array.isArray(ham))
    throw new KaynakHatasi(ezanMeta.id, "ayristirma", "Vakit listesi alınamadı.");
  return {
    url,
    vakitler: ham.map((v) => ({
      tarih: noktaliToIso(String(v.MiladiTarihKisa)),
      yer,
      imsak: String(v.Imsak),
      gunes: String(v.Gunes),
      ogle: String(v.Ogle),
      ikindi: String(v.Ikindi),
      aksam: String(v.Aksam),
      yatsi: String(v.Yatsi),
      hicri: String(v.HicriTarihUzun),
    })),
  };
}

const DIYANET = "https://awqatsalah.diyanet.gov.tr";

async function diyanetVakti(
  id: string,
  yer: string,
  env: NodeJS.ProcessEnv,
): Promise<{ url: string; vakitler: Vakit[] }> {
  const { DIYANET_EMAIL, DIYANET_PASSWORD } = anahtarlar(diyanetMeta, env);
  const token = await cached(`diyanet:token:${DIYANET_EMAIL}`, 3000, async () => {
    const r = await fetchJson<{ data?: { accessToken?: string } }>(`${DIYANET}/Auth/Login`, {
      sourceId: diyanetMeta.id,
      method: "POST",
      json: { email: DIYANET_EMAIL, password: DIYANET_PASSWORD },
    });
    if (!r?.data?.accessToken)
      throw new KaynakHatasi(diyanetMeta.id, "anahtar-yok", "Diyanet girişi başarısız.");
    return r.data.accessToken;
  });
  const url = `${DIYANET}/api/PrayerTime/Daily/${id}`;
  const r = await cached(url, diyanetMeta.ttlSaniye, () =>
    fetchJson<{ data?: Array<Record<string, string>> }>(url, {
      sourceId: diyanetMeta.id,
      headers: { Authorization: `Bearer ${token}` },
    }),
  );
  if (!Array.isArray(r?.data))
    throw new KaynakHatasi(
      diyanetMeta.id,
      "ayristirma",
      "Diyanet vakit yanıtı beklenen biçimde değil.",
    );
  return {
    url,
    vakitler: r.data.map((v) => ({
      tarih: noktaliToIso(String(v.gregorianDateShortIso8601 ?? v.gregorianDateShort)),
      yer,
      imsak: String(v.fajr),
      gunes: String(v.sunrise),
      ogle: String(v.dhuhr),
      ikindi: String(v.asr),
      aksam: String(v.maghrib),
      yatsi: String(v.isha),
      hicri: String(v.hijriDateLong ?? ""),
    })),
  };
}

export async function getPrayerTimes(
  o: { il: string; ilce?: string; gunSayisi?: number },
  env: NodeJS.ProcessEnv,
): Promise<Sonuc<Vakit[]>> {
  const { id, yer, not } = await ilceBul(o.il, o.ilce);
  const diyanet = kaynakAktif(diyanetMeta, env);
  const { url, vakitler } = diyanet ? await diyanetVakti(id, yer, env) : await ezanVakti(id, yer);
  const bugun = bugunTr();
  const secilen = vakitler.filter((v) => v.tarih >= bugun).slice(0, o.gunSayisi ?? 1);
  return sonuc(diyanet ? diyanetMeta : ezanMeta, url, secilen, not);
}
