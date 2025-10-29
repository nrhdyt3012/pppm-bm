// src/app/(dashboard)/admin/menu/_components/dialog-update-menu.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateMenu } from "../actions";
import { toast } from "sonner";
import FormMenu from "./form-menu";
import { Dialog } from "@radix-ui/react-dialog";
import { Menu, MenuForm, menuFormSchema } from "@/validations/menu-validation";
import { INITIAL_STATE_MENU } from "@/constants/menu-constant";

export default function DialogUpdateMenu({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Menu;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const form = useForm<MenuForm>({
    resolver: zodResolver(menuFormSchema),
  });

  const [updateMenuState, updateMenuAction, isPendingUpdateMenu] =
    useActionState(updateMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("id", currentData?.id ?? "");

    startTransition(() => {
      updateMenuAction(formData);
    });
  });

  useEffect(() => {
    if (updateMenuState?.status === "error") {
      toast.error("Gagal Mengubah Tagihan", {
        description: updateMenuState.errors?._form?.[0],
      });
    }

    if (updateMenuState?.status === "success") {
      toast.success("Tagihan Berhasil Diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateMenuState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("periode", currentData.periode);
      form.setValue("description", currentData.description);
      form.setValue("uang_makan", currentData.uang_makan.toString());
      form.setValue("asrama", currentData.asrama.toString());
      form.setValue("kas_pondok", currentData.kas_pondok.toString());
      form.setValue(
        "shodaqoh_sukarela",
        currentData.shodaqoh_sukarela.toString()
      );
      form.setValue("jariyah_sb", currentData.jariyah_sb.toString());
      form.setValue("uang_tahunan", currentData.uang_tahunan.toString());
      form.setValue("iuran_kampung", currentData.iuran_kampung.toString());
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormMenu
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateMenu}
        type="Update"
      />
    </Dialog>
  );
}
