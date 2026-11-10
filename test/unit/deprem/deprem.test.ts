import { describe, expect, it, vi } from "vitest";
import * as afad from "../../../src/sources/deprem/afad.js";
import * as kandilli from "../../../src/sources/deprem/kandilli.js";
import { fixture, mockFetch } from "../../helpers.js";

const simdi = new Date("2026-11-10T19:00:00Z"); // TR 22:00

describe("AFAD", () => {
  it("UTC tarihleri +03:00'a çevirir, alanları ayrıştırır, sorgu UTC penceresiyle yapılır", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(simdi);
    const { calls } = mockFetch([
      {
        match: "servisnet.afad.gov.tr",
        body: fixture("deprem/afad.json"),
        contentType: "application/json",
      },
    ]);
    const s = await afad.getEarthquakes({ saat: 24, minBuyukluk: 3 });
    const u = new URL(calls[0]?.url ?? "");
    expect(u.searchParams.get("start")).toBe("2026-11-09T19:00:00");
    expect(u.searchParams.get("end")).toBe("2026-11-10T19:00:00");
    expect(u.searchParams.get("minmag")).toBe("3");
    expect(s.veri[0]).toEqual({
      id: "afad-733903",
      tarih: "2026-11-10T21:12:54+03:00",
      buyukluk: 3.7,
      tip: "ML",
      derinlikKm: 7,
      enlem: 37.64417,
      boylam: 35.36967,
      yer: "Aladağ (Adana)",
      il: "Adana",
      kaynak: "afad",
    });
    expect(s.veri.every((d) => d.buyukluk >= 3)).toBe(true);
  });

  it("il filtresi Türkçe karakter duyarsız", async () => {
    mockFetch([
      { match: "servisnet", body: fixture("deprem/afad.json"), contentType: "application/json" },
    ]);
    const s = await afad.getEarthquakes({ il: "MUGLA", limit: 200 });
    expect(s.veri.length).toBeGreaterThan(0);
    expect(s.veri.every((d) => d.il === "Muğla")).toBe(true);
  });
});

describe("Kandilli", () => {
  it("sabit genişlikli satırları ayrıştırır, ML/Mw önceliği, il parantezden", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(simdi);
    mockFetch([
      {
        match: "koeri.boun.edu.tr",
        body: fixture("deprem/kandilli.html"),
        contentType: "text/html",
      },
    ]);
    const s = await kandilli.getEarthquakes({ saat: 24 });
    expect(s.veri[0]).toEqual({
      id: "kandilli-20261110211252-37.6492-35.3652",
      tarih: "2026-11-10T21:12:52+03:00",
      buyukluk: 3.7,
      tip: "ML",
      derinlikKm: 5,
      enlem: 37.6492,
      boylam: 35.3652,
      yer: "YETIMLI-ALADAG (ADANA)",
      il: "ADANA",
      kaynak: "kandilli",
    });
    expect(s.veri.find((d) => d.yer === "EGE DENIZI")?.il).toBeNull();
    expect(s.veri.find((d) => d.yer === "KAYNAR-(KAHRAMANMARAS)")?.il).toBe("KAHRAMANMARAS");
  });

  it("il ve büyüklük filtreleri, varsayılan limit 20", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(simdi);
    mockFetch([
      { match: "koeri", body: fixture("deprem/kandilli.html"), contentType: "text/html" },
    ]);
    const hepsi = await kandilli.getEarthquakes({ saat: 720 });
    expect(hepsi.veri).toHaveLength(20);
    const km = await kandilli.getEarthquakes({
      saat: 720,
      il: "Kahramanmaraş",
      minBuyukluk: 1.5,
      limit: 200,
    });
    expect(km.veri.length).toBeGreaterThan(0);
    expect(km.veri.every((d) => d.il === "KAHRAMANMARAS" && d.buyukluk >= 1.5)).toBe(true);
  });

  it("saat penceresi dışındakileri eler", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(simdi);
    mockFetch([
      { match: "koeri", body: fixture("deprem/kandilli.html"), contentType: "text/html" },
    ]);
    const s = await kandilli.getEarthquakes({ saat: 1, limit: 200 });
    // TR 21:00–22:00 arası: yalnız 21:12:52
    expect(s.veri.map((d) => d.tarih)).toEqual(["2026-11-10T21:12:52+03:00"]);
  });
});

describe("deprem_get_recent aracı", () => {
  it("varsayılan AFAD, özet en büyük depremi verir", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(simdi);
    const { deprem } = await import("../../../src/sources/deprem/index.js");
    const arac = deprem.tools.find((t) => t.name === "deprem_get_recent");
    if (!arac) throw new Error("araç yok");
    mockFetch([
      { match: "servisnet", body: fixture("deprem/afad.json"), contentType: "application/json" },
    ]);
    const g = arac.inputSchema.parse({ minBuyukluk: 3 });
    const s = await arac.run(g, {});
    expect(s.kaynak.id).toBe("afad");
    const ozet = arac.ozet(s, g);
    expect(ozet).toMatch(/Son 24 saatte 3\+ büyüklüğünde \d+ deprem/);
    expect(ozet).toContain("En büyüğü");
  });

  it("deprem yoksa açık bir mesaj", async () => {
    const { deprem } = await import("../../../src/sources/deprem/index.js");
    const arac = deprem.tools[0];
    if (!arac) throw new Error("araç yok");
    mockFetch([{ match: "servisnet", body: [] }]);
    const g = arac.inputSchema.parse({ minBuyukluk: 7 });
    const s = await arac.run(g, {});
    expect(arac.ozet(s, g)).toContain("deprem kaydedilmedi");
  });
});
