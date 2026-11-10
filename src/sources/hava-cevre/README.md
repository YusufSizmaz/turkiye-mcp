<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 🌤️ Hava & Çevre

MGM anlık hava durumu ve tahminleri, Ulusal Hava Kalitesi İzleme Ağı ölçümleri.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| Meteoroloji Genel Müdürlüğü (MGM) | 🏛️ Resmî | `hava_get_current`<br>`hava_get_forecast` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmgm.json) |
| Ulusal Hava Kalitesi İzleme Ağı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı) | 🏛️ Resmî | `hava_get_air_quality` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fhava-kalitesi.json) |

<details>
<summary><b>Meteoroloji Genel Müdürlüğü (MGM)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmgm.json" alt="durum" align="top"></summary>

MGM'nin il/ilçe bazında anlık gözlemleri (sıcaklık, hissedilen, nem, rüzgâr, basınç, yağış), 5 günlük ve 3 saatlik tahminleri. mgm.gov.tr'nin kullandığı servis; Origin başlığı gerektirir.

- **Resmî site:** https://www.mgm.gov.tr
- **Önbellek:** 10 dakika

**Uç noktalar**

```text
GET https://servis.mgm.gov.tr/web/merkezler?il={İl}            (Origin: https://www.mgm.gov.tr)
GET https://servis.mgm.gov.tr/web/merkezler/ililcesi?il={İl}
GET https://servis.mgm.gov.tr/web/sondurumlar?merkezid={merkezId}
GET https://servis.mgm.gov.tr/web/tahminler/gunluk?istno={gunlukTahminIstNo}
GET https://servis.mgm.gov.tr/web/tahminler/saatlik?istno={saatlikTahminIstNo}
```

**MCP aracı: `hava_get_current`** — Anlık hava durumu (MGM)

> Current observed weather (hava durumu, sıcaklık) for a Turkish province/district from the Turkish State Meteorological Service (MGM): temperature, feels-like, humidity, wind, pressure, precipitation, condition.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka, ör. "İstanbul", "izmir", "6" |
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy" (Türkçe karakter şart değil). Boşsa il merkezi. |

Örnek sorular:

- “Kadıköy'de hava şu an nasıl?”
- “Ankara'da şu an kaç derece?”

**MCP aracı: `hava_get_forecast`** — Hava tahmini (MGM)

> Weather forecast (hava tahmini) for a Turkish province/district from MGM: 5-day daily min/max and condition, or 3-hourly forecast.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka, ör. "İstanbul", "izmir", "6" |
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy" (Türkçe karakter şart değil). Boşsa il merkezi. |
| `tur` | `gunluk` \| `saatlik` | — | `"gunluk"` | gunluk: 5 gün · saatlik: 3 saatlik |

Örnek sorular:

- “İzmir'de hafta sonu hava nasıl olacak?”
- “Yarın Bursa'da yağmur var mı?”

**Kütüphane olarak**

```ts
import { mgm } from "turkiye-mcp";

const simdi = await mgm.getCurrent("İstanbul", "Kadıköy");
const tahmin = await mgm.getForecast("ankara");               // 5 günlük
const saatlik = await mgm.getForecast("izmir", undefined, "saatlik");
```

</details>

<details>
<summary><b>Ulusal Hava Kalitesi İzleme Ağı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fhava-kalitesi.json" alt="durum" align="top"></summary>

Türkiye genelindeki ~335 istasyonun son saatlik hava kalitesi indeksi (HKİ), kategori (İyi/Orta/Hassas/Sağlıksız/Kötü/Tehlikeli) ve baskın kirletici (PM10, PM2.5, NO2, SO2, O3, CO).

- **Resmî site:** https://sim.csb.gov.tr/Services/AirQuality
- **Önbellek:** 10 dakika

**Uç noktalar**

```text
GET  https://sim.csb.gov.tr/Services/GetAirQualityStatus?type=0
POST https://sim.csb.gov.tr/Services/GetAirQualityStations?type=0  {"Location":null,"Date":"DD.MM.YYYY HH:mm:ss"}
```

**MCP aracı: `hava_get_air_quality`** — Hava kalitesi

> Air quality (hava kalitesi, kirlilik, PM10, PM2.5) from Türkiye's National Air Quality Monitoring Network: latest hourly AQI, category and dominant pollutant per station, worst first. Filter by province.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | — | — | İl adı. Boşsa tüm Türkiye (en kötüden iyiye). |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Ankara'da hava kalitesi nasıl?”
- “Şu an Türkiye'de havası en kirli yerler neresi?”

**Kütüphane olarak**

```ts
import { havaKalitesi } from "turkiye-mcp";

const { veri } = await havaKalitesi.getAirQuality({ il: "Ankara" });
console.log(veri[0]?.istasyon, veri[0]?.indeks, veri[0]?.kategori);
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
