import FormImage from "@/components/common/form-image";
import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ROLE_LIST, JENIS_KELAMIN_LIST } from "@/constants/auth-constant";
import { Preview } from "@/types/general";
import { Loader2 } from "lucide-react";
import { FormEvent } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export default function FormUser<T extends FieldValues>({
  form,
  onSubmit,
  isLoading,
  type,
  preview,
  setPreview,
}: {
  form: UseFormReturn<T>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  type: "Create" | "Update";
  preview?: Preview;
  setPreview?: (preview: Preview) => void;
}) {
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
      <Form {...form}>
        <DialogHeader>
          <DialogTitle>{type} Santri</DialogTitle>
          <DialogDescription>
            {type === "Create" ? "Tambah data santri baru" : "Ubah data santri"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4 max-h-[60vh] px-1 overflow-y-auto">
            <FormInput
              form={form}
              name={"name" as Path<T>}
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
            />

            {type === "Create" && (
              <FormInput
                form={form}
                name={"email" as Path<T>}
                label="Email"
                placeholder="Masukkan email"
                type="email"
              />
            )}

            <FormSelect
              form={form}
              name={"jenis_kelamin" as Path<T>}
              label="Jenis Kelamin"
              selectItem={JENIS_KELAMIN_LIST}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name={"tempat_lahir" as Path<T>}
                label="Tempat Lahir"
                placeholder="Kota/Kabupaten"
              />
              <FormInput
                form={form}
                name={"tanggal_lahir" as Path<T>}
                label="Tanggal Lahir"
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </div>

            <FormInput
              form={form}
              name={"jurusan" as Path<T>}
              label="Jurusan"
              placeholder="Masukkan jurusan"
            />

            <FormInput
              form={form}
              name={"universitas" as Path<T>}
              label="Universitas / Sekolah"
              placeholder="Nama universitas/sekolah"
            />

            <FormInput
              form={form}
              name={"nama_ayah" as Path<T>}
              label="Nama Ayah"
              placeholder="Nama lengkap ayah"
            />

            <FormInput
              form={form}
              name={"pekerjaan_ayah" as Path<T>}
              label="Pekerjaan Ayah"
              placeholder="Pekerjaan ayah"
            />

            <FormInput
              form={form}
              name={"nama_ibu" as Path<T>}
              label="Nama Ibu"
              placeholder="Nama lengkap ibu"
            />

            <FormInput
              form={form}
              name={"pekerjaan_ibu" as Path<T>}
              label="Pekerjaan Ibu"
              placeholder="Pekerjaan ibu"
            />

            <FormImage
              form={form}
              name={"avatar_url" as Path<T>}
              label="Foto Santri"
              preview={preview}
              setPreview={setPreview}
            />

            <FormSelect
              form={form}
              name={"role" as Path<T>}
              label="Role"
              selectItem={ROLE_LIST}
            />

            {type === "Create" && (
              <FormInput
                form={form}
                name={"password" as Path<T>}
                label="Password"
                placeholder="******"
                type="password"
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
              {isLoading ? <Loader2 className="animate-spin" /> : type}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
