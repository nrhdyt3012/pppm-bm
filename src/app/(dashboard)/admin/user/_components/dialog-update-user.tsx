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
  currentData?: any; // pakai any dulu untuk debug
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
    console.log("=== FORM DATA DIKIRIM ===", data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "avatar_url") return;
      formData.append(key, (value as string) || "");
    });
    formData.append("id", currentData?.id ?? "");
    console.log("=== ID SISWA ===", currentData?.id);
    startTransition(() => {
      action(formData);
    });
  });

  useEffect(() => {
    if (state?.status === "error") {
      console.error("=== ERROR STATE ===", state.errors);
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

  useEffect(() => {
    if (currentData && open) {
      // DEBUG: lihat semua key yang ada di currentData
      console.log("=== CURRENT DATA LENGKAP ===", JSON.stringify(currentData, null, 2));
      console.log("=== KEYS ===", Object.keys(currentData));

      form.setValue("nama_siswa", currentData.namaSiswa || currentData.namasiswa || currentData.name || "");
      form.setValue("NIS", currentData.NIS || currentData.nis || "");

      // Ambil jenis kelamin dari semua kemungkinan field
      const rawJK =
        currentData.jeniskelamin ??
        currentData.jenis_kelamin ??
        currentData.jenisKelamin ??
        "";

      console.log("=== RAW JENIS KELAMIN ===", rawJK);

      // Normalisasi ke "Laki-laki" atau "Perempuan"
      let normalizedJK: "Laki-laki" | "Perempuan" | undefined;
      const jkLower = String(rawJK).toLowerCase().trim();
      if (jkLower === "laki-laki" || jkLower === "l" || jkLower === "laki") {
        normalizedJK = "Laki-laki";
      } else if (jkLower === "perempuan" || jkLower === "p") {
        normalizedJK = "Perempuan";
      }

      console.log("=== NORMALIZED JK ===", normalizedJK);

      if (normalizedJK) {
        form.setValue("jenis_kelamin", normalizedJK);
      }

      form.setValue("kelas", currentData.kelas || "");
      form.setValue("angkatan", currentData.angkatan || "");
      form.setValue("nama_wali", currentData.namaWali || currentData.namawali || "");
      form.setValue("no_wa", currentData.noWa || currentData.nowa || "");
      form.setValue("tempat_lahir", currentData.tempatLahir || currentData.tempatlahir || "");
      form.setValue("tanggal_lahir", currentData.tanggalLahir || currentData.tanggallahir || "");
      form.setValue("role", "siswa");

      // DEBUG: lihat nilai form setelah di-set
      setTimeout(() => {
        console.log("=== FORM VALUES SETELAH SET ===", form.getValues());
      }, 100);
    }
  }, [currentData, open]);

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