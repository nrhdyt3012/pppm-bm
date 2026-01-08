// src/types/auth.d.ts
export type AuthFormState = {
  status?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    role?: string[];
    avatar_url?: string[];
    jenis_kelamin?: string[];
    tempat_lahir?: string[];
    tanggal_lahir?: string[];
    nama_ayah?: string[];
    pekerjaan_ayah?: string[];
    nama_ibu?: string[];
    pekerjaan_ibu?: string[];
    _form?: string[];
  };
};

export type Profile = {
  id?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  // Alias untuk kompatibilitas dengan form (snake_case)
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  nama_ayah?: string;
  pekerjaan_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
  // Data dari tabel santri (camelCase sesuai database)
  jenisKelamin?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  namaAyah?: string;
  namaIbu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
};