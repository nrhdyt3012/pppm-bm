import { INITIAL_CREATE_USER_FORM, INITIAL_STATE_CREATE_USER } from "@/constants/auth-constant";
import { CreateUserForm, createUserSchema } from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createUser } from "../actions";
import { toast } from "sonner";
import { Preview } from "@/types/general";
import FormUser from "./form-user";

export default function DialogCreateUser({ refetch }: { refetch: () => void }) {
  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: INITIAL_CREATE_USER_FORM,
  });

  const [state, action, isPending] = useActionState(createUser, INITIAL_STATE_CREATE_USER);
  const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "avatar_url" && preview?.file) {
        formData.append(key, preview.file);
      } else {
        formData.append(key, value as string || "");
      }
    });
    startTransition(() => { action(formData); });
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal Menambah Siswa", { description: state.errors?._form?.[0] });
    }
    if (state?.status === "success") {
      toast.success("Data siswa berhasil ditambahkan");
      form.reset();
      setPreview(undefined);
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [state]);

  return <FormUser form={form} onSubmit={onSubmit} isLoading={isPending} type="Create" preview={preview} setPreview={setPreview} />;
}