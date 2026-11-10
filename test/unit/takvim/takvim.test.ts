import { describe, expect, it, vi } from "vitest";
import { getPrayerTimes } from "../../../src/sources/takvim/namaz.js";
import { getHolidays } from "../../../src/sources/takvim/tatiller.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(`takvim/${p}`), contentType: "application/json" });

describe("Resmî tatiller", () => {
  it("Türkçe ad ve gün adı", async () => {
    mockFetch([{ match: "PublicHolidays/2026/TR", ...j("nager-2026.json") }]);
    const s = await getHolidays(2026);
    expect(s.veri.find((t) => t.ad === "Ramazan Bayramı 1. Gün")).toEqual({
      tarih: "2026-03-20",
      ad: "Ramazan Bayramı 1. Gün",
      gun: "Cuma",
    });
    expect(s.veri[0]).toMatchObject({ tarih: "2026-01-01", gun: "Perşembe" });
  });
});

describe("Namaz vakitleri (Ezan Vakti)", () => {
  it("il → şehir → il merkezi ilçesi → vakitler zinciri, bugünden itibaren", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    const { calls } = mockFetch([
      { match: "ezanvakti.emushaf.net/sehirler/2", ...j("ezan-sehirler-2.json") },
      { match: "ezanvakti.emushaf.net/ilceler/540", ...j("ezan-ilceler-izmir.json") },
      { match: "ezanvakti.emushaf.net/vakitler/9560", ...j("ezan-vakitler-izmir.json") },
    ]);
    const s = await getPrayerTimes({ il: "izmir" }, {});
    expect(calls.map((c) => new URL(c.url).pathname)).toEqual([
      "/sehirler/2",
      "/ilceler/540",
      "/vakitler/9560",
    ]);
    expect(s.kaynak.id).toBe("ezanvakti");
    expect(s.veri).toEqual([
      {
        tarih: "2026-11-10",
        yer: "İZMİR / İZMİR",
        imsak: "06:16",
        gunes: "07:40",
        ogle: "13:00",
        ikindi: "15:46",
        aksam: "18:10",
        yatsi: "19:29",
        hicri: "1 Cemaziyelahir 1448",
      },
    ]);
  });

  it("ilçe Türkçe karaktersiz, gunSayisi", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    mockFetch([
      { match: "/sehirler/2", ...j("ezan-sehirler-2.json") },
      { match: "/ilceler/540", ...j("ezan-ilceler-izmir.json") },
      { match: "/vakitler/9552", ...j("ezan-vakitler-izmir.json") },
    ]);
    const s = await getPrayerTimes({ il: "İzmir", ilce: "aliaga", gunSayisi: 3 }, {});
    expect(s.veri.map((v) => v.tarih)).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);
    expect(s.veri[0]?.yer).toBe("İZMİR / ALİAĞA");
  });

  it("ilçe Diyanet listesinde yoksa (merkez ilçe) il merkezine düşer ve not ekler", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    mockFetch([
      { match: "/sehirler/2", ...j("ezan-sehirler-2.json") },
      { match: "/ilceler/540", ...j("ezan-ilceler-izmir.json") },
      { match: "/vakitler/9560", ...j("ezan-vakitler-izmir.json") },
    ]);
    const s = await getPrayerTimes({ il: "izmir", ilce: "Bornova" }, {});
    expect(s.veri[0]?.yer).toBe("İZMİR / İZMİR");
    expect(s.not).toContain("Bornova");
  });

  it("Diyanet anahtarı varsa Diyanet'e giriş yapar ve onu kaynak gösterir", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T09:00:00Z"));
    const { calls } = mockFetch([
      { match: "/sehirler/2", ...j("ezan-sehirler-2.json") },
      { match: "/ilceler/540", ...j("ezan-ilceler-izmir.json") },
      {
        match: "awqatsalah.diyanet.gov.tr/Auth/Login",
        body: { data: { accessToken: "tok" }, success: true },
      },
      {
        match: "awqatsalah.diyanet.gov.tr/api/PrayerTime/Daily/9560",
        body: {
          success: true,
          data: [
            {
              gregorianDateShortIso8601: "10.11.2026",
              hijriDateLong: "1 Cemaziyelahir 1448",
              fajr: "06:16",
              sunrise: "07:40",
              dhuhr: "13:00",
              asr: "15:46",
              maghrib: "18:10",
              isha: "19:29",
            },
          ],
        },
      },
    ]);
    const s = await getPrayerTimes(
      { il: "izmir" },
      { DIYANET_EMAIL: "a@b.c", DIYANET_PASSWORD: "x" },
    );
    expect(s.kaynak.id).toBe("diyanet-namaz");
    const veriIstegi = calls.find((c) => c.url.includes("PrayerTime"));
    expect(new Headers(veriIstegi?.init?.headers).get("authorization")).toBe("Bearer tok");
    expect(s.veri[0]).toMatchObject({ tarih: "2026-11-10", imsak: "06:16", yatsi: "19:29" });
  });
});
