// src/validations/auth-validation.ts
import z from "zod";

export const loginSchemaForm = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nama_siswa: z.string().min(1, "Nama siswa wajib diisi"),
  NIS: z.string().optional(),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  angkatan: z.string().optional(),
  nama_wali: z.string().min(1, "Nama wali wajib diisi"),
  no_wa: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  role: z.string().min(1, "Role wajib diisi"),
  avatar_url: z.union([
    z.string(),
    z.instanceof(File),
  ]).optional(),
});

export const updateUserSchema = z.object({
  nama_siswa: z.string().min(1, "Nama siswa wajib diisi"),
  NIS: z.string().optional(),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  angkatan: z.string().optional(),
  nama_wali: z.string().min(1, "Nama wali wajib diisi"),
  no_wa: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  tempat_lahir: z.string().optional(),
  tanggal_lahir: z.string().optional(),
  role: z.string().min(1, "Role wajib diisi"),
  avatar_url: z.union([
    z.string(),
    z.instanceof(File),
  ]).optional(),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;