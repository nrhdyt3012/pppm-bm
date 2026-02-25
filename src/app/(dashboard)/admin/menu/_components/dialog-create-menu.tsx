// src/app/(dashboard)/admin/menu/_components/dialog-create-menu.tsx
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

  const [createMenuState, createMenuAction, isPendingCreateMenu] =
    useActionState(createMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
  const formData = new FormData();
  // Pastikan semua key sesuai schema
  formData.append("periode", data.periode);
  formData.append("description", data.description);
  formData.append("uang_makan", data.uang_makan);
  formData.append("asrama", data.asrama);
  formData.append("kas_pondok", data.kas_pondok);
  formData.append("sedekah_sukarela", data.sedekah_sukarela); // ✅
  formData.append("aset_jariyah", data.aset_jariyah);         // ✅
  formData.append("uang_tahunan", data.uang_tahunan);
  formData.append("iuran_kampung", data.iuran_kampung);

  startTransition(() => {
    createMenuAction(formData);
  });
});

  useEffect(() => {
    if (createMenuState?.status === "error") {
      toast.error("Gagal Membuat Tagihan", {
        description: createMenuState.errors?._form?.[0],
      });
    }

    if (createMenuState?.status === "success") {
      toast.success("Tagihan Berhasil Dibuat");
      form.reset();
      document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
      refetch();
    }
  }, [createMenuState]);

  return (
    <FormMenu
      form={form}
      onSubmit={onSubmit}
      isLoading={isPendingCreateMenu}
      type="Create"
    />
  );
}
