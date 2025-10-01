import { Menu } from "@/validations/menu-validation";

export type OrderFormState = {
  status?: string;
  errors?: {
    customer_name?: string[];
    table_id?: string[];
    status?: string[];
    _form?: string[];
  };
};

export type Cart = {
  menu_id: string;
  quantity: number;
  total: number;
  notes: string;
  menu: Menu;
  order_id?: string;
};
