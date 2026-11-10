import { describe, expect, it, vi } from "vitest";
import * as bist from "../../../src/sources/finans/bist.js";
import * as mevzuat from "../../../src/sources/resmi/mevzuat.js";
import { getOnDuty } from "../../../src/sources/saglik/eczane/index.js";
import * as izmir from "../../../src/sources/sehir/izmir.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(p), contentType: "application/json" });

describe("BIST endeks bileşenleri", () => {
  it("endeksin hisselerini döndürür (.E soneki atılır)", async () => {
    mockFetch([
      {
        match: "hisse_endeks_ds.csv",
        body: fixture("finans/bist-endeks.csv"),
        contentType: "text/csv",
      },
    ]);
    const s = await bist.getIndex({ endeks: "xu030" });
    expect(s.veri.endeks).toMatchObject({ kod: "XU030", ad: "BIST 30" });
    expect(s.veri.hisseler).toHaveLength(30);
    expect(s.veri.hisseler).toContainEqual({ kod: "ASELS", ad: "ASELSAN" });
    expect(s.veri.tarih).toBe("2026-11-11");
  });
  it("hisse verilirse dahil olduğu endeksler", async () => {
    mockFetch([
      {
        match: "hisse_endeks_ds.csv",
        body: fixture("finans/bist-endeks.csv"),
        contentType: "text/csv",
      },
    ]);
    const s = await bist.getStockIndices("asels");
    expect(s.veri.map((e) => e.kod)).toContain("XU030");
  });
  it("bilinmeyen endeks bulunamadi", async () => {
    mockFetch([
      {
        match: "hisse_endeks_ds.csv",
        body: fixture("finans/bist-endeks.csv"),
        contentType: "text/csv",
      },
    ]);
    await expect(bist.getIndex({ endeks: "XYZ" })).rejects.toMatchObject({ tur: "bulunamadi" });
  });
});

describe("Mevzuat arama", () => {
  it("başlıkta arar (AranacakYer 2), vurgu etiketlerini temizler", async () => {
    const { calls } = mockFetch([
      { match: "MevzuatDatatable", ...j("resmi/mevzuat-kanun-vergi.json") },
    ]);
    const s = await mevzuat.search({ sorgu: "vergi", tur: "kanun", limit: 5 });
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({
      length: 5,
      parameters: {
        MevzuatTur: "Kanun",
        AranacakIfade: "vergi",
        AranacakYer: 2,
        TamCumle: false,
        GenelArama: false,
      },
    });
    expect(s.veri.toplam).toBe(50);
    expect(s.veri.sonuclar[0]).toEqual({
      no: "7524",
      ad: "VERGİ KANUNLARI İLE BAZI KANUNLARDA VE 375 SAYILI KANUN HÜKMÜNDE KARARNAMEDE DEĞİŞİKLİK YAPILMASINA DAİR KANUN",
      tur: "Kanunlar",
      kabulTarihi: "2024-07-28",
      resmiGazeteTarihi: "2024-08-02",
      resmiGazeteSayisi: "32620",
      url: "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=7524&MevzuatTur=1&MevzuatTertip=5",
    });
  });
});

describe("İzmir hal fiyatları", () => {
  it("sebze-meyve: tarih, ürün, birim, en düşük/en yüksek/ortalama; ürün filtresi", async () => {
    const { calls } = mockFetch([
      { match: "halfiyatlari/sebzemeyve/2026-11-10", ...j("sehir/izmir/hal-sebzemeyve.json") },
    ]);
    const s = await izmir.getMarketPrices({
      tur: "sebzemeyve",
      tarih: "2026-11-10",
      urun: "ananas",
    });
    expect(calls[0]?.url).toBe(
      "https://openapi.izmir.bel.tr/api/ibb/halfiyatlari/sebzemeyve/2026-11-10",
    );
    expect(s.veri.tarih).toBe("2026-11-10");
    expect(s.veri.urunler[0]).toEqual({
      ad: "ANANAS",
      tip: "İTHAL",
      birim: "ADET",
      enDusuk: 100,
      enYuksek: 150,
      ortalama: 125,
    });
  });
  it("ürün adlarındaki fazla boşluklar tekilleşir", async () => {
    mockFetch([
      { match: "halfiyatlari/sebzemeyve/2026-11-10", ...j("sehir/izmir/hal-sebzemeyve.json") },
    ]);
    const s = await izmir.getMarketPrices({ tur: "sebzemeyve", tarih: "2026-11-10", limit: 300 });
    expect(s.veri.urunler.some((u) => u.ad === "DOMATES BEEF")).toBe(true);
    expect(s.veri.urunler.every((u) => !/\s{2,}/.test(u.ad))).toBe(true);
  });

  it("bugün için bülten yoksa (204) önceki güne düşer ve not", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    mockFetch([
      { match: "balik/2026-11-10", body: "", status: 204 },
      { match: "balik/2026-11-09", ...j("sehir/izmir/hal-balik.json") },
    ]);
    const s = await izmir.getMarketPrices({ tur: "balik" });
    expect(s.veri.tarih).toBe("2026-11-09");
    expect(s.not).toContain("10.11.2026");
  });
});

