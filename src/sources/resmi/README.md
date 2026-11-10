<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## 📜 Resmî Yayınlar

Resmî Gazete'nin günlük sayıları ve Mevzuat Bilgi Sistemi'nde kanun, yönetmelik ve tebliğ araması.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| T.C. Resmî Gazete | 🏛️ Resmî | `resmi_gazete_get_issue` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fresmi-gazete.json) |
| Mevzuat Bilgi Sistemi | 🏛️ Resmî | `resmi_mevzuat_search` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmevzuat.json) |

<details>
<summary><b>T.C. Resmî Gazete</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fresmi-gazete.json" alt="durum" align="top"></summary>

Günlük Resmî Gazete sayısının içindekiler listesi: yürütme ve idare bölümü (yönetmelikler, tebliğler, kararlar, genelgeler…), yargı bölümü ve ilân bölümü; her madde için tam metin linki. Anahtar kelime ile filtrelenebilir.

- **Resmî site:** https://www.resmigazete.gov.tr
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://www.resmigazete.gov.tr/eskiler/{YYYY}/{MM}/{YYYYMMDD}.htm  (windows-1254)
```

**MCP aracı: `resmi_gazete_get_issue`** — Resmî Gazete günlük sayı

> Table of contents of the Official Gazette of Türkiye (Resmî Gazete) for today or a given date: regulations (yönetmelik), communiqués (tebliğ), presidential decisions (karar), circulars (genelge), announcements (ilan) with links. Optional keyword filter.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `tarih` | metin | — | — | Tarih (YYYY-MM-DD). Boşsa bugünkü sayı. |
| `arama` | metin | — | — | Başlıklarda aranacak kelime, ör. "vergi", "yönetmelik" |

Örnek sorular:

- “Bugünkü Resmî Gazete'de neler var?”
- “Bu haftaki Resmî Gazete'lerde vergiyle ilgili bir düzenleme çıktı mı?”

Gerçek örnek çıktı:

```text
Resmî Gazete — 10.11.2026, Sayı 33426 (11 madde)
HÂKİMLER VE SAVCILAR KURULU KARARLARI
  – Hâkimler ve Savcılar Kuruluna Ait Kararlar
YÖNETMELİKLER
  – Gençlik ve Spor Bakanlığı Yurt Hizmetleri Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik
  – İller Bankası Anonim Şirketi İnsan Kaynakları Yönetmeliğinde Değişiklik Yapılmasına Dair Yönetmelik
  – Türkiye Sağlık Enstitüleri Başkanlığı Bünyesinde Oluşturulacak Bilim Kurulları Hakkında Yönetmelikte Değişiklik Yapılmasına Dair Yönetmelik
GENELGE
  – Yeşil Mutabakat Eylem Planı (2026-2030) ile İlgili 2026/12 Sayılı Cumhurbaşkanlığı Genelgesi
TEBLİĞLER
  – Vergi Usul Kanunu Genel Tebliği (Sıra No: 597)
  – Türk Gıda Kodeksi Peynir Tebliği (No: 2026/24)
İLÂN BÖLÜMÜ
  – Yargı İlânları
```

**Kütüphane olarak**

```ts
import { resmiGazete } from "turkiye-mcp";

const { veri } = await resmiGazete.getIssue();                       // bugünkü sayı
const vergi = await resmiGazete.getIssue({ tarih: "2026-11-10", arama: "vergi" });
```

</details>

<details>
<summary><b>Mevzuat Bilgi Sistemi</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmevzuat.json" alt="durum" align="top"></summary>

Cumhurbaşkanlığı Mevzuat Bilgi Sistemi'nde başlıkta arama: kanunlar, KHK'lar, tüzükler, yönetmelikler, tebliğler. Kabul ve Resmî Gazete tarihi, sayısı ve tam metin linki.

- **Resmî site:** https://www.mevzuat.gov.tr
- **Önbellek:** 1 saat

**Uç noktalar**

```text
POST https://www.mevzuat.gov.tr/anasayfa/MevzuatDatatable  {"draw":1,"start":0,"length":n,"parameters":{"MevzuatTur":"Kanun","AranacakIfade":"…","AranacakYer":2,"TamCumle":false,"GenelArama":false}}
```

**MCP aracı: `resmi_mevzuat_search`** — Mevzuat arama

> Search Turkish legislation in the official Mevzuat Bilgi Sistemi: laws (kanun), decree-laws (KHK), regulations (yönetmelik), communiqués (tebliğ). Returns number, title, adoption and Official Gazette dates and full-text link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `sorgu` | metin | ✔ | — | Aranacak ifade, ör. "kişisel veri", "vergi usul" |
| `tur` | `kanun` \| `khk` \| `tuzuk` \| `yonetmelik` \| `kurum-yonetmeligi` \| `universite-yonetmeligi` \| `teblig` | — | `"kanun"` | Mevzuat türü |
| `limit` | sayı | — | `10` | En fazla kaç kayıt (1–100) |

Örnek sorular:

- “Kişisel verilerle ilgili yönetmelikler hangileri?”
- “Vergi usul kanunu hangi Resmî Gazete'de yayımlandı?”

Gerçek örnek çıktı:

```text
1 kayıttan 1 tanesi:
- 6698 sayılı KİŞİSEL VERİLERİN KORUNMASI KANUNU (RG 07.04.2016, sayı 29677)
  https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6698&MevzuatTur=1&MevzuatTertip=5

Kaynak: 🏛️ Resmî Mevzuat Bilgi Sistemi — https://www.mevzuat.gov.tr/anasayfa/MevzuatDatatable (alındı 2026-11-10T22:55:35+03:00)
```

**Kütüphane olarak**

```ts
import { mevzuat } from "turkiye-mcp";

const { veri } = await mevzuat.search({ sorgu: "kişisel veri", tur: "yonetmelik" });
```

</details>

[← Tüm kategoriler](../../../README.md#-araçlar)
