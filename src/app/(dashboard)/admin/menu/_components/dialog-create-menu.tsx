import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createMenu } from "../actions";
import { toast } from "sonner";
import { MenuForm, menuFormSchema } from "@/validations/menu-validation";
import { INITIAL_MENU, INITIAL_STATE_MENU } from "@/constants/menu-constant";
import FormMenu from "./form-menu";

export default function DialogCreateMenu({ refetch }: { refetch: () => void }) {
  const form = useForm<MenuForm>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: INITIAL_MENU,
  });

  const [state, action, isPending] = useActionState(createMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("namaTagihan", data.namaTagihan);
    formData.append("jenjang", data.jenjang);
    formData.append("jenisTagihan", data.jenisTagihan);
    formData.append("nominal", data.nominal);
    formData.append("description", data.description || "");
    startTransition(() => { action(formData); });
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal Menyimpan", { description: state.errors?._form?.[0] });
    }
    if (state?.status === "success") {
      toast.success("Master tagihan berhasil ditambahkan");
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [state]);

  return <FormMenu form={form} onSubmit={onSubmit} isLoading={isPending} type="Create" />;
}