describe("İzmir ulaşım", () => {
  it("İZBAN: istasyon adları Türkçe karaktersiz, kalan seferler", async () => {
    const { calls } = mockFetch([
      { match: "izban/istasyonlar", ...j("sehir/izmir/izban-istasyonlar.json") },
      { match: "izban/sefersaatleri/1/38", ...j("sehir/izmir/izban-1-38.json") },
    ]);
    const istasyonlar = (await import("../../../test/helpers.js")).fixtureJson<
      Array<{ IstasyonId: number; IstasyonAdi: string }>
    >("sehir/izmir/izban-istasyonlar.json");
    const varis = istasyonlar.find((x) => x.IstasyonId === 38)?.IstasyonAdi ?? "";
    const s = await izmir.getIzbanTimes({ kalkis: "aliaga", varis });
    expect(calls.some((c) => c.url.endsWith("/izban/sefersaatleri/1/38"))).toBe(true);
    expect(s.veri.kalkis).toBe("Aliağa");
    expect(s.veri.seferler[0]).toEqual({ kalkis: "21:41", varis: "23:36" });
  });
  it("vapur: iskele adı ve gün → sefer listesi", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z")); // Salı → gunId 2
    const { calls } = mockFetch([
      { match: "izdeniz/iskeleler", ...j("sehir/izmir/iskeleler.json") },
      { match: "izdeniz/iskelesefersaatleri/1/2", ...j("sehir/izmir/iskele-1-2.json") },
    ]);
    const s = await izmir.getFerryTimes({ iskele: "konak" });
    expect(calls.some((c) => c.url.endsWith("/iskelesefersaatleri/1/2"))).toBe(true);
    expect(s.veri.iskele).toBe("Konak");
    expect(s.veri.gun).toBe("Salı");
    expect(s.veri.seferler[0]).toEqual({
      saat: "07:30",
      varis: ["Karşıyaka"],
      arabali: false,
      iptal: false,
      aciklama: null,
    });
  });
});

describe("İzmir yerler", () => {
  it("kategori + ilçe filtresi", async () => {
    const { calls } = mockFetch([
      { match: "ibb/cbs/hastaneler", ...j("sehir/izmir/cbs-hastaneler.json") },
    ]);
    const s = await izmir.findPlaces({ kategori: "hastaneler", ilce: "aliaga" });
    expect(calls[0]?.url).toBe("https://openapi.izmir.bel.tr/api/ibb/cbs/hastaneler");
    expect(s.veri.yerler[0]).toMatchObject({
      ad: "Aliağa Devlet Hastanesi",
      ilce: "ALİAĞA",
      mahalle: "YENİ",
      enlem: 38.787045353073,
      boylam: 26.974983403458,
    });
    expect(s.veri.yerler.every((y) => y.ilce === "ALİAĞA")).toBe(true);
  });
});

describe("Nöbetçi eczane — yeni kaynaklar", () => {
  it("İzmir resmî API: konum, telefon, bölge, nöbet notu", async () => {
    const { calls } = mockFetch([
      { match: "openapi.izmir.bel.tr/api/ibb/nobetcieczaneler", ...j("saglik/izmir-api.json") },
    ]);
    const s = await getOnDuty({ il: "izmir", limit: 200 });
    expect(calls[0]?.url).toBe("https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler");
    expect(s.veri).toHaveLength(73);
    expect(s.veri[0]).toEqual({
      ad: "NEHIR ECZANESİ",
      ilce: "ALTINDAĞ",
      adres: "4209 SK. NO:31/A",
      telefon: "02324619045",
      konum: { enlem: 38.429488, boylam: 27.19608 },
      tarif: null,
      nobet: "24:00DEN SONRA- ÇAMDİBİ",
    });
  });
  it("Adana: ilçe başlığı ve kartlar", async () => {
    mockFetch([
      { match: "adanaeo.org.tr", body: fixture("saglik/adana.html"), contentType: "text/html" },
    ]);
    const s = await getOnDuty({ il: "adana", limit: 200 });
    expect(s.kaynak.id).toBe("eczane-adana");
    expect(s.veri.length).toBeGreaterThan(20);
    expect(s.veri.find((e) => e.ad === "BELDE ECZANESİ")).toMatchObject({
      ilce: "SEYHAN",
      telefon: "03224573086",
      konum: { enlem: 36.994055, boylam: 35.325312 },
    });
    const seyhan = await getOnDuty({ il: "adana", ilce: "seyhan", limit: 200 });
    expect(seyhan.veri.every((e) => e.ilce === "SEYHAN")).toBe(true);
  });
  it("Mersin: ad - ilçe başlığı, tarif ve nöbet saati", async () => {
    mockFetch([
      {
        match: "mersineczaciodasi.org.tr",
        body: fixture("saglik/mersin.html"),
        contentType: "text/html",
      },
    ]);
    const s = await getOnDuty({ il: "mersin", limit: 200 });
    expect(s.kaynak.id).toBe("eczane-mersin");
    const alp = s.veri.find((e) => e.ad === "ALP ECZANESİ");
    expect(alp).toMatchObject({
      ilce: "MEZİTLİ",
      adres: "MENDERES MAH.CEVAT KUTLU NO:15/A",
      tarif: "DENİZHAN-2 KARŞISI, NAFİZ ÇOLAK SAĞLIK OCAĞI KARŞISI/MEZİTLİ",
      telefon: "03243583037",
      konum: { enlem: 36.740902, boylam: 34.525603 },
    });
    expect(alp?.nobet).toContain("10.11.2026 18:00 / 11.11.2026 08:00");
  });
});
