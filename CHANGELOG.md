# Değişiklik günlüğü

## 0.2.0 — 2026-11-10

**Yeni veri kaynakları (25 → 31 araç, 25 → 32 kaynak)**
- `finans_get_bist_index` — Borsa İstanbul endeks bileşenleri (BIST 30, BIST 100, XBANK… ve bir hissenin dahil olduğu endeksler).
- `resmi_mevzuat_search` — Mevzuat Bilgi Sistemi'nde kanun, KHK, tüzük, yönetmelik ve tebliğ araması.
- `izmir_get_market_prices` — İzmir sebze-meyve ve balık hali günlük fiyatları.
- `izmir_get_izban_times`, `izmir_get_ferry_times` — İZBAN ve İzdeniz vapur sefer saatleri.
- `izmir_find_places` — İzmir kent rehberi: hastane, afet toplanma alanı, plaj, müze, noter, WizmirNET… 25 kategori.
- Nöbetçi eczane: **Adana** ve **Mersin** eklendi (6 il); İzmir artık belediyenin resmî API'sinden.

**Düzeltmeler**
- Ağ hataları artık gerçekten bir kez (Truncgil'de üç kez, artan beklemeyle) tekrar deneniyor.
- README sadeleştirildi: kategori başlıkları altında araç tabloları; parametreler ve kod örnekleri kategori sayfalarında.

## 0.1.0 — 2026-11-10

İlk sürüm.

- **9 kategori, 25 kaynak, 25 MCP aracı**: finans (TCMB kurları, KAP, altın, BIST, kripto, EVDS), deprem (AFAD, Kandilli), Resmî Gazete, hava (MGM, hava kalitesi), enerji (Opet, EPİAŞ), nöbetçi eczane (İstanbul/Yalova, İzmir, Ankara), şehir (İBB trafik, İSPARK, İBB ve İzmir açık veri), coğrafya (il/ilçe/mahalle), takvim (resmî tatiller, namaz vakitleri).
- Her yanıtta kaynak, rozet (🏛️ resmî / ✅ birinci taraf / 🌐 topluluk) ve veri zamanı.
- `TURKIYE_MCP_CATEGORIES` ile kategori filtresi; anahtarlı kaynaklar yalnız anahtar tanımlıysa yüklenir; `list_sources` aracı.
- Tipli TypeScript kütüphanesi olarak da kullanılabilir.
- Günlük canlı sağlık kontrolü, GitHub Pages durum sayfası ve kaynak başına durum rozeti.
- Yurt dışı IP'lerini engelleyen 7 kaynak (TCMB, İBB, bazı eczacı odaları…) günlük kontrolde 🌍 "yalnızca TR" olarak gösterilir; Türkiye'den normal çalışır.
- EVDS, EPİAŞ ve Diyanet resmî API'leri 🧪 deneysel (belgeye göre yazıldı, anahtarla doğrulanmadı).
