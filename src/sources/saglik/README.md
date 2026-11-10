<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## 💊 Sağlık

Eczacı odalarından bugünkü nöbetçi eczaneler (İstanbul, Yalova, Ankara, İzmir, Adana, Mersin). Yeni il adaptörlerine katkıya açık.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| İstanbul Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-istanbul.json) |
| Ankara Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-ankara.json) |
| İzmir Büyükşehir Belediyesi — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-izmir.json) |
| Adana Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-adana.json) |
| Mersin Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-mersin.json) |

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

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

Gerçek örnek çıktı:

```text
• BELDE ECZANESİ (SEYHAN)
  ATATÜRK CAD. BÜYÜKŞEHİR BELEDİYESİ YANI ÖZEL ADANA HASTANESİ (ÜNİVERSAL HASTANESİ)KARŞISI
  Tel: 03224573086
  Harita: https://www.google.com/maps?q=36.994055,35.325312
• NAZLI TUNÇ ECZANESİ (SEYHAN)
  DENİZLİ MAH. ŞEHİT MEHMET ÖZEL CAD. NO:84 BARBAROS ORTAOKULU KARŞISI
  Tel: 05382456436
  Harita: https://www.google.com/maps?q=37.001580473950156,35.29788753883242

Kaynak: 🏛️ Resmî Adana Eczacı Odası — Nöbetçi Eczaneler — https://www.adanaeo.org.tr/nobetci-eczaneler (alındı 2026-11-10T22:55:40+03:00)
Not: 10 eczaneden ilk 2 tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.
```

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İstanbul", ilce: "Kadıköy" });
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

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

Gerçek örnek çıktı:

```text
• BELDE ECZANESİ (SEYHAN)
  ATATÜRK CAD. BÜYÜKŞEHİR BELEDİYESİ YANI ÖZEL ADANA HASTANESİ (ÜNİVERSAL HASTANESİ)KARŞISI
  Tel: 03224573086
  Harita: https://www.google.com/maps?q=36.994055,35.325312
• NAZLI TUNÇ ECZANESİ (SEYHAN)
  DENİZLİ MAH. ŞEHİT MEHMET ÖZEL CAD. NO:84 BARBAROS ORTAOKULU KARŞISI
  Tel: 05382456436
  Harita: https://www.google.com/maps?q=37.001580473950156,35.29788753883242

Kaynak: 🏛️ Resmî Adana Eczacı Odası — Nöbetçi Eczaneler — https://www.adanaeo.org.tr/nobetci-eczaneler (alındı 2026-11-10T22:55:40+03:00)
Not: 10 eczaneden ilk 2 tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.
```

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });
```

</details>

<details>
<summary><b>İzmir Büyükşehir Belediyesi — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-izmir.json" alt="durum" align="top"></summary>

İzmir'in bugünkü nöbetçi eczaneleri, İzmir Büyükşehir Belediyesi açık veri API'sinden: ad, bölge, adres, telefon, konum ve nöbet notu (ör. 24:00'den sonra hangi eczane).

- **Resmî site:** https://acikveri.bizizmir.com/tr/dataset/nobetci-eczaneler-ve-eczane-listesi
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

Gerçek örnek çıktı:

```text
• BELDE ECZANESİ (SEYHAN)
  ATATÜRK CAD. BÜYÜKŞEHİR BELEDİYESİ YANI ÖZEL ADANA HASTANESİ (ÜNİVERSAL HASTANESİ)KARŞISI
  Tel: 03224573086
  Harita: https://www.google.com/maps?q=36.994055,35.325312
• NAZLI TUNÇ ECZANESİ (SEYHAN)
  DENİZLİ MAH. ŞEHİT MEHMET ÖZEL CAD. NO:84 BARBAROS ORTAOKULU KARŞISI
  Tel: 05382456436
  Harita: https://www.google.com/maps?q=37.001580473950156,35.29788753883242

