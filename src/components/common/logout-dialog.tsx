"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut } from "@/actions/auth-action";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export default function LogoutDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 px-1 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>

      <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <LogOut className="w-5 h-5 text-red-500" />
              Konfirmasi Keluar
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Apakah Anda yakin ingin keluar dari sistem?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex-1 sm:flex-none gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Keluar...</>
              ) : (
                <><LogOut className="w-4 h-4" />Ya, Keluar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}