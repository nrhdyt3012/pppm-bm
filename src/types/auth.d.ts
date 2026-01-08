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
    jurusan?: string[];
    universitas?: string[];
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
  // Data dari tabel santri (dengan nama kolom sesuai database)
  jenisKelamim?: string; // Typo di database, ikuti as-is
  tempatLahir?: string;
  tangggalLahir?: string; // Typo di database (3 'g'), ikuti as-is
  namaAyah?: string;
  namaIbu?: string;
  pekerjaanAyah?: string;
  pekerjaanIbu?: string;
  // Tambahan untuk compatibility dengan form
  jenis_kelamin?: string; // Alias untuk form
  tempat_lahir?: string;  // Alias untuk form
  tanggal_lahir?: string; // Alias untuk form
  nama_ayah?: string;     // Alias untuk form
  pekerjaan_ayah?: string; // Alias untuk form
  nama_ibu?: string;      // Alias untuk form
  pekerjaan_ibu?: string; // Alias untuk form
  jurusan?: string;       // Tidak ada di database saat ini
  universitas?: string;   // Tidak ada di database saat ini
};