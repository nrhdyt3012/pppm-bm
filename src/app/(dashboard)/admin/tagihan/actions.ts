// src/app/(dashboard)/admin/tagihan/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { MenuFormState } from "@/types/menu";
import { menuSchema } from "@/validations/menu-validation";
import { revalidatePath } from "next/cache";

// Update Tagihan (Master Tagihan)
export async function updateTagihan(
  prevState: MenuFormState,
  formData: FormData
) {
  const validatedFields = menuSchema.safeParse({
    periode: formData.get("periode"),
    description: formData.get("description"),
    uang_makan: parseFloat(formData.get("uang_makan") as string) || 0,
    asrama: parseFloat(formData.get("asrama") as string) || 0,
    kas_pondok: parseFloat(formData.get("kas_pondok") as string) || 0,
    shodaqoh_sukarela:
      parseFloat(formData.get("shodaqoh_sukarela") as string) || 0,
    jariyah_sb: parseFloat(formData.get("jariyah_sb") as string) || 0,
    uang_tahunan: parseFloat(formData.get("uang_tahunan") as string) || 0,
    iuran_kampung: parseFloat(formData.get("iuran_kampung") as string) || 0,
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("master_tagihan")
    .update({
      periode: validatedFields.data.periode,
      description: validatedFields.data.description,
      uang_makan: validatedFields.data.uang_makan,
      asrama: validatedFields.data.asrama,
      kas_pondok: validatedFields.data.kas_pondok,
      sedekah_sukarela: validatedFields.data.sedekah_sukarela,
      aset_jariyah: validatedFields.data.aset_jariyah,
      uang_tahunan: validatedFields.data.uang_tahunan,
      iuran_kampung: validatedFields.data.iuran_kampung,
    })
    .eq("idMasterTagihan", formData.get("id"));

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return {
    status: "success",
  };
}

// Delete Tagihan (Master Tagihan)
export async function deleteTagihan(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const idTagihanSantri = formData.get("idTagihanSantri") as string;

  if (!idTagihanSantri) {
    return {
      status: "error",
      errors: {
        _form: ["ID tagihan tidak valid"],
      },
    };
  }

  const { error } = await supabase
    .from("tagihan_santri")
    .delete()
    .eq("idTagihanSantri", idTagihanSantri); // PENTING: gunakan id_tagihan_santri

  if (error) {
    console.error("Delete error:", error);
    return {
      status: "error",
      errors: {
        _form: [`Gagal menghapus tagihan: ${error.message}`],
      },
    };
  }

  revalidatePath("/admin/tagihan");
  return { status: "success" };
}

// src/app/(dashboard)/admin/tagihan/actions.ts
// TAMBAHKAN atau UPDATE function ini
export async function updateTagihanSantri(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idTagihanSantri");
  const idMasterTagihan = formData.get("idMasterTagihan");
  const jumlahTagihan = formData.get("jumlahTagihan");
  const statusPembayaran = formData.get("statusPembayaran");

  if (!idTagihan || !idMasterTagihan || !jumlahTagihan || !statusPembayaran) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  const supabase = await createClient();

  // Update tagihan_santri
  const { error } = await supabase
    .from("tagihan_santri")
    .update({
      idMasterTagihan: parseInt(idMasterTagihan as string),
      jumlahTagihan: parseFloat(jumlahTagihan as string),
      statusPembayaran: statusPembayaran as string,
      updatedAt: new Date().toISOString(),
    })
    .eq("idTagihanSantri", idTagihan);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal mengubah tagihan: " + error.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return { status: "success" };
}

// Delete Tagihan Santri
export async function deleteTagihanSantri(prevState: any, formData: FormData) {
  const idTagihan = formData.get("idTagihanSantri");

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
    .eq("idTagihanSantri", idTagihan);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus tagihan: " + error.message],
      },
    };
  }

  revalidatePath("/admin/tagihan");

  return { status: "success" };
}

