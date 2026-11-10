<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 💊 Sağlık

Eczacı odalarından bugünkü nöbetçi eczaneler (İstanbul, Yalova, İzmir, Ankara). Yeni il adaptörlerine katkıya açık.

| Kaynak                                    | Rozet    | MCP araçları         | Durum                                                                                                                           |
| ----------------------------------------- | -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| İstanbul Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-istanbul.json) |
| İzmir Eczacı Odası — Nöbetçi Eczaneler    | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-izmir.json)    |
| Ankara Eczacı Odası — Nöbetçi Eczaneler   | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-ankara.json)   |

<details>
<summary><b>İstanbul Eczacı Odası — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-istanbul.json" alt="durum" align="top"></summary>

İstanbul ve Yalova'daki nöbetçi eczaneler: ad, adres, tarif, konum ve nöbet saatleri. Telefon numaraları oda tarafından tek tek gösterildiği için toplu verilmez; resmî sayfadan bakılabilir.

- **Resmî site:** https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/   (gömülü boot JSON: token + ilçe listesi)
GET https://www.istanbuleczaciodasi.org.tr/api/nobetci-eczane-web/?action=district&id={ilceId}   (X-Web-Token, Referer)
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, İzmir, Ankara. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip   | Zorunlu | Varsayılan | Açıklama                                                            |
| --------- | ----- | ------- | ---------- | ------------------------------------------------------------------- |
| `il`      | metin | ✔       | —          | İl: İstanbul, Yalova, İzmir, Ankara                                 |
| `ilce`    | metin | —       | —          | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit`   | sayı  | —       | `20`       | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20)               |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İstanbul", ilce: "Kadıköy" });
```

</details>

<details>
<summary><b>İzmir Eczacı Odası — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-izmir.json" alt="durum" align="top"></summary>

İzmir'deki bugünkü nöbetçi eczaneler: ad, semt, adres, telefon ve harita konumu.

- **Resmî site:** https://www.izmireczaciodasi.org.tr/nobetci-eczaneler
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://www.izmireczaciodasi.org.tr/nobetci-eczaneler   (HTML)
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, İzmir, Ankara. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip   | Zorunlu | Varsayılan | Açıklama                                                            |
| --------- | ----- | ------- | ---------- | ------------------------------------------------------------------- |
| `il`      | metin | ✔       | —          | İl: İstanbul, Yalova, İzmir, Ankara                                 |
| `ilce`    | metin | —       | —          | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit`   | sayı  | —       | `20`       | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20)               |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İzmir", ilce: "Bornova" });
```

</details>

<details>
<summary><b>Ankara Eczacı Odası — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-ankara.json" alt="durum" align="top"></summary>

Ankara'daki bugünkü nöbetçi eczaneler: ad, ilçe, adres, telefon ve harita konumu.

- **Resmî site:** https://www.aeo.org.tr/nobetci-eczaneler
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://www.aeo.org.tr/getPharmacies/{YYYY-MM-DD}   (JSON içinde HTML parçası)
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, İzmir, Ankara. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip   | Zorunlu | Varsayılan | Açıklama                                                            |
| --------- | ----- | ------- | ---------- | ------------------------------------------------------------------- |
| `il`      | metin | ✔       | —          | İl: İstanbul, Yalova, İzmir, Ankara                                 |
| `ilce`    | metin | —       | —          | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit`   | sayı  | —       | `20`       | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20)               |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
