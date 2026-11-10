# Değişiklik günlüğü

## 0.1.0 — 2026-11-10

İlk sürüm.

- **9 kategori, 25 kaynak, 25 MCP aracı**: finans (TCMB kurları, KAP, altın, BIST, kripto, EVDS), deprem (AFAD, Kandilli), Resmî Gazete, hava (MGM, hava kalitesi), enerji (Opet, EPİAŞ), nöbetçi eczane (İstanbul/Yalova, İzmir, Ankara), şehir (İBB trafik, İSPARK, İBB ve İzmir açık veri), coğrafya (il/ilçe/mahalle), takvim (resmî tatiller, namaz vakitleri).
- Her yanıtta kaynak, rozet (🏛️ resmî / ✅ birinci taraf / 🌐 topluluk) ve veri zamanı.
- `TURKIYE_MCP_CATEGORIES` ile kategori filtresi; anahtarlı kaynaklar yalnız anahtar tanımlıysa yüklenir; `list_sources` aracı.
- Tipli TypeScript kütüphanesi olarak da kullanılabilir.
- Günlük canlı sağlık kontrolü, GitHub Pages durum sayfası ve kaynak başına durum rozeti.
- EVDS, EPİAŞ ve Diyanet resmî API'leri 🧪 deneysel (belgeye göre yazıldı, anahtarla doğrulanmadı).
