<div align="center">

# 🇹🇷 turkiye-mcp

**Türkiye'nin güncel kamu verileri, yapay zekâ asistanınızın içinde.**

Döviz, borsa, deprem, Resmî Gazete, hava, nöbetçi eczane, akaryakıt, şehir verileri, namaz vakitleri…<br>
Tek bir [MCP](https://modelcontextprotocol.io) sunucusu · tipli TypeScript kütüphanesi · her yanıtta kaynak ve zaman.

[![CI](https://github.com/YusufSizmaz/turkiye-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/YusufSizmaz/turkiye-mcp/actions/workflows/ci.yml)
[![Kaynak sağlığı](https://img.shields.io/endpoint?url=https%3A%2F%2Fyusufsizmaz.github.io%2Fturkiye-mcp%2Fbadges%2F_genel.json)](https://yusufsizmaz.github.io/turkiye-mcp)
[![Lisans: MIT](https://img.shields.io/badge/lisans-MIT-blue.svg)](LICENSE)
![Node ≥ 20](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)

<!-- SAYILAR:BASLA -->

**9 kategori · 32 kaynak (24 resmî) · 31 MCP aracı**

<!-- SAYILAR:BITIR -->

</div>

## ⚡ Kurulum

```bash
claude mcp add turkiye -- npx -y github:YusufSizmaz/turkiye-mcp
```

Claude Desktop, Cursor, VS Code ve diğer MCP istemcileri için:

```json
{ "mcpServers": { "turkiye": { "command": "npx", "args": ["-y", "github:YusufSizmaz/turkiye-mcp"] } } }
```

Node.js 20+ yeterli; anahtar veya kayıt gerekmez. İstemciyi yeniden başlatıp sorun: *“Bugün Resmî Gazete'de neler var?”*

## 📚 Araçlar

<!-- KATEGORILER:BASLA -->

[💱 Finans & Piyasalar](#-finans--piyasalar) · [🌍 Deprem & Afet](#-deprem--afet) · [📜 Resmî Yayınlar](#-resmî-yayınlar) · [🌤️ Hava & Çevre](#-hava--çevre) · [⛽ Enerji & Akaryakıt](#-enerji--akaryakıt) · [💊 Sağlık](#-sağlık) · [🏙️ Şehir Verileri](#-şehir-verileri) · [🗺️ Coğrafya](#-coğrafya) · [📅 Takvim & Vakitler](#-takvim--vakitler)

<!-- KATEGORILER:BITIR -->

<!-- ARACLAR:BASLA -->

### 💱 Finans & Piyasalar

Döviz kurları, altın, BIST hisseleri ve endeksleri, kripto paralar, KAP bildirimleri ve TCMB EVDS serileri.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `finans_get_exchange_rates` | TCMB döviz kurları | “Dolar ve euro bugün kaç TL?” |
| `finans_get_kap_disclosures` | KAP bildirimleri | “KAP'a son düşen bildirimler neler?” |
| `finans_search_kap_companies` | KAP şirket/fon arama | “Aselsan'ın hisse kodu ne?” |
| `finans_get_gold_prices` | Altın ve değerli metal fiyatları | “Gram altın ve çeyrek altın şu an kaç TL?” |
| `finans_get_stock_history` | BIST hisse fiyat geçmişi | “THYAO son bir ayda nasıl gitti?” |
| `finans_get_crypto_prices` | Kripto para fiyatları (TL) | “Bitcoin şu an kaç TL?” |
| `finans_get_evds_series` | TCMB EVDS zaman serileri | “TÜFE endeksi (TP.FG.J0) son 12 ayda nasıl değişti?” |
| `finans_get_bist_index` | BIST endeks bileşenleri | “BIST 30'da hangi hisseler var?” |

**Kaynaklar:** 🏛️ TCMB · 🏛️ KAP · 🌐 Truncgil · 🌐 İş Yatırım · ✅ BtcTurk · ✅ Paribu · 🏛️ TCMB EVDS 🔑 · 🏛️ Borsa İstanbul  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/finans/README.md)

### 🌍 Deprem & Afet

AFAD ve Kandilli Rasathanesi'nden son depremler.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `deprem_get_recent` | Son depremler | “Son 24 saatte 4'ten büyük deprem oldu mu?” |

**Kaynaklar:** 🏛️ AFAD · 🏛️ Kandilli Rasathanesi  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/deprem/README.md)

### 📜 Resmî Yayınlar

Resmî Gazete'nin günlük sayıları ve Mevzuat Bilgi Sistemi'nde kanun, yönetmelik ve tebliğ araması.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `resmi_gazete_get_issue` | Resmî Gazete günlük sayı | “Bugünkü Resmî Gazete'de neler var?” |
| `resmi_mevzuat_search` | Mevzuat arama | “Kişisel verilerle ilgili yönetmelikler hangileri?” |

**Kaynaklar:** 🏛️ Resmî Gazete · 🏛️ Mevzuat Bilgi Sistemi  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/resmi/README.md)

### 🌤️ Hava & Çevre

MGM anlık hava durumu ve tahminleri, Ulusal Hava Kalitesi İzleme Ağı ölçümleri.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `hava_get_current` | Anlık hava durumu (MGM) | “Kadıköy'de hava şu an nasıl?” |
| `hava_get_forecast` | Hava tahmini (MGM) | “İzmir'de hafta sonu hava nasıl olacak?” |
| `hava_get_air_quality` | Hava kalitesi | “Ankara'da hava kalitesi nasıl?” |

**Kaynaklar:** 🏛️ MGM · 🏛️ Ulusal Hava Kalitesi Ağı 🇹🇷  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/hava-cevre/README.md)

### ⛽ Enerji & Akaryakıt

İl/ilçe bazında akaryakıt pompa fiyatları ve EPİAŞ elektrik piyasası verileri.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `enerji_get_fuel_prices` | Akaryakıt fiyatları (Opet) | “Kadıköy'de benzin litresi kaç TL?” |
| `enerji_get_electricity_market` | Elektrik piyasası (EPİAŞ) | “Bugün elektrik piyasa takas fiyatı saatlik ne kadar?” |

**Kaynaklar:** ✅ Opet · 🏛️ EPİAŞ 🔑  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/enerji/README.md)

### 💊 Sağlık

Eczacı odalarından bugünkü nöbetçi eczaneler (İstanbul, Yalova, Ankara, İzmir, Adana, Mersin). Yeni il adaptörlerine katkıya açık.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `eczane_get_on_duty` | Nöbetçi eczaneler | “Kadıköy'de bugün nöbetçi eczane hangisi?” |

**Kaynaklar:** 🏛️ İstanbul Eczacı Odası · 🏛️ Ankara Eczacı Odası 🇹🇷 · 🏛️ İzmir BB · 🏛️ Adana Eczacı Odası · 🏛️ Mersin Eczacı Odası  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/saglik/README.md)

### 🏙️ Şehir Verileri

İstanbul trafik endeksi ve İSPARK; İzmir hal fiyatları, İZBAN/vapur saatleri ve kent rehberi; İBB ve İzmir açık veri portallarında arama.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `istanbul_get_traffic_index` | İstanbul trafik endeksi | “İstanbul'da trafik şu an nasıl?” |
| `istanbul_get_parking` | İSPARK boş otoparklar | “Kadıköy'de boş yeri olan İSPARK otoparkları hangileri?” |
| `opendata_search` | Belediye açık veri arama | “İBB açık veride baraj doluluk verisi var mı?” |
| `opendata_query` | Belediye açık veri tablosu sorgula | “Bu veri setinin son 10 kaydını getir” |
| `izmir_get_market_prices` | İzmir hal fiyatları | “İzmir halinde domatesin kilosu kaç lira?” |
| `izmir_get_izban_times` | İZBAN sefer saatleri | “Alsancak'tan Menemen'e bir sonraki İZBAN kaçta?” |
| `izmir_get_ferry_times` | İzmir vapur saatleri | “Karşıyaka'dan Konak'a vapur saatleri” |
| `izmir_find_places` | İzmir kent rehberi | “Bornova'daki afet toplanma alanları nerede?” |

**Kaynaklar:** 🏛️ İBB Trafik 🇹🇷 · 🏛️ İSPARK 🇹🇷 · 🏛️ İzmir BB (hal) · 🏛️ İzmir BB (ulaşım) · 🏛️ İzmir BB (kent rehberi) · 🏛️ İBB Açık Veri 🇹🇷 · 🏛️ İzmir Açık Veri  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/sehir/README.md)

### 🗺️ Coğrafya

81 il, ilçe ve mahalle bilgileri: nüfus, yüzölçümü, rakım, bölge, plaka, telefon kodu, koordinat.

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `cografya_get_provinces` | İl bilgileri | “Ankara'nın nüfusu ve yüzölçümü ne?” |
| `cografya_get_districts` | İlçeler | “İzmir'in en kalabalık ilçeleri hangileri?” |
| `cografya_get_neighborhoods` | Mahalleler | “Kadıköy'ün mahalleleri ve nüfusları” |

**Kaynaklar:** 🌐 TurkiyeAPI  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/cografya/README.md)

