// src/types/menu.d.ts
export type MenuFormState = {
  status?: string;
  errors?: {
    id?: string[];
    namaTagihan?: string[];
    jenjang?: string[];
    jenisTagihan?: string[];
    nominal?: string[];
    periode?: string[];
    description?: string[];
    _form?: string[];
  };
};