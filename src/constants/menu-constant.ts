// src/constants/menu-constant.ts
export const HEADER_TABLE_MENU = [
  "No",
  "Nama Tagihan",
  "Jenjang",
  "Jenis Tagihan",
  "Nominal",
  "Action",
];

export const INITIAL_MENU = {
  namaTagihan: "",
  jenjang: "",
  jenisTagihan: "",
  nominal: "",
  description: "",
};

export const INITIAL_STATE_MENU = {
  status: "idle",
  errors: {
    id: [],
    namaTagihan: [],
    jenjang: [],
    jenisTagihan: [],
    nominal: [],
    description: [],
    _form: [],
  },
};

export const JENJANG_LIST = [
  { value: "KB", label: "Kelompok Bermain (KB)" },
  { value: "TK A", label: "TK A" },
  { value: "TK B", label: "TK B" },
];

export const JENIS_TAGIHAN_LIST = [
  { value: "Reguler", label: "Reguler" },
  { value: "Subsidi", label: "Subsidi" },
];