<!-- Bu dosya `npm run readme` ile üretilir; elle düzenlemeyin. -->

## 💱 Finans & Piyasalar

Döviz kurları, altın, BIST hisseleri, kripto paralar, KAP bildirimleri ve TCMB EVDS serileri.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| TCMB Gösterge Niteliğindeki Döviz Kurları | 🏛️ Resmî | `finans_get_exchange_rates` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftcmb-kurlar.json) |
| KAP — Kamuyu Aydınlatma Platformu | 🏛️ Resmî | `finans_get_kap_disclosures`<br>`finans_search_kap_companies` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fkap.json) |
| Truncgil Finans (altın ve serbest piyasa) | 🌐 Topluluk | `finans_get_gold_prices` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftruncgil.json) |
| İş Yatırım — BIST hisse geçmişi | 🌐 Topluluk | `finans_get_stock_history` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fisyatirim.json) |
| BtcTurk | ✅ Birinci taraf | `finans_get_crypto_prices` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fbtcturk.json) |
| Paribu | ✅ Birinci taraf | `finans_get_crypto_prices` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fparibu.json) |
| TCMB EVDS — Elektronik Veri Dağıtım Sistemi | 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel | `finans_get_evds_series` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftcmb-evds.json) |

<details>
<summary><b>TCMB Gösterge Niteliğindeki Döviz Kurları</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftcmb-kurlar.json" alt="durum" align="top"></summary>

Türkiye Cumhuriyet Merkez Bankası'nın her iş günü 15:30'da yayımladığı döviz alış/satış ve efektif kurları. Geçmiş tarihler desteklenir; tatil ve hafta sonunda önceki iş gününün bülteni döner.

- **Resmî site:** https://www.tcmb.gov.tr/kurlar/kurlar_tr.html
- **Önbellek:** 5 dakika

**Uç noktalar**

```text
GET https://www.tcmb.gov.tr/kurlar/today.xml
GET https://www.tcmb.gov.tr/kurlar/{YYYYMM}/{DDMMYYYY}.xml
```

**MCP aracı: `finans_get_exchange_rates`** — TCMB döviz kurları

> Official Central Bank of Türkiye (TCMB) exchange rates (döviz kuru, dolar, euro, sterlin) for today or a past date. Returns forex and banknote buying/selling rates in TRY.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `tarih` | metin | — | — | Geçmiş tarih (YYYY-MM-DD). Boşsa bugünün bülteni. |
| `kodlar` | metin listesi | — | — | Yalnız bu döviz kodları, ör. ["USD","EUR"]. Boşsa hepsi. |

Örnek sorular:

- “Dolar ve euro bugün kaç TL?”
- “1 Ocak 2026'da TCMB sterlin satış kuru neydi?”

Gerçek örnek çıktı:

```text
TCMB kurları — 10.11.2026 (bülten 2026/211)
USD (1 ABD DOLARI): alış 50,1078 · satış 50,1981
EUR (1 EURO): alış 56,2781 · satış 56,3795
GBP (1 İNGİLİZ STERLİNİ): alış 67,2269 · satış 67,5774

Kaynak: 🏛️ Resmî TCMB Gösterge Niteliğindeki Döviz Kurları — https://www.tcmb.gov.tr/kurlar/today.xml (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { tcmb } from "turkiye-mcp";

const { veri } = await tcmb.getRates();                 // bugünün bülteni
const usd = veri.kurlar.find((k) => k.kod === "USD");
const gecmis = await tcmb.getRates({ tarih: "2026-01-02" });
```

</details>

<details>
<summary><b>KAP — Kamuyu Aydınlatma Platformu</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fkap.json" alt="durum" align="top"></summary>

Borsa İstanbul şirketlerinin özel durum açıklamaları, finansal raporları ve diğer bildirimleri. Son bildirimler, tarih aralığı + hisse kodu filtresi ve şirket arama. (Sitenin kendi web arayüzünün kullandığı uç noktalar.)

- **Resmî site:** https://www.kap.org.tr
- **Önbellek:** 2 dakika

**Uç noktalar**

```text
GET  https://www.kap.org.tr/tr/api/disclosure/list/light
POST https://www.kap.org.tr/tr/api/disclosure/list/main  {"fromDate":"DD.MM.YYYY","toDate":"DD.MM.YYYY","memberTypes":["IGS"],"disclosureClass":""}
POST https://www.kap.org.tr/tr/api/search/combined  {"keyword":"türk hava"}
```

