interface Kayit {
  bitis: number;
  deger: Promise<unknown>;
}

const depo = new Map<string, Kayit>();

/** TTL'li bellek önbelleği. Eşzamanlı aynı anahtar tek istek yapar; hatalar önbelleğe alınmaz. */
export function cached<T>(key: string, ttlSaniye: number, fn: () => Promise<T>): Promise<T> {
  const simdi = Date.now();
  const mevcut = depo.get(key);
  if (mevcut && mevcut.bitis > simdi) return mevcut.deger as Promise<T>;
  const deger = fn();
  depo.set(key, { bitis: simdi + ttlSaniye * 1000, deger });
  deger.catch(() => {
    if (depo.get(key)?.deger === deger) depo.delete(key);
  });
  return deger;
}

export function clearCache(): void {
  depo.clear();
}
