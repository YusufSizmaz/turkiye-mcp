<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

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

**MCP aracı: `cografya_get_districts`** — İlçeler

> Districts (ilçe) of a Turkish province with population and area, most populous first.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka |

Örnek sorular:

- “İzmir'in en kalabalık ilçeleri hangileri?”

**MCP aracı: `cografya_get_neighborhoods`** — Mahalleler

> Neighborhoods (mahalle) of a district with population.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl |
| `ilce` | metin | ✔ | — | İlçe |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'ün mahalleleri ve nüfusları”

**Kütüphane olarak**

```ts
import { turkiyeapi } from "turkiye-mcp";

const { veri } = await turkiyeapi.getProvinces({ ad: "Ankara" });
const ilceler = await turkiyeapi.getDistricts("İzmir");
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
