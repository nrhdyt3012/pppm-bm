export type AuthFormState = {
  status?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    role?: string[];
    avatar_url?: string[];
    _form?: string[];
  };
};

export type Profile = {
  id?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jurusan?: string;
  universitas?: string;
  nama_ayah?: string;
  pekerjaan_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ibu?: string;
};