**MCP aracı: `finans_get_kap_disclosures`** — KAP bildirimleri

> Public disclosures from KAP (Kamuyu Aydınlatma Platformu) for Borsa Istanbul companies: material event disclosures (özel durum açıklaması), financial reports etc. Latest disclosures, or a date range optionally filtered by stock ticker (hisse kodu).

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `baslangic` | metin | — | — | Başlangıç tarihi (YYYY-MM-DD). Boşsa en son bildirimler. |
| `bitis` | metin | — | — | Bitiş tarihi (YYYY-MM-DD). Boşsa bugün. |
| `hisseKodu` | metin | — | — | Hisse kodu, ör. THYAO. Verilirse tarih aralığı kullanılır (varsayılan son 7 gün). |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “KAP'a son düşen bildirimler neler?”
- “THYAO bu hafta KAP'a ne açıkladı?”

Gerçek örnek çıktı:

```text
3 KAP bildirimi:
- 10.11.2026 22:00 · LUXERA GAYRİMENKUL YATIRIM ORTAKLIĞI A.Ş.: Payların Geri Alınmasına İlişkin Bildirim — 10.11.2026 Tarihli Pay Geri Alım İşlemleri Hakkında (https://www.kap.org.tr/tr/Bildirim/1696756)
- 10.11.2026 21:51 · PC İLETİŞİM VE MEDYA HİZMETLERİ SANAYİ TİCARET A.Ş.: Payların Geri Alınmasına İlişkin Bildirim — 10.11.2026 Tarihli Pay Geri Alım İşlemleri (https://www.kap.org.tr/tr/Bildirim/1696755)
- 10.11.2026 20:58 · İSTANBUL ULUSLARARASI DERECELENDİRME HİZMETLERİ A.Ş.: Kredi Derecelendirmesi — Kredi Derecelendirme Notunun Askıya Alınması (https://www.kap.org.tr/tr/Bildirim/1696754)

Kaynak: 🏛️ Resmî KAP — Kamuyu Aydınlatma Platformu — https://www.kap.org.tr/tr/api/disclosure/list/light (alındı 2026-11-10T22:13:48+03:00)
```

**MCP aracı: `finans_search_kap_companies`** — KAP şirket/fon arama

> Search companies and funds on KAP by name or ticker (şirket ara, hisse kodu bul). Returns name, ticker and KAP company page link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `sorgu` | metin | ✔ | — | Şirket adı veya kod, ör. "türk hava", "aselsan" |

Örnek sorular:

- “Aselsan'ın hisse kodu ne?”
- “KAP'ta 'enerji' geçen şirketleri bul”

Gerçek örnek çıktı:

```text
- ASELS — ASELSAN ELEKTRONİK SANAYİ VE TİCARET A.Ş.

Kaynak: 🏛️ Resmî KAP — Kamuyu Aydınlatma Platformu — https://www.kap.org.tr/tr/api/search/combined (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { kap } from "turkiye-mcp";

const son = await kap.getLatestDisclosures({ limit: 10 });
const thy = await kap.getDisclosures({ baslangic: "2026-11-01", bitis: "2026-11-10", hisseKodu: "THYAO" });
const sirket = await kap.searchCompanies("türk hava");
```

</details>

<details>
<summary><b>Truncgil Finans (altın ve serbest piyasa)</b> — 🌐 Topluluk <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftruncgil.json" alt="durum" align="top"></summary>

Kapalıçarşı/serbest piyasa altın fiyatları (gram, çeyrek, yarım, tam, Cumhuriyet, 22/18/14 ayar), gümüş, platin, paladyum ve serbest piyasa döviz. Altın için ücretsiz resmî bir kaynak olmadığından topluluk kaynağıdır.

- **Resmî site:** https://finans.truncgil.com
- **Önbellek:** 5 dakika

**Uç noktalar**

```text
GET https://finans.truncgil.com/v4/today.json
```

**MCP aracı: `finans_get_gold_prices`** — Altın ve değerli metal fiyatları

> Turkish free-market gold prices (altın fiyatları: gram, çeyrek, yarım, tam, Cumhuriyet, 22/18/14 ayar), silver, platinum and palladium in TRY. Optionally any code from the feed (e.g. USD, EUR for free-market FX).

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `kodlar` | metin listesi | — | — | Yalnız bu kodlar, ör. ["GRA","CEYREKALTIN","USD"]. Boşsa tüm değerli metaller. |

Örnek sorular:

- “Gram altın ve çeyrek altın şu an kaç TL?”
- “Gümüşün gramı ne kadar?”

