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
  const form = useForm<MenuForm>({ resolver: zodResolver(menuFormSchema) });
  const [state, action, isPending] = useActionState(updateMenu, INITIAL_STATE_MENU);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("id", currentData!.id_masterTagihan!.toString());
    formData.append("namaTagihan", data.namaTagihan);
    formData.append("jenjang", data.jenjang);
    formData.append("jenisTagihan", data.jenisTagihan);
    formData.append("nominal", data.nominal);
    formData.append("description", data.description || "");
    startTransition(() => { action(formData); });
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal Mengubah", { description: state.errors?._form?.[0] });
    }
    if (state?.status === "success") {
      toast.success("Master tagihan berhasil diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [state]);

  useEffect(() => {
    if (currentData) {
      form.setValue("namaTagihan", currentData.namaTagihan || "");
      form.setValue("jenjang", currentData.jenjang || "");
      form.setValue("jenisTagihan", currentData.jenisTagihan || "");
      form.setValue("nominal", currentData.nominal?.toString() || "");
      form.setValue("description", currentData.description || "");
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormMenu form={form} onSubmit={onSubmit} isLoading={isPending} type="Update" />
    </Dialog>
  );
}