// src/types/tagihan.d.ts
export type TagihanFormState = {
  status?: string;
  errors?: {
    santri_ids?: string[];
    master_tagihan_id?: string[];
    _form?: string[];
  };
};

export type Tagihan = {
  id_tagihan_santri: string; // Changed from number to string
  id_santri: string;
  id_master_tagihan: number;
  jumlah_tagihan: number;
  status_pembayaran: "BELUM BAYAR" | "LUNAS" | "KADALUARSA";
  payment_token: string | null;
  created_at: string;
  updated_at: string;
};

export type TagihanWithDetails = Tagihan & {
  santri: {
    id: string;
    name: string;
    avatar_url: string;
  };
  master_tagihan: {
    id: number;
    periode: string;
    description: string;
  };
};

// src/constants/tagihan-constant.ts
export const HEADER_TABLE_TAGIHAN = [
  "No",
  "ID Tagihan",
  "Nama Santri",
  "Periode",
  "Jumlah Tagihan",
  "Status",
  "Tanggal Dibuat",
  "Action",
];

export const STATUS_PEMBAYARAN = [
  {
    value: "BELUM BAYAR",
    label: "Belum Bayar",
  },
  {
    value: "LUNAS",
    label: "Lunas",
  },
  {
    value: "KADALUARSA",
    label: "Kadaluarsa",
  },
];

export const INITIAL_STATE_TAGIHAN = {
  status: "idle",
  errors: {
    santri_ids: [],
    master_tagihan_id: [],
    _form: [],
  },
};

// src/validations/tagihan-validation.ts
import z from "zod";

export const tagihanFormSchema = z.object({
  santri_ids: z.array(z.string()).min(1, "Pilih minimal 1 santri"),
  master_tagihan_id: z.string().min(1, "Pilih jenis tagihan"),
});

export type TagihanForm = z.infer<typeof tagihanFormSchema>;
