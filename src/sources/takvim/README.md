<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 📅 Takvim & Vakitler

Resmî tatiller ve dinî bayramlar; il/ilçe bazında namaz vakitleri (Diyanet verisi).

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| Nager.Date — Resmî Tatiller | 🌐 Topluluk | `takvim_get_holidays` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fnager-tatiller.json) |
| Ezan Vakti API (Diyanet verisi) | 🌐 Topluluk | `takvim_get_prayer_times` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fezanvakti.json) |
| Diyanet İşleri Başkanlığı Namaz Vakti API | 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel | — | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fdiyanet-namaz.json) |

<details>
<summary><b>Nager.Date — Resmî Tatiller</b> — 🌐 Topluluk <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fnager-tatiller.json" alt="durum" align="top"></summary>

Türkiye'nin resmî tatilleri ve dinî bayramlar (Ramazan ve Kurban Bayramı günleri dahil), yıl bazında.

- **Resmî site:** https://date.nager.at
- **Önbellek:** 24 saat

**Uç noktalar**

```text
GET https://date.nager.at/api/v3/PublicHolidays/{yıl}/TR
```

**MCP aracı: `takvim_get_holidays`** — Resmî tatiller

> Official public holidays in Türkiye for a year, including religious holidays (Ramazan/Kurban Bayramı) — resmî tatil, bayram günleri.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `yil` | sayı | — | — | Yıl. Boşsa bu yıl. |

Örnek sorular:

- “Bu yıl Kurban Bayramı ne zaman?”
- “2027 resmî tatilleri hangi günlere denk geliyor?”

Gerçek örnek çıktı:

```text
- 01.01.2026 Perşembe: Yılbaşı
- 20.03.2026 Cuma: Ramazan Bayramı 1. Gün
- 21.03.2026 Cumartesi: Ramazan Bayramı 2. Gün
- 22.03.2026 Pazar: Ramazan Bayramı 3. Gün
- 23.04.2026 Perşembe: Ulusal Egemenlik ve Çocuk Bayramı
- 01.05.2026 Cuma: İşçi Bayramı
- 19.05.2026 Salı: Atatürk'ü Anma, Gençlik ve Spor Bayramı
- 27.05.2026 Çarşamba: Kurban Bayramı 1. Gün
- 28.05.2026 Perşembe: Kurban Bayramı 2. Gün
- 29.05.2026 Cuma: Kurban Bayramı 3. Gün
- 30.05.2026 Cumartesi: Kurban Bayramı 4. Gün
- 15.07.2026 Çarşamba: Demokrasi ve Millî Birlik Günü
- 30.08.2026 Pazar: Zafer Bayramı
- 29.10.2026 Perşembe: Cumhuriyet Bayramı
```

**Kütüphane olarak**

```ts
import { tatiller } from "turkiye-mcp";

const { veri } = await tatiller.getHolidays(2027);
```

</details>

<details>
<summary><b>Ezan Vakti API (Diyanet verisi)</b> — 🌐 Topluluk <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fezanvakti.json" alt="durum" align="top"></summary>

Diyanet İşleri Başkanlığı'nın il/ilçe bazlı namaz vakitlerini anahtarsız sunan topluluk aynası; ~30 günlük vakit, hicri tarih.

- **Resmî site:** https://ezanvakti.emushaf.net
- **Önbellek:** 24 saat

**Uç noktalar**

```text
GET https://ezanvakti.emushaf.net/sehirler/2
GET https://ezanvakti.emushaf.net/ilceler/{sehirId}
GET https://ezanvakti.emushaf.net/vakitler/{ilceId}
```

**MCP aracı: `takvim_get_prayer_times`** — Namaz vakitleri

> Islamic prayer times (namaz vakitleri, ezan, iftar/sahur) for any Turkish province/district from Diyanet data: imsak, güneş, öğle, ikindi, akşam, yatsı. Uses the official Diyanet API if DIYANET_EMAIL/DIYANET_PASSWORD are set, otherwise a keyless Diyanet mirror.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl |
| `ilce` | metin | — | — | İlçe. Boşsa il merkezi. |
| `gunSayisi` | sayı | — | `1` | Bugünden itibaren kaç gün (1–30) |

Örnek sorular:

- “İstanbul'da bugün akşam ezanı kaçta?”
- “Üsküdar için bu haftanın namaz vakitleri”

Gerçek örnek çıktı:

```text
İSTANBUL / İSTANBUL
Salı 10.11.2026 (1 Cemaziyelahir 1448): İmsak 06:11 · Güneş 07:38 · Öğle 12:53 · İkindi 15:33 · Akşam 17:58 · Yatsı 19:20

Kaynak: 🌐 Topluluk Ezan Vakti API (Diyanet verisi) — https://ezanvakti.emushaf.net/vakitler/9541 (alındı 2026-11-10T22:24:35+03:00)
Not: Diyanet "Üsküdar" için ayrı vakit yayımlamıyor (merkez ilçe); İstanbul merkez vakitleri verildi.
```

**Kütüphane olarak**

```ts
import { namaz } from "turkiye-mcp";

const { veri } = await namaz.getPrayerTimes({ il: "İstanbul", ilce: "Üsküdar", gunSayisi: 7 }, process.env);
```

</details>

<details>
<summary><b>Diyanet İşleri Başkanlığı Namaz Vakti API</b> — 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fdiyanet-namaz.json" alt="durum" align="top"></summary>

Diyanet'in resmî namaz vakti servisi. Anahtar tanımlıysa namaz vakitleri doğrudan buradan alınır; yoksa Ezan Vakti aynası kullanılır.

- **Resmî site:** https://awqatsalah.diyanet.gov.tr
- **Önbellek:** 24 saat
- **Gerekli ortam değişkenleri:** `DIYANET_EMAIL`, `DIYANET_PASSWORD`
- **Anahtar nasıl alınır:** Ücretsiz üyelik: https://awqatsalah.diyanet.gov.tr adresinden kayıt olun.
- 🧪 **Deneysel:** resmî belgelere göre yazıldı, henüz gerçek anahtarla doğrulanmadı.

**Uç noktalar**

```text
POST https://awqatsalah.diyanet.gov.tr/Auth/Login  {"email","password"} → accessToken
GET  https://awqatsalah.diyanet.gov.tr/api/PrayerTime/Daily/{ilceId}   (Authorization: Bearer)
```

**Kütüphane olarak**

```ts
import { namaz } from "turkiye-mcp";

// DIYANET_EMAIL ve DIYANET_PASSWORD tanımlıysa otomatik olarak Diyanet kullanılır
const { veri, kaynak } = await namaz.getPrayerTimes({ il: "Ankara" }, process.env);
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
