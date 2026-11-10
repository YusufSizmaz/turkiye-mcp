import * as z from "zod";

export const tarihSema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD biçiminde olmalı")
  .describe("Tarih, YYYY-MM-DD (ör. 2026-11-10)");

export const limitSema = z
  .number()
  .int()
  .min(1)
  .max(200)
  .default(20)
  .describe("En fazla kaç kayıt döndürülsün (1–200, varsayılan 20)");
