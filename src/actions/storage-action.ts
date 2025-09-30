"use server";

import { environment } from "@/configs/environtment";
import { createClient } from "@/lib/supabase/server";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  prevPath?: string
) {
  const supabase = await createClient();

  const newPath = `${path}/${Date.now()}-${file.name}`;

  if (prevPath) {
    const { error } = await supabase.storage.from(bucket).remove([prevPath]);
    if (error) {
      return {
        status: "error",
        errors: {
          _form: [error.message],
        },
      };
    }
  }

  const { error } = await supabase.storage.from(bucket).upload(newPath, file);
  if (error) {
    return {
      status: "error",
      errors: {
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
    data: {
      url: `${environment.SUPABASE_URL}/storage/v1/object/public/${bucket}/${newPath}`,
      path: newPath,
    },
  };
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    return {
      status: "error",
      errors: {
        _form: [error.message],
      },
    };
  }

  return {
    status: "success",
  };
}
