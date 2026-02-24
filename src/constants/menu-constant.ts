// src/constants/menu-constant.ts
export const HEADER_TABLE_MENU = [
  "No",
  "Periode",
  "Uang Makan",
  "Asrama",
  "Kas Pondok",
  "Sedekah Sukarela",
  "Aset Jariyah",
  "Uang Tahunan",
  "Iuran Kampung",
  "Action",
];

export const INITIAL_MENU = {
  periode: "",
  description: "",
  uang_makan: "",
  asrama: "",
  kas_pondok: "",
  sedekah_sukarela: "",
  aset_jariyah: "",
  uang_tahunan: "",
  iuran_kampung: "",
};

export const INITIAL_STATE_MENU = {
  status: "idle",
  errors: {
    id: [],
    periode: [],
    description: [],
    uang_makan: [],
    asrama: [],
    kas_pondok: [],
    sedekah_sukarela: [],
    aset_jariyah: [],
    uang_tahunan: [],
    iuran_kampung: [],
    _form: [],
  },
};
