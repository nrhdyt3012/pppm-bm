// src/app/(dashboard)/admin/menu/actions.tsx
"use server";

import { createClient } from "@/lib/supabase/server";
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
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("master_tagihan").insert({
    namaTagihan: validatedFields.data.namaTagihan,
    jenjang: validatedFields.data.jenjang,
    jenisTagihan: validatedFields.data.jenisTagihan,
    nominal: validatedFields.data.nominal,
    description: validatedFields.data.description,
  });

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

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
      namaTagihan: validatedFields.data.namaTagihan,
      jenjang: validatedFields.data.jenjang,
      jenisTagihan: validatedFields.data.jenisTagihan,
      nominal: validatedFields.data.nominal,
      description: validatedFields.data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id_masterTagihan", validatedFields.data.id_masterTagihan);

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  revalidatePath("/admin/menu");
  return { status: "success" };
}

export async function deleteMenu(prevState: MenuFormState, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("master_tagihan")
    .delete()
    .eq("id_masterTagihan", parseInt(formData.get("id") as string));

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  revalidatePath("/admin/menu");
  return { status: "success" };
}