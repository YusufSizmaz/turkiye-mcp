import type { KategoriModulu } from "../../mcp/tool.js";
import * as bist from "./bist.js";
import * as btcturk from "./btcturk.js";
import * as evds from "./evds.js";
import * as isyatirim from "./isyatirim.js";
import * as kap from "./kap.js";
import * as kripto from "./kripto-arac.js";
import * as paribu from "./paribu.js";
import * as tcmb from "./tcmb.js";
import * as truncgil from "./truncgil.js";

const bosDegil = (ne: string) => (n: number) => {
  if (!n) throw new Error(`${ne} boş döndü`);
};

export const finans: KategoriModulu = {
  kategori: "finans",
  ad: "Finans & Piyasalar",
  ikon: "💱",
  aciklama:
    "Döviz kurları, altın, BIST hisseleri ve endeksleri, kripto paralar, KAP bildirimleri ve TCMB EVDS serileri.",
  sources: [
    tcmb.meta,
    kap.meta,
    truncgil.meta,
    isyatirim.meta,
    btcturk.meta,
    paribu.meta,
    evds.meta,
    bist.meta,
  ],
  tools: [
    ...tcmb.araclar,
    ...kap.araclar,
    ...truncgil.araclar,
    ...isyatirim.araclar,
    ...kripto.araclar,
    ...evds.araclar,
    ...bist.araclar,
  ],
  probes: {
    [bist.meta.id]: async () =>
      bosDegil("BIST 30")((await bist.getIndex({ endeks: "XU030" })).veri.hisseler.length),
    [tcmb.meta.id]: async () => bosDegil("kur listesi")((await tcmb.getRates()).veri.kurlar.length),
    [kap.meta.id]: async () =>
      bosDegil("bildirim listesi")((await kap.getLatestDisclosures({ limit: 1 })).veri.length),
    [truncgil.meta.id]: async () =>
      bosDegil("altın listesi")((await truncgil.getGoldAndMarket()).veri.kalemler.length),
    [isyatirim.meta.id]: async () => {
      const { bugunTr, gunEkle } = await import("../../core/tarih.js");
      const bitis = bugunTr();
      const s = await isyatirim.getStockHistory({
        hisse: "THYAO",
        baslangic: gunEkle(bitis, -10),
        bitis,
      });
      bosDegil("hisse geçmişi")(s.veri.length);
    },
    [btcturk.meta.id]: async () => bosDegil("BtcTurk")((await btcturk.getTickers()).veri.length),
    [paribu.meta.id]: async () => bosDegil("Paribu")((await paribu.getTickers()).veri.length),
    [evds.meta.id]: async () => {
      const { bugunTr, gunEkle } = await import("../../core/tarih.js");
      const bitis = bugunTr();
      const s = await evds.getSeries(
        { seriler: ["TP.DK.USD.A"], baslangic: gunEkle(bitis, -10), bitis },
        process.env,
      );
      bosDegil("EVDS serisi")(s.veri.length);
    },
  },
};
