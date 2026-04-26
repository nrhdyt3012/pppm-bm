// src/validations/menu-validation.ts
import { z } from "zod";

export const menuFormSchema = z.object({
  namaTagihan: z.string().min(1, "Nama tagihan wajib diisi"),
  jenjang: z.string().min(1, "Jenjang wajib diisi"),
  jenisTagihan: z.string().min(1, "Jenis tagihan wajib diisi"),
  nominal: z.string().min(1, "Nominal wajib diisi"),
  description: z.string().optional(),
});

export const menuSchema = z.object({
  id_masterTagihan: z.number().optional(),
  namaTagihan: z.string(),
  jenjang: z.string(),
  jenisTagihan: z.string(),
  nominal: z.number(),
  description: z.string().optional(),
});

export type MenuForm = z.infer<typeof menuFormSchema>;
export type Menu = z.infer<typeof menuSchema>;