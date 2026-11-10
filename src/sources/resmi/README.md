<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 📜 Resmî Yayınlar

Resmî Gazete'nin günlük sayıları ve içerik başlıkları.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| T.C. Resmî Gazete | 🏛️ Resmî | `resmi_gazete_get_issue` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fresmi-gazete.json) |

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

**Kütüphane olarak**

```ts
import { resmiGazete } from "turkiye-mcp";

const { veri } = await resmiGazete.getIssue();                       // bugünkü sayı
const vergi = await resmiGazete.getIssue({ tarih: "2026-11-10", arama: "vergi" });
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
