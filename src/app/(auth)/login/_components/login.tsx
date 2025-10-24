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
import { startTransition, useActionState, useEffect, useState } from "react";
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

  // 🖼️ Gambar-gambar slideshow
  const images = [
    "/images/illustrations/ppm_1.jpg",
    "/images/illustrations/ppm_2.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  // 🔄 Ganti gambar tiap 2 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

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
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 p-6 lg:py-0">
      {/* === 🔘 Tombol Dark Mode di pojok kanan atas === */}
      <div className="absolute top-4 right-4 z-50">
        <DarkmodeToggle />
      </div>

      {/* === BAGIAN KIRI (dengan slideshow animasi) === */}
      <div className="relative flex w-full lg:w-1/3 flex-col items-center justify-center gap-10">
        <div className="relative w-2/3 lg:w-full aspect-square">
          {images.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`illustration-${index}`}
              fill
              priority={index === currentImage}
              className={`object-contain transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      {/* === BAGIAN KANAN (form login) === */}
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Login to access all features</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormInput
                form={form}
                name="email"
                label="Email"
                placeholder="Insert email here"
                type="email"
              />
              <FormInput
                form={form}
                name="password"
                label="Password"
                placeholder="******"
                type="password"
              />
              <Button type="submit" className="w-full">
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
    </div>
  );
}
