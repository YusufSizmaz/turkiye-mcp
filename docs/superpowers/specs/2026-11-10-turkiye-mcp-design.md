# turkiye-mcp — Tasarım Belgesi

Tarih: 2026-11-10 · Repo: https://github.com/YusufSizmaz/turkiye-mcp (public)

## 1. Amaç ve neden

Türkiye'nin güncel, kamuya açık verilerini (kurlar, depremler, KAP, Resmî Gazete, hava, nöbetçi eczane, şehir verileri…) **tek bir açık kaynak projede** toplamak. Bugün bu veriler onlarca farklı sitede, farklı formatlarda (XML, JSON, windows-1254 HTML) ve belgesiz iç API'lerde dağınık duruyor.

Proje iki şekilde kullanılabilir:

1. **MCP sunucusu**: Claude Desktop, Claude Code, Cursor vb. araçlara eklenir. Kullanıcı "dolar bugün kaç?", "son 24 saatte 4+ deprem var mı?", "Kadıköy'de nöbetçi eczane?" diye sorduğunda yapay zekâ cevabı doğrudan kaynaktan alır.
2. **TypeScript kütüphanesi**: Geliştiriciler `import { tcmb, afad } from "turkiye-mcp"` ile aynı kaynakları tipli fonksiyonlar olarak kullanır.

Kaynak politikası (kullanıcının kararı): **Güvenilir şekilde çalışan her kaynak girer. Kullanıp kullanmamaya kullanıcı karar verir.** Resmî olanlar rozetle işaretlenir.

Başarı ölçütü: Repo GitHub'da düzgün görünmeli (kategorize edilmiş, rozetli, kaynak durum tablosu canlı olmalı). Her araç bugün gerçekten veri döndürmeli. Türk geliştirici topluluğunda paylaşılabilecek kalitede olmalı.

## 2. Hedefler / hedef olmayanlar / anti-hedefler

**Hedefler**
- Aşağıdaki kataloğun (§4) tamamını v1'de çalışır şekilde sunmak.
- Her kaynağın: tipli bir istemci fonksiyonu, bir veya daha fazla MCP aracı, rozet metadatası ve testi olmalı.
- Her araç çıktısında **kaynak bilgisi** yer almalı: kaynak adı, rozet, URL ve veri çekilme zamanı. Böylece yapay zekâ "bu veri TCMB'den, 21:15'te alındı" diyebilir.
- Kategori bazlı, okunaklı repo yapısı ve README.
- Kaynakların sağlığını düzenli olarak kontrol eden bir CI iş akışı.
- `npx turkiye-mcp` ile çalışmaya hazır paket yapısı.

**Hedef olmayanlar (v1)**
- npm'e yayınlamak. Paket hazır olacak, ama yayınlama sonraki bir karar.
- Uzak (HTTP / Streamable HTTP) sunucu ve barındırma. v1 yalnızca stdio.
- Veritabanı, kalıcı depolama, geçmiş veri arşivleme.
- Ücretli API'ler ve e-Devlet gibi giriş gerektiren servisler.
- Web arayüzü.

**Anti-hedefler (teknik olarak çalışsa bile başarısızlık sayılır)**
- Bir aracın bayat ya da yanlış veriyi **kaynak ve zaman belirtmeden** döndürmesi.
- Kaynak bozulduğunda belirsiz hata vermek. Hata mesajı hangi kaynağın, neden çalışmadığını Türkçe ve açıkça söylemeli.
- Araç listesinin, yapay zekâyı şaşırtacak kadar kalabalık ve karışık olması.
- PR CI'ının dış sitelere bağlı olup rastgele kırılması. Canlı testler PR CI'ından ayrı tutulmalı.
- Commit'lerde ve PR'larda Claude imzası veya co-author satırı olması. Yazar yalnızca `YusufSizmaz <yusuf.sizmaz11@gmail.com>`.

## 3. Rozet sistemi

