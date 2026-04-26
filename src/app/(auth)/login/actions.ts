"use client";
import Image from "next/image";
import FormInput from "@/components/common/form-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  INITIAL_LOGIN_FORM,
  INITIAL_STATE_LOGIN_FORM,
} from "@/constants/auth-constant";
import { LoginForm, loginSchemaForm } from "@/validations/auth-validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { login } from "../actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DarkmodeToggle } from "@/components/common/darkmode-toggle";

export default function Login() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchemaForm),
    defaultValues: INITIAL_LOGIN_FORM,
  });

  const [loginState, loginAction, isPendingLogin] = useActionState(
    login,
    INITIAL_STATE_LOGIN_FORM
  );

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    startTransition(() => {
      loginAction(formData);
    });
  });

  useEffect(() => {
    if (loginState?.status === "error") {
      toast.error("Login Gagal", {
        description:
          loginState.errors?._form?.[0] || "Terjadi kesalahan saat login",
      });
    }
    if (loginState?.status === "success") {
      toast.success("Login Berhasil");
      setTimeout(() => {
        window.location.href = loginState.data?.redirectUrl || "/";
      }, 500);
    }
  }, [loginState]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-950 p-6">
      <div className="absolute top-4 right-4 z-50">
        <DarkmodeToggle />
      </div>

      <div className="mb-6">
        <Image
          src="/logo_ppm.svg"
          alt="Logo PAUD Aisyiyah Bustanul Athfal 1 Buduran"
          width={110}
          height={110}
          className="rounded-full shadow-lg"
          priority
        />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          Selamat Datang
        </h1>
        <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
          PAUD Aisyiyah Bustanul Athfal 1 Buduran
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Sistem Informasi Manajemen Pembayaran
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl">Login</CardTitle>
          <CardDescription>
            Masukkan email dan password untuk mengakses sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormInput
                form={form}
                name="email"
                label="Email"
                placeholder="Masukkan email Anda"
                type="email"
              />
              <FormInput
                form={form}
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isPendingLogin}
              >
                {isPendingLogin ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Sedang masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} PAUD Aisyiyah Bustanul Athfal 1 Buduran</p>
      </div>
    </div>
  );
}