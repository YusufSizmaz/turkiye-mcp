export type HataTuru =
  | "zaman-asimi"
  | "http"
  | "ayristirma"
  | "anahtar-yok"
  | "desteklenmiyor"
  | "bulunamadi";

export class KaynakHatasi extends Error {
  override name = "KaynakHatasi";

  constructor(
    public readonly sourceId: string,
    public readonly tur: HataTuru,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}
