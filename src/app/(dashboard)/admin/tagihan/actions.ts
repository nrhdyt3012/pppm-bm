// src/app/(dashboard)/admin/tagihan/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { MenuFormState } from "@/types/menu";
import { menuSchema } from "@/validations/menu-validation";
import { revalidatePath } from "next/cache";

// Update Tagihan
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
      shodaqoh_sukarela: validatedFields.data.shodaqoh_sukarela,
      jariyah_sb: validatedFields.data.jariyah_sb,
      uang_tahunan: validatedFields.data.uang_tahunan,
      iuran_kampung: validatedFields.data.iuran_kampung,
    })
    .eq("id", formData.get("id"));

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

// Delete Tagihan
export async function deleteTagihan(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("master_tagihan")
    .delete()
    .eq("id", formData.get("id"));

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

  return { status: "success" };
}

// Create Tagihan Batch
export async function createTagihanBatch(prevState: any, formData: FormData) {
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

  // Ambil data santri untuk mendapatkan nama
  const { data: santriData } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", santriIds);

  // Buat order untuk setiap santri
  const ordersToInsert = (santriData || []).map((santri: any) => {
    return {
      order_id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_id: santri.id, // simpan ID
      master_tagihan_id: masterTagihanId,
      customer_name: santri.name,
      status: "process",
    };
  });

  const { error: insertError } = await supabase
    .from("orders")
    .insert(ordersToInsert);

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

  // Delete order_menus terlebih dahulu (foreign key constraint)
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

  // Delete order
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

  // Ambil nama santri
  const { data: santri } = await supabase
    .from("profiles")
    .select("name")
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
      customer_name: santri.name,
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

  // Get order ID from order_id
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

  // Insert items
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

  // This should call your Midtrans API to generate payment token
  // For now, return a dummy response
  return {
    status: "success",
    data: {
      payment_token: "dummy-token-" + Math.random().toString(36).substr(2, 9),
    },
  };
}
