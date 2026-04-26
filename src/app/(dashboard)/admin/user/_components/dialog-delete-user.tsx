import DialogDelete from "@/components/common/dialog-delete";
import { Profile } from "@/types/auth";
import { startTransition, useActionState, useEffect } from "react";
import { deleteUser } from "../actions";
import { INITIAL_STATE_ACTION } from "@/constants/general-constant";
import { toast } from "sonner";

export default function DialogDeleteUser({
  open,
  refetch,
  currentData,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Profile;
  open: boolean;
  handleChangeAction: (open: boolean) => void;
}) {
  const [state, action, isPending] = useActionState(deleteUser, INITIAL_STATE_ACTION);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append("id", currentData!.id as string);
    formData.append("avatar_url", currentData!.avatar_url as string ?? "");
    startTransition(() => { action(formData); });
  };

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal Menghapus", { description: state.errors?._form?.[0] });
    }
    if (state?.status === "success") {
      toast.success("Data siswa berhasil dihapus");
      handleChangeAction?.(false);
      refetch();
    }
  }, [state]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title={`Siswa ${currentData?.namaSiswa || currentData?.name || ""}`}
    />
  );
}