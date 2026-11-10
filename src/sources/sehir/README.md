<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## 🏙️ Şehir Verileri

İstanbul trafik endeksi ve İSPARK; İzmir hal fiyatları, İZBAN/vapur saatleri ve kent rehberi; İBB ve İzmir açık veri portallarında arama.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| İBB Trafik Endeksi | 🏛️ Resmî | `istanbul_get_traffic_index` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-trafik.json) |
| İSPARK Otopark Doluluk | 🏛️ Resmî | `istanbul_get_parking` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fispark.json) |
| İzmir Büyükşehir — Hal Fiyatları | 🏛️ Resmî | `izmir_get_market_prices` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-hal.json) |
| İzmir Büyükşehir — İZBAN ve Vapur Seferleri | 🏛️ Resmî | `izmir_get_izban_times`<br>`izmir_get_ferry_times` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-ulasim.json) |
| İzmir Büyükşehir — Kent Rehberi (CBS) | 🏛️ Resmî | `izmir_find_places` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-yerler.json) |
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
Genel: 17/100 (akıcı)
Anadolu: 13/100 (akıcı) · Avrupa: 20/100 (akıcı)

Kaynak: 🏛️ Resmî İBB Trafik Endeksi — https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont (alındı 2026-11-10T22:55:33+03:00)
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
- Kadıköy Yeni Salı Pazarı PD Katlı Otoparkı (KADIKÖY): 487/1350 boş · KAPALI OTOPARK · 24 Saat · ilk 15 dk ücretsiz
- Bostancı Açık (KADIKÖY): 343/394 boş · AÇIK OTOPARK · 24 Saat · ilk 15 dk ücretsiz
- Kadıköy Hasanpaşa Gazhane Katlı Otoparkı (KADIKÖY): 170/310 boş · KAPALI OTOPARK · 24 Saat · ilk 15 dk ücretsiz

Kaynak: 🏛️ Resmî İSPARK Otopark Doluluk — https://api.ibb.gov.tr/ispark/Park (alındı 2026-11-10T22:55:33+03:00)
```

**Kütüphane olarak**

```ts
import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getParking({ ilce: "Kadıköy" });
```

</details>

<details>
<summary><b>İzmir Büyükşehir — Hal Fiyatları</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-hal.json" alt="durum" align="top"></summary>

İzmir sebze-meyve ve balık hallerinin günlük fiyat bülteni: ürün, birim, en düşük / en yüksek / ortalama fiyat.

- **Resmî site:** https://acikveri.bizizmir.com
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://openapi.izmir.bel.tr/api/ibb/halfiyatlari/sebzemeyve/{YYYY-MM-DD}
GET https://openapi.izmir.bel.tr/api/ibb/halfiyatlari/balik/{YYYY-MM-DD}
```

**MCP aracı: `izmir_get_market_prices`** — İzmir hal fiyatları

> Daily wholesale market prices in İzmir (hal fiyatları): fruits & vegetables (sebze-meyve) or fish (balık) with min/max/average price per unit. Falls back to the latest bulletin.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `tur` | `sebzemeyve` \| `balik` | — | `"sebzemeyve"` | sebzemeyve veya balik |
| `urun` | metin | — | — | Ürün adı, ör. "domates", "çipura" |
| `tarih` | metin | — | — | Bülten tarihi (YYYY-MM-DD). Boşsa en güncel. |
| `limit` | sayı | — | `50` |  |

Örnek sorular:

- “İzmir halinde domatesin kilosu kaç lira?”
- “Bugün halde çipura fiyatı ne?”

Gerçek örnek çıktı:

```text
İzmir sebze-meyve hali — 10.11.2026 (6 ürün)
- DOMATES BEEF (SEBZE): 45–100 TL/kg, ort. 72,5
- DOMATES SALKIM (SEBZE): 50–90 TL/kg, ort. 70
- DOMATES CHERRY (SEBZE): 80–130 TL/kg, ort. 105
- DOMATES (KOKTEYL) (SEBZE): 90–140 TL/kg, ort. 115
- DOMATES PEMBE (SEBZE): 70–120 TL/kg, ort. 95
- DOMATES SERA (SEBZE): 40–70 TL/kg, ort. 55

Kaynak: 🏛️ Resmî İzmir Büyükşehir — Hal Fiyatları — https://openapi.izmir.bel.tr/api/ibb/halfiyatlari/sebzemeyve/2026-11-10 (alındı 2026-11-10T22:55:36+03:00)
```

