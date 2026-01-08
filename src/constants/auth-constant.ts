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
  name: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  nama_ayah: "",
  pekerjaan_ayah: "",
  nama_ibu: "",
  pekerjaan_ibu: "",
  role: "santri",
  avatar_url: "",
  email: "",
  password: "",
};

export const INITIAL_STATE_CREATE_USER = {
  status: "idle",
  errors: {
    email: [],
    password: [],
    name: [],
    jenis_kelamin: [],
    tempat_lahir: [],
    tanggal_lahir: [],
    nama_ayah: [],
    pekerjaan_ayah: [],
    nama_ibu: [],
    pekerjaan_ibu: [],
    role: [],
    avatar_url: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_USER = {
  status: "idle",
  errors: {
    name: [],
    jenis_kelamin: [],
    tempat_lahir: [],
    tanggal_lahir: [],
    nama_ayah: [],
    pekerjaan_ayah: [],
    nama_ibu: [],
    pekerjaan_ibu: [],
    role: [],
    avatar_url: [],
    _form: [],
  },
};

export const ROLE_LIST = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "santri",
    label: "Santri",
  },
];

export const JENIS_KELAMIN_LIST = [
  {
    value: "Laki-laki",
    label: "Laki-laki",
  },
  {
    value: "Perempuan",
    label: "Perempuan",
  },
];