import { describe, expect, it } from "vitest";
import { readmeGuncelle, renderIcindekiler, renderKatalog } from "../../../src/readme.js";
import { KATEGORILER } from "../../../src/registry.js";

const katalog = renderKatalog(KATEGORILER, {
  finans_get_exchange_rates: "TCMB kurları — 10.11.2026",
});

describe("README kataloğu", () => {
  it("her kategori için başlık", () => {
    for (const k of KATEGORILER) expect(katalog).toContain(`## ${k.ikon} ${k.ad}`);
  });

  it("her kaynak için bir details bloğu ve canlı durum rozeti", () => {
    const toplam = KATEGORILER.reduce((n, k) => n + k.sources.length, 0);
    expect(katalog.match(/<details>/g)).toHaveLength(toplam);
    expect(katalog).toContain(
      "https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftcmb-kurlar.json",
    );
  });

  it("rozet etiketleri, anahtar ve deneysel işaretleri", () => {
    expect(katalog).toContain("🏛️ Resmî");
    expect(katalog).toContain("TCMB_EVDS_KEY");
    expect(katalog).toContain("🧪");
  });

  it("araç parametre tablosu: zorunlu ve varsayılan sütunları", () => {
    expect(katalog).toContain("`finans_get_exchange_rates`");
    expect(katalog).toContain("| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |");
    expect(katalog).toMatch(/\| `limit` \| sayı \| — \| `20` \|/);
    expect(katalog).toMatch(/\| `il` \| metin \| ✔ \| — \|/);
  });

  it("uç noktalar, kütüphane örneği ve verilen örnek çıktı", () => {
    expect(katalog).toContain("GET https://www.tcmb.gov.tr/kurlar/today.xml");
    expect(katalog).toContain('import { tcmb } from "turkiye-mcp";');
    expect(katalog).toContain("TCMB kurları — 10.11.2026");
  });
});

describe("içindekiler ve işaretler", () => {
  it("her kategoriye çapa linki", () => {
    const ic = renderIcindekiler(KATEGORILER);
    expect(ic).toContain("(#-finans--piyasalar)");
  });

  it("readmeGuncelle idempotent ve işaret yoksa hata", () => {
    const r = "a\n<!-- KATALOG:BASLA -->\neski\n<!-- KATALOG:BITIR -->\nb";
    const bir = readmeGuncelle(r, "KATALOG", "yeni");
    expect(bir).toBe("a\n<!-- KATALOG:BASLA -->\nyeni\n<!-- KATALOG:BITIR -->\nb");
    expect(readmeGuncelle(bir, "KATALOG", "yeni")).toBe(bir);
    expect(() => readmeGuncelle("x", "KATALOG", "y")).toThrow();
  });
});

describe("details özeti", () => {
  it("summary içinde markdown değil <img> rozet", () => {
    const summary = katalog.split("\n").find((l) => l.startsWith("<summary>")) ?? "";
    expect(summary).toContain('<img src="https://img.shields.io/endpoint?url=');
    expect(summary).not.toContain("![durum]");
  });
});

describe("ana README araç kataloğu (kategori + liste)", () => {
  it("her kategori başlığı altında Araç | Ne yapar | Örnek soru tablosu, kaynak satırı ve ayrıntı linki", async () => {
    const { renderAracKatalogu } = await import("../../../src/readme.js");
    const md = renderAracKatalogu(KATEGORILER);
    for (const k of KATEGORILER) {
      expect(md).toContain(`### ${k.ikon} ${k.ad}`);
      expect(md).toContain(`](src/sources/${k.kategori}/README.md)`);
    }
    expect(md).toContain("| Araç | Ne yapar | Örnek soru |");
    expect(md).toMatch(
      /\| `finans_get_exchange_rates` \| TCMB döviz kurları \| “Dolar ve euro bugün kaç TL\?” \|/,
    );
    expect(md).toContain("**Kaynaklar:** 🏛️ TCMB");
    // ana README sade: details blokları, parametre tabloları ve canlı rozet yok
    expect(md).not.toContain("<details>");
    expect(md).not.toContain("| Parametre |");
    expect(md).not.toContain("img.shields.io");
  });

  it("içindekiler tek satır, kategoriler arası nokta ile", async () => {
    const { renderKategoriSatiri } = await import("../../../src/readme.js");
    const satir = renderKategoriSatiri(KATEGORILER);
    expect(satir.split("\n")).toHaveLength(1);
    expect(satir).toContain("[💱 Finans & Piyasalar](#-finans--piyasalar)");
  });
});