**Kütüphane olarak**

```ts
import { izmir } from "turkiye-mcp";

const { veri } = await izmir.getMarketPrices({ tur: "sebzemeyve", urun: "domates" });
```

</details>

<details>
<summary><b>İzmir Büyükşehir — İZBAN ve Vapur Seferleri</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-ulasim.json" alt="durum" align="top"></summary>

İZBAN banliyö istasyonları arası kalkış/varış saatleri ve İzdeniz vapur iskelelerinin günlük sefer saatleri.

- **Resmî site:** https://acikveri.bizizmir.com
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://openapi.izmir.bel.tr/api/izban/istasyonlar
GET https://openapi.izmir.bel.tr/api/izban/sefersaatleri/{kalkisId}/{varisId}
GET https://openapi.izmir.bel.tr/api/izdeniz/iskeleler
GET https://openapi.izmir.bel.tr/api/izdeniz/iskelesefersaatleri/{iskeleId}/{gunId}
```

**MCP aracı: `izmir_get_izban_times`** — İZBAN sefer saatleri

> İZBAN commuter rail (banliyö) departure and arrival times between two stations in İzmir.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `kalkis` | metin | ✔ | — | Kalkış istasyonu, ör. "Alsancak" |
| `varis` | metin | ✔ | — | Varış istasyonu, ör. "Cumaovası" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Alsancak'tan Menemen'e bir sonraki İZBAN kaçta?”

Gerçek örnek çıktı:

```text
İZBAN Alsancak → Menemen
- 00:18 → 01:12
- 00:32 → 01:26
- 05:40 → 06:34

Kaynak: 🏛️ Resmî İzmir Büyükşehir — İZBAN ve Vapur Seferleri — https://openapi.izmir.bel.tr/api/izban/sefersaatleri/34/4 (alındı 2026-11-10T22:55:37+03:00)
```

**MCP aracı: `izmir_get_ferry_times`** — İzmir vapur saatleri

> İzdeniz ferry departures from a pier in İzmir (vapur saatleri: Konak, Karşıyaka, Bostanlı, Alsancak, Üçkuyular…) for today or a given date.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `iskele` | metin | ✔ | — | İskele, ör. "Karşıyaka", "Konak" |
| `tarih` | metin | — | — | Tarih (YYYY-MM-DD). Boşsa bugün. |
| `limit` | sayı | — | `50` |  |

Örnek sorular:

- “Karşıyaka'dan Konak'a vapur saatleri”
- “Bostanlı iskelesinden pazar günü vapur var mı?”

Gerçek örnek çıktı:

```text
Karşıyaka iskelesi — Salı (5 sefer)
- 07:10 → Konak
- 07:20 → Alsancak, Pasaport
- 07:30 → Konak
- 07:30 → Üçkuyular, Göztepe, Karantina
- 07:35 → Alsancak, Pasaport

Kaynak: 🏛️ Resmî İzmir Büyükşehir — İZBAN ve Vapur Seferleri — https://openapi.izmir.bel.tr/api/izdeniz/iskelesefersaatleri/2/2 (alındı 2026-11-10T22:55:38+03:00)
```

**Kütüphane olarak**

```ts
import { izmir } from "turkiye-mcp";

