import { Geist, Geist_Mono } from "next/font/google";
import "../../app/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AuthStoreProvider from "@/providers/auth-store-provider";
import { cookies } from "next/headers";
import ReactQueryProvider from "@/providers/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PAUD Aisyiyah Bustanul Athfal 1 Buduran",
  description: "Sistem Informasi Manajemen Pembayaran PAUD Aisyiyah Bustanul Athfal 1 Buduran",
  icons: { icon: "/logo_ppm.svg" },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const userProfileCookie = cookiesStore.get("user_profile");

  let profile = {};
  try {
    profile = userProfileCookie?.value ? JSON.parse(userProfileCookie.value) : {};
  } catch {
    profile = {};
  }

  // TIDAK PERLU <html> dan <body> di sini
  // Cukup return children dengan provider yang diperlukan
  return (
    <ReactQueryProvider>
      <AuthStoreProvider profile={profile}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthStoreProvider>
    </ReactQueryProvider>
  );
}