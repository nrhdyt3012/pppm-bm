import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function DialogDelete({
  open,
  onOpenChange,
  onSubmit,
  title,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  title: string;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Hapus {title}</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {" "}
              <span className="lowercase">{title}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" formAction={onSubmit}>
              {isLoading ? <Loader2 className="animate-spin" /> : " Hapus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
