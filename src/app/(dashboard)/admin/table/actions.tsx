"use server";

import { createClient } from "@/lib/supabase/server";
import { TableFormState } from "@/types/table";
import { tableSchema } from "@/validations/table-validation";

export async function createTable(
  prevState: TableFormState,
  formData: FormData
) {
  const validatedFields = tableSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    capacity: parseInt(formData.get("capacity") as string),
    status: formData.get("status"),
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

  const { error } = await supabase.from("tables").insert({
    name: validatedFields.data.name,
    description: validatedFields.data.description,
    capacity: validatedFields.data.capacity,
    status: validatedFields.data.status,
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

export async function updateTable(
  prevState: TableFormState,
  formData: FormData
) {
  const validatedFields = tableSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    capacity: parseInt(formData.get("capacity") as string),
    status: formData.get("status"),
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
    .from("tables")
    .update({
      name: validatedFields.data.name,
      description: validatedFields.data.description,
      capacity: validatedFields.data.capacity,
      status: validatedFields.data.status,
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

export async function deleteTable(
  prevState: TableFormState,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tables")
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
