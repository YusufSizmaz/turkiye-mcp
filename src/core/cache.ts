interface Kayit {
  bitis: number;
  deger: Promise<unknown>;
}

const depo = new Map<string, Kayit>();
const TEMIZLIK_ESIGI = 200;
const AZAMI_KAYIT = 1000;

function temizle(simdi: number): void {
  for (const [k, v] of depo) if (v.bitis <= simdi) depo.delete(k);
  // Hâlâ çok büyükse en eski girdileri at (Map ekleme sırasını korur).
  while (depo.size > AZAMI_KAYIT) {
    const ilk = depo.keys().next().value;
    if (ilk === undefined) break;
    depo.delete(ilk);
  }
}

/**
 * TTL'li bellek önbelleği. Eşzamanlı aynı anahtar tek istek yapar; hatalar önbelleğe alınmaz.
 * Uzun süre açık kalan stdio sunucusunda bellek büyümesin diye süresi dolanlar temizlenir.
 */
export function cached<T>(key: string, ttlSaniye: number, fn: () => Promise<T>): Promise<T> {
  const simdi = Date.now();
  const mevcut = depo.get(key);
  if (mevcut && mevcut.bitis > simdi) return mevcut.deger as Promise<T>;
  if (depo.size >= TEMIZLIK_ESIGI) temizle(simdi);
  const deger = fn();
  depo.delete(key);
  depo.set(key, { bitis: simdi + ttlSaniye * 1000, deger });
  deger.catch(() => {
    if (depo.get(key)?.deger === deger) depo.delete(key);
  });
  return deger;
}

export function clearCache(): void {
  depo.clear();
}

export function onbellekBoyutu(): number {
  return depo.size;
}
