import { describe, expect, it } from "vitest";
import { KaynakHatasi } from "../../../src/core/errors.js";
import type { SourceMeta } from "../../../src/core/types.js";
import { type DurumKaydi, durumBelirle, shieldsJson } from "../../../src/health.js";

const m = (o: Partial<SourceMeta> = {}): SourceMeta => ({
  id: "x",
  ad: "X",
  kategori: "finans",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [],
  resmiUrl: "",
  aciklama: "",
  ttlSaniye: 1,
  ucNoktalar: [],
  kutuphaneOrnegi: "",
  ...o,
});

describe("durumBelirle", () => {
  it("hata yoksa çalışıyor", () => expect(durumBelirle(m(), null)).toBe("calisiyor"));
  it("anahtar-yok hatası", () =>
    expect(durumBelirle(m(), new KaynakHatasi("x", "anahtar-yok", ""))).toBe("anahtar-yok"));
  it("geo-kısıtlı kaynakta hata", () =>
    expect(durumBelirle(m({ geoKisitli: true }), new Error("timeout"))).toBe("geo-kisitli"));
  it("diğer hatalar bozuk", () => expect(durumBelirle(m(), new Error("x"))).toBe("bozuk"));
});

describe("shieldsJson", () => {
  const k = (durum: DurumKaydi["durum"]): DurumKaydi => ({
    id: "x",
    ad: "X",
    kategori: "finans",
    rozet: "resmi",
    durum,
    sureMs: 10,
    deneysel: false,
  });
  it.each([
    ["calisiyor", "çalışıyor", "brightgreen"],
    ["bozuk", "bozuk", "red"],
    ["geo-kisitli", "yalnızca TR", "lightgrey"],
    ["anahtar-yok", "anahtar gerekli", "blue"],
  ] as const)("%s", (durum, message, color) => {
    expect(shieldsJson(k(durum))).toEqual({ schemaVersion: 1, label: "durum", message, color });
  });
});

describe("yurt dışından engellenen kaynaklar", () => {
  it("GitHub Actions (ABD) koşusunda engellenen 8 kaynak geoKisitli işaretli", async () => {
    const { TUM_KAYNAKLAR } = await import("../../../src/registry.js");
    const geo = TUM_KAYNAKLAR.filter((s) => s.geoKisitli)
      .map((s) => s.id)
      .sort();
    expect(geo).toEqual([
      "eczane-ankara",
      "eczane-izmir",
      "ezanvakti",
      "hava-kalitesi",
      "ibb-acik-veri",
      "ibb-trafik",
      "ispark",
      "tcmb-kurlar",
    ]);
  });
});

describe("genel rozet", () => {
  const k = (durum: "calisiyor" | "bozuk" | "geo-kisitli" | "anahtar-yok") => ({
    id: durum,
    ad: "",
    kategori: "finans" as const,
    rozet: "resmi" as const,
    durum,
    sureMs: 1,
    deneysel: false,
  });
  it("bozuk yoksa yeşil 'bozuk yok' (yalnızca TR ve anahtarlılar sorun sayılmaz)", async () => {
    const { genelRozet } = await import("../../../src/health.js");
    expect(genelRozet([k("calisiyor"), k("geo-kisitli"), k("anahtar-yok")])).toEqual({
      schemaVersion: 1,
      label: "kaynaklar",
      message: "3 kaynak · bozuk yok",
      color: "brightgreen",
    });
  });
  it("bozuk varsa turuncu ve sayısı", async () => {
    const { genelRozet } = await import("../../../src/health.js");
    expect(genelRozet([k("calisiyor"), k("bozuk")])).toMatchObject({
      message: "2 kaynak · 1 bozuk",
      color: "orange",
    });
  });
});