// Create Tagihan Batch - DIPERBAIKI
export async function createTagihanBatch(
  prevState: any,
  formData: FormData | null
) {
  if (!formData) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak valid"],
      },
    };
  }

  const santriIdsStr = formData.get("santri_ids");
  const masterTagihanId = formData.get("master_tagihan_id");

  if (!santriIdsStr || !masterTagihanId) {
    return {
      status: "error",
      errors: {
        _form: ["Data santri atau tagihan tidak lengkap"],
      },
    };
  }

  let santriIds: string[];
  try {
    santriIds = JSON.parse(santriIdsStr as string) as string[];
  } catch (error) {
    return {
      status: "error",
      errors: {
        _form: ["Format data santri tidak valid"],
      },
    };
  }

  if (!santriIds || santriIds.length === 0) {
    return {
      status: "error",
      errors: {
        _form: ["Pilih minimal 1 santri"],
      },
    };
  }

  const supabase = await createClient();

  // ✅ DIPERBAIKI: Gunakan relasi ke santri, bukan profiles
  const { data: existingTagihan, error: checkError } = await supabase
    .from("tagihan_santri")
    .select("idSantri, santri!idSantri(nama)")
    .eq("idMasterTagihan", masterTagihanId)
    .in("idSantri", santriIds);

  if (checkError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal memeriksa duplikat: " + checkError.message],
      },
    };
  }

  // Jika ada yang duplikat, beri warning
  if (existingTagihan && existingTagihan.length > 0) {
    const duplicateNames = existingTagihan
      .map((t: any) => t.santri?.nama)
      .join(", ");

    return {
      status: "error",
      errors: {
        _form: [
          `Santri berikut sudah memiliki tagihan periode ini: ${duplicateNames}. Silakan hapus dari pilihan atau pilih periode lain.`,
        ],
      },
    };
  }

  // Ambil data master tagihan
  const { data: masterTagihan, error: masterError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id_masterTagihan", masterTagihanId)
    .single();

  if (masterError || !masterTagihan) {
    return {
      status: "error",
      errors: {
        _form: ["Data tagihan tidak ditemukan"],
      },
    };
  }

  // Hitung total tagihan
  const jumlahTagihan =
    (masterTagihan.uang_makan || 0) +
    (masterTagihan.asrama || 0) +
    (masterTagihan.kas_pondok || 0) +
    (masterTagihan.sedekah_sukarela || 0) +
    (masterTagihan.aset_jariyah || 0) +
    (masterTagihan.uang_tahunan || 0) +
    (masterTagihan.iuran_kampung || 0);

  // Buat tagihan untuk setiap santri (ID akan auto-generate dari trigger)
  const tagihanToInsert = santriIds.map((santriId: string) => ({
    idSantri: santriId,
    idMasterTagihan: parseInt(masterTagihanId as string),
    jumlahTagihan: jumlahTagihan,
    statusPembayaran: "BELUM BAYAR",
  }));

  const { error: insertError } = await supabase
    .from("tagihan_santri")
    .insert(tagihanToInsert);

  if (insertError) {
    console.error("Insert error:", insertError);
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

// Delete Order (untuk order.tsx)
export async function deleteOrder(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const orderId = formData.get("order_id") as string;

  if (!orderId) {
    return {
      status: "error",
      errors: {
        _form: ["Order ID tidak valid"],
      },
    };
  }

  const { error: deleteMenuError } = await supabase
    .from("orders_menus")
    .delete()
    .eq(
      "order_id",
      (
        await supabase
          .from("orders")
          .select("id")
          .eq("order_id", orderId)
          .single()
      ).data?.id
    );

  if (deleteMenuError && deleteMenuError.code !== "PGRST116") {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus order: " + deleteMenuError.message],
      },
    };
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("order_id", orderId);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus tagihan: " + error.message],
      },
    };
  }

  revalidatePath("/admin/order");

  return { status: "success" };
}

// Update Order Customer
export async function updateOrderCustomer(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const orderId = formData.get("order_id") as string;
  const santriId = formData.get("santri_id") as string;

  if (!orderId || !santriId) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  const { data: santri } = await supabase
    .from("santri")
    .select("nama")
    .eq("id", santriId)
    .single();

  if (!santri) {
    return {
      status: "error",
      errors: {
        _form: ["Santri tidak ditemukan"],
      },
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      customer_name: santri.nama,
    })
    .eq("order_id", orderId);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal mengubah tagihan: " + error.message],
      },
    };
  }

  revalidatePath("/admin/order");

  return { status: "success" };
}

// Add Order Item
export async function addOrderItem(prevState: any, data: any) {
  const supabase = await createClient();
  const { order_id, items } = data;

  if (!order_id || !items || items.length === 0) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  const { data: orderData } = await supabase
    .from("orders")
    .select("id")
    .eq("order_id", order_id)
    .single();

  if (!orderData) {
    return {
      status: "error",
      errors: {
        _form: ["Order tidak ditemukan"],
      },
    };
  }

  const itemsToInsert = items.map((item: any) => ({
    order_id: orderData.id,
    ...item,
  }));

  const { error } = await supabase.from("orders_menus").insert(itemsToInsert);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menambah item: " + error.message],
      },
    };
  }

  revalidatePath(`/order/${order_id}`);

  return { status: "success" };
}

// Update Status Order Item
export async function updateStatusOrderitem(
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id || !status) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  const { error } = await supabase
    .from("orders_menus")
    .update({ status })
    .eq("id", id);

  if (error) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal mengubah status: " + error.message],
      },
    };
  }

  return { status: "success" };
}

// Generate Payment
export async function generatePayment(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const grossAmount = formData.get("gross_amount") as string;
  const customerName = formData.get("customer_name") as string;

  if (!id || !grossAmount || !customerName) {
    return {
      status: "error",
      errors: {
        _form: ["Data tidak lengkap"],
      },
    };
  }

  return {
    status: "success",
    data: {
      payment_token: "dummy-token-" + Math.random().toString(36).substr(2, 9),
    },
  };
}