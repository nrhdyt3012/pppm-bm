import { INITIAL_STATE_UPDATE_USER } from "@/constants/auth-constant";
import { UpdateUserForm, updateUserSchema } from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "../actions";
import { toast } from "sonner";
import FormUser from "./form-user";
import { Profile } from "@/types/auth";
import { Dialog } from "@radix-ui/react-dialog";

export default function DialogUpdateUser({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Profile;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const form = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
  });

  const [state, action, isPending] = useActionState(
    updateUser,
    INITIAL_STATE_UPDATE_USER
  );

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "avatar_url") return; // abaikan avatar
      formData.append(key, (value as string) || "");
    });
    formData.append("id", currentData?.id ?? "");
    startTransition(() => {
      action(formData);
    });
  });

  useEffect(() => {
    if (state?.status === "error") {
      toast.error("Gagal Mengubah Data", {
        description: state.errors?._form?.[0],
      });
    }
    if (state?.status === "success") {
      toast.success("Data siswa berhasil diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [state]);

  // Isi form saat data berubah
  useEffect(() => {
    if (currentData) {
      form.setValue("nama_siswa", (currentData.namaSiswa || currentData.name || "") as string);
      form.setValue("NIS", (currentData.NIS || "") as string);
      form.setValue("kelas", (currentData.kelas || "") as string);
      form.setValue("angkatan", (currentData.angkatan || "") as string);
      form.setValue("nama_wali", (currentData.namaWali || "") as string);
      form.setValue("no_wa", (currentData.noWa || "") as string);
      form.setValue("tempat_lahir", (currentData.tempatLahir || "") as string);
      form.setValue("tanggal_lahir", (currentData.tanggalLahir || "") as string);
      form.setValue("role", "siswa");
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormUser
        form={form}
        onSubmit={onSubmit}
        isLoading={isPending}
        type="Update"
      />
    </Dialog>
  );
}