Kaynak: 🏛️ Resmî Adana Eczacı Odası — Nöbetçi Eczaneler — https://www.adanaeo.org.tr/nobetci-eczaneler (alındı 2026-11-10T22:55:40+03:00)
Not: 10 eczaneden ilk 2 tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.
```

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "İzmir", ilce: "Bornova" });
```

</details>

<details>
<summary><b>Adana Eczacı Odası — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-adana.json" alt="durum" align="top"></summary>

Adana'daki bugünkü nöbetçi eczaneler: ad, ilçe, adres, tarif, telefon, harita konumu ve nöbet saatleri.

- **Resmî site:** https://www.adanaeo.org.tr/nobetci-eczaneler
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://www.adanaeo.org.tr/nobetci-eczaneler   (HTML)
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

Gerçek örnek çıktı:

```text
• BELDE ECZANESİ (SEYHAN)
  ATATÜRK CAD. BÜYÜKŞEHİR BELEDİYESİ YANI ÖZEL ADANA HASTANESİ (ÜNİVERSAL HASTANESİ)KARŞISI
  Tel: 03224573086
  Harita: https://www.google.com/maps?q=36.994055,35.325312
• NAZLI TUNÇ ECZANESİ (SEYHAN)
  DENİZLİ MAH. ŞEHİT MEHMET ÖZEL CAD. NO:84 BARBAROS ORTAOKULU KARŞISI
  Tel: 05382456436
  Harita: https://www.google.com/maps?q=37.001580473950156,35.29788753883242

Kaynak: 🏛️ Resmî Adana Eczacı Odası — Nöbetçi Eczaneler — https://www.adanaeo.org.tr/nobetci-eczaneler (alındı 2026-11-10T22:55:40+03:00)
Not: 10 eczaneden ilk 2 tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.
```

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Adana" });
```

</details>

<details>
<summary><b>Mersin Eczacı Odası — Nöbetçi Eczaneler</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-mersin.json" alt="durum" align="top"></summary>

Mersin'daki bugünkü nöbetçi eczaneler: ad, ilçe, adres, tarif, telefon, harita konumu ve nöbet saatleri.

- **Resmî site:** https://www.mersineczaciodasi.org.tr/nobetci-eczaneler
- **Önbellek:** 30 dakika

**Uç noktalar**

```text
GET https://www.mersineczaciodasi.org.tr/nobetci-eczaneler   (HTML)
```

**MCP aracı: `eczane_get_on_duty`** — Nöbetçi eczaneler

> On-duty pharmacies today (nöbetçi eczane) from official pharmacists' chambers. Supported provinces: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin. District (ilçe) is required for İstanbul. Returns name, address, phone (where published), directions and map link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, Ankara, İzmir, Adana, Mersin |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

Gerçek örnek çıktı:

```text
• BELDE ECZANESİ (SEYHAN)
  ATATÜRK CAD. BÜYÜKŞEHİR BELEDİYESİ YANI ÖZEL ADANA HASTANESİ (ÜNİVERSAL HASTANESİ)KARŞISI
  Tel: 03224573086
  Harita: https://www.google.com/maps?q=36.994055,35.325312
• NAZLI TUNÇ ECZANESİ (SEYHAN)
  DENİZLİ MAH. ŞEHİT MEHMET ÖZEL CAD. NO:84 BARBAROS ORTAOKULU KARŞISI
  Tel: 05382456436
  Harita: https://www.google.com/maps?q=37.001580473950156,35.29788753883242

Kaynak: 🏛️ Resmî Adana Eczacı Odası — Nöbetçi Eczaneler — https://www.adanaeo.org.tr/nobetci-eczaneler (alındı 2026-11-10T22:55:40+03:00)
Not: 10 eczaneden ilk 2 tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.
```

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Mersin" });
```

</details>

[← Tüm kategoriler](../../../README.md#-araçlar)
