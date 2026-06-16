import DialogDelete from "@/components/common/dialog-delete";
import { startTransition, useActionState, useEffect, useRef } from "react";
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
  const [state, action, isPending] = useActionState(
    deleteTagihanSiswa,
    INITIAL_STATE
  );

  // Pakai ref untuk track apakah sudah handle state ini
  // supaya tidak double-trigger
  const handledRef = useRef<string | null>(null);

  const onSubmit = () => {
    const formData = new FormData();
    formData.append(
      "idtagihansiswa",
      currentData?.idtagihansiswa?.toString() ?? ""
    );
    // Reset handled ref setiap submit baru
    handledRef.current = null;
    startTransition(() => {
      action(formData);
    });
  };

  useEffect(() => {
    // Guard: jangan proses state yang sama dua kali
    const stateKey = `${state?.status}-${currentData?.idtagihansiswa}`;
    if (handledRef.current === stateKey) return;

    if (state?.status === "error") {
      handledRef.current = stateKey;
      toast.error("Gagal Menghapus", {
        description: state.errors?._form?.[0],
      });
    }

    if (state?.status === "success") {
      handledRef.current = stateKey;
      toast.success("Tagihan berhasil dihapus");
      handleChangeAction(false);
      // Paksa refetch dengan sedikit delay
      // agar server action selesai commit sebelum query dijalankan
      setTimeout(() => {
        refetch();
      }, 300);
    }
  }, [state]);

  return (
    <DialogDelete
      open={open}
      onOpenChange={handleChangeAction}
      isLoading={isPending}
      onSubmit={onSubmit}
      title={`Tagihan #${currentData?.idtagihansiswa} — ${
        currentData?.siswa?.namasiswa || ""
      }`}
    />
  );
}