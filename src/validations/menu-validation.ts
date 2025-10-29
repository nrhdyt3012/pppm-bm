// src/validations/menu-validation.ts
import z from "zod";

export const menuFormSchema = z.object({
  periode: z.string().min(1, "Periode is required"),
  description: z.string().min(1, "Description is required"),
  uang_makan: z.string().min(1, "Uang Makan is required"),
  asrama: z.string().min(1, "Asrama is required"),
  kas_pondok: z.string().min(1, "Kas Pondok is required"),
  shodaqoh_sukarela: z.string().min(1, "Shodaqoh Sukarela is required"),
  jariyah_sb: z.string().min(1, "Jariyah SB is required"),
  uang_tahunan: z.string().min(1, "Uang Tahunan is required"),
  iuran_kampung: z.string().min(1, "Iuran Kampung is required"),
});

export const menuSchema = z.object({
  periode: z.string(),
  description: z.string(),
  uang_makan: z.number(),
  asrama: z.number(),
  kas_pondok: z.number(),
  shodaqoh_sukarela: z.number(),
  jariyah_sb: z.number(),
  uang_tahunan: z.number(),
  iuran_kampung: z.number(),
});

export type MenuForm = z.infer<typeof menuFormSchema>;
export type Menu = z.infer<typeof menuSchema> & { id: string };
