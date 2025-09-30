export type TableFormState = {
  status?: string;
  errors?: {
    id?: string[];
    name?: string[];
    description?: string[];
    capacity?: string[];
    status?: string[];
    _form?: string[];
  };
};
