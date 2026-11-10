import { describe, expect, it } from "vitest";
import { getIssue } from "../../../src/sources/resmi/resmi-gazete.js";
import { fixture, mockFetch } from "../../helpers.js";

const html = () => ({ body: fixture("resmi/rg-20261110.htm"), contentType: "text/html" });

describe("Resmî Gazete", () => {
  it("sayı no, bölümler, alt başlıklar ve maddeleri ayrıştırır", async () => {
    const { calls } = mockFetch([{ match: "eskiler/2026/11/20261110.htm", ...html() }]);
    const s = await getIssue({ tarih: "2026-11-10" });
    expect(calls[0]?.url).toBe("https://www.resmigazete.gov.tr/eskiler/2026/11/20261110.htm");
    expect(s.veri.tarih).toBe("2026-11-10");
    expect(s.veri.sayi).toBe("33426");
    const yon = s.veri.bolumler.find((b) => b.altBaslik === "YÖNETMELİKLER");
    expect(yon?.bolum).toBe("YÜRÜTME VE İDARE BÖLÜMÜ");
    expect(yon?.maddeler).toHaveLength(3);
    expect(yon?.maddeler[0]).toEqual({
      baslik:
        "Gençlik ve Spor Bakanlığı Yurt Hizmetleri Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik",
      url: "https://www.resmigazete.gov.tr/eskiler/2026/11/20261110-2.htm",
    });
    const genelge = s.veri.bolumler.find((b) => b.altBaslik === "GENELGE");
    expect(genelge?.maddeler[0]?.baslik).toBe(
      "Yeşil Mutabakat Eylem Planı (2026-2030) ile İlgili 2026/12 Sayılı Cumhurbaşkanlığı Genelgesi",
    );
    expect(genelge?.maddeler[0]?.url).toMatch(/20261110-5\.pdf$/);
    const ilan = s.veri.bolumler.find((b) => b.bolum === "İLÂN BÖLÜMÜ");
    expect(ilan?.maddeler.map((m) => m.baslik)).toContain("Yargı İlânları");
    expect(ilan?.maddeler[0]?.url).toBe(
      "http://www.resmigazete.gov.tr/ilanlar/eskiilanlar/2026/11/20261110-2.htm",
    );
  });

  it("arama Türkçe karakter/büyük harf duyarsız filtreler, boş grupları atar", async () => {
    mockFetch([{ match: "20261110.htm", ...html() }]);
    const s = await getIssue({ tarih: "2026-11-10", arama: "GENCLIK" });
    const maddeler = s.veri.bolumler.flatMap((b) => b.maddeler);
    expect(maddeler).toHaveLength(1);
    expect(maddeler[0]?.baslik).toMatch(/^Gençlik ve Spor/);
    expect(s.veri.bolumler).toHaveLength(1);
  });

  it("tarih verilmez ve bugünün sayısı henüz yoksa dünkünü döndürür ve not düşer", async () => {
    const { vi } = await import("vitest");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T21:30:00Z")); // TR: 11 Kasım 00:30
    mockFetch([
      { match: "20261111.htm", body: "", status: 404 },
      { match: "20261110.htm", ...html() },
    ]);
    const s = await getIssue();
    expect(s.veri.tarih).toBe("2026-11-10");
    expect(s.not).toContain("11.11.2026");
  });
});
