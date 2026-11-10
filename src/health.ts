import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KaynakHatasi } from "./core/errors.js";
import { istanbulIso } from "./core/tarih.js";
import type { Kategori, Rozet, SourceMeta } from "./core/types.js";
import { KATEGORILER, TUM_KAYNAKLAR } from "./registry.js";

export type Durum = "calisiyor" | "bozuk" | "geo-kisitli" | "anahtar-yok";

export interface DurumKaydi {
  id: string;
  ad: string;
  kategori: Kategori;
  rozet: Rozet;
  durum: Durum;
  sureMs: number;
  hata?: string;
  deneysel: boolean;
}

export function durumBelirle(meta: SourceMeta, hata: unknown | null): Durum {
  if (!hata) return "calisiyor";
  if (hata instanceof KaynakHatasi && hata.tur === "anahtar-yok") return "anahtar-yok";
  if (meta.geoKisitli) return "geo-kisitli";
  return "bozuk";
}

const ROZET: Record<Durum, { message: string; color: string }> = {
  calisiyor: { message: "çalışıyor", color: "brightgreen" },
  bozuk: { message: "bozuk", color: "red" },
  "geo-kisitli": { message: "yalnızca TR", color: "lightgrey" },
  "anahtar-yok": { message: "anahtar gerekli", color: "blue" },
};

export function shieldsJson(k: DurumKaydi): {
  schemaVersion: 1;
  label: "durum";
  message: string;
  color: string;
} {
  return { schemaVersion: 1, label: "durum", ...ROZET[k.durum] };
}

/** Bozuk kaynaklar, satır başına "id<TAB>hata". Her satır (sonuncusu dahil) newline ile biter: bash `read` son satırı atlamasın. */
export function bozukMetni(kayitlar: DurumKaydi[]): string {
  return kayitlar
    .filter((k) => k.durum === "bozuk")
    .map((k) => `${k.id}\t${(k.hata ?? "").replace(/[\t\r\n]+/g, " ")}\n`)
    .join("");
}

/** README başındaki genel rozet: asıl soru "bozuk kaynak var mı?" (yalnızca TR / anahtarlılar bozuk sayılmaz). */
export function genelRozet(kayitlar: DurumKaydi[]): {
  schemaVersion: 1;
  label: "kaynaklar";
  message: string;
  color: string;
} {
  const bozuk = kayitlar.filter((k) => k.durum === "bozuk").length;
  return {
    schemaVersion: 1,
    label: "kaynaklar",
    message: `${kayitlar.length} kaynak · ${bozuk ? `${bozuk} bozuk` : "bozuk yok"}`,
    color: bozuk ? "orange" : "brightgreen",
  };
}

const SINIR_MS = 30_000;

function zamanSiniri<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`${SINIR_MS / 1000} sn içinde tamamlanmadı`)), SINIR_MS),
    ),
  ]);
}

/** Tüm probe'ları sırayla çalıştırır (kaynaklara yük bindirmemek için). */
export async function probeHepsi(log: (s: string) => void = () => {}): Promise<DurumKaydi[]> {
  const kayitlar: DurumKaydi[] = [];
  for (const kat of KATEGORILER) {
    for (const meta of kat.sources) {
      const probe = kat.probes[meta.id];
      const bas = Date.now();
      let hata: unknown = null;
      if (!probe) hata = new Error("probe tanımlı değil");
      else {
        try {
          await zamanSiniri(probe());
        } catch (e) {
          hata = e;
        }
      }
      const k: DurumKaydi = {
        id: meta.id,
        ad: meta.ad,
        kategori: meta.kategori,
        rozet: meta.rozet,
        durum: durumBelirle(meta, hata),
        sureMs: Date.now() - bas,
        deneysel: Boolean(meta.deneysel),
        ...(hata ? { hata: (hata as Error)?.message ?? String(hata) } : {}),
      };
      kayitlar.push(k);
      log(
        `${k.durum === "calisiyor" ? "✅" : k.durum === "bozuk" ? "❌" : k.durum === "anahtar-yok" ? "🔑" : "🌍"} ${meta.id} (${k.sureMs} ms)${k.hata ? ` — ${k.hata}` : ""}`,
      );
    }
  }
  return kayitlar;
}

export async function runHealth(
  outDir: string,
  log: (s: string) => void = console.log,
): Promise<DurumKaydi[]> {
  const kayitlar = await probeHepsi(log);
  await mkdir(join(outDir, "badges"), { recursive: true });
  const durum = {
    olusturulma: istanbulIso(),
    ozet: {
      toplam: kayitlar.length,
      calisiyor: kayitlar.filter((k) => k.durum === "calisiyor").length,
      bozuk: kayitlar.filter((k) => k.durum === "bozuk").length,
    },
    kategoriler: KATEGORILER.map((k) => ({ kategori: k.kategori, ad: k.ad, ikon: k.ikon })),
    kaynaklar: kayitlar.map((k) => {
      const m = TUM_KAYNAKLAR.find((s) => s.id === k.id);
      return { ...k, resmiUrl: m?.resmiUrl, anahtarGerekli: m?.anahtarGerekli ?? false };
    }),
  };
  await writeFile(join(outDir, "status.json"), `${JSON.stringify(durum, null, 2)}\n`);
  for (const k of kayitlar) {
    await writeFile(join(outDir, "badges", `${k.id}.json`), JSON.stringify(shieldsJson(k)));
  }
  await writeFile(join(outDir, "badges", "_genel.json"), JSON.stringify(genelRozet(kayitlar)));
  const sablon = join(dirname(fileURLToPath(import.meta.url)), "..", "site", "index.html");
  await writeFile(join(outDir, "index.html"), await readFile(sablon, "utf-8"));
  await writeFile(join(outDir, "bozuk.txt"), bozukMetni(kayitlar));
  return kayitlar;
}
