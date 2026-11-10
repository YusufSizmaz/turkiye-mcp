import { KaynakHatasi } from "../../../core/errors.js";
import { ilBul } from "../../../core/iller.js";
import { sinirla } from "../../../core/sonuc.js";
import type { Sonuc } from "../../../core/types.js";
import * as ankara from "./ankara.js";
import * as istanbul from "./istanbul.js";
import * as izmir from "./izmir.js";
import type { Eczane, EczaneAdaptoru } from "./tipler.js";

export type { Eczane, EczaneAdaptoru } from "./tipler.js";

export const ADAPTORLER: EczaneAdaptoru[] = [istanbul.adaptor, izmir.adaptor, ankara.adaptor];

export const DESTEKLENEN_ILLER = "İstanbul, Yalova, İzmir, Ankara";

export async function getOnDuty(o: {
  il: string;
  ilce?: string;
  limit?: number;
}): Promise<Sonuc<Eczane[]>> {
  const il = ilBul(o.il);
  const adaptor = il ? ADAPTORLER.find((a) => a.plakalar.includes(il.plaka)) : undefined;
  if (!il || !adaptor) {
    throw new KaynakHatasi(
      "eczane",
      "desteklenmiyor",
      `"${o.il}" için nöbetçi eczane kaynağı henüz yok. Şimdilik desteklenen iller: ${DESTEKLENEN_ILLER}. Yeni il eklemek için: https://github.com/YusufSizmaz/turkiye-mcp/blob/main/CONTRIBUTING.md`,
    );
  }
  const s = await adaptor.getir(il.plaka, o.ilce);
  const limit = o.limit ?? 20;
  if (s.veri.length <= limit) return s;
  const kesik = `${s.veri.length} eczaneden ilk ${limit} tanesi gösterildi; daha kısa liste için ilçe belirtin veya limit'i artırın.`;
  return { ...s, veri: sinirla(s.veri, limit), not: s.not ? `${s.not} ${kesik}` : kesik };
}

export const metalar = ADAPTORLER.map((a) => a.meta);
