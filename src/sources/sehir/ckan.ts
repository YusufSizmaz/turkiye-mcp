import { cached } from "../../core/cache.js";
import { KaynakHatasi } from "../../core/errors.js";
import { fetchJson } from "../../core/http.js";
import { sonuc } from "../../core/sonuc.js";
import type { Sonuc, SourceMeta } from "../../core/types.js";

export type Portal = "ibb" | "izmir";

const TABAN: Record<Portal, string> = {
  ibb: "https://data.ibb.gov.tr",
  izmir: "https://acikveri.bizizmir.com",
};

const ortak = {
  kategori: "sehir",
  rozet: "resmi",
  anahtarGerekli: false,
  envVars: [] as string[],
  ttlSaniye: 3600,
} satisfies Partial<SourceMeta>;

export const portalMeta: Record<Portal, SourceMeta> = {
  ibb: {
    ...ortak,
    id: "ibb-acik-veri",
    ad: "İBB Açık Veri Portalı",
    resmiUrl: "https://data.ibb.gov.tr",
    aciklama:
      "İstanbul Büyükşehir Belediyesi'nin 500+ veri seti: ulaşım, su ve barajlar, hal, çevre, nüfus, afet… CKAN API ile arama ve tablo sorgusu.",
    ucNoktalar: [
      "GET https://data.ibb.gov.tr/api/3/action/package_search?q={sorgu}&rows={n}",
      "GET https://data.ibb.gov.tr/api/3/action/datastore_search?resource_id={id}&q=&limit=&sort=",
    ],
    kutuphaneOrnegi: `import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("ibb", "baraj doluluk");
const tablo = await acikVeri.queryDatastore("ibb", veri.sonuclar[0].kaynaklar[0].id, { limit: 10 });`,
  },
  izmir: {
    ...ortak,
    id: "izmir-acik-veri",
    ad: "İzmir Büyükşehir Belediyesi Açık Veri Portalı",
    resmiUrl: "https://acikveri.bizizmir.com",
    aciklama:
      "İzmir Büyükşehir Belediyesi'nin açık veri setleri (CKAN): ulaşım, eczaneler, hal fiyatları, afet toplanma alanları…",
    ucNoktalar: [
      "GET https://acikveri.bizizmir.com/api/3/action/package_search?q={sorgu}",
      "GET https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id={id}",
    ],
    kutuphaneOrnegi: `import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("izmir", "otobüs");`,
  },
};

interface CkanYanit<T> {
  success: boolean;
  result?: T;
  error?: { message?: string };
}

async function ckanCagir<T>(
  portal: Portal,
  eylem: string,
  params: Record<string, string>,
): Promise<{ url: string; result: T }> {
  const meta = portalMeta[portal];
  const url = `${TABAN[portal]}/api/3/action/${eylem}?${new URLSearchParams(params)}`;
  let y: CkanYanit<T>;
  try {
    y = await cached(url, meta.ttlSaniye, () =>
      fetchJson<CkanYanit<T>>(url, { sourceId: meta.id }),
    );
  } catch (e) {
    if (e instanceof KaynakHatasi && (e.status === 404 || e.status === 409)) {
      throw new KaynakHatasi(
        meta.id,
        "bulunamadi",
        `${meta.ad}: istenen kayıt bulunamadı.`,
        e.status,
      );
    }
    throw e;
  }
  if (!y?.success || y.result === undefined) {
    throw new KaynakHatasi(
      meta.id,
      "bulunamadi",
      `${meta.ad}: ${y?.error?.message ?? "istek başarısız"}.`,
    );
  }
  return { url, result: y.result };
}

export interface VeriSeti {
  id: string;
  baslik: string;
  aciklama: string;
  kurum: string | null;
  guncelleme: string | null;
  url: string;
  kaynaklar: Array<{ id: string; ad: string; format: string; url: string; datastore: boolean }>;
}

interface HamPaket {
  name: string;
  title: string;
  notes?: string | null;
  organization?: { title?: string } | null;
  metadata_modified?: string;
  resources?: Array<{
    id: string;
    name?: string;
    format?: string;
    url?: string;
    datastore_active?: boolean;
  }>;
}

export async function searchDatasets(
  portal: Portal,
  sorgu: string,
  limit = 10,
): Promise<Sonuc<{ toplam: number; sonuclar: VeriSeti[] }>> {
  const { url, result } = await ckanCagir<{ count: number; results: HamPaket[] }>(
    portal,
    "package_search",
    {
      q: sorgu,
      rows: String(limit),
    },
  );
  if (!Array.isArray(result?.results)) {
    throw new KaynakHatasi(
      portalMeta[portal].id,
      "ayristirma",
      `${portalMeta[portal].ad}: arama yanıtı beklenen biçimde değil.`,
    );
  }
  return sonuc(portalMeta[portal], url, {
    toplam: result.count,
    sonuclar: result.results.map((p) => ({
      id: p.name,
      baslik: p.title,
      aciklama: (p.notes ?? "").replace(/\s+/g, " ").trim().slice(0, 400),
      kurum: p.organization?.title ?? null,
      guncelleme: p.metadata_modified?.slice(0, 10) ?? null,
      url: `${TABAN[portal]}/dataset/${p.name}`,
      kaynaklar: (p.resources ?? []).map((r) => ({
        id: r.id,
        ad: r.name ?? "",
        format: (r.format ?? "").toUpperCase(),
        url: r.url ?? "",
        datastore: Boolean(r.datastore_active),
      })),
    })),
  });
}

export interface TabloSonucu {
  alanlar: string[];
  kayitlar: Record<string, unknown>[];
  toplam: number;
}

export async function queryDatastore(
  portal: Portal,
  kaynakId: string,
  o: { q?: string; limit?: number; sirala?: string } = {},
): Promise<Sonuc<TabloSonucu>> {
  const params: Record<string, string> = { resource_id: kaynakId, limit: String(o.limit ?? 20) };
  if (o.q) params.q = o.q;
  if (o.sirala) params.sort = o.sirala;
  const { url, result } = await ckanCagir<{
    fields: Array<{ id: string }>;
    records: Record<string, unknown>[];
    total: number;
  }>(portal, "datastore_search", params);
  if (!Array.isArray(result?.fields) || !Array.isArray(result?.records)) {
    throw new KaynakHatasi(
      portalMeta[portal].id,
      "ayristirma",
      `${portalMeta[portal].ad}: tablo yanıtı beklenen biçimde değil.`,
    );
  }
  return sonuc(portalMeta[portal], url, {
    alanlar: result.fields.map((f) => f.id).filter((f) => f !== "_id"),
    kayitlar: result.records.map(({ _id, ...r }) => r),
    toplam: result.total,
  });
}
