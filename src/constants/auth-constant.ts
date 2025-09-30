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
  role: "",
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
    role: [],
    avatar_url: [],
    _form: [],
  },
};

export const INITIAL_STATE_UPDATE_USER = {
  status: "idle",
  errors: {
    name: [],
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
    value: "kitchen",
    label: "Kitchen",
  },
  {
    value: "cashier",
    label: "Cashier",
  },
];

export const AVAILABILITY_LIST = [
  {
    value: "true",
    label: "Available",
  },
  {
    value: "false",
    label: "Not Available",
  },
];
