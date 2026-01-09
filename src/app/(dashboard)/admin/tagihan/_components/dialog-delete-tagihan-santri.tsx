// src/app/(dashboard)/admin/tagihan/_components/dialog-delete-tagihan.tsx
import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { deleteTagihanSantri } from "../actions";
import { toast } from "sonner";

type DeleteActionState =
  | { status: "idle" | "success"; errors?: undefined }
  | { status: "error"; errors: { _form: string[] } };

const INITIAL_DELETE_STATE: DeleteActionState = {
  status: "idle",
};

export default function DialogDeleteTagihan({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: any;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [deleteState, deleteAction, isPending] = useActionState(
    deleteTagihanSantri,
    INITIAL_DELETE_STATE
  );

  const onSubmit = () => {
    const formData = new FormData();
    formData.append(
      "id_tagihan_santri",
      currentData?.id_tagihan_santri as string
    );
    startTransition(() => {
      deleteAction(formData);
    });
  };

  useEffect(() => {
    if (deleteState?.status === "error") {
      toast.error("Gagal Menghapus Tagihan", {
        description: deleteState.errors?._form?.[0],
      });
    }

    if (deleteState?.status === "success") {
      toast.success("Tagihan Berhasil Dihapus");
      handleChangeAction(false);
      refetch();
    }
  }, [deleteState, handleChangeAction, refetch]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title={`Tagihan ${currentData?.santri?.name || ""}`}
    />
  );
}
