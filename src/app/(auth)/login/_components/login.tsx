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
      toast.error("Login Failed", {
        description: loginState.errors?._form?.[0],
      });
      startTransition(() => {
        loginAction(null);
      });
    }
  }, [loginState]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 p-6">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <DarkmodeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/logo_ppm.svg"
          alt="Logo PPPM Baitul Makmur"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
          priority
        />
      </div>

      {/* Welcome Text */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Selamat Datang
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          Sistem Informasi Pondok Pesantren Baitul Makmur
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Portal untuk Wali Santri dan Administrator
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses sistem
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
                placeholder="******"
                type="password"
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isPendingLogin ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2024 Pondok Pesantren Baitul Makmur</p>
        <p className="mt-1">Semua hak cipta dilindungi</p>
      </div>
    </div>
  );
}
