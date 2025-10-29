import z from "zod";

export const loginSchemaForm = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  name: z.string().min(1, "Nama lengkap is required"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin is required"),
  tempat_lahir: z.string().min(1, "Tempat lahir is required"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir is required"),
  jurusan: z.string().min(1, "Jurusan is required"),
  universitas: z.string().min(1, "Universitas/Sekolah is required"),
  nama_ayah: z.string().min(1, "Nama ayah is required"),
  pekerjaan_ayah: z.string().min(1, "Pekerjaan ayah is required"),
  nama_ibu: z.string().min(1, "Nama ibu is required"),
  pekerjaan_ibu: z.string().min(1, "Pekerjaan ibu is required"),
  role: z.string().min(1, "Role is required"),
  avatar_url: z.union([
    z.string().min(1, "Foto santri is required"),
    z.instanceof(File),
  ]),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama lengkap is required"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin is required"),
  tempat_lahir: z.string().min(1, "Tempat lahir is required"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir is required"),
  jurusan: z.string().min(1, "Jurusan is required"),
  universitas: z.string().min(1, "Universitas/Sekolah is required"),
  nama_ayah: z.string().min(1, "Nama ayah is required"),
  pekerjaan_ayah: z.string().min(1, "Pekerjaan ayah is required"),
  nama_ibu: z.string().min(1, "Nama ibu is required"),
  pekerjaan_ibu: z.string().min(1, "Pekerjaan ibu is required"),
  role: z.string().min(1, "Role is required"),
  avatar_url: z.union([
    z.string().min(1, "Foto santri is required"),
    z.instanceof(File),
  ]),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
