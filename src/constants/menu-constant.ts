// src/constants/menu-constant.ts
export const HEADER_TABLE_MENU = [
  "No",
  "Periode",
  "Uang Makan",
  "Asrama",
  "Kas Pondok",
  "Shodaqoh Sukarela",
  "Jariyah SB",
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
  shodaqoh_sukarela: "",
  jariyah_sb: "",
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
    shodaqoh_sukarela: [],
    jariyah_sb: [],
    uang_tahunan: [],
    iuran_kampung: [],
    _form: [],
  },
};
