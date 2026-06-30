"use server";

// src/app/(dashboard)/admin/menu/actions.ts

import { createClient } from "@/lib/supabase/server";
import { writeChangelog } from "@/lib/changelog";
import { MenuFormState } from "@/types/menu";
import { menuSchema } from "@/validations/menu-validation";
import { revalidatePath } from "next/cache";

export async function createMenu(prevState: MenuFormState, formData: FormData) {
  const validatedFields = menuSchema.safeParse({
    namaTagihan: formData.get("namaTagihan"),
    jenjang: formData.get("jenjang"),
    jenisTagihan: formData.get("jenisTagihan"),
    nominal: parseFloat(formData.get("nominal") as string) || 0,
    description: formData.get("description") || "",
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: { ...validatedFields.error.flatten().fieldErrors, _form: [] },
    };
  }

  const supabase = await createClient({ isAdmin: true });

  const { error } = await supabase.from("master_tagihan").insert({
    namatagihan: validatedFields.data.namaTagihan,
    jenjang: validatedFields.data.jenjang,
    jenistagihan: validatedFields.data.jenisTagihan, // "Reguler" | "Subsidi"
    nominal: validatedFields.data.nominal,
    description: validatedFields.data.description,
  });

  if (error) {
    return { status: "error", errors: { ...prevState.errors, _form: [error.message] } };
  }

  // Gunakan jenisTagihanDisplay (e.g. "SPP Reguler") untuk deskripsi changelog yang lebih jelas
  const jenisTagihanDisplay = (formData.get("jenisTagihanDisplay") as string) || validatedFields.data.jenisTagihan;

  await writeChangelog({
    supabase,
    namamenu: "Master Tagihan",
    jenisaksi: "TAMBAH",
    deskripsi: `Menambahkan master tagihan "${validatedFields.data.namaTagihan}" (${validatedFields.data.jenjang} - ${jenisTagihanDisplay})`,
  });

  revalidatePath("/admin/menu");
  return { status: "success" };
}

export async function updateMenu(prevState: MenuFormState, formData: FormData) {
  const validatedFields = menuSchema.safeParse({
    id_masterTagihan: parseInt(formData.get("id") as string),
    namaTagihan: formData.get("namaTagihan"),
    jenjang: formData.get("jenjang"),
    jenisTagihan: formData.get("jenisTagihan"),
    nominal: parseFloat(formData.get("nominal") as string) || 0,
    description: formData.get("description") || "",
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: { ...validatedFields.error.flatten().fieldErrors, _form: [] },
    };
  }

  const supabase = await createClient({ isAdmin: true });

  const { error } = await supabase
    .from("master_tagihan")
    .update({
      namatagihan: validatedFields.data.namaTagihan,
      jenjang: validatedFields.data.jenjang,
      jenistagihan: validatedFields.data.jenisTagihan,
      nominal: validatedFields.data.nominal,
      description: validatedFields.data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id_mastertagihan", validatedFields.data.id_masterTagihan);

  if (error) {
    return { status: "error", errors: { ...prevState.errors, _form: [error.message] } };
  }

  const jenisTagihanDisplay = (formData.get("jenisTagihanDisplay") as string) || validatedFields.data.jenisTagihan;

  await writeChangelog({
    supabase,
    namamenu: "Master Tagihan",
    jenisaksi: "UBAH",
    deskripsi: `Mengubah master tagihan "${validatedFields.data.namaTagihan}" (${validatedFields.data.jenjang} - ${jenisTagihanDisplay})`,
  });

  revalidatePath("/admin/menu");
  return { status: "success" };
}

export async function deleteMenu(prevState: MenuFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const id = parseInt(formData.get("id") as string);

  const { data: existing } = await supabase
    .from("master_tagihan")
    .select("namatagihan")
    .eq("id_mastertagihan", id)
    .maybeSingle();

  const { error } = await supabase
    .from("master_tagihan")
    .delete()
    .eq("id_mastertagihan", id);

  if (error) {
    return { status: "error", errors: { ...prevState.errors, _form: [error.message] } };
  }

  await writeChangelog({
    supabase,
    namamenu: "Master Tagihan",
    jenisaksi: "HAPUS",
    deskripsi: `Menghapus master tagihan "${existing?.namatagihan || `#${id}`}"`,
  });

  revalidatePath("/admin/menu");
  return { status: "success" };
}