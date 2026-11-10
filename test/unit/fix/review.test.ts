/** Son incelemenin (final review) bulgularını sabitleyen testler. */
import { describe, expect, it, vi } from "vitest";
import { cached, onbellekBoyutu } from "../../../src/core/cache.js";
import { bozukMetni } from "../../../src/health.js";
import { getNeighborhoods } from "../../../src/sources/cografya/turkiyeapi.js";
import * as afad from "../../../src/sources/deprem/afad.js";
import { deprem } from "../../../src/sources/deprem/index.js";
import * as kandilli from "../../../src/sources/deprem/kandilli.js";
import * as opet from "../../../src/sources/enerji/opet.js";
import * as ankara from "../../../src/sources/saglik/eczane/ankara.js";
import { getOnDuty } from "../../../src/sources/saglik/eczane/index.js";
import * as ckan from "../../../src/sources/sehir/ckan.js";
import { getPrayerTimes } from "../../../src/sources/takvim/namaz.js";
import { fixture, mockFetch } from "../../helpers.js";

const j = (p: string) => ({ body: fixture(p), contentType: "application/json" });

describe("I1 bozuk.txt", () => {
  it("son satır da newline ile biter (bash read son satırı atlamasın)", () => {
    const m = bozukMetni([
      {
        id: "kap",
        ad: "",
        kategori: "finans",
        rozet: "resmi",
        durum: "bozuk",
        sureMs: 1,
        deneysel: false,
        hata: "HTTP 500",
      },
    ]);
    expect(m).toBe("kap\tHTTP 500\n");
  });
});

describe("I2 Ankara nöbet günü", () => {
  it("TR 09:00'dan önce önceki günün nöbet listesi istenir ve not düşülür", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T00:00:00Z")); // TR 03:00
    const { calls } = mockFetch([
      { match: "aeo.org.tr/getPharmacies/", ...j("saglik/ankara.json") },
    ]);
    const s = await getOnDuty({ il: "ankara", limit: 200 });
    expect(calls[0]?.url).toMatch(/getPharmacies\/2026-11-10$/);
    expect(s.veri[0]?.nobet).toContain("10.11.2026");
  });
  it("TR 09:00'dan sonra bugünün listesi", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T07:00:00Z")); // TR 10:00
    const { calls } = mockFetch([
      { match: "aeo.org.tr/getPharmacies/", ...j("saglik/ankara.json") },
    ]);
    await getOnDuty({ il: "ankara" });
    expect(calls[0]?.url).toMatch(/getPharmacies\/2026-11-11$/);
  });
});

describe("I3 boş ayrıştırma hata verir, sessiz 'yok' demez", () => {
  it("Kandilli: <pre> var ama hiç satır çözülmedi", () => {
    expect(() => kandilli.ayristir("<pre>yeni biçim\nbambaşka</pre>")).toThrow(/ayrıştırılamadı/);
  });
  it("Ankara: kutu yok", () => {
    expect(() => ankara.ayristir("<div>yeni tasarım</div>")).toThrow(/ayrıştırılamadı/);
  });
  it("CKAN: result.results dizi değil → ayristirma", async () => {
    mockFetch([{ match: "package_search", body: { success: true, result: { count: 1 } } }]);
    await expect(ckan.searchDatasets("ibb", "x")).rejects.toMatchObject({ tur: "ayristirma" });
  });
  it("Opet: İstanbul Avrupa yanıtı dizi değil → ayristirma", async () => {
    mockFetch([
      { match: "ProvinceCode=934", body: { hata: 1 } },
      { match: "ProvinceCode=34", ...j("enerji/opet-34.json") },
    ]);
    await expect(opet.getFuelPrices({ il: "istanbul" })).rejects.toMatchObject({
      tur: "ayristirma",
    });
  });
  it("Ezan Vakti: şehir listesi dizi değil → ayristirma", async () => {
    mockFetch([{ match: "/sehirler/2", body: { mesaj: "bakım" } }]);
    await expect(getPrayerTimes({ il: "izmir" }, {})).rejects.toMatchObject({ tur: "ayristirma" });
  });
});

