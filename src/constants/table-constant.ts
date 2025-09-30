export const HEADER_TABLE_TABLE = [
  "No",
  "Name",
  "Capacity",
  "Status",
  "Action",
];

export const STATUS_TABLE_LIST = [
  {
    value: "available",
    label: "Available",
  },
  {
    value: "unavailable",
    label: "Unavailable",
  },
  {
    value: "reserved",
    label: "Reserved",
  },
];

export const INITIAL_TABLE = {
  name: "",
  description: "",
  capacity: "",
  status: "",
};

export const INITIAL_STATE_TABLE = {
  status: "idle",
  errors: {
    id: [],
    name: [],
    description: [],
    capacity: [],
    status: [],
    _form: [],
  },
};
