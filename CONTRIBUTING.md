# Katkı rehberi

Teşekkürler! turkiye-mcp'nin değeri kaynak çeşitliliğinden geliyor. En değerli katkılar **yeni kaynaklar** ve **yeni illerin nöbetçi eczane adaptörleri**.

## Kurulum

```bash
git clone https://github.com/YusufSizmaz/turkiye-mcp.git
cd turkiye-mcp
npm install
npm test          # ağa çıkmayan unit testler
npm run test:live # gerçek kaynaklar
```

## Kaynak eklemeden önce

- Kaynak **bugün, anahtarsız (ya da ücretsiz anahtarla) ve kararlı** çalışmalı. Ücretli API'ler, giriş/captcha gerektiren ya da erişim kısıtlamasını aşmayı gerektiren kaynaklar kabul edilmez.
- Kaynağın kullanım koşullarına uyun; önbellek süresini (`ttlSaniye`) verinin gerçek güncellenme sıklığına göre seçin.
- Rozeti dürüst seçin: 🏛️ `resmi` (kamu kurumu/belediye/meslek odası), ✅ `birinci-taraf` (şirketin kendi API'si), 🌐 `topluluk` (üçüncü taraf).

## Yeni kaynak: adım adım

1. **Gerçek yanıtı kaydedin.** `scripts/record-fixtures.sh` dosyasına bir `get` satırı ekleyip çalıştırın; yanıt `test/fixtures/<kategori>/` altına düşer. windows-1254 sayfaları ham bayt olarak saklanır. Büyük yanıtları küçültün (<100 KB).
2. **Önce testi yazın** (`test/unit/<kategori>/<kaynak>.test.ts`): `mockFetch` + `fixture` ile fonksiyonun döndürdüğü `veri`yi, kayıttaki somut bir değerle doğrulayın; istek URL'sini/başlıklarını `calls` üzerinden kontrol edin. Testin **kırmızı** olduğunu görün.
3. **Kaynağı yazın** (`src/sources/<kategori>/<kaynak>.ts`):
   - `export const meta: SourceMeta` — id, ad, rozet, açıklama, `ucNoktalar`, `kutuphaneOrnegi`…
   - Saf fonksiyonlar: `fetchJson`/`fetchText` (`src/core/http.ts`) + `cached(...)` + `sonuc(meta, url, veri, not?)`.
   - Beklenmeyen yanıtta `KaynakHatasi(meta.id, "ayristirma", "Türkçe, açık bir mesaj")`.
   - Kullanıcı girdisini `eslesir` / `ilBul` ile karşılaştırın (Türkçe karakter ve büyük/küçük harf duyarsız).
   - Tarihlerde `bugunTr()` / `istanbulIso()` kullanın; asla makinenin saat dilimine güvenmeyin.
4. **MCP aracını tanımlayın** (`defineTool`): İngilizce snake_case ad + kategori öneki, İngilizce açıklama (Türkçe anahtar kelimelerle), zod girdi şeması (`.describe(...)` Türkçe), 1–3 `ornekSorular`, kısa Türkçe `ozet`. Liste döndürüyorsa `limit: limitSema`.
5. **Kategoriye bağlayın**: `src/sources/<kategori>/index.ts` içinde `sources`, `tools` ve en ucuz canlı kontrolü yapan bir `probes[meta.id]` ekleyin; `src/index.ts`'e namespace export ekleyin.
6. `npm test && npm run lint && npm run typecheck && npm run test:live` → yeşil.
7. `npm run readme` → README kataloğu ve kategori README'si güncellenir. Elle düzenlemeyin.

## Yeni il: nöbetçi eczane adaptörü

`src/sources/saglik/eczane/` altında `izmir.ts` veya `ankara.ts`'i örnek alın:

```ts
export const adaptor: EczaneAdaptoru = {
  plakalar: [16], // Bursa
  meta, // id: "eczane-bursa", rozet: "resmi" (eczacı odası)
  async getir(plaka, ilce) {
    /* … */ return sonuc(meta, url, eczaneler);
  },
};
```

`ADAPTORLER` listesine ve `saglik/index.ts`'teki `probes`'a ekleyin, `DESTEKLENEN_ILLER`'i güncelleyin. Eczacı odası telefonları bilinçli olarak gizliyorsa (ör. tıklama başına bilet), toplu çekmeyin.

## Commit ve PR

- Küçük, odaklı PR'lar. Commit mesajları Türkçe ve kısa: `feat(saglik): Bursa nöbetçi eczaneleri`.
- PR'da: hangi uç nokta, rozet neden o, canlı test çıktısı.