describe("I4 deprem özeti limit öncesi toplam ve en büyük", () => {
  it("toplam ve en büyük limitten önce hesaplanır, kesilme belirtilir", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T19:00:00Z"));
    const ham = [
      ...Array.from({ length: 30 }, (_, i) => ({
        eventID: String(i),
        location: "Küçük",
        latitude: "38",
        longitude: "27",
        depth: "5",
        type: "ML",
        magnitude: "1.2",
        province: "İzmir",
        date: `2026-11-10T1${i % 9}:00:00`,
      })),
      {
        eventID: "99",
        location: "Büyük",
        latitude: "38",
        longitude: "27",
        depth: "9",
        type: "Mw",
        magnitude: "5.1",
        province: "İzmir",
        date: "2026-11-10T05:00:00",
      },
    ];
    mockFetch([{ match: "servisnet", body: ham }]);
    const a = deprem.tools[0];
    if (!a) throw new Error("yok");
    const g = a.inputSchema.parse({ limit: 5 });
    const s = await a.run(g, {});
    const ozet = a.ozet(s, g);
    expect(ozet).toContain("31 deprem");
    expect(ozet).toContain("En büyüğü: 5,1");
    expect(ozet).toContain("ilk 5");
  });
  it("Kandilli istenen pencereden kısa veri tutuyorsa not düşer", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T19:00:00Z"));
    mockFetch([
      { match: "koeri", body: fixture("deprem/kandilli.html"), contentType: "text/html" },
    ]);
    const s = await kandilli.getEarthquakes({ saat: 720 });
    expect(s.not).toMatch(/son 500 depremi/);
  });
  it("AFAD 1000 kayıt sınırına ulaşınca not düşer", async () => {
    const bin = Array.from({ length: 1000 }, (_, i) => ({
      eventID: String(i),
      location: "x",
      latitude: "38",
      longitude: "27",
      depth: "5",
      type: "ML",
      magnitude: "1.0",
      province: "İzmir",
      date: "2026-11-10T10:00:00",
    }));
    mockFetch([{ match: "servisnet", body: bin }]);
    const s = await afad.getEarthquakes({ saat: 720 });
    expect(s.not).toMatch(/1000/);
  });
});

describe("I5 namaz: yalnız gerçek merkez ilçelerde il merkezine düş", () => {
  it("yazım hatalı ilçe → bulunamadi (il merkezine sessizce düşmez)", async () => {
    mockFetch([
      { match: "/sehirler/2", ...j("takvim/ezan-sehirler-2.json") },
      { match: "/ilceler/540", ...j("takvim/ezan-ilceler-izmir.json") },
      {
        match: "api.turkiyeapi.dev/v1/provinces",
        body: {
          status: "OK",
          data: [
            {
              id: 35,
              name: "İzmir",
              districts: [{ id: 1, name: "Bornova", population: 1, area: 1 }],
            },
          ],
        },
      },
    ]);
    await expect(getPrayerTimes({ il: "izmir", ilce: "Bornva" }, {})).rejects.toMatchObject({
      tur: "bulunamadi",
    });
  });
});

describe("I6 mahalle sorgusu Türkçe karaktersiz ilçe", () => {
  it("Kadikoy → Kadıköy (yerel eşleştirme) ve boş sonuç bulunamadi", async () => {
    const { calls } = mockFetch([
      {
        match: "/v1/provinces",
        body: {
          status: "OK",
          data: [
            {
              id: 34,
              name: "İstanbul",
              districts: [{ id: 1421, name: "Kadıköy", population: 1, area: 1 }],
            },
          ],
        },
      },
      { match: "/v1/neighborhoods", ...j("cografya/neighborhoods-kadikoy.json") },
    ]);
    await getNeighborhoods({ il: "istanbul", ilce: "Kadikoy" });
    const u = new URL(calls.find((c) => c.url.includes("neighborhoods"))?.url ?? "");
    expect(u.searchParams.get("district")).toBe("Kadıköy");
  });
});

describe("I7 önbellek süresi dolan girdileri temizler", () => {
  it("binlerce farklı anahtar birikmez", async () => {
    vi.useFakeTimers();
    for (let i = 0; i < 600; i++) await cached(`k${i}`, 1, async () => i);
    vi.advanceTimersByTime(2000);
    await cached("yeni", 1, async () => 0);
    expect(onbellekBoyutu()).toBeLessThan(10);
  });
});

describe("Eczane listesi kesilince söylenir", () => {
  it("limit altında kalan kayıt sayısı not ile bildirilir", async () => {
    mockFetch([
      {
        match: "izmireczaciodasi.org.tr",
        body: fixture("saglik/izmir.html"),
        contentType: "text/html",
      },
    ]);
    const s = await getOnDuty({ il: "izmir" });
    expect(s.veri).toHaveLength(20);
    expect(s.not).toMatch(/\d+ eczaneden ilk 20/);
  });
});