### 📅 Takvim & Vakitler

Resmî tatiller ve dinî bayramlar; il/ilçe bazında namaz vakitleri (Diyanet verisi).

| Araç | Ne yapar | Örnek soru |
|---|---|---|
| `takvim_get_holidays` | Resmî tatiller | “Bu yıl Kurban Bayramı ne zaman?” |
| `takvim_get_prayer_times` | Namaz vakitleri | “İstanbul'da bugün akşam ezanı kaçta?” |

**Kaynaklar:** 🌐 Nager.Date · 🌐 Ezan Vakti 🇹🇷 · 🏛️ Diyanet 🔑  
[Parametreler, uç noktalar ve kod örnekleri →](src/sources/takvim/README.md)

<!-- ARACLAR:BITIR -->

## 🏷️ Kaynak rozetleri

| | Anlamı |
|---|---|
| 🏛️ | **Resmî** — kamu kurumu, belediye, meslek odası (TCMB, AFAD, KAP, MGM, İBB…) |
| ✅ | **Birinci taraf** — şirketin kendi API'si (Opet, BtcTurk, Paribu) |
| 🌐 | **Topluluk** — üçüncü taraf kaynak (Truncgil, İş Yatırım, TurkiyeAPI…) |
| 🔑 | Ücretsiz anahtar ister — tanımlı değilse araç listede görünmez |
| 🇹🇷 | Yurt dışı IP'lerini engelliyor — Türkiye'den çalışır |

