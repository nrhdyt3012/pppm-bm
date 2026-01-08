import { INITIAL_STATE_UPDATE_USER } from "@/constants/auth-constant";
import {
  UpdateUserForm,
  updateUserSchema,
} from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateUser } from "../actions";
import { toast } from "sonner";
import { Preview } from "@/types/general";
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

  const [updateUserState, updateUserAction, isPendingUpdateUser] =
    useActionState(updateUser, INITIAL_STATE_UPDATE_USER);

  const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    if (currentData?.avatar_url !== data.avatar_url) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(
          key,
          key === "avatar_url" ? preview!.file ?? "" : value
        );
      });
      formData.append("old_avatar_url", currentData?.avatar_url ?? "");
    } else {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    formData.append("id", currentData?.id ?? "");

    startTransition(() => {
      updateUserAction(formData);
    });
  });

  useEffect(() => {
    if (updateUserState?.status === "error") {
      toast.error("Update Santri Gagal", {
        description: updateUserState.errors?._form?.[0],
      });
    }

    if (updateUserState?.status === "success") {
      toast.success("Data Santri Berhasil Diubah");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateUserState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("name", currentData.name as string);
      // Mapping dari nama kolom database ke form
      form.setValue("jenis_kelamin", currentData.jenisKelamim || currentData.jenis_kelamin as string);
      form.setValue("tempat_lahir", currentData.tempatLahir || currentData.tempat_lahir as string);
      form.setValue("tanggal_lahir", currentData.tangggalLahir || currentData.tanggal_lahir as string);
      form.setValue("nama_ayah", currentData.namaAyah || currentData.nama_ayah as string);
      form.setValue("pekerjaan_ayah", currentData.pekerjaanAyah || currentData.pekerjaan_ayah as string);
      form.setValue("nama_ibu", currentData.namaIbu || currentData.nama_ibu as string);
      form.setValue("pekerjaan_ibu", currentData.pekerjaanIbu || currentData.pekerjaan_ibu as string);
      form.setValue("role", "santri");
      form.setValue("avatar_url", currentData.avatar_url as string);
      setPreview({
        file: new File([], currentData.avatar_url as string),
        displayUrl: currentData.avatar_url as string,
      });
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormUser
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateUser}
        type="Update"
        preview={preview}
        setPreview={setPreview}
      />
    </Dialog>
  );
}