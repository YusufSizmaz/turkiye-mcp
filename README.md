<div align="center">

# 🇹🇷 turkiye-mcp

**Türkiye'nin güncel kamu verileri, yapay zekâ asistanınızın içinde.**

TCMB kurları, KAP bildirimleri, AFAD ve Kandilli depremleri, Resmî Gazete, MGM hava durumu,<br>
nöbetçi eczaneler, akaryakıt fiyatları, İstanbul trafiği, namaz vakitleri ve daha fazlası.
Tek bir [MCP](https://modelcontextprotocol.io) sunucusu ve tipli bir TypeScript kütüphanesi.

[![CI](https://github.com/YusufSizmaz/turkiye-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/YusufSizmaz/turkiye-mcp/actions/workflows/ci.yml)
[![Kaynak sağlığı](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2F_genel.json)](https://yusufsizmaz.github.io/turkiye-mcp)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-blue.svg)](LICENSE)
![Node ≥ 20](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-stdio-8A2BE2)

<!-- SAYILAR:BASLA -->

**9 kategori · 25 kaynak (17 resmî) · 25 MCP aracı**

<!-- SAYILAR:BITIR -->

[Kurulum](#-30-saniyede-kurulum) · [Ne sorabilirim?](#-ne-sorabilirim) · [Kaynak kataloğu](#kaynak-kataloğu) · [Kütüphane olarak](#-kütüphane-olarak-kullanım) · [Canlı durum sayfası](https://yusufsizmaz.github.io/turkiye-mcp)

</div>

---

```text
Sen:    Kadıköy'de bugün nöbetçi eczane hangisi, bir de dolar kaç?

Claude: [eczane_get_on_duty, finans_get_exchange_rates]
        Kadıköy'de bu gece 8 nöbetçi eczane var. Size en yakınlardan biri
        Burkay Eczanesi (Göztepe Mah. Mustafakaya Sk. 18/B, Vakıflar Bankası
        karşısı), nöbet 19:00–09:00.
        TCMB'nin bugünkü bültenine göre dolar alış 50,11 / satış 50,20 TL.
        Kaynaklar: 🏛️ İstanbul Eczacı Odası, 🏛️ TCMB.
```

Her yanıt **kaynağını, rozetini ve verinin çekildiği zamanı** taşır. Böylece asistan "bu bilgi TCMB'nin 10.11.2026 15:30 bülteninden" diyebilir. Uydurmaz, eski veriyi yeniymiş gibi sunmaz.

## ⚡ 30 saniyede kurulum

Node.js 20 veya üzeri yeterli. Anahtar ya da kayıt gerekmez.

**Claude Code**

```bash
claude mcp add turkiye -- npx -y github:YusufSizmaz/turkiye-mcp
```

**Claude Desktop** (`claude_desktop_config.json`) · **Cursor** (`.cursor/mcp.json`) · **VS Code / Windsurf** ve diğer MCP istemcileri

```json
{
  "mcpServers": {
    "turkiye": {
      "command": "npx",
      "args": ["-y", "github:YusufSizmaz/turkiye-mcp"]
    }
  }
}
```

İstemciyi yeniden başlatın. Ardından "Bugün Resmî Gazete'de neler var?" diye sorun.

<details>
<summary>Yerel kopyadan çalıştırmak</summary>

```bash
git clone https://github.com/YusufSizmaz/turkiye-mcp.git
cd turkiye-mcp && npm install && npm run build
# istemci ayarında: "command": "node", "args": ["/tam/yol/turkiye-mcp/dist/cli.js"]
```

</details>

## 💬 Ne sorabilirim?

| Soru | Kullanılan araç |
|---|---|
| “Dolar ve euro bugün kaç TL? Gram altın ne kadar?” | `finans_get_exchange_rates`, `finans_get_gold_prices` |
| “THYAO bu hafta KAP'a ne açıkladı, hisse son bir ayda nasıl gitti?” | `finans_get_kap_disclosures`, `finans_get_stock_history` |
| “Son 24 saatte 4'ten büyük deprem oldu mu?” | `deprem_get_recent` |
| “Bugünkü Resmî Gazete'de vergiyle ilgili bir şey var mı?” | `resmi_gazete_get_issue` |
| “İzmir'de hafta sonu hava nasıl, Ankara'nın havası kirli mi?” | `hava_get_forecast`, `hava_get_air_quality` |
| “Çankaya'da nöbetçi eczane? Kadıköy'de benzin kaç TL?” | `eczane_get_on_duty`, `enerji_get_fuel_prices` |
| “İstanbul'da trafik nasıl, Şişli'de boş İSPARK var mı?” | `istanbul_get_traffic_index`, `istanbul_get_parking` |
| “Üsküdar'da akşam ezanı kaçta? Kurban Bayramı ne zaman?” | `takvim_get_prayer_times`, `takvim_get_holidays` |

## 🏷️ Rozetler

Güvenilir şekilde çalışan her kaynak pakete dahil. Hangisine güveneceğinize siz karar verin diye her kaynak etiketli:

| Rozet | Anlamı | Örnek |
|---|---|---|
| 🏛️ **Resmî** | Kamu kurumu, belediye, kamu üniversitesi, meslek odası | TCMB, AFAD, KAP, MGM, İBB, eczacı odaları |
| ✅ **Birinci taraf** | Şirketin kendi verisi için kendi API'si | Opet, BtcTurk, Paribu |
| 🌐 **Topluluk** | Üçüncü taraf veya resmî olmayan kaynak | Truncgil (altın), İş Yatırım, TurkiyeAPI |
| 🔑 **Anahtar** | Ücretsiz kayıtla alınan anahtar ister (ek rozet) | TCMB EVDS, EPİAŞ, Diyanet |
| 🧪 **Deneysel** | Belgeye göre yazıldı, gerçek anahtarla henüz doğrulanmadı | EVDS, EPİAŞ, Diyanet |

Her kaynağın yanındaki **durum rozeti**, GitHub Actions'ın her sabah 09:00'da (TSİ) attığı gerçek istekten gelir. Tüm sonuçlar [durum sayfasında](https://yusufsizmaz.github.io/turkiye-mcp) görünür. Bozulan bir kaynak için otomatik olarak issue açılır.

## Kaynak kataloğu

Her kategoriyi ve kaynağı açarak uç noktaları, araç parametrelerini, örnek soruları ve kod örneklerini görebilirsiniz.

<!-- ICINDEKILER:BASLA -->
- [💱 Finans & Piyasalar](#-finans--piyasalar) — 7 kaynak, 7 araç
- [🌍 Deprem & Afet](#-deprem--afet) — 2 kaynak, 1 araç
- [📜 Resmî Yayınlar](#-resmî-yayınlar) — 1 kaynak, 1 araç
- [🌤️ Hava & Çevre](#-hava--çevre) — 2 kaynak, 3 araç
- [⛽ Enerji & Akaryakıt](#-enerji--akaryakıt) — 2 kaynak, 2 araç
- [💊 Sağlık](#-sağlık) — 3 kaynak, 1 araç
- [🏙️ Şehir Verileri](#-şehir-verileri) — 4 kaynak, 4 araç
- [🗺️ Coğrafya](#-coğrafya) — 1 kaynak, 3 araç
- [📅 Takvim & Vakitler](#-takvim--vakitler) — 3 kaynak, 2 araç
<!-- ICINDEKILER:BITIR -->

<!-- KATALOG:BASLA -->
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

**MCP aracı: `finans_search_kap_companies`** — KAP şirket/fon arama

> Search companies and funds on KAP by name or ticker (şirket ara, hisse kodu bul). Returns name, ticker and KAP company page link.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `sorgu` | metin | ✔ | — | Şirket adı veya kod, ör. "türk hava", "aselsan" |

Örnek sorular:

- “Aselsan'ın hisse kodu ne?”
- “KAP'ta 'enerji' geçen şirketleri bul”

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

**Kütüphane olarak**

```ts
import { kandilli } from "turkiye-mcp";

const { veri } = await kandilli.getEarthquakes({ saat: 6, il: "İzmir" });
```

</details>

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

## 🌤️ Hava & Çevre

MGM anlık hava durumu ve tahminleri, Ulusal Hava Kalitesi İzleme Ağı ölçümleri.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| Meteoroloji Genel Müdürlüğü (MGM) | 🏛️ Resmî | `hava_get_current`<br>`hava_get_forecast` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmgm.json) |
| Ulusal Hava Kalitesi İzleme Ağı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı) | 🏛️ Resmî | `hava_get_air_quality` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fhava-kalitesi.json) |

<details>
<summary><b>Meteoroloji Genel Müdürlüğü (MGM)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fmgm.json" alt="durum" align="top"></summary>

MGM'nin il/ilçe bazında anlık gözlemleri (sıcaklık, hissedilen, nem, rüzgâr, basınç, yağış), 5 günlük ve 3 saatlik tahminleri. mgm.gov.tr'nin kullandığı servis; Origin başlığı gerektirir.

- **Resmî site:** https://www.mgm.gov.tr
- **Önbellek:** 10 dakika

**Uç noktalar**

```text
GET https://servis.mgm.gov.tr/web/merkezler?il={İl}            (Origin: https://www.mgm.gov.tr)
GET https://servis.mgm.gov.tr/web/merkezler/ililcesi?il={İl}
GET https://servis.mgm.gov.tr/web/sondurumlar?merkezid={merkezId}
GET https://servis.mgm.gov.tr/web/tahminler/gunluk?istno={gunlukTahminIstNo}
GET https://servis.mgm.gov.tr/web/tahminler/saatlik?istno={saatlikTahminIstNo}
```

**MCP aracı: `hava_get_current`** — Anlık hava durumu (MGM)

> Current observed weather (hava durumu, sıcaklık) for a Turkish province/district from the Turkish State Meteorological Service (MGM): temperature, feels-like, humidity, wind, pressure, precipitation, condition.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka, ör. "İstanbul", "izmir", "6" |
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy" (Türkçe karakter şart değil). Boşsa il merkezi. |

Örnek sorular:

- “Kadıköy'de hava şu an nasıl?”
- “Ankara'da şu an kaç derece?”

**MCP aracı: `hava_get_forecast`** — Hava tahmini (MGM)

> Weather forecast (hava tahmini) for a Turkish province/district from MGM: 5-day daily min/max and condition, or 3-hourly forecast.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl adı veya plaka, ör. "İstanbul", "izmir", "6" |
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy" (Türkçe karakter şart değil). Boşsa il merkezi. |
| `tur` | `gunluk` \| `saatlik` | — | `"gunluk"` | gunluk: 5 gün · saatlik: 3 saatlik |

Örnek sorular:

- “İzmir'de hafta sonu hava nasıl olacak?”
- “Yarın Bursa'da yağmur var mı?”

**Kütüphane olarak**

```ts
import { mgm } from "turkiye-mcp";

const simdi = await mgm.getCurrent("İstanbul", "Kadıköy");
const tahmin = await mgm.getForecast("ankara");               // 5 günlük
const saatlik = await mgm.getForecast("izmir", undefined, "saatlik");
```

</details>

<details>
<summary><b>Ulusal Hava Kalitesi İzleme Ağı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı)</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fhava-kalitesi.json" alt="durum" align="top"></summary>

Türkiye genelindeki ~335 istasyonun son saatlik hava kalitesi indeksi (HKİ), kategori (İyi/Orta/Hassas/Sağlıksız/Kötü/Tehlikeli) ve baskın kirletici (PM10, PM2.5, NO2, SO2, O3, CO).

- **Resmî site:** https://sim.csb.gov.tr/Services/AirQuality
- **Önbellek:** 10 dakika

**Uç noktalar**

```text
GET  https://sim.csb.gov.tr/Services/GetAirQualityStatus?type=0
POST https://sim.csb.gov.tr/Services/GetAirQualityStations?type=0  {"Location":null,"Date":"DD.MM.YYYY HH:mm:ss"}
```

**MCP aracı: `hava_get_air_quality`** — Hava kalitesi

> Air quality (hava kalitesi, kirlilik, PM10, PM2.5) from Türkiye's National Air Quality Monitoring Network: latest hourly AQI, category and dominant pollutant per station, worst first. Filter by province.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | — | — | İl adı. Boşsa tüm Türkiye (en kötüden iyiye). |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Ankara'da hava kalitesi nasıl?”
- “Şu an Türkiye'de havası en kirli yerler neresi?”

**Kütüphane olarak**

```ts
import { havaKalitesi } from "turkiye-mcp";

const { veri } = await havaKalitesi.getAirQuality({ il: "Ankara" });
console.log(veri[0]?.istasyon, veri[0]?.indeks, veri[0]?.kategori);
```

</details>

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

## 💊 Sağlık

Eczacı odalarından bugünkü nöbetçi eczaneler (İstanbul, Yalova, İzmir, Ankara). Yeni il adaptörlerine katkıya açık.

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| İstanbul Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-istanbul.json) |
| İzmir Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-izmir.json) |
| Ankara Eczacı Odası — Nöbetçi Eczaneler | 🏛️ Resmî | `eczane_get_on_duty` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Feczane-ankara.json) |

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

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, İzmir, Ankara |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

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

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, İzmir, Ankara |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

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

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `il` | metin | ✔ | — | İl: İstanbul, Yalova, İzmir, Ankara |
| `ilce` | metin | — | — | İlçe (İzmir için semt de olur), ör. "Kadıköy", "Çankaya", "Bornova" |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de bugün nöbetçi eczane hangisi?”
- “Çankaya'da açık eczane var mı?”

**Kütüphane olarak**

```ts
import { eczane } from "turkiye-mcp";

const { veri } = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });
```

</details>

## 🏙️ Şehir Verileri

İstanbul'un canlı trafik endeksi ve İSPARK doluluğu; İBB ve İzmir açık veri portallarında arama ve tablo sorgusu (barajlar, hal, ulaşım, afet ve yüzlercesi).

| Kaynak | Rozet | MCP araçları | Durum |
|---|---|---|---|
| İBB Trafik Endeksi | 🏛️ Resmî | `istanbul_get_traffic_index` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-trafik.json) |
| İSPARK Otopark Doluluk | 🏛️ Resmî | `istanbul_get_parking` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fispark.json) |
| İBB Açık Veri Portalı | 🏛️ Resmî | `opendata_search`<br>`opendata_query` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-acik-veri.json) |
| İzmir Büyükşehir Belediyesi Açık Veri Portalı | 🏛️ Resmî | `opendata_search`<br>`opendata_query` | ![durum](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-acik-veri.json) |

<details>
<summary><b>İBB Trafik Endeksi</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-trafik.json" alt="durum" align="top"></summary>

İstanbul'un anlık trafik yoğunluk endeksi (0–100): genel, Anadolu yakası ve Avrupa yakası.

- **Resmî site:** https://uym.ibb.gov.tr
- **Önbellek:** 1 dakika

**Uç noktalar**

```text
GET https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont
```

**MCP aracı: `istanbul_get_traffic_index`** — İstanbul trafik endeksi

> Live Istanbul traffic congestion index 0–100 (trafik yoğunluğu) overall and for the Asian (Anadolu) and European (Avrupa) sides, from İBB.

_Parametre yok._

Örnek sorular:

- “İstanbul'da trafik şu an nasıl?”
- “Anadolu yakasında trafik yoğun mu?”

**Kütüphane olarak**

```ts
import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getTrafficIndex(); // { genel, anadolu, avrupa }
```

</details>

<details>
<summary><b>İSPARK Otopark Doluluk</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fispark.json" alt="durum" align="top"></summary>

İSPARK otoparklarının anlık boş/toplam kapasitesi, türü, çalışma saatleri, ücretsiz süre ve konumu.

- **Resmî site:** https://ispark.istanbul
- **Önbellek:** 1 dakika

**Uç noktalar**

```text
GET https://api.ibb.gov.tr/ispark/Park
```

**MCP aracı: `istanbul_get_parking`** — İSPARK boş otoparklar

> Live İSPARK car park availability in Istanbul (otopark, boş yer): free spaces, capacity, type, hours, free minutes, location. Sorted by most free spaces.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `ilce` | metin | — | — | İlçe, ör. "Kadıköy", "Şişli" |
| `sadeceAcik` | evet/hayır | — | `true` | Yalnız şu an açık otoparklar |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Kadıköy'de boş yeri olan İSPARK otoparkları hangileri?”

**Kütüphane olarak**

```ts
import { ibb } from "turkiye-mcp";

const { veri } = await ibb.getParking({ ilce: "Kadıköy" });
```

</details>

<details>
<summary><b>İBB Açık Veri Portalı</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fibb-acik-veri.json" alt="durum" align="top"></summary>

İstanbul Büyükşehir Belediyesi'nin 500+ veri seti: ulaşım, su ve barajlar, hal, çevre, nüfus, afet… CKAN API ile arama ve tablo sorgusu.

- **Resmî site:** https://data.ibb.gov.tr
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://data.ibb.gov.tr/api/3/action/package_search?q={sorgu}&rows={n}
GET https://data.ibb.gov.tr/api/3/action/datastore_search?resource_id={id}&q=&limit=&sort=
```

**MCP aracı: `opendata_search`** — Belediye açık veri arama

> Search open datasets of Istanbul (İBB) or İzmir metropolitan municipalities (açık veri): transport, dams/baraj, markets/hal, environment, disaster areas… Returns datasets and their resource ids; resources marked queryable can be read with opendata_query.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `sorgu` | metin | ✔ | — | Arama, ör. "baraj doluluk", "hal fiyat", "toplanma alanı" |
| `limit` | sayı | — | `10` |  |

Örnek sorular:

- “İBB açık veride baraj doluluk verisi var mı?”
- “İzmir'de afet toplanma alanları veri seti”

**MCP aracı: `opendata_query`** — Belediye açık veri tablosu sorgula

> Read rows from a queryable (datastore) resource of İBB or İzmir open data portals. Use opendata_search first to find the resource id. Supports full-text filter and sorting.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `kaynakId` | metin | ✔ | — | opendata_search sonucundaki 'sorgulanabilir' kaynak id'si |
| `sorgu` | metin | — | — | Tablo içinde tam metin arama |
| `sirala` | metin | — | — | Sıralama, ör. "_id desc" (en yeni kayıtlar) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Bu veri setinin son 10 kaydını getir”

**Kütüphane olarak**

```ts
import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("ibb", "baraj doluluk");
const tablo = await acikVeri.queryDatastore("ibb", veri.sonuclar[0].kaynaklar[0].id, { limit: 10 });
```

</details>

<details>
<summary><b>İzmir Büyükşehir Belediyesi Açık Veri Portalı</b> — 🏛️ Resmî <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2Fizmir-acik-veri.json" alt="durum" align="top"></summary>

İzmir Büyükşehir Belediyesi'nin açık veri setleri (CKAN): ulaşım, eczaneler, hal fiyatları, afet toplanma alanları…

- **Resmî site:** https://acikveri.bizizmir.com
- **Önbellek:** 1 saat

**Uç noktalar**

```text
GET https://acikveri.bizizmir.com/api/3/action/package_search?q={sorgu}
GET https://acikveri.bizizmir.com/api/3/action/datastore_search?resource_id={id}
```

**MCP aracı: `opendata_search`** — Belediye açık veri arama

> Search open datasets of Istanbul (İBB) or İzmir metropolitan municipalities (açık veri): transport, dams/baraj, markets/hal, environment, disaster areas… Returns datasets and their resource ids; resources marked queryable can be read with opendata_query.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `sorgu` | metin | ✔ | — | Arama, ör. "baraj doluluk", "hal fiyat", "toplanma alanı" |
| `limit` | sayı | — | `10` |  |

Örnek sorular:

- “İBB açık veride baraj doluluk verisi var mı?”
- “İzmir'de afet toplanma alanları veri seti”

**MCP aracı: `opendata_query`** — Belediye açık veri tablosu sorgula

> Read rows from a queryable (datastore) resource of İBB or İzmir open data portals. Use opendata_search first to find the resource id. Supports full-text filter and sorting.

| Parametre | Tip | Zorunlu | Varsayılan | Açıklama |
|---|---|---|---|---|
| `portal` | `ibb` \| `izmir` | ✔ | — | ibb: İstanbul (data.ibb.gov.tr) · izmir: İzmir (acikveri.bizizmir.com) |
| `kaynakId` | metin | ✔ | — | opendata_search sonucundaki 'sorgulanabilir' kaynak id'si |
| `sorgu` | metin | — | — | Tablo içinde tam metin arama |
| `sirala` | metin | — | — | Sıralama, ör. "_id desc" (en yeni kayıtlar) |
| `limit` | sayı | — | `20` | En fazla kaç kayıt döndürülsün (1–200, varsayılan 20) |

Örnek sorular:

- “Bu veri setinin son 10 kaydını getir”

**Kütüphane olarak**

```ts
import { acikVeri } from "turkiye-mcp";

const { veri } = await acikVeri.searchDatasets("izmir", "otobüs");
```

</details>

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

<!-- KATALOG:BITIR -->

## ⚙️ Ayarlar

| Ortam değişkeni | Ne işe yarar |
|---|---|
| `TURKIYE_MCP_CATEGORIES` | Yalnız bu kategorilerin araçlarını yükler, ör. `finans,deprem`. Araç listesini kısa tutmak için idealdir. Geçerli değerler: `finans, deprem, resmi, hava-cevre, enerji, saglik, sehir, cografya, takvim` |
| `TCMB_EVDS_KEY` | TCMB EVDS serilerini açar ([ücretsiz anahtar](https://evds3.tcmb.gov.tr)) |
| `EPIAS_USERNAME`, `EPIAS_PASSWORD` | EPİAŞ elektrik piyasası verilerini açar ([ücretsiz üyelik](https://kayit.epias.com.tr)) |
| `DIYANET_EMAIL`, `DIYANET_PASSWORD` | Namaz vakitlerini doğrudan Diyanet'in resmî API'sinden alır ([kayıt](https://awqatsalah.diyanet.gov.tr)). Tanımlı değilse anahtarsız ayna kullanılır. |

```json
{
  "mcpServers": {
    "turkiye": {
      "command": "npx",
      "args": ["-y", "github:YusufSizmaz/turkiye-mcp"],
      "env": { "TURKIYE_MCP_CATEGORIES": "finans,deprem,resmi", "TCMB_EVDS_KEY": "..." }
    }
  }
}
```

Anahtarı tanımlanmamış kaynakların araçları listede görünmez. `list_sources` aracı her zaman bulunur ve hangi kaynağın kapalı olduğunu, nasıl açılacağını söyler.

## 📦 Kütüphane olarak kullanım

Aynı kaynaklar tipli fonksiyonlar olarak da kullanılabilir. Her fonksiyon `{ veri, kaynak: { ad, rozet, url, alinmaZamani }, not? }` döndürür.

```bash
npm install github:YusufSizmaz/turkiye-mcp
```

```ts
import { afad, eczane, mgm, resmiGazete, tcmb } from "turkiye-mcp";

const { veri: kurlar } = await tcmb.getRates();
const depremler = await afad.getEarthquakes({ saat: 24, minBuyukluk: 4 });
const gazete = await resmiGazete.getIssue({ arama: "yönetmelik" });
const hava = await mgm.getCurrent("İzmir", "Bornova");
const nobetci = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });
```

Hatalar `KaynakHatasi` olarak gelir. `tur` alanı şu değerlerden birini alır: `zaman-asimi`, `http`, `ayristirma`, `anahtar-yok`, `desteklenmiyor` veya `bulunamadi`. Mesajlar Türkçedir.

## 🧱 Nasıl çalışır?

```text
src/
├─ core/          HTTP (zaman aşımı, tekrar, windows-1254), TTL önbellek, Türkçe metin/tarih yardımcıları, 81 il
├─ sources/
│  ├─ finans/     tcmb · kap · evds · truncgil · isyatirim · btcturk · paribu
│  ├─ deprem/     afad · kandilli
│  ├─ resmi/      resmi-gazete
│  ├─ hava-cevre/ mgm · hava-kalitesi
│  ├─ enerji/     opet · epias
│  ├─ saglik/     eczane/{istanbul, izmir, ankara}
│  ├─ sehir/      ibb (trafik, İSPARK) · ckan (İBB ve İzmir açık veri)
│  ├─ cografya/   turkiyeapi
│  └─ takvim/     tatiller · namaz
├─ mcp/           araç tanımı + sunucu (anahtar/kategori filtresi, kaynak bloğu)
└─ registry.ts    tüm kategorilerin tek listesi: README, list_sources ve sağlık kontrolü buradan beslenir
```

- **Saat dilimi:** Tüm tarihler `Europe/Istanbul`'a göre hesaplanır. Sunucu UTC'de çalışsa bile gece yarısından sonra "bugün" yanlış güne kaymaz.
- **Türkçe girdi:** "kadikoy", "KADIKÖY" ve "Kadıköy" aynı yere eşlenir. Afyon, Urfa ve Maraş gibi kısa adlar da tanınır.
- **Tatil ve yayımlanmamış gün:** Hafta sonu istenen TCMB kuru ya da henüz çıkmamış Resmî Gazete için önceki geçerli gün döndürülür ve bu durum `not` alanında açıkça belirtilir.
- **Nezaket:** Her kaynağın kendi önbellek süresi var (depremde 30 sn, coğrafyada 1 gün). Liste döndüren araçların hepsi `limit` parametresi alır.

## 🛠️ Geliştirme

```bash
npm install
npm test             # ağa çıkmayan, gerçek yanıt kayıtlarıyla (fixture) unit testler
npm run test:live    # tüm kaynaklara gerçek istek
npm run health       # canlı kontrol + durum sitesi (site-dist/)
npm run readme       # bu README'deki kataloğu registry'den yeniden üretir
npm run dev          # MCP sunucusunu stdio'da başlatır
```

Yeni bir kaynak ya da yeni bir il için nöbetçi eczane adaptörü eklemek mi istiyorsunuz? [CONTRIBUTING.md](CONTRIBUTING.md) dosyasında adım adım anlatılıyor.

## 🔭 Yakında ve neden yok?

| Kaynak | Durum |
|---|---|
| İstanbul baraj doluluk (canlı) | İSKİ'nin canlı servisi herkese açık değil. İBB açık verideki set 2024'te kalmış. Geçmiş veriye `opendata_search` ile ulaşılabilir. |
| İBB hal fiyatları | Servis şu an kararlı yanıt vermiyor. Takipte. |
| Diğer illerin nöbetçi eczaneleri | Her il ayrı bir adaptör gerektiriyor. Katkıya açık! |
| data.gov.tr | Alan adı şu an çözülmüyor. |
| YSK seçim sonuçları | Site otomatik istemcilere bağlantıyı kesiyor. |
| doviz.com, Harem Altın | Anahtar istiyor veya uç nokta kapalı. Altın için Truncgil kullanılıyor. |
| TÜİK | Herkese açık, belgelenmiş bir API'si yok. Seriler EVDS üzerinden alınabiliyor. |

## ⚖️ Sorumluluk reddi

Veriler kaynaklardan olduğu gibi alınır. turkiye-mcp hiçbir kurumla bağlantılı değildir ve verilerin doğruluğunu garanti etmez. Finansal veriler yatırım tavsiyesi değildir. Deprem bilgisi resmî uyarıların yerini tutmaz. Kaynakların kullanım koşullarına uyun. Nöbetçi eczane bilgisini gitmeden önce telefonla teyit edin.

## 🇬🇧 English

**turkiye-mcp** is an MCP server and a typed TypeScript library that gives AI assistants live, source-attributed access to Turkish public data: Central Bank FX rates, KAP stock-exchange disclosures, AFAD and Kandilli earthquakes, the Official Gazette, weather and air quality, on-duty pharmacies, fuel prices, Istanbul traffic and parking, prayer times, holidays and administrative geography. Every result carries its source, a trust badge (🏛️ official / ✅ first-party / 🌐 community) and a fetch timestamp. All sources are checked live every day and the results are published to a [status page](https://yusufsizmaz.github.io/turkiye-mcp). Install with `claude mcp add turkiye -- npx -y github:YusufSizmaz/turkiye-mcp`. Tool names are English. Outputs are in Turkish.

## Lisans

[MIT](LICENSE) © Yusuf Sızmaz