Her yanıtın sonunda kaynak, rozet ve verinin çekildiği zaman yazar. Tüm kaynaklar her sabah canlı test edilir: **[durum sayfası →](https://yusufsizmaz.github.io/turkiye-mcp)**

## ⚙️ Ayarlar

| Ortam değişkeni | Ne işe yarar |
|---|---|
| `TURKIYE_MCP_CATEGORIES` | Yalnız seçilen kategoriler, ör. `finans,deprem` (araç listesini kısaltır) |
| `TCMB_EVDS_KEY` | TCMB EVDS serileri — [ücretsiz anahtar](https://evds3.tcmb.gov.tr) |
| `EPIAS_USERNAME` · `EPIAS_PASSWORD` | EPİAŞ elektrik piyasası — [ücretsiz üyelik](https://kayit.epias.com.tr) |
| `DIYANET_EMAIL` · `DIYANET_PASSWORD` | Namaz vakitleri doğrudan Diyanet API'sinden — [kayıt](https://awqatsalah.diyanet.gov.tr) |

## 📦 Kütüphane olarak

```ts
import { afad, eczane, mgm, tcmb } from "turkiye-mcp";   // npm i github:YusufSizmaz/turkiye-mcp

const kurlar = await tcmb.getRates();
const depremler = await afad.getEarthquakes({ saat: 24, minBuyukluk: 4 });
const hava = await mgm.getCurrent("İzmir", "Bornova");
const nobetci = await eczane.getOnDuty({ il: "Ankara", ilce: "Çankaya" });
// her biri → { veri, kaynak: { ad, rozet, url, alinmaZamani }, not? }
```

## 🛠️ Geliştirme

```bash
npm install && npm test   # kayıtlı gerçek yanıtlarla unit testler
npm run test:live         # tüm kaynaklara canlı istek
npm run readme            # bu sayfadaki araç listesini yeniden üretir
```

Yeni kaynak veya yeni il için nöbetçi eczane eklemek: [CONTRIBUTING.md](CONTRIBUTING.md)

## ⚖️ Sorumluluk reddi

Veriler kaynaklardan olduğu gibi alınır; turkiye-mcp hiçbir kurumla bağlantılı değildir. Finansal veriler yatırım tavsiyesi değildir, deprem bilgisi resmî uyarıların yerini tutmaz, nöbetçi eczaneyi gitmeden önce telefonla teyit edin.

<details>
<summary>🇬🇧 English</summary>

**turkiye-mcp** is an MCP server and typed TypeScript library giving AI assistants live, source-attributed access to Turkish public data: Central Bank FX, KAP disclosures, Borsa Istanbul indices, earthquakes (AFAD, Kandilli), the Official Gazette and legislation search, weather and air quality, on-duty pharmacies, fuel prices, Istanbul and İzmir city data, prayer times and holidays. Every result carries its source, a trust badge and a timestamp; all sources are checked daily ([status page](https://yusufsizmaz.github.io/turkiye-mcp)). Install: `claude mcp add turkiye -- npx -y github:YusufSizmaz/turkiye-mcp`. Tool names are English; outputs are Turkish.

</details>

## Lisans

[MIT](LICENSE) © Yusuf Sızmaz
