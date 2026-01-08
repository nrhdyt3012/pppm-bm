// src/app/(dashboard)/admin/tagihan/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { TagihanFormState } from "@/types/tagihan";
import { revalidatePath } from "next/cache";

export async function createTagihanBatch(
  prevState: TagihanFormState,
  formData: FormData
) {
  const santriIds = JSON.parse(
    formData.get("santri_ids") as string
  ) as string[];
  const masterTagihanId = formData.get("master_tagihan_id") as string;

  if (!santriIds || santriIds.length === 0) {
    return {
      status: "error",
      errors: {
        _form: ["Pilih minimal 1 santri"],
      },
    };
  }

  if (!masterTagihanId) {
    return {
      status: "error",
      errors: {
        _form: ["Pilih jenis tagihan"],
      },
    };
  }

  const supabase = await createClient();

  // Ambil data master tagihan
  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return {
      status: "error",
      errors: {
        _form: ["Data tagihan tidak ditemukan"],
      },
    };
  }

  // Hitung total nominal dari master tagihan
  const totalNominal =
    (masterTagihan.uang_makan || 0) +
    (masterTagihan.asrama || 0) +
    (masterTagihan.kas_pondok || 0) +
    (masterTagihan.shodaqoh_sukarela || 0) +
    (masterTagihan.jariyah_sb || 0) +
    (masterTagihan.uang_tahunan || 0) +
    (masterTagihan.iuran_kampung || 0);

  // Ambil data santri
  const { data: santriList, error: santriError } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", santriIds);

  if (santriError || !santriList) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal memuat data santri"],
      },
    };
  }

  // Buat tagihan untuk setiap santri
  const tagihanToInsert = santriList.map((santri) => ({
    id_santri: santri.id,
    id_master_tagihan: parseInt(masterTagihanId),
    jumlah_tagihan: totalNominal,
    status_pembayaran: "BELUM BAYAR",
  }));

  const { error: insertError } = await supabase
    .from("tagihan_santri")
    .insert(tagihanToInsert);

  if (insertError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal membuat tagihan: " + insertError.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return {
    status: "success",
  };
}

export async function updateTagihan(
  prevState: TagihanFormState,
  formData: FormData
) {
  const idTagihan = formData.get("id_tagihan") as string;
  const idSantri = formData.get("id_santri") as string;
  const masterTagihanId = formData.get("master_tagihan_id") as string;

  if (!idTagihan || !idSantri || !masterTagihanId) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  const supabase = await createClient();

  // Ambil data master tagihan baru
  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return {
      status: "error",
      errors: {
        _form: ["Data tagihan tidak ditemukan"],
      },
    };
  }

  // Hitung total nominal
  const totalNominal =
    (masterTagihan.uang_makan || 0) +
    (masterTagihan.asrama || 0) +
    (masterTagihan.kas_pondok || 0) +
    (masterTagihan.shodaqoh_sukarela || 0) +
    (masterTagihan.jariyah_sb || 0) +
    (masterTagihan.uang_tahunan || 0) +
    (masterTagihan.iuran_kampung || 0);

  // Update tagihan
  const { error: updateError } = await supabase
    .from("tagihan_santri")
    .update({
      id_santri: idSantri,
      id_master_tagihan: parseInt(masterTagihanId),
      jumlah_tagihan: totalNominal,
    })
    .eq("id_tagihan_santri", parseInt(idTagihan));

  if (updateError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal mengubah tagihan: " + updateError.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return {
    status: "success",
  };
}

export async function deleteTagihan(
  prevState: TagihanFormState,
  formData: FormData
) {
  const idTagihan = formData.get("id_tagihan") as string;

  if (!idTagihan) {
    return {
      status: "error",
      errors: {
        _form: ["ID tagihan tidak valid"],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tagihan_santri")
    .delete()
    .eq("id_tagihan_santri", parseInt(idTagihan));

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus tagihan: " + error.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return {
    status: "success",
  };
}