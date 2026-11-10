import { describe, expect, it } from "vitest";
import { HADISE, hadiseAdi } from "../../../src/sources/hava-cevre/hadise.js";
import { findStation, getCurrent, getForecast } from "../../../src/sources/hava-cevre/mgm.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`hava-cevre/${p}`), contentType: "application/json" });

describe("MGM", () => {
  it("il merkezi istasyonu: il adı Türkçe yazımla ve Origin header'ıyla istenir", async () => {
    const { calls } = mockFetch([{ match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") }]);
    const ist = await findStation("ankara");
    expect(new URL(calls[0]?.url ?? "").searchParams.get("il")).toBe("Ankara");
    expect(new Headers(calls[0]?.init?.headers).get("origin")).toBe("https://www.mgm.gov.tr");
    expect(ist).toMatchObject({
      merkezId: 90601,
      il: "Ankara",
      gunlukTahminIstNo: 90601,
      saatlikTahminIstNo: 17130,
    });
  });

  it("ilçe Türkçe karaktersiz yazılsa da bulunur", async () => {
    const { calls } = mockFetch([
      { match: "merkezler/ililcesi", ...j("mgm-ilceler-istanbul.json") },
    ]);
    const ist = await findStation("istanbul", "kadikoy");
    expect(new URL(calls[0]?.url ?? "").searchParams.get("il")).toBe("İstanbul");
    expect(ist).toMatchObject({ merkezId: 93409, ilce: "Kadıköy", gunlukTahminIstNo: 93409 });
  });

  it("bilinmeyen ilçe bulunamadi hatası", async () => {
    mockFetch([{ match: "merkezler/ililcesi", ...j("mgm-ilceler-istanbul.json") }]);
    await expect(findStation("istanbul", "Atlantis")).rejects.toMatchObject({ tur: "bulunamadi" });
  });

  it("anlık durum: -9999 null, hadise Türkçe, zaman +03:00", async () => {
    mockFetch([
      { match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") },
      { match: "sondurumlar?merkezid=90601", ...j("mgm-sondurum.json") },
    ]);
    const s = await getCurrent("Ankara");
    expect(s.veri).toMatchObject({
      yer: "Ankara / Keçiören",
      zaman: "2026-11-10T21:39:00+03:00",
      sicaklik: 2.9,
      hissedilen: 2.9,
      nem: 96,
      ruzgarYon: 80,
      basinc: 1028.9,
      hadiseKodu: "PUS",
      hadise: "Puslu",
      karYuksekligiCm: null,
    });
  });

  it("5 günlük tahmin", async () => {
    mockFetch([
      { match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") },
      { match: "tahminler/gunluk?istno=90601", ...j("mgm-gunluk.json") },
    ]);
    const s = await getForecast("Ankara");
    expect(s.veri).toHaveLength(5);
    expect(s.veri[0]).toEqual({
      tarih: "2026-11-11",
      enDusuk: -1,
      enYuksek: 10,
      hadiseKodu: "PUS",
      hadise: "Puslu",
      ruzgarKmh: 5,
    });
    expect(s.veri[2]?.hadise).toBe("Rüzgarlı");
  });

  it("saatlik tahmin saatlikTahminIstNo ile", async () => {
    mockFetch([
      { match: "merkezler?il=", ...j("mgm-merkezler-ankara.json") },
      { match: "tahminler/saatlik?istno=17130", ...j("mgm-saatlik.json") },
    ]);
    const s = await getForecast("Ankara", undefined, "saatlik");
    expect(s.veri[0]).toMatchObject({
      tarih: "2026-11-11T00:00:00+03:00",
      sicaklik: 1,
      hadise: "Çok Bulutlu",
    });
  });
});

describe("hadise kodları", () => {
  it("bilinen ve bilinmeyen kod", () => {
    expect(HADISE.GSY).toBe("Gökgürültülü Sağanak Yağışlı");
    expect(hadiseAdi("XYZ")).toBe("XYZ");
  });
});
