<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## 🗺️ Coğrafya

81 il, ilçe ve mahalle bilgileri: nüfus, yüzölçümü, rakım, bölge, plaka, telefon kodu, koordinat.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| TurkiyeAPI | 🌐 Topluluk | `cografya_get_provinces`<br>`cografya_get_districts`<br>`cografya_get_neighborhoods` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fturkiyeapi.json) |

<details>
<summary><b>TurkiyeAPI</b> — 🌐 Topluluk <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fturkiyeapi.json" alt="durum" align="top"></summary>

Açık kaynak Türkiye idari bölümler API'si: 81 il, 973 ilçe ve mahalleler; nüfus, yüzölçümü, rakım, bölge, NUTS kodları, telefon kodu, koordinat.

- **Resmî site:** https://turkiyeapi.dev
- **Önbellek:** 24 saat

**Uç noktalar**

```text
GET https://api.turkiyeapi.dev/v1/provinces?name={İl}
GET https://api.turkiyeapi.dev/v1/neighborhoods?province={İl}&district={İlçe}&limit={n}
```

**MCP aracı: `cografya_get_provinces`** — İl bilgileri

> Turkish provinces (il) facts: plate code, population (nüfus), area, altitude, region, metropolitan/coastal, phone area code, coordinates. One province by name or all 81.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `ad` | metin | — | — | İl adı veya plaka. Boşsa 81 il. |

Örnek sorular:

- “Ankara'nın nüfusu ve yüzölçümü ne?”
- “Kıyısı olan büyükşehirler hangileri?”

Gerçek örnek çıktı:

```text
- Eskişehir (26) · İç Anadolu · nüfus 927.956 · 13.960 km² · rakım 796 m · tel 222 · büyükşehir

Kaynak: 🌐 Topluluk TurkiyeAPI — https://api.turkiyeapi.dev/v1/provinces?name=Eski%C5%9Fehir (alındı 2026-11-10T22:55:34+03:00)
```

**MCP aracı: `cografya_get_districts`** — İlçeler

> Districts (ilçe) of a Turkish province with population and area, most populous first.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka |

Örnek sorular:

- “İzmir'in en kalabalık ilçeleri hangileri?”

Gerçek örnek çıktı:

```text
13 ilçe:
- Bodrum: 207.196 kişi, 650 km²
- Fethiye: 187.332 kişi, 875 km²
- Milas: 152.275 kişi, 2.067 km²
- Menteşe: 126.288 kişi, 1.659 km²
- Marmaris: 97.373 kişi, 906 km²
- Seydikemer: 65.648 kişi, 2.208 km²
- Ortaca: 58.704 kişi, 285 km²
- Dalaman: 53.327 kişi, 608 km²
- Yatağan: 45.024 kişi, 851 km²
- Köyceğiz: 41.810 kişi, 1.329 km²
- Ula: 27.649 kişi, 479 km²
- Datça: 26.067 kişi, 436 km²
- Kavaklıdere: 10.854 kişi, 302 km²
```

**MCP aracı: `cografya_get_neighborhoods`** — Mahalleler

> Neighborhoods (mahalle) of a district with population.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl |
| `ilce` | metin | ✔ | — | İlçe |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'ün mahalleleri ve nüfusları”

Gerçek örnek çıktı:

```text
- Abbasağa: 4.054
- Akat: 12.089
- Arnavutköy: 3.371

Kaynak: 🌐 Topluluk TurkiyeAPI — https://api.turkiyeapi.dev/v1/neighborhoods?province=%C4%B0stanbul&district=Be%C5%9Fikta%C5%9F&limit=1000 (alındı 2026-11-10T22:55:34+03:00)
```

**Kütüphane olarak**

```ts
import { turkiyeapi } from "turkiye-mcp";

const { veri } = await turkiyeapi.getProvinces({ ad: "Ankara" });
const ilceler = await turkiyeapi.getDistricts("İzmir");
```

</details>

[← Tüm kategoriler](../../../README.md#-araçlar)
