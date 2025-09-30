import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateMenu } from "../actions";
import { toast } from "sonner";
import { Preview } from "@/types/general";
import FormMenu from "./form-menu";
import { Dialog } from "@radix-ui/react-dialog";
import { Menu, MenuForm, menuFormSchema } from "@/validations/menu-validation";
import { INITIAL_STATE_MENU } from "@/constants/menu-constant";

export default function DialogUpdateMenu({
  refetch,
  currentData,
  open,
  handleChangeAction,
}: {
  refetch: () => void;
  currentData?: Menu;
  open?: boolean;
  handleChangeAction?: (open: boolean) => void;
}) {
  const form = useForm<MenuForm>({
    resolver: zodResolver(menuFormSchema),
  });

  const [updateMenuState, updateMenuAction, isPendingUpdateMenu] =
    useActionState(updateMenu, INITIAL_STATE_MENU);

  const [preview, setPreview] = useState<Preview | undefined>(undefined);

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    if (currentData?.image_url !== data.image_url) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, key === "image_url" ? preview!.file ?? "" : value);
      });
      formData.append("old_image_url", currentData?.image_url ?? "");
    } else {
      Object.entries(data).forEach(([Key, value]) => {
        formData.append(Key, value);
      });
    }
    formData.append("id", currentData?.id ?? "");

    startTransition(() => {
      updateMenuAction(formData);
    });
  });

  useEffect(() => {
    if (updateMenuState?.status === "error") {
      toast.error("Update Menu Failed", {
        description: updateMenuState.errors?._form?.[0],
      });
    }

    if (updateMenuState?.status === "success") {
      toast.success("Update Menu Success");
      form.reset();
      handleChangeAction?.(false);
      refetch();
    }
  }, [updateMenuState]);

  useEffect(() => {
    if (currentData) {
      form.setValue("name", currentData.name);
      form.setValue("description", currentData.description);
      form.setValue("price", currentData.price.toString());
      form.setValue("discount", currentData.discount.toString());
      form.setValue("category", currentData.category);
      form.setValue("is_available", currentData.is_available.toString());
      form.setValue("image_url", currentData.image_url);
      setPreview({
        file: new File([], currentData.image_url as string),
        displayUrl: currentData.image_url as string,
      });
    }
  }, [currentData]);

  return (
    <Dialog open={open} onOpenChange={handleChangeAction}>
      <FormMenu
        form={form}
        onSubmit={onSubmit}
        isLoading={isPendingUpdateMenu}
        type="Update"
        preview={preview}
        setPreview={setPreview}
      />
    </Dialog>
  );
}