Gerçek örnek çıktı:

```text
Serbest piyasa — 10.11.2026 22:13
- Gram Altın: alış 6.508,2 · satış 6.509,18 TL (-2,58%)
- Çeyrek Altın: alış 10.590 · satış 10.677 TL (-2,47%)
- Tam Altın: alış 42.281 · satış 42.538 TL (-2,47%)

Kaynak: 🌐 Topluluk Truncgil Finans (altın ve serbest piyasa) — https://finans.truncgil.com/v4/today.json (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { truncgil } from "turkiye-mcp";

const { veri } = await truncgil.getGoldAndMarket();
const ceyrek = veri.kalemler.find((k) => k.kod === "CEYREKALTIN");
```

</details>

<details>
<summary><b>İş Yatırım — BIST hisse geçmişi</b> — 🌐 Topluluk <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fisyatirim.json" alt="durum" align="top"></summary>

Borsa İstanbul hisselerinin günlük kapanış, en düşük/en yüksek, ağırlıklı ortalama fiyat, işlem hacmi ve piyasa değeri. İş Yatırım'ın web sitesinin kullandığı veri servisi; gün sonu verisidir, anlık değildir.

- **Resmî site:** https://www.isyatirim.com.tr/tr-tr/analiz/hisse/Sayfalar/default.aspx
- **Önbellek:** 5 dakika

**Uç noktalar**

```text
GET https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=THYAO&startdate=DD-MM-YYYY&enddate=DD-MM-YYYY
```

**MCP aracı: `finans_get_stock_history`** — BIST hisse fiyat geçmişi

> Daily end-of-day price history for a Borsa Istanbul stock (hisse, BIST): close, low, high, weighted average, volume, market cap. Default last 30 days.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `hisse` | metin | ✔ | — | Hisse kodu, ör. THYAO, ASELS |
| `baslangic` | metin | — | — | Başlangıç (YYYY-MM-DD). Boşsa 30 gün önce. |
| `bitis` | metin | — | — | Bitiş (YYYY-MM-DD). Boşsa bugün. |

Örnek sorular:

- “THYAO son bir ayda nasıl gitti?”
- “ASELS'in dünkü kapanışı neydi?”

Gerçek örnek çıktı:

```text
12.10.2026 → 09.11.2026 (20 işlem günü)
Son kapanış: 310 TL · Dönem değişimi: +8,49%
Dönem en düşük/en yüksek: 242,2 / 310,25 TL

Kaynak: 🌐 Topluluk İş Yatırım — BIST hisse geçmişi — https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=THYAO&startdate=11-10-2026&enddate=10-11-2026 (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { isyatirim } from "turkiye-mcp";

const { veri } = await isyatirim.getStockHistory({ hisse: "THYAO", baslangic: "2026-10-01", bitis: "2026-11-10" });
console.log(veri.at(-1)?.kapanis);
```

</details>

<details>
<summary><b>BtcTurk</b> — ✅ Birinci taraf <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fbtcturk.json" alt="durum" align="top"></summary>

Türkiye'nin en büyük kripto borsalarından BtcTurk'ün herkese açık fiyat (ticker) API'si.

- **Resmî site:** https://docs.btcturk.com
- **Önbellek:** 30 saniye

**Uç noktalar**

```text
GET https://api.btcturk.com/api/v2/ticker
```

**MCP aracı: `finans_get_crypto_prices`** — Kripto para fiyatları (TL)

> Live cryptocurrency prices in TRY from Turkish exchanges BtcTurk or Paribu (kripto, bitcoin, ethereum, USDT). Default pairs BTC_TRY, ETH_TRY, USDT_TRY.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `borsa` | `btcturk` \| `paribu` | — | `"btcturk"` | Borsa |
| `pariteler` | metin listesi | — | — | Pariteler, ör. ["BTC","ETH_TRY","AVAXTRY"]. Boşsa BTC, ETH, USDT. |

Örnek sorular:

- “Bitcoin şu an kaç TL?”
- “Paribu'da ETH ve AVAX fiyatları ne?”

Gerçek örnek çıktı:

```text
- BTC/TRY: 3.681.406 (24s -1,53%)
- ETH/TRY: 102.546 (24s -3,57%)
- USDT/TRY: 50,184 (24s +0,18%)

Kaynak: ✅ Birinci taraf BtcTurk — https://api.btcturk.com/api/v2/ticker (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { btcturk } from "turkiye-mcp";

const { veri } = await btcturk.getTickers({ pariteler: ["BTC_TRY", "ETH_TRY"] });
```

