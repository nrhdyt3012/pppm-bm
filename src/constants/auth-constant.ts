// src/constants/auth-constant.ts

export const INITIAL_CREATE_USER_FORM = {
  email: "",
  password: "",
  nama_siswa: "",
  NIS: "",
  jenis_kelamin: undefined as unknown as "Laki-laki" | "Perempuan",
  kelas: "",
  angkatan: "",
  nama_wali: "",
  no_wa: "",
  email_wali: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  role: "siswa",
};

export const INITIAL_STATE_CREATE_USER = {
  status: "idle",
  errors: { _form: [] as string[] },
};

export const INITIAL_STATE_UPDATE_USER = {
  status: "idle",
  errors: { _form: [] as string[] },
};

// Daftar kelas PAUD
export const KELAS_LIST = [
  { value: "KB", label: "KB (Kelompok Bermain)" },
  { value: "TK A", label: "TK A" },
  { value: "TK B", label: "TK B" },
];

// Daftar jenis kelamin
export const JENIS_KELAMIN_LIST = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];