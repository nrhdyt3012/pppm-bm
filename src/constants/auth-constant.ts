// src/constants/auth-constant.ts
export const INITIAL_LOGIN_FORM = {
  email: "",
  password: "",
};

export const INITIAL_STATE_LOGIN_FORM = {
  status: "idle",
  errors: {
    email: [],
    password: [],
    _form: [],
  },
};

export const INITIAL_STATE_PROFILE = {
  id: "",
  name: "",
  role: "",
  avatar_url: "",
};

export const INITIAL_CREATE_USER_FORM = {
  nama_siswa: "",
  email: "",
  password: "",
  NIS: "",
  kelas: "",
  angkatan: "",
  nama_wali: "",
  no_wa: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  role: "siswa",
  avatar_url: "",
};

export const INITIAL_STATE_CREATE_USER = {
  status: "idle",
  errors: {
    email: [],
    password: [],
    nama_siswa: [],
    NIS: [],
    kelas: [],
    angkatan: [],
    nama_wali: [],
    no_wa: [],
    tempat_lahir: [],
    tanggal_lahir: [],
    role: [],
    avatar_url: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_USER = {
  status: "idle",
  errors: {
    nama_siswa: [],
    NIS: [],
    kelas: [],
    angkatan: [],
    nama_wali: [],
    no_wa: [],
    tempat_lahir: [],
    tanggal_lahir: [],
    role: [],
    avatar_url: [],
    _form: [],
  },
};

export const ROLE_LIST = [
  { value: "admin", label: "Admin" },
  { value: "siswa", label: "Siswa" },
];

export const KELAS_LIST = [
  { value: "KB", label: "Kelompok Bermain (KB)" },
  { value: "TK A", label: "TK A" },
  { value: "TK B", label: "TK B" },
];

export const STATUS_LIST = [
  { value: "aktif", label: "Aktif" },
  { value: "tidak aktif", label: "Tidak Aktif" },
];