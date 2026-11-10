<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 🏙️ Şehir Verileri

İstanbul'un canlı trafik endeksi ve İSPARK doluluğu; İBB ve İzmir açık veri portallarında arama ve tablo sorgusu (barajlar, hal, ulaşım, afet ve yüzlercesi).

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| İBB Trafik Endeksi | 🏛️ Resmî | `istanbul_get_traffic_index` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-trafik.json) |
| İSPARK Otopark Doluluk | 🏛️ Resmî | `istanbul_get_parking` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fispark.json) |
| İBB Açık Veri Portalı | 🏛️ Resmî | `opendata_search`<br>`opendata_query` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-acik-veri.json) |
| İzmir Büyükşehir Belediyesi Açık Veri Portalı | 🏛️ Resmî | `opendata_search`<br>`opendata_query` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-acik-veri.json) |

<details>
<summary><b>İBB Trafik Endeksi</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-trafik.json" alt="durum" align="top"></summary>

İstanbul'un anlık trafik yoğunluk endeksi (0–100): genel, Anadolu yakası ve Avrupa yakası.

- **Resmî site:** https://uym.ibb.gov.tr
- **Önbellek:** 1 dakika

**Uç noktalar**

```text
GET https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont
```

**MCP aracı: `istanbul_get_traffic_index`** — İstanbul trafik endeksi

> Live Istanbul traffic congestion index 0–100 (trafik yoğunluğu) overall and for the Asian (Anadolu) and European (Avrupa) sides, from İBB.

_Parametre yok._

Örnek sorular:

- “İstanbul'da trafik şu an nasıl?”
- “Anadolu yakasında trafik yoğun mu?”

Gerçek örnek çıktı:

```text
İstanbul trafik endeksi
Genel: 20/100 (akıcı)
Anadolu: 13/100 (akıcı) · Avrupa: 26/100 (akıcı)

Kaynak: 🏛️ Resmî İBB Trafik Endeksi — https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont (alındı 2026-11-10T22:13:51+03:00)
```

**Kütüphane olarak**

```ts
import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getTrafficIndex(); // { genel, anadolu, avrupa }
```

</details>

<details>
<summary><b>İSPARK Otopark Doluluk</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fispark.json" alt="durum" align="top"></summary>

İSPARK otoparklarının anlık boş/toplam kapasitesi, türü, çalışma saatleri, ücretsiz süre ve konumu.

- **Resmî site:** https://ispark.istanbul
- **Önbellek:** 1 dakika

**Uç noktalar**

```text
GET https://api.ibb.gov.tr/ispark/Park
```

**MCP aracı: `istanbul_get_parking`** — İSPARK boş otoparklar

> Live İSPARK car park availability in Istanbul (otopark, boş yer): free spaces, capacity, type, hours, free minutes, location. Sorted by most free spaces.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy", "Şişli" |
| `sadeceAcik` | evet/hayır | — | `true` | Yalnız şu an açık otoparklar |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de boş yeri olan İSPARK otoparkları hangileri?”

Gerçek örnek çıktı:

```text
- Kadıköy Yeni Salı Pazarı PD Katlı Otoparkı (KADIKÖY): 488/1350 boş · KAPALI OTOPARK · 24 Saat · ilk 15 dk ücretsiz
- Bostancı Açık (KADIKÖY): 342/394 boş · AÇIK OTOPARK · 24 Saat · ilk 15 dk ücretsiz
- Kadıköy Hasanpaşa Gazhane Katlı Otoparkı (KADIKÖY): 169/310 boş · KAPALI OTOPARK · 24 Saat · ilk 15 dk ücretsiz

Kaynak: 🏛️ Resmî İSPARK Otopark Doluluk — https://api.ibb.gov.tr/ispark/Park (alındı 2026-11-10T22:13:51+03:00)
```

**Kütüphane olarak**

```ts
import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getParking({ ilce: "Kadıköy" });
```

</details>

<details>
<summary><b>İBB Açık Veri Portalı</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-acik-veri.json" alt="durum" align="top"></summary>

İstanbul Büyükşehir Belediyesi'nin 500+ veri seti: ulaşım, su ve barajlar, hal, çevre, nüfus, afet… CKAN API ile arama ve tablo sorgusu.

- **Resmî site:** https://data.ibb.gov.tr
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://data.ibb.gov.tr/api/3/action/package_search?q={sorgu}&rows={n}
GET https://data.ibb.gov.tr/api/3/action/datastore_search?resource_id={id}&q=&limit=&sort=
```

**MCP aracı: `opendata_search`** — Belediye açık veri arama

> Search open datasets of Istanbul (İBB) or İzmir metropolitan municipalities (açık veri): transport, dams/baraj, markets/hal, environment, disaster areas… Returns datasets and their resource ids; resources marked queryable can be read with opendata_query.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `sorgu` | metin | ✔ | — | Arama, ör. "baraj doluluk", "hal fiyat", "toplanma alanı" |
| `limit` | sayı | — | `10` |  |

Örnek sorular:

- “İBB açık veride baraj doluluk verisi var mı?”
- “İzmir'de afet toplanma alanları veri seti”

Gerçek örnek çıktı:

```text
4 veri seti bulundu:
• İstanbul Barajlarında Yağış ve Günlük Tüketim Verileri — İSKİ (güncelleme 2024-08-26)
  https://data.ibb.gov.tr/dataset/istanbul-barajlarina-dusen-gunluk-toplam-yagis-miktari
  - [XLSX] İstanbul Barajlarına Düşen Yağış Ve Günlük Tüketim Verileri · sorgulanabilir: 762b802e-c5f9-4175-a5c1-78b892d9764b
• İstanbul Barajları Günlük Doluluk Oranları — İSKİ (güncelleme 2024-03-01)
  https://data.ibb.gov.tr/dataset/istanbul-barajlari-gunluk-doluluk-oranlari
  - [XLSX] İstanbul Barajları Günlük Doluluk Oranları · sorgulanabilir: af0b3902-cfd9-4096-85f7-e2c3017e4f21

Kaynak: 🏛️ Resmî İBB Açık Veri Portalı — https://data.ibb.gov.tr/api/3/action/package_search?q=baraj&rows=2 (alındı 2026-11-10T22:13:52+03:00)
```

**MCP aracı: `opendata_query`** — Belediye açık veri tablosu sorgula

> Read rows from a queryable (datastore) resource of İBB or İzmir open data portals. Use opendata_search first to find the resource id. Supports full-text filter and sorting.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `kaynakId` | metin | ✔ | — | opendata_search sonucundaki 'sorgulanabilir' kaynak id'si |
| `sorgu` | metin | — | — | Tablo içinde tam metin arama |
| `sirala` | metin | — | — | Sıralama, ör. "_id desc" (en yeni kayıtlar) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Bu veri setinin son 10 kaydını getir”

**Kütüphane olarak**

```ts
import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("ibb", "baraj doluluk");
const tablo = await acikVeri.queryDatastore("ibb", veri.sonuclar[0].kaynaklar[0].id, { limit: 10 });
```

</details>

<details>
<summary><b>İzmir Büyükşehir Belediyesi Açık Veri Portalı</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-acik-veri.json" alt="durum" align="top"></summary>

İzmir Büyükşehir Belediyesi'nin açık veri setleri (CKAN): ulaşım, eczaneler, hal fiyatları, afet toplanma alanları…

- **Resmî site:** https://acikveri.bizizmir.com
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://acikveri.bizizmir.com/api/3/action/package_search?q={sorgu}
GET https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id={id}
```

**MCP aracı: `opendata_search`** — Belediye açık veri arama

> Search open datasets of Istanbul (İBB) or İzmir metropolitan municipalities (açık veri): transport, dams/baraj, markets/hal, environment, disaster areas… Returns datasets and their resource ids; resources marked queryable can be read with opendata_query.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `sorgu` | metin | ✔ | — | Arama, ör. "baraj doluluk", "hal fiyat", "toplanma alanı" |
| `limit` | sayı | — | `10` |  |

Örnek sorular:

- “İBB açık veride baraj doluluk verisi var mı?”
- “İzmir'de afet toplanma alanları veri seti”

Gerçek örnek çıktı:

```text
4 veri seti bulundu:
• İstanbul Barajlarında Yağış ve Günlük Tüketim Verileri — İSKİ (güncelleme 2024-08-26)
  https://data.ibb.gov.tr/dataset/istanbul-barajlarina-dusen-gunluk-toplam-yagis-miktari
  - [XLSX] İstanbul Barajlarına Düşen Yağış Ve Günlük Tüketim Verileri · sorgulanabilir: 762b802e-c5f9-4175-a5c1-78b892d9764b
• İstanbul Barajları Günlük Doluluk Oranları — İSKİ (güncelleme 2024-03-01)
  https://data.ibb.gov.tr/dataset/istanbul-barajlari-gunluk-doluluk-oranlari
  - [XLSX] İstanbul Barajları Günlük Doluluk Oranları · sorgulanabilir: af0b3902-cfd9-4096-85f7-e2c3017e4f21

Kaynak: 🏛️ Resmî İBB Açık Veri Portalı — https://data.ibb.gov.tr/api/3/action/package_search?q=baraj&rows=2 (alındı 2026-11-10T22:13:52+03:00)
```

**MCP aracı: `opendata_query`** — Belediye açık veri tablosu sorgula

> Read rows from a queryable (datastore) resource of İBB or İzmir open data portals. Use opendata_search first to find the resource id. Supports full-text filter and sorting.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `kaynakId` | metin | ✔ | — | opendata_search sonucundaki 'sorgulanabilir' kaynak id'si |
| `sorgu` | metin | — | — | Tablo içinde tam metin arama |
| `sirala` | metin | — | — | Sıralama, ör. "_id desc" (en yeni kayıtlar) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Bu veri setinin son 10 kaydını getir”

**Kütüphane olarak**

```ts
import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("izmir", "otobüs");
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
