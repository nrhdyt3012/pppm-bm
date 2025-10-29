// src/app/(dashboard)/admin/menu/actions.tsx
"use server";

import { createClient } from "@/lib/supabase/server";
import { MenuFormState } from "@/types/menu";
import { menuSchema } from "@/validations/menu-validation";

export async function createMenu(prevState: MenuFormState, formData: FormData) {
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

  const { error } = await supabase.from("menus").insert({
    periode: validatedFields.data.periode,
    description: validatedFields.data.description,
    uang_makan: validatedFields.data.uang_makan,
    asrama: validatedFields.data.asrama,
    kas_pondok: validatedFields.data.kas_pondok,
    shodaqoh_sukarela: validatedFields.data.shodaqoh_sukarela,
    jariyah_sb: validatedFields.data.jariyah_sb,
    uang_tahunan: validatedFields.data.uang_tahunan,
    iuran_kampung: validatedFields.data.iuran_kampung,
  });

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function updateMenu(prevState: MenuFormState, formData: FormData) {
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
    .from("menus")
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

  return {
    status: "success",
  };
}

export async function deleteMenu(prevState: MenuFormState, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("menus")
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

  return { status: "success" };
}
