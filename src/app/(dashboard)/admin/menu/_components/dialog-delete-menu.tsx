// src/app/(dashboard)/admin/menu/_components/dialog-delete-menu.tsx
import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { deleteMenu } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";
import { Menu } from "@/validations/menu-validation";

export default function DialogDeleteMenu({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Menu;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteMenuState, deleteMenuAction, isPendingDeleteMenu] =
    useActionState(deleteMenu, INITIAL_STATE_ACTION);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("id", currentData!.id_masterTagihan!.toString());    
    startTransition(() => {
      deleteMenuAction(formData);
    });
  };

  useEffect(() => {
    if (deleteMenuState?.status === "error") {
      toast.error("Gagal Menghapus Tagihan", {
        description: deleteMenuState.errors?._form?.[0],
      });
    }

    if (deleteMenuState?.status === "success") {
      toast.success("Tagihan Berhasil Dihapus");
      handleChangeAction?.(false);
      refetch();
    }
  }, [deleteMenuState]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPendingDeleteMenu}
      onSubmit={onSubmit}
      title="Tagihan"
    />
  );
}
