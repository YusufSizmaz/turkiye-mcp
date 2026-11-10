<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

[← turkiye-mcp](../../../README.md#-araçlar)

## 🌍 Deprem & Afet

AFAD ve Kandilli Rasathanesi'nden son depremler.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| AFAD Deprem Dairesi | 🏛️ Resmî | `deprem_get_recent` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fafad.json) |
| Boğaziçi Üniversitesi Kandilli Rasathanesi (KOERI) | 🏛️ Resmî | `deprem_get_recent` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fkandilli.json) |

<details>
<summary><b>AFAD Deprem Dairesi</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fafad.json" alt="durum" align="top"></summary>

Afet ve Acil Durum Yönetimi Başkanlığı'nın deprem kataloğu: büyüklük, derinlik, koordinat, il/ilçe. Zaman aralığı, en küçük büyüklük ve il filtresi.

- **Resmî site:** https://deprem.afad.gov.tr
- **Önbellek:** 30 saniye

**Uç noktalar**

```text
GET https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=…&end=…&minmag=…&orderby=timedesc&limit=…  (zamanlar UTC)
```

**MCP aracı: `deprem_get_recent`** — Son depremler

> Recent earthquakes in and around Türkiye (son depremler, deprem listesi) from AFAD or Kandilli Observatory, newest first. Filter by hours, minimum magnitude and province (il).

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `kaynak` | `afad` \| `kandilli` | — | `"afad"` | Veri kaynağı: AFAD veya Kandilli |
| `saat` | sayı | — | `24` | Son kaç saat (1–720, varsayılan 24) |
| `minBuyukluk` | sayı | — | `0` | En küçük büyüklük, ör. 3 |
| `il` | metin | — | — | İl filtresi, ör. "İzmir" (Türkçe karakter şart değil) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Son 24 saatte 4'ten büyük deprem oldu mu?”
- “Kandilli'ye göre İzmir'de bugün deprem var mı?”

Gerçek örnek çıktı:

```text
Son 24 saatte 2,5+ büyüklüğünde 8 deprem. Aşağıda en yeni ilk 3 tanesi var.
En büyüğü: 3,7 ML — Aladağ (Adana), 10.11.2026 21:12
- 10.11.2026 21:12 · 3,7 ML · 7 km · Aladağ (Adana)
- 10.11.2026 17:16 · 3,1 ML · 8,9 km · Kozan (Adana)
- 10.11.2026 16:18 · 2,5 ML · 11,7 km · Ege Denizi - Gökova Körfezi - [05.07 km] Milas (Muğla)

Kaynak: 🏛️ Resmî AFAD Deprem Dairesi — https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=2026-11-09T19%3A55%3A00&end=2026-11-10T19%3A55%3A00&minmag=2.5&orderby=timedesc&limit=1000 (alındı 2026-11-10T22:55:30+03:00)
```

**Kütüphane olarak**

```ts
import { afad } from "turkiye-mcp";

const { veri } = await afad.getEarthquakes({ saat: 24, minBuyukluk: 3 });
console.log(veri[0]?.yer, veri[0]?.buyukluk);
```

</details>

<details>
<summary><b>Boğaziçi Üniversitesi Kandilli Rasathanesi (KOERI)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fkandilli.json" alt="durum" align="top"></summary>

Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü'nün son 500 depremlik hızlı çözüm listesi (MD/ML/Mw büyüklükleri).

- **Resmî site:** http://www.koeri.boun.edu.tr/scripts/lst0.asp
- **Önbellek:** 30 saniye

**Uç noktalar**

```text
GET http://www.koeri.boun.edu.tr/scripts/lst0.asp  (windows-1254, <pre> içinde sabit genişlikli metin)
```

**MCP aracı: `deprem_get_recent`** — Son depremler

> Recent earthquakes in and around Türkiye (son depremler, deprem listesi) from AFAD or Kandilli Observatory, newest first. Filter by hours, minimum magnitude and province (il).

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `kaynak` | `afad` \| `kandilli` | — | `"afad"` | Veri kaynağı: AFAD veya Kandilli |
| `saat` | sayı | — | `24` | Son kaç saat (1–720, varsayılan 24) |
| `minBuyukluk` | sayı | — | `0` | En küçük büyüklük, ör. 3 |
| `il` | metin | — | — | İl filtresi, ör. "İzmir" (Türkçe karakter şart değil) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Son 24 saatte 4'ten büyük deprem oldu mu?”
- “Kandilli'ye göre İzmir'de bugün deprem var mı?”

Gerçek örnek çıktı:

```text
Son 24 saatte 2,5+ büyüklüğünde 8 deprem. Aşağıda en yeni ilk 3 tanesi var.
En büyüğü: 3,7 ML — Aladağ (Adana), 10.11.2026 21:12
- 10.11.2026 21:12 · 3,7 ML · 7 km · Aladağ (Adana)
- 10.11.2026 17:16 · 3,1 ML · 8,9 km · Kozan (Adana)
- 10.11.2026 16:18 · 2,5 ML · 11,7 km · Ege Denizi - Gökova Körfezi - [05.07 km] Milas (Muğla)

Kaynak: 🏛️ Resmî AFAD Deprem Dairesi — https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=2026-11-09T19%3A55%3A00&end=2026-11-10T19%3A55%3A00&minmag=2.5&orderby=timedesc&limit=1000 (alındı 2026-11-10T22:55:30+03:00)
```

**Kütüphane olarak**

```ts
import { kandilli } from "turkiye-mcp";

const { veri } = await kandilli.getEarthquakes({ saat: 6, il: "İzmir" });
```

</details>

[← Tüm kategoriler](../../../README.md#-araçlar)
