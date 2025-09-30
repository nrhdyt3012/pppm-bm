export type MenuFormState = {
  status?: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    price?: string[];
    discount?: string[];
    category?: string[];
    image_url?: string[];
    is_available?: string[];
    _form?: string[];
  };
};
