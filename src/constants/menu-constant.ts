export const HEADER_TABLE_MENU = [
  "No",
  "Periode",
  "Category",
  "Price",
  "Available",
  "periode",
  "uang_makan",
  "uang_asrama",
  "kas_pondok",
  "shoaqoh_sukkarela",
  "jariyah_sb",
  "uang_tahunan",
  "iuran_kampung",
  "Action",
];

export const CATEGORY_LIST = [
  {
    value: "beverages",
    label: "Beverages",
  },
  {
    value: "mains",
    label: "Mains",
  },
  {
    value: "desserts",
    label: "Desserts",
  },
];

export const INITIAL_MENU = {
  periode: "",
  uang_makan: "",
  uang_asrama: "",
  kas_pondok: "",
  shoaqoh_sukkarela: "",
  jariyah_sb: "",
  uang_tahunan: "",
  iuran_kampung: "",
};

export const INITIAL_STATE_MENU = {
  status: "idle",
  errors: {
    id: [],
    name: [],
    description: [],
    price: [],
    discount: [],
    category: [],
    image_url: [],
    is_available: [],
    periode: [],
    uang_makan: [],
    uang_asrama: [],
    kas_pondok: [],
    shoaqoh_sukkarela: [],
    jariyah_sb: [],
    uang_tahunan: [],
    iuran_kampung: [],
    _form: [],
  },
};
