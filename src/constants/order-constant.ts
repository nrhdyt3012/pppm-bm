import { INITIAL_STATE_ACTION } from "./general-constant";

export const HEADER_TABLE_ORDER = [
  "No",
  "Order ID",
  "Customer Name",
  "Table",
  "Status",
  "Action",
];

export const INITIAL_ORDER = {
  customer_name: "",
  table_id: "",
  status: "",
};

export const INITIAL_STATE_ORDER = {
  status: "idle",
  errors: {
    customer_name: [],
    table_id: [],
    status: [],
    _form: [],
  },
};

export const INITIAL_ORDER_TAKEAWAY = {
  customer_name: "",
};

export const INITIAL_STATE_ORDER_TAKEAWAY = {
  status: "idle",
  errors: {
    customer_name: [],
    _form: [],
  },
};

export const STATUS_CREATE_ORDER = [
  {
    value: "reserved",
    label: "Reserved",
  },
  {
    value: "process",
    label: "Process",
  },
];

export const HEADER_TABLE_DETAIL_ORDER = [
  "No",
  "Menu",
  "Total",
  "Status",
  "Action",
];

export const FILTER_MENU = [
  {
    value: "",
    label: "All",
  },
  {
    value: "mains",
    label: "Mains",
  },
  {
    value: "sides",
    label: "Sides",
  },
  {
    value: "desserts",
    label: "Desserts",
  },
  {
    value: "beverages",
    label: "Beverages",
  },
];

export const INITIAL_STATE_GENERATE_PAYMENT = {
  ...INITIAL_STATE_ACTION,
  data: {
    payment_token: "",
  },
};
