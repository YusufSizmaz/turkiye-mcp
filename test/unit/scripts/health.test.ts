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