Her kaynağın metadatasında `badge` ve `requiresKey` alanları bulunur. README'de ve araç çıktısında gösterilir.

| Rozet | Anlamı | Örnek |
|---|---|---|
| 🏛️ **Resmî** | Kamu kurumu / devlet / kamu üniversitesi | TCMB, AFAD, Kandilli, MGM, KAP, İBB |
| ✅ **Birinci taraf** | Şirketin kendi verisi için kendi API'si | Opet, BtcTurk, Paribu |
| 🌐 **Topluluk** | Üçüncü taraf veya resmî olmayan kaynak | Truncgil, İş Yatırım, Ezan Vakti mirror'ı, turkiyeapi.dev, Nager |
| 🔑 **Anahtar gerekli** | Ek rozet. Ücretsiz kayıtla alınan anahtar ister | EVDS, EPİAŞ, Diyanet |

(Kullanıcının istediği tek ayrım "resmî rozet". ✅ ile 🌐 ayrımını ben ekledim, çünkü BtcTurk'ün kendi API'si ile bir aracı site aynı güven düzeyinde değil.)

## 4. Kaynak kataloğu (10 Kasım 2026'da canlı test edildi)

Durum: ✅ çalışıyor · ⚠️ çalışıyor ama ek iş gerekiyor

### 4.1 `finans` — Finans ve piyasalar
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| TCMB günlük kurlar | 🏛️ | `https://www.tcmb.gov.tr/kurlar/today.xml` | ✅ |
| TCMB geçmiş kurlar | 🏛️ | `https://www.tcmb.gov.tr/kurlar/YYYYMM/DDMMYYYY.xml` (hafta sonu/tatilde 404 → önceki iş gününe düş) | ✅ |
| TCMB EVDS (seriler) | 🏛️🔑 | `https://evds3.tcmb.gov.tr/igmevdsms-dis/series=…&startDate=…&endDate=…&type=json`, `key` header'ı ile. Env: `TCMB_EVDS_KEY` | ✅ (anahtarsız 403 döndüğü doğrulandı) |
| KAP bildirimleri | 🏛️ | `GET https://www.kap.org.tr/tr/api/disclosure/list/light` (son bildirimler); `POST …/api/disclosure/list/main` body `{"fromDate":"DD.MM.YYYY","toDate":"DD.MM.YYYY","memberTypes":["IGS"],"disclosureClass":""}` (tarih aralığı, hisse kodlu) | ✅ |
| KAP şirket arama | 🏛️ | `api/search/combined` / `api/member/filter` (sitenin JS'inden çıkarıldı, parametreler doğrulanmalı) | ⚠️ |
| Altın / serbest piyasa | 🌐 | `https://finans.truncgil.com/v4/today.json` | ✅ |
| BIST hisse geçmişi | 🌐 | `https://www.isyatirim.com.tr/_layouts/15/Isyatirim.Website/Common/Data.aspx/HisseTekil?hisse=THYAO&startdate=DD-MM-YYYY&enddate=DD-MM-YYYY` | ✅ |
| Kripto (BtcTurk) | ✅ | `https://api.btcturk.com/api/v2/ticker?pairSymbol=BTCTRY` | ✅ |
| Kripto (Paribu) | ✅ | `https://www.paribu.com/ticker` | ✅ |

### 4.2 `deprem` — Deprem ve afet
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| AFAD | 🏛️ | `https://servisnet.afad.gov.tr/apigateway/deprem/apiv2/event/filter?start=…&end=…&minmag=…&limit=…` (eski `deprem.afad.gov.tr/apiv2` buraya 302 veriyor; doğrudan yeni adres kullanılmalı) | ✅ |
| Kandilli (KOERI) | 🏛️ | `http://www.koeri.boun.edu.tr/scripts/lst0.asp`: windows-1254, `<pre>` içinde sabit genişlikli metin, ayrıştırılmalı | ✅ |

### 4.3 `resmi` — Resmî yayınlar
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| Resmî Gazete (günlük sayı) | 🏛️ | `https://www.resmigazete.gov.tr/eskiler/YYYY/MM/YYYYMMDD.htm`: windows-1254. Sayı no, bölümler (YÜRÜTME VE İDARE, YÖNETMELİKLER, İLÂN…) ve madde başlıkları + linkleri ayrıştırılmalı | ✅ |

Mevzuat.gov.tr'de arama yapmak v1 için kapsam dışı. Builder kolay bir uç nokta bulursa ekleyebilir.

### 4.4 `hava-cevre` — Hava ve çevre
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| MGM istasyon arama | 🏛️ | `https://servis.mgm.gov.tr/web/merkezler?il=Ankara[&ilce=…]`: **`Origin: https://www.mgm.gov.tr` header'ı zorunlu** | ✅ |
| MGM anlık gözlem | 🏛️ | `…/web/sondurumlar?merkezid=…` | ✅ |
| MGM 5 günlük tahmin | 🏛️ | `…/web/tahminler/gunluk?istno=…` | ✅ |
| MGM saatlik tahmin | 🏛️ | `…/web/tahminler/saatlik?istno=…` (doğrulanmalı) | ⚠️ |
| Hava kalitesi (Çevre Bakanlığı) | 🏛️ | `https://sim.csb.gov.tr/Services/GetAirQualityStatus?type=0` (kategoriler) ✅. İstasyon ve ölçüm verisi için sitenin JS'inden uç nokta bulunmalı | ⚠️ |

MGM hadise kodları (`PUS`, `A`, `KKY`…) Türkçe açıklamaya çevrilmeli.

### 4.5 `enerji` — Enerji ve akaryakıt
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| Akaryakıt fiyatları (Opet) | ✅ | `https://api.opet.com.tr/api/fuelprices/prices?ProvinceCode=34`: ilçe bazında. İstanbul 34 yerine Anadolu/Avrupa ayrımı var, bu kontrol edilmeli | ✅ |
| Elektrik piyasası (EPİAŞ Şeffaflık) | 🏛️🔑 | `https://seffaflik.epias.com.tr/electricity-service/v1/…`: TGT (ticket) ile kimlik doğrulama. Env: `EPIAS_USERNAME`, `EPIAS_PASSWORD`. Kapsam: PTF (piyasa takas fiyatı), gerçek zamanlı tüketim | ✅ (401 döndüğü doğrulandı) |

### 4.6 `saglik` — Nöbetçi eczane
Ülke çapında ücretsiz ve tek bir kaynak yok. **İl bazlı adaptör deseni** kullanılacak: her il için bir adaptör olacak, ortak bir çıktı tipine dönüşecek (`ad, ilçe, adres, telefon, konum?`).

| İl | Rozet | Uç nokta | Durum |
|---|---|---|---|
| İstanbul (+Yalova) | 🏛️ (İstanbul Eczacı Odası) | Sayfa: `https://www.istanbuleczaciodasi.org.tr/nobetci-eczane/`. İç API: `/api/nobetci-eczane-web/` (parametresiz çağrıda 400 "Geçersiz istek" dönüyor). Parametreler `/nobetci-eczane/yeni/js/main.js`'ten çıkarılmalı. İlçe listesi sayfada gömülü JSON olarak var | ⚠️ |
| İzmir | 🏛️ (İzmir Eczacı Odası) | `https://www.izmireczaciodasi.org.tr/nobetci-eczaneler`: HTML'de eczane adları görünüyor, ayrıştırılabilir | ✅ |
| Ankara | 🏛️ (Ankara Eczacı Odası) | `https://www.aeo.org.tr/nobetci-eczaneler`: veri JS ile yükleniyor (`fetch(url…)`), çağrılan uç nokta bulunmalı | ⚠️ |

Eczacı odaları kamu kurumu niteliğinde meslek kuruluşlarıdır, bu yüzden 🏛️ sayıldı. Desteklenmeyen bir il sorulduğunda araç desteklenen illeri listeler ve katkı çağrısı yapar.

### 4.7 `sehir` — Şehir verileri
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| İBB trafik endeksi | 🏛️ | `https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndex_Sc1_Cont` → `{"TI":27,"TI_An":17,"TI_Av":35}` (genel / Anadolu / Avrupa) | ✅ |
| İSPARK otopark doluluk | 🏛️ | `https://api.ibb.gov.tr/ispark/Park` (ilçe filtresi istemci tarafında) | ✅ |
| İBB açık veri portalı | 🏛️ | CKAN: `https://data.ibb.gov.tr/api/3/action/{package_search,package_show,datastore_search}` | ✅ |
| İSKİ baraj doluluk | 🏛️ | İBB CKAN'da `baraj` araması ile bulunan veri seti (datastore veya CSV kaynağı) | ✅ |
| İBB hal fiyatları | 🏛️ | İBB CKAN'da `hal fiyat` veri seti | ✅ |
| İzmir açık veri portalı | 🏛️ | CKAN: `https://acikveri.bizizmir.com/api/3/action/…` | ✅ |

CKAN için tek bir genel istemci yazılacak. Belirli veri setleri (baraj, hal) bu istemcinin üzerinde ince sarmalayıcılar olacak.

### 4.8 `cografya` — Coğrafya
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| İl / ilçe / mahalle | 🌐 | `https://api.turkiyeapi.dev/v1/{provinces,districts,neighborhoods}` (nüfus, alan, plaka, NUTS, koordinat) | ✅ |

### 4.9 `takvim` — Takvim ve dinî vakitler
| Kaynak | Rozet | Uç nokta | Durum |
|---|---|---|---|
| Resmî tatiller | 🌐 | `https://date.nager.at/api/v3/PublicHolidays/{yıl}/TR` (bayramlar dahil) | ✅ |
| Namaz vakitleri (Diyanet) | 🏛️🔑 | `https://awqatsalah.diyanet.gov.tr`: e-posta/şifre ile `/Auth/Login` → token. Env: `DIYANET_EMAIL`, `DIYANET_PASSWORD` | ✅ (uç nokta canlı) |
| Namaz vakitleri (Ezan Vakti) | 🌐 | `https://ezanvakti.emushaf.net/{ulkeler, sehirler/{ulkeId}, ilceler/{sehirId}, vakitler/{ilceId}}`. Diyanet verisinin mirror'ı, anahtar istemiyor. **Diyanet anahtarı yoksa varsayılan olarak bu kullanılır** | ✅ |

### Elenen kaynaklar (README'de "neden yok" bölümünde listelenecek)
data.gov.tr (alan adı çözülmüyor), YSK (bağlantıyı kesiyor), doviz.com (anahtar istiyor ve kapalı), Harem Altın JSON (404), e-Devlet nöbetçi eczane (giriş ve form gerekiyor), TÜİK veri portalı (herkese açık bir API bulunamadı).

## 5. Teknik kararlar (benim kararlarım)

- **Dil ve çalışma ortamı:** TypeScript, ESM, Node ≥ 20. Yerleşik `fetch` kullanılacak.
- **MCP:** `@modelcontextprotocol/sdk`, stdio taşıma. Girdi şemaları için `zod`.
- **Ayrıştırma:** `fast-xml-parser` (TCMB), `cheerio` (HTML), `iconv-lite` (windows-1254: Kandilli ve Resmî Gazete).
- **Build:** `tsup` (ESM + `.d.ts`). **Test:** `vitest`. **Lint/format:** Biome (tek araç, hızlı).
- **Lisans:** MIT.

### 5.1 Repo yapısı
```
turkiye-mcp/
├─ src/
│  ├─ core/            # http (timeout, retry, UA, encoding), cache (TTL), hatalar, kaynak metadata tipi
│  ├─ sources/
│  │  ├─ finans/       # tcmb.ts, evds.ts, kap.ts, truncgil.ts, isyatirim.ts, btcturk.ts, paribu.ts, README.md
│  │  ├─ deprem/       # afad.ts, kandilli.ts, README.md
│  │  ├─ resmi/        # resmi-gazete.ts
│  │  ├─ hava-cevre/   # mgm.ts, hava-kalitesi.ts
│  │  ├─ enerji/       # opet.ts, epias.ts
│  │  ├─ saglik/       # eczane/{index.ts, istanbul.ts, izmir.ts, ankara.ts}
│  │  ├─ sehir/        # ckan.ts, ibb.ts, izmir.ts
│  │  ├─ cografya/     # turkiyeapi.ts
│  │  └─ takvim/       # tatiller.ts, namaz.ts (diyanet + ezanvakti)
│  ├─ mcp/
│  │  ├─ tools/        # kategori başına bir dosya: tools'u kaydeder
│  │  └─ server.ts
│  ├─ registry.ts      # tüm kaynakların metadata listesi (README tablosu ve list_sources buradan beslenir)
│  ├─ index.ts         # kütüphane dışa aktarımları
│  └─ cli.ts           # bin: `turkiye-mcp`
├─ test/
│  ├─ fixtures/        # her kaynak için kayıtlı gerçek yanıt (XML/HTML/JSON)
│  ├─ unit/            # ayrıştırıcı testleri: offline ve deterministik
│  └─ live/            # gerçek uç noktaya giden testler
├─ scripts/            # gen-readme-table.ts (registry → README tablosu)
├─ .github/workflows/  # ci.yml, health.yml
└─ docs/
```

### 5.2 Kaynak sözleşmesi
Her kaynak bir `SourceMeta` dışa aktarır: `{ id, ad, kategori, rozet, anahtarGerekli, envVars[], resmiUrl, aciklama, ttlSaniye }`. Ayrıca saf ve tipli fonksiyonlar dışa aktarır (ör. `getRates(date?)`). Bu fonksiyonlar `{ veri, kaynak: { ad, rozet, url, alinmaZamani } }` döndürür.

### 5.3 MCP araçları
- Araç adları İngilizce snake_case olur, kategori öneki taşır: `finans_get_exchange_rates`, `deprem_get_recent`, `eczane_get_on_duty`… Açıklamalar İngilizce olur ve Türkçe anahtar kelimeler içerir (kur, deprem, nöbetçi). Çıktı alan adları ve özetler Türkçe olur.
- Çıktı biçimi: kısa bir Türkçe özet metni ve JSON veri (`structuredContent`). Kaynak bloğu her zaman bulunur.
- **Araç kalabalığını önlemek için:** `TURKIYE_MCP_CATEGORIES=finans,deprem` env değişkeniyle yalnızca seçilen kategoriler yüklenebilir. Varsayılan: hepsi.
- **Anahtarlı kaynaklar:** Env tanımlı değilse araç **kaydedilmez**. Bunun yerine her zaman mevcut olan `list_sources` aracı, tüm kaynakları rozet ve durumlarıyla listeler ve kapalı olanların nasıl açılacağını (hangi env, anahtarın nereden alınacağı) söyler.
- Toplam hedef: ~25–30 araç.

### 5.4 Ağ davranışı
- Varsayılan zaman aşımı 15 sn, ağ hatalarında 1 tekrar deneme.
- Bellekte TTL önbelleği, kaynağa özel süreler: deprem 30 sn, kripto 30 sn, kurlar 5 dk, akaryakıt 1 sa, Resmî Gazete 1 sa, coğrafya 24 sa.
- Kaynaklara saygı: önbellek sayesinde aynı veri tekrar tekrar çekilmez. README'de "kaynakların kullanım koşullarına uyun" uyarısı yer alır.

### 5.5 Test ve CI
- **Unit (PR CI'ında):** Kayıtlı fixture'lar üzerinde ayrıştırıcı testleri. Ağa çıkmaz, kırılmaz.
- **Live (`npm run test:live`):** Her kaynağa gerçek bir istek atar ve şema doğrulaması yapar. Anahtarlı kaynaklar, anahtar yoksa atlanır.
- **`health.yml`:** Günde bir çalışır (cron) ve manuel tetiklenebilir. Live testleri koşturur, sonuç tablosunu job özetine yazar. Bir kaynak bozulursa "Kaynak bozuldu: X" başlıklı bir issue açar veya mevcut issue'yu günceller. README'de bu iş akışının durum rozeti bulunur.
  - Bot commit'i atılmaz. Yazar listesinde yalnızca kullanıcı görünmeli (anti-hedef).
  - **Kaynak bazında canlı durum (benim kararım):** `health.yml`, sonuçları `status.json` ve kaynak başına shields.io "endpoint" JSON'ları olarak üretir. Bunları `actions/upload-pages-artifact` + `actions/deploy-pages` ile GitHub Pages'e yayınlar. Bu yöntem **hiçbir branch'e commit atmaz**, yani yazar listesi temiz kalır. README'deki kaynak tablosunda her satırda `https://img.shields.io/endpoint?url=https://yusufsizmaz.github.io/turkiye-mcp/badges/<id>.json` rozeti bulunur. Böylece tablo kendi kendine güncellenir. Repo ayarlarında Pages kaynağı "GitHub Actions" seçilmelidir (kurulumda kullanıcıya hatırlatılacak). Issue'lar `github-actions[bot]` tarafından açılır. Bunlar commit olmadığı için yazar kuralını ihlal etmez.
  - **Yurt dışı engeli (benim kararım):** Health check, GitHub'ın standart (ABD) sunucularında çalışır. Ücretli proxy kullanılmaz. Kaynak metadatasında `geoKisitli?: boolean` alanı bulunur. Yurt dışından bloklandığı bilinen kaynaklar bozuk değil **"🌍 yalnızca TR"** durumu alır (gri rozet) ve bu kaynaklar için issue açılmaz. Bir kaynağın geo-kısıtlı olup olmadığı ilk CI koşusunda gözlemlenir: Türkiye'den çalışan ama Actions'ta tutarlı şekilde zaman aşımına uğrayan veya 403 dönen kaynak bu bayrağı alır. Kullanıcının kendi makinesinde `npm run health` ile aynı kontrol yerel olarak da koşturulabilir. Bu kontrol hafiftir, sadece sırayla HTTP istekleri atar.
- **`ci.yml`:** Lint, typecheck, unit ve build.

### 5.6 README
**Kullanıcının isteği:** README kategori başlıklarıyla bölünür. Her kategori başlığının altında o kategorideki tüm API'ler listelenir. Her API, açılır bir bölümle (`<details>`) tüm ayrıntılarını gösterir: açıklama, rozet, canlı durum, uç noktalar, MCP araçları ve parametre tablosu, örnek sorular, kütüphane kullanım örneği ve gerçek örnek çıktı. Bu bölüm registry'den otomatik üretilir.
- Başlık, kısa açıklama ve rozetler (CI, kaynak sağlığı, lisans, Node sürümü).
- "Ne sorabilirsin?" bölümü: örnek sorular.
- Kurulum: Claude Desktop (`claude_desktop_config.json`), Claude Code (`claude mcp add turkiye -- npx -y turkiye-mcp`), Cursor. npm'e yayınlanana kadar yerel derleme ile kurulum talimatı.
- **Kategori bazlı kaynak tablosu**: `registry.ts`'den otomatik üretilir (`scripts/gen-readme-table.ts`, işaretli bloklar arasına yazar; kaynak eklenince geliştirici çalıştırıp commit'ler). Sütunlar: kaynak, rozet, araçlar, anahtar, **canlı durum** (Pages'ten beslenen shields rozeti, §5.5).
- Kütüphane kullanımı örneği.
- Anahtar alma rehberi (EVDS, EPİAŞ, Diyanet).
- Elenen kaynaklar ve nedenleri.
- Yeni kaynak / yeni il eczane adaptörü ekleme rehberi (`CONTRIBUTING.md`).
- Sorumluluk reddi: veriler kaynaklardan olduğu gibi alınır ve yatırım tavsiyesi değildir.
- Kısa bir İngilizce bölüm.

### 5.7 Paket
- `package.json` adı `turkiye-mcp` (npm'de boş olduğu 10.11.2026'da doğrulandı). `bin: turkiye-mcp` ve `files: dist` tanımlanır. Kütüphane ve CLI aynı pakette bulunur.
- Yayın v1'de yapılmaz. `npm publish` ile yayınlanmaya hazır olur.

### 5.8 Anahtarlı kaynaklar (benim kararım; kullanıcı "her şeyi yapalım" dedi, anahtar sağlamadı)
EVDS, EPİAŞ ve Diyanet resmî belgelerine göre yazılır ve registry'de `deneysel: true` olarak işaretlenir. README'de "🧪 deneysel, anahtarla doğrulanmadı" notu bulunur. Unit testler belgelerdeki örnek yanıtlardan üretilen fixture'larla çalışır. Live testler `TCMB_EVDS_KEY` / `EPIAS_USERNAME` / `DIYANET_EMAIL` env'leri yoksa atlanır. `health.yml` bu secret'lar tanımlıysa onları da test eder. Böylece kullanıcı ileride secret eklediğinde, kod değişikliği gerekmeden bu kaynaklar doğrulanmış olur.

### 5.9 Görünürlük (amaç: profilde iyi durmak, star toplamak)
- README'nin ilk ekranı vitrin gibi olmalı: proje adı + tek cümlelik açıklama, rozet satırı, "30 saniyede kur" bloğu, gerçek bir soru-cevap örneği (kod bloğu içinde yapay zekâ konuşması) ve kategori ikonlarıyla kaynak tablosu.
- GitHub repo meta verileri `gh` ile ayarlanır: açıklama, topics (`mcp`, `model-context-protocol`, `turkey`, `turkiye`, `tcmb`, `deprem`, `kap`, `open-data`, `typescript`, `claude`), homepage (Pages adresi).
- Pages sitesinde, `status.json`'ın yanında, kaynak durumlarını gösteren basit tek sayfalık bir durum sayfası (`index.html`) yayınlanır.
- `CONTRIBUTING.md`, issue şablonları ("yeni kaynak öner", "kaynak bozuldu"), `LICENSE` (MIT) ve `CHANGELOG.md`.
- İlk sürüm etiketi: `v0.1.0`, GitHub Release notlarıyla birlikte.

## 6. Kısıtlar
- Git yazar/committer: `YusufSizmaz <yusuf.sizmaz11@gmail.com>`. Commit mesajlarında ve PR'larda Claude ile ilgili satır bulunmaz.
- Repo herkese açık. Gizli anahtarlar repoya girmez. `.env.example` bulunur.
- Geliştirme makinesi fansız bir M4 Air (16 GB). Ağır araçlardan kaçınılmalı, testler paralel ama ölçülü koşmalı.

## 7. Builder'a bırakılanlar
- ⚠️ işaretli uç noktaların parametrelerini bulmak: KAP şirket arama, MGM saatlik tahmin, hava kalitesi istasyon verisi, İstanbul ve Ankara eczane iç API'leri. Bulunamazsa ilgili özellik "deneysel" olarak işaretlenir ya da v1'den çıkarılır, README'de not düşülür.
- Her kaynak için tam çıktı alanları ve araç girdi parametreleri.
- Kesin araç adları ve sayısı (§5.3'teki ilkeler çerçevesinde).
- Hata mesajlarının metinleri.
- User-Agent politikası: Mümkünse proje UA'sı (`turkiye-mcp/<sürüm> (+repo url)`) kullanılır. Tarayıcı UA'sı gerektiren siteler için kaynak bazında istisna tanınır.
