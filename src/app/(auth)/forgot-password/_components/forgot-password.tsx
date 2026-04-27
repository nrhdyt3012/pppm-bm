"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DarkmodeToggle } from "@/components/common/darkmode-toggle";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useState } from "react";
import { sendResetPasswordEmail } from "../actions";
import { toast } from "sonner";

const INITIAL_STATE = { status: "idle", message: "" };

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [state, action, isPending] = useActionState(sendResetPasswordEmail, INITIAL_STATE);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    startTransition(() => { action(formData); });
  };

  useEffect(() => {
    if (state.status === "error") {
      toast.error("Gagal mengirim email", { description: state.message });
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
        <div className="absolute top-4 right-4"><DarkmodeToggle /></div>
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Email Terkirim!</h2>
                <p className="text-muted-foreground text-sm">
                  Link reset password telah dikirim ke <strong>{email}</strong>.
                  Silakan cek inbox atau folder spam Anda.
                </p>
              </div>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
      <div className="absolute top-4 right-4"><DarkmodeToggle /></div>
      <div className="mb-8">
        <Image src="/logo_ppm.svg" alt="Logo" width={100} height={100} className="rounded-full shadow-lg" priority />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Lupa Password?</CardTitle>
          <CardDescription>
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? <><Loader2 className="mr-2 animate-spin" />Mengirim...</> : "Kirim Link Reset Password"}
            </Button>
            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}