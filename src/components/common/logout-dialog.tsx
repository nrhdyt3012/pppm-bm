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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signOut } from "@/actions/auth-action";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Dialog Logout ────────────────────────────────────────────────────────────
function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isLoading && onOpenChange(v)}>
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
            onClick={() => onOpenChange(false)}
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
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Keluar...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Ya, Keluar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog Ganti Password ────────────────────────────────────────────────────
function GantiPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = (v: boolean) => {
    if (!isPending) {
      // reset state saat dialog ditutup
      if (!v) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsSuccess(false);
      }
      onOpenChange(v);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsPending(true);
    const supabase = createClient();

    // Verifikasi password lama dengan re-authenticate
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      toast.error("Sesi tidak valid, silakan login ulang");
      setIsPending(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Password lama tidak sesuai");
      setIsPending(false);
      return;
    }

    // Update ke password baru
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Gagal mengganti password", { description: error.message });
      setIsPending(false);
      return;
    }

    setIsSuccess(true);
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
        {isSuccess ? (
          /* ── Success State ── */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Password Berhasil Diubah
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Password akun Anda telah berhasil diperbarui.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleClose(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* ── Form State ── */
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-green-600" />
                Ganti Password
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Masukkan password lama dan password baru Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Password Lama */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowCurrent(!showCurrent)}
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowNew(!showNew)}
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500">Password tidak cocok</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 gap-2"
                disabled={
                  isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Simpan Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Trigger utama yang dipasang di sidebar ───────────────────────────────────
export default function SidebarAccountActions() {
  const [openLogout, setOpenLogout] = useState(false);
  const [openGantiPassword, setOpenGantiPassword] = useState(false);

  return (
    <>
      {/* Menu Ganti Password */}
      <button
        onClick={() => setOpenGantiPassword(true)}
        className="flex w-full items-center gap-2 px-1 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors"
      >
        <Lock className="w-4 h-4" />
        Ganti Password
      </button>

      {/* Menu Keluar */}
      <button
        onClick={() => setOpenLogout(true)}
        className="flex w-full items-center gap-2 px-1 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>

      {/* Dialog Ganti Password */}
      <GantiPasswordDialog
        open={openGantiPassword}
        onOpenChange={setOpenGantiPassword}
      />

      {/* Dialog Logout */}
      <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
    </>
  );
}