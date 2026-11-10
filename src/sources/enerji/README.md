<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## ⛽ Enerji & Akaryakıt

İl/ilçe bazında akaryakıt pompa fiyatları ve EPİAŞ elektrik piyasası verileri.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| Opet Akaryakıt Fiyatları | ✅ Birinci taraf | `enerji_get_fuel_prices` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fopet.json) |
| EPİAŞ Şeffaflık Platformu | 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel | `enerji_get_electricity_market` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fepias.json) |

<details>
<summary><b>Opet Akaryakıt Fiyatları</b> — ✅ Birinci taraf <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fopet.json" alt="durum" align="top"></summary>

Opet'in il/ilçe bazında güncel pompa fiyatları: benzin, motorin, LPG, gazyağı. İstanbul Anadolu ve Avrupa yakaları birleşik verilir.

- **Resmî site:** https://www.opet.com.tr/akaryakit-fiyatlari
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://api.opet.com.tr/api/fuelprices/provinces
GET https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode={plaka}   (İstanbul: 34 Anadolu + 934 Avrupa)
```

**MCP aracı: `enerji_get_fuel_prices`** — Akaryakıt fiyatları (Opet)

> Current fuel pump prices in Türkiye by province/district from Opet (akaryakıt, benzin, motorin, mazot, LPG fiyatı).

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka, ör. "İstanbul" ya da 34 |
| `ilce` | metin | — | — | İlçe adı. Boşsa ilk 10 ilçe. |

Örnek sorular:

- “Kadıköy'de benzin litresi kaç TL?”
- “Ankara'da motorin fiyatı ne?”

Gerçek örnek çıktı:

```text
İSTANBUL ANADOLU / KADIKÖY
  Kurşunsuz Benzin 95: 74,49 TL
  Motorin UltraForce: 95,09 TL
  Motorin EcoForce: 95,09 TL

Kaynak: ✅ Birinci taraf Opet Akaryakıt Fiyatları — https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode=34 (alındı 2026-11-10T22:55:33+03:00)
```

**Kütüphane olarak**

```ts
import { opet } from "turkiye-mcp";

const { veri } = await opet.getFuelPrices({ il: "İstanbul", ilce: "Kadıköy" });
console.log(veri.ilceler[0]?.urunler);
```

</details>

<details>
<summary><b>EPİAŞ Şeffaflık Platformu</b> — 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fepias.json" alt="durum" align="top"></summary>

Enerji Piyasaları İşletme A.Ş. verileri: gün öncesi piyasası saatlik Piyasa Takas Fiyatı (PTF, TL/USD/EUR per MWh) ve gerçek zamanlı elektrik tüketimi.

- **Resmî site:** https://seffaflik.epias.com.tr
- **Önbellek:** 1 saat
- **Gerekli ortam değişkenleri:** `EPIAS_USERNAME`, `EPIAS_PASSWORD`
- **Anahtar nasıl alınır:** Ücretsiz üyelik: https://kayit.epias.com.tr adresinden Şeffaflık Platformu kullanıcısı oluşturun; kullanıcı adı (e-posta) ve şifrenizi kullanın.
- 🧪 **Deneysel:** resmî belgelere göre yazıldı, henüz gerçek anahtarla doğrulanmadı.

**Uç noktalar**

```text
POST https://giris.epias.com.tr/cas/v1/tickets   (form: username, password → TGT)
POST https://seffaflik.epias.com.tr/electricity-service/v1/markets/dam/data/mcp   (header: TGT) {"startDate":"…+03:00","endDate":"…+03:00"}
POST https://seffaflik.epias.com.tr/electricity-service/v1/consumption/data/realtime-consumption
```

**MCP aracı: `enerji_get_electricity_market`** — Elektrik piyasası (EPİAŞ)

> Turkish electricity market data from EPİAŞ Transparency Platform: hourly day-ahead market clearing price (PTF, elektrik fiyatı) or real-time consumption (tüketim). Requires EPIAS_USERNAME and EPIAS_PASSWORD.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `veri` | `ptf` \| `tuketim` | — | `"ptf"` | ptf: piyasa takas fiyatı · tuketim: gerçek zamanlı tüketim |
| `tarih` | metin | — | — | Tarih (YYYY-MM-DD). Boşsa bugün. |

Örnek sorular:

- “Bugün elektrik piyasa takas fiyatı saatlik ne kadar?”

**Kütüphane olarak**

```ts
import { epias } from "turkiye-mcp";

const ptf = await epias.getMarketClearingPrice({ tarih: "2026-11-10" }, process.env);
```

</details>

[← Tüm kategoriler](../../../README.md#-araçlar)
