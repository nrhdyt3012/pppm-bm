import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect } from "react";
import { deleteTagihanSiswa } from "../actions";
import { toast } from "sonner";

const INITIAL_STATE = { status: "idle", errors: { _form: [] } };

export default function DialogDeleteTagihanSiswa({
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
  const [state, action, isPending] = useActionState(deleteTagihanSiswa, INITIAL_STATE);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("idtagihansiswa", currentData?.idtagihansiswa?.toString() ?? "");
    startTransition(() => { action(formData); });
  };

  useEffect(() => {
    if (state?.status === "error") toast.error("Gagal Menghapus", { description: state.errors?._form?.[0] });
    if (state?.status === "success") {
      toast.success("Tagihan berhasil dihapus");
      handleChangeAction(false);
      refetch();
    }
  }, [state]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title={`Tagihan #${currentData?.idtagihansiswa} — ${currentData?.siswa?.namasiswa || ""}`}
    />
  );
}