</details>

<details>
<summary><b>Paribu</b> — ✅ Birinci taraf <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fparibu.json" alt="durum" align="top"></summary>

Paribu kripto borsasının herkese açık fiyat (ticker) uç noktası. TL pariteleri.

- **Resmî site:** https://www.paribu.com
- **Önbellek:** 30 saniye

**Uç noktalar**

```text
GET https://www.paribu.com/ticker
```

**MCP aracı: `finans_get_crypto_prices`** — Kripto para fiyatları (TL)

> Live cryptocurrency prices in TRY from Turkish exchanges BtcTurk or Paribu (kripto, bitcoin, ethereum, USDT). Default pairs BTC_TRY, ETH_TRY, USDT_TRY.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `borsa` | `btcturk` \| `paribu` | — | `"btcturk"` | Borsa |
| `pariteler` | metin listesi | — | — | Pariteler, ör. ["BTC","ETH_TRY","AVAXTRY"]. Boşsa BTC, ETH, USDT. |

Örnek sorular:

- “Bitcoin şu an kaç TL?”
- “Paribu'da ETH ve AVAX fiyatları ne?”

Gerçek örnek çıktı:

```text
- BTC/TRY: 3.681.406 (24s -1,53%)
- ETH/TRY: 102.546 (24s -3,57%)
- USDT/TRY: 50,184 (24s +0,18%)

Kaynak: ✅ Birinci taraf BtcTurk — https://api.btcturk.com/api/v2/ticker (alındı 2026-11-10T22:13:48+03:00)
```

**Kütüphane olarak**

```ts
import { paribu } from "turkiye-mcp";

const { veri } = await paribu.getTickers({ pariteler: ["BTC", "AVAX"] });
```

</details>

<details>
<summary><b>TCMB EVDS — Elektronik Veri Dağıtım Sistemi</b> — 🏛️ Resmî · 🔑 Anahtar · 🧪 Deneysel <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Ftcmb-evds.json" alt="durum" align="top"></summary>

TCMB'nin on binlerce ekonomik zaman serisi: enflasyon (TÜFE/ÜFE), faizler, rezervler, kredi/mevduat, dış ticaret, kurlar… Seri kodlarını EVDS sitesindeki veri ağacından bulabilirsiniz (ör. TP.DK.USD.A, TP.FG.J0).

- **Resmî site:** https://evds3.tcmb.gov.tr
- **Önbellek:** 1 saat
- **Gerekli ortam değişkenleri:** `TCMB_EVDS_KEY`
- **Anahtar nasıl alınır:** Ücretsiz anahtar: https://evds3.tcmb.gov.tr adresinde üye olun → Profil → API Anahtarı.
- 🧪 **Deneysel:** resmî belgelere göre yazıldı, henüz gerçek anahtarla doğrulanmadı.

**Uç noktalar**

```text
GET https://evds3.tcmb.gov.tr/igmevdsms-dis/series={KOD1-KOD2}&startDate=DD-MM-YYYY&endDate=DD-MM-YYYY&type=json[&frequency=1..8]  (header: key)
```

**MCP aracı: `finans_get_evds_series`** — TCMB EVDS zaman serileri

> Economic time series from the Central Bank of Türkiye EVDS (inflation/enflasyon TÜFE, interest rates/faiz, reserves/rezerv, credit, FX). Requires TCMB_EVDS_KEY. Pass EVDS series codes like TP.DK.USD.A or TP.FG.J0.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `seriler` | metin listesi | ✔ | — | EVDS seri kodları, ör. ["TP.FG.J0"] |
| `baslangic` | metin | — | — | Başlangıç (YYYY-MM-DD). Boşsa 1 yıl önce. |
| `bitis` | metin | — | — | Bitiş (YYYY-MM-DD). Boşsa bugün. |
| `frekans` | `gunluk` \| `isgunu` \| `haftalik` \| `aylik` \| `ceyreklik` \| `yillik` | — | — |  |

Örnek sorular:

- “TÜFE endeksi (TP.FG.J0) son 12 ayda nasıl değişti?”

**Kütüphane olarak**

```ts
import { evds } from "turkiye-mcp";

const { veri } = await evds.getSeries(
  { seriler: ["TP.FG.J0"], baslangic: "2025-01-01", bitis: "2026-10-01", frekans: "aylik" },
  process.env, // TCMB_EVDS_KEY
);
```

</details>

[← Tüm kategoriler](../../../README.md#kaynak-kataloğu)
