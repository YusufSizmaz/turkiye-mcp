import * as cheerio from "cheerio";
import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { trZaman } from "../../core/format.js";
import { fetchText } from "../../core/http.js";
import { eslesir } from "../../core/metin.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";
import { type Deprem, type DepremListesi, type DepremSorgusu, listele } from "./tipler.js";

export const meta: SourceMeta = {
  id: "kandilli",
  kisaAd: "Kandilli Rasathanesi",
  ad: "Boğaziçi Üniversitesi Kandilli Rasathanesi (KOERI)",
  kategori: "deprem",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "http://www.koeri.boun.edu.tr/scripts/lst0.asp",
  aciklama:
    "Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü'nün son 500 depremlik hızlı çözüm listesi (MD/ML/Mw büyüklükleri).",
  ttlSaniye: 30,
  ucNoktalar: [
    "GET http://www.koeri.boun.edu.tr/scripts/lst0.asp  (windows-1254, <pre> içinde sabit genişlikli metin)",
  ],
  kutuphaneOrnegi: `import { kandilli } from "turkiye-mcp";

const { veri } = await kandilli.getEarthquakes({ saat: 6, il: "İzmir" });`,
};

const URL_ = "http://www.koeri.boun.edu.tr/scripts/lst0.asp";
const SATIR =
  /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s+(-?[\d.]+)\s+(-?[\d.]+)\s+([\d.]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\s{2,}(\S.*)$/;

const sayi = (s: string) => (s === "-.-" ? null : Number(s));

export function ayristir(html: string): Deprem[] {
  const pre = cheerio.load(html)("pre").text();
  if (!pre) throw new KaynakHatasi(meta.id, "ayristirma", "Kandilli listesi bulunamadı.");
  const out: Deprem[] = [];
  for (const satir of pre.split(/\r?\n/)) {
    const m = SATIR.exec(satir.trim());
    if (!m) continue;
    const [, y, a, g, hh, mm, ss, lat, lon, der, md, ml, mw, yer] = m as unknown as string[];
    const ML = sayi(ml as string);
    const MW = sayi(mw as string);
    const MD = sayi(md as string);
    const [buyukluk, tip] = ML !== null ? [ML, "ML"] : MW !== null ? [MW, "Mw"] : [MD, "MD"];
    if (buyukluk === null) continue;
    const yerTemiz = (yer as string).trim();
    out.push({
      id: `kandilli-${y}${a}${g}${hh}${mm}${ss}-${lat}-${lon}`,
      tarih: `${y}-${a}-${g}T${hh}:${mm}:${ss}+03:00`,
      buyukluk,
      tip: tip as string,
      derinlikKm: Number(der),
      enlem: Number(lat),
      boylam: Number(lon),
      yer: yerTemiz,
      il: /\(([^)]+)\)\s*$/.exec(yerTemiz)?.[1]?.trim() ?? null,
      kaynak: "kandilli",
    });
  }
  if (!out.length) {
    throw new KaynakHatasi(
      meta.id,
      "ayristirma",
      "Kandilli listesi ayrıştırılamadı (sayfa biçimi değişmiş olabilir).",
    );
  }
  return out;
}

export async function getEarthquakes(o: DepremSorgusu = {}): Promise<Sonuc<DepremListesi>> {
  const tum = await cached("kandilli", meta.ttlSaniye, async () =>
    ayristir(await fetchText(URL_, { sourceId: meta.id, encoding: "windows-1254" })),
  );
  const sinir = Date.now() - (o.saat ?? 24) * 3_600_000;
  const veri = tum.filter(
    (d) =>
      Date.parse(d.tarih) >= sinir &&
      d.buyukluk >= (o.minBuyukluk ?? 0) &&
      (!o.il || (d.il !== null && eslesir(d.il, o.il))),
  );
  const enEski = tum.at(-1);
  const not =
    enEski && Date.parse(enEski.tarih) > sinir
      ? `Kandilli yalnız son 500 depremi yayımlar; liste ${trZaman(enEski.tarih)} sonrasını kapsıyor, istenen sürenin tamamını değil.`
      : undefined;
  return sonuc(meta, URL_, listele(veri, o.limit), not);
}
