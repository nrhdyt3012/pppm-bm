"use server";

import { createClient } from "@/lib/supabase/server";
import { formState } from "@/types/general";
import { Cart, OrderFormState } from "@/types/order";
import { redirect } from "next/navigation";
import midtrans from "midtrans-client";
import { environment } from "@/configs/environtment";

export async function createOrderBatch(
  prevState: formState,
  formData: FormData
) {
  const santriIds = JSON.parse(
    formData.get("santri_ids") as string
  ) as string[];
  const menuId = formData.get("menu_id") as string;

  if (!santriIds || santriIds.length === 0) {
    return {
      status: "error",
      errors: {
        _form: ["Pilih minimal 1 santri"],
      },
    };
  }

  if (!menuId) {
    return {
      status: "error",
      errors: {
        _form: ["Pilih jenis tagihan"],
      },
    };
  }

  const supabase = await createClient();

  // Ambil data menu/tagihan
  const { data: menu, error: menuError } = await supabase
    .from("master_tagihan")
    .select("*")
    .eq("id", menuId)
    .single();

  if (menuError || !menu) {
    return {
      status: "error",
      errors: {
        _form: ["Data tagihan tidak ditemukan"],
      },
    };
  }

  // Hitung total nominal
  const totalNominal =
    (menu.uang_makan || 0) +
    (menu.asrama || 0) +
    (menu.kas_pondok || 0) +
    (menu.shodaqoh_sukarela || 0) +
    (menu.jariyah_sb || 0) +
    (menu.uang_tahunan || 0) +
    (menu.iuran_kampung || 0);

  // Ambil data santri
  const { data: santriList, error: santriError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", santriIds);

  if (santriError || !santriList) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal memuat data santri"],
      },
    };
  }

  // Buat order untuk setiap santri
  const ordersToInsert = santriList.map((santri) => {
    const orderId = `PPPMBM-${Date.now()}-${santri.id.substring(0, 8)}`;
    return {
      order_id: orderId,
      customer_name: santri.name,
      status: "process",
      table_id: null, // Tidak pakai table lagi
    };
  });

  const { data: createdOrders, error: orderError } = await supabase
    .from("orders")
    .insert(ordersToInsert)
    .select();

  if (orderError || !createdOrders) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal membuat tagihan: " + orderError?.message],
      },
    };
  }

  // Buat order_menus untuk setiap order
  const orderMenusToInsert = createdOrders.map((order) => ({
    order_id: order.id,
    menu_id: parseInt(menuId),
    quantity: 1,
    nominal: totalNominal,
    status: "pending",
    notes: menu.name, // Simpan nama periode sebagai notes
  }));

  const { error: orderMenuError } = await supabase
    .from("orders_menus")
    .insert(orderMenusToInsert);

  if (orderMenuError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal membuat detail tagihan: " + orderMenuError.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function addOrderItem(
  prevState: OrderFormState,
  data: {
    order_id: string;
    items: Cart[];
  }
) {
  const supabase = await createClient();

  const payload = data.items.map(({ menu, ...item }) => item);

  const { error } = await supabase.from("orders_menus").insert(payload);
  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState,
        _form: [],
      },
    };
  }

  redirect(`/order/${data.order_id}`);
}

export async function updateStatusOrderitem(
  prevState: formState,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders_menus")
    .update({
      status: formData.get("status"),
    })
    .eq("id", formData.get("id"));

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function updateOrderCustomer(
  prevState: formState,
  formData: FormData
) {
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

  const supabase = await createClient();

  // Ambil data santri
  const { data: santri, error: santriError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", santriId)
    .single();

  if (santriError || !santri) {
    return {
      status: "error",
      errors: {
        _form: ["Data santri tidak ditemukan"],
      },
    };
  }

  // Update order
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

  return {
    status: "success",
  };
}

export async function deleteOrder(prevState: formState, formData: FormData) {
  const orderId = formData.get("order_id") as string;

  if (!orderId) {
    return {
      status: "error",
      errors: {
        _form: ["Order ID tidak valid"],
      },
    };
  }

  const supabase = await createClient();

  // Ambil data order untuk mendapatkan ID internal
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("order_id", orderId)
    .single();

  if (orderError || !order) {
    return {
      status: "error",
      errors: {
        _form: ["Tagihan tidak ditemukan"],
      },
    };
  }

  // Hapus order_menus terlebih dahulu (foreign key constraint)
  const { error: deleteMenusError } = await supabase
    .from("orders_menus")
    .delete()
    .eq("order_id", order.id);

  if (deleteMenusError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus detail tagihan: " + deleteMenusError.message],
      },
    };
  }

  // Hapus order
  const { error: deleteOrderError } = await supabase
    .from("orders")
    .delete()
    .eq("order_id", orderId);

  if (deleteOrderError) {
    return {
      status: "error",
      errors: {
        _form: ["Gagal menghapus tagihan: " + deleteOrderError.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function generatePayment(
  prevState: formState,
  formData: FormData
) {
  const supabase = await createClient();
  const orderId = formData.get("id");
  const grossAmount = formData.get("gross_amount");
  const customerName = formData.get("customer_name");

  const snap = new midtrans.Snap({
    isProduction: false,
    serverKey: environment.MIDTRANS_SERVER_KEY!,
  });
  const parameter = {
    transaction_details: {
      order_id: `${orderId}`,
      gross_amount: parseFloat(grossAmount as string),
    },
    customer_details: {
      first_name: customerName,
    },
  };

  const result = await snap.createTransaction(parameter);

  if (result.error_messages) {
    return {
      status: "error",
      errors: {
        ...prevState,
        _form: [result.error_messages],
      },
      data: {
        payment_token: "",
      },
    };
  }

  await supabase
    .from("orders")
    .update({ payment_token: result.token })
    .eq("order_id", orderId);

  return {
    status: "success",
    data: {
      payment_token: `${result.token}`,
    },
  };
}
