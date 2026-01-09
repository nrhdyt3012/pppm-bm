import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { deleteTagihan } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

type DeleteActionState =
  | { status: "idle" | "success" }
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
  const [deleteTagihanState, deleteTagihanAction, isPendingDeleteTagihan] =
    useActionState(deleteTagihan, INITIAL_DELETE_STATE);

  const onSubmit = () => {
    if (!currentData || !currentData.id_tagihan_santri) {
      toast.error("Data tidak valid");
      return;
    }

    const formData = new FormData();
    formData.append(
      "id_tagihan_santri",
      currentData.id_tagihan_santri as string
    );

    startTransition(() => {
      deleteTagihanAction(formData);
    });
  };

  useEffect(() => {
    if (deleteTagihanState?.status === "error") {
      toast.error("Gagal Menghapus Tagihan", {
        description: deleteTagihanState.errors?._form?.[0],
      });
    }

    if (deleteTagihanState?.status === "success") {
      toast.success("Tagihan Berhasil Dihapus");
      handleChangeAction(false);
      refetch();
    }
  }, [deleteTagihanState, handleChangeAction, refetch]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPendingDeleteTagihan}
      onSubmit={onSubmit}
      title="Tagihan"
    />
  );
}