const izban = await izmir.getIzbanTimes({ kalkis: "Alsancak", varis: "Cumaovası" });
const vapur = await izmir.getFerryTimes({ iskele: "Karşıyaka" });
```

</details>

<details>
<summary><b>İzmir Büyükşehir — Kent Rehberi (CBS)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-yerler.json" alt="durum" align="top"></summary>

İzmir'de hastaneler, afet toplanma alanları, plajlar, müzeler, kütüphaneler, noterler, vergi daireleri, terminaller, taksi durakları, ücretsiz WizmirNet noktaları ve daha fazlası: ad, ilçe, mahalle, adres ve koordinat.

- **Resmî site:** https://acikveri.bizizmir.com
- **Önbellek:** 24 saat

**Uç noktalar**

```text
GET https://openapi.izmir.bel.tr/api/ibb/cbs/{kategori}   (ör. hastaneler, afetaciltoplanmaalani, plajlar…)
```

**MCP aracı: `izmir_find_places`** — İzmir kent rehberi

> Find places in İzmir by category from the municipality's GIS: hospitals, disaster assembly areas (toplanma alanı), beaches, museums, libraries, notaries, tax offices, bus terminals, taxi stands, free Wi-Fi points and more. Filter by district (ilçe) or name.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `kategori` | `hastaneler` \| `ailesagligimerkezleri` \| `kanmerkezleri` \| `veterinerlikler` \| `afetaciltoplanmaalani` \| `itfaiyegruplari` \| `plajlar` \| `mavibayrakplajlar` \| `muzeler` \| `kutuphaneler` \| `sinemalar` \| `tiyatrolar` \| `kaplicalar` \| `pazaryerleri` \| `otobusterminalleri` \| `trengarlari` \| `taksiduraklari` \| `wizmirnetnoktalari` \| `noterler` \| `vergidaireleri` \| `nufusmudurlukleri` \| `ptt` \| `universiteler` \| `muhtarliklar` \| `aracmuayeneistasyonlari` | ✔ | — | Kategori: hastaneler (Hastaneler), ailesagligimerkezleri (Aile sağlığı merkezleri), kanmerkezleri (Kan merkezleri), veterinerlikler (Veteriner klinikleri), afetaciltoplanmaalani (Afet ve acil durum toplanma alanları), itfaiyegruplari (İtfaiye grupları), plajlar (Plajlar), mavibayrakplajlar (Mavi bayraklı plajlar), muzeler (Müzeler), kutuphaneler (Kütüphaneler), sinemalar (Sinemalar), tiyatrolar (Tiyatrolar), kaplicalar (Kaplıcalar), pazaryerleri (Semt pazarları), otobusterminalleri (Otobüs terminalleri), trengarlari (Tren garları), taksiduraklari (Taksi durakları), wizmirnetnoktalari (Ücretsiz WizmirNET noktaları), noterler (Noterler), vergidaireleri (Vergi daireleri), nufusmudurlukleri (Nüfus müdürlükleri), ptt (PTT şubeleri), universiteler (Üniversiteler), muhtarliklar (Muhtarlıklar), aracmuayeneistasyonlari (Araç muayene istasyonları) |
| `ilce` | metin | — | — | İlçe, ör. "Bornova" |
| `arama` | metin | — | — | Ad içinde ara |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Bornova'daki afet toplanma alanları nerede?”
- “Karşıyaka'da hangi hastaneler var?”

Gerçek örnek çıktı:

```text
Afet ve acil durum toplanma alanları (73 kayıttan ilk 3)
- 1 NO LU AFET VE ACİL DURUM TOPLANMA ALANI — BORNOVA, GAZİ OSMAN PAŞA, 5460 Sk. · https://www.google.com/maps?q=38.43323086856,27.196610985687
- 1 NO LU AFET VE ACİL DURUM TOPLANMA ALANI — BORNOVA, ATATÜRK, 954 Sk. · https://www.google.com/maps?q=38.485183799478,27.19991536355
- 1 NO'LU AFET VE ACİL DURUM TOPLANMA ALANI — BORNOVA, EVKA 4, AHMET ARVASİ · https://www.google.com/maps?q=38.489355927096,27.214853442805

Kaynak: 🏛️ Resmî İzmir Büyükşehir — Kent Rehberi (CBS) — https://openapi.izmir.bel.tr/api/ibb/cbs/afetaciltoplanmaalani (alındı 2026-11-10T22:55:39+03:00)
```

**Kütüphane olarak**

```ts
import { izmir } from "turkiye-mcp";

const { veri } = await izmir.findPlaces({ kategori: "afetaciltoplanmaalani", ilce: "Bornova" });
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

Kaynak: 🏛️ Resmî İBB Açık Veri Portalı — https://data.ibb.gov.tr/api/3/action/package_search?q=baraj&rows=2 (alındı 2026-11-10T22:55:34+03:00)
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

Kaynak: 🏛️ Resmî İBB Açık Veri Portalı — https://data.ibb.gov.tr/api/3/action/package_search?q=baraj&rows=2 (alındı 2026-11-10T22:55:34+03:00)
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

[← Tüm kategoriler](../../../README.md#-araçlar)
