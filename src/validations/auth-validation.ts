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
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  nama_ayah: z.string().min(1, "Nama ayah wajib diisi"),
  pekerjaan_ayah: z.string().min(1, "Pekerjaan ayah wajib diisi"),
  nama_ibu: z.string().min(1, "Nama ibu wajib diisi"),
  pekerjaan_ibu: z.string().min(1, "Pekerjaan ibu wajib diisi"),
  role: z.string().min(1, "Role is required"),
  avatar_url: z.union([
    z.string().min(1, "Foto santri wajib diisi"),
    z.instanceof(File),
  ]),
  // Field ini dihapus karena tidak ada di database
  // jurusan: z.string().optional(),
  // universitas: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  jenis_kelamin: z.string().min(1, "Jenis kelamin wajib diisi"),
  tempat_lahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  nama_ayah: z.string().min(1, "Nama ayah wajib diisi"),
  pekerjaan_ayah: z.string().min(1, "Pekerjaan ayah wajib diisi"),
  nama_ibu: z.string().min(1, "Nama ibu wajib diisi"),
  pekerjaan_ibu: z.string().min(1, "Pekerjaan ibu wajib diisi"),
  role: z.string().min(1, "Role is required"),
  avatar_url: z.union([
    z.string().min(1, "Foto santri wajib diisi"),
    z.instanceof(File),
  ]),
});

export type LoginForm = z.infer<typeof loginSchemaForm>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;