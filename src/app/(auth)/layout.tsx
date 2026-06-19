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
  title: "KB/TK Aisyiyah Bustanul Athfal 1 Buduran",
  description: "Sistem Informasi Manajemen Pembayaran KB/TK Aisyiyah Bustanul Athfal 1 Buduran",
  icons: { icon: "/favicon.ico" },
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

  return (
    <ReactQueryProvider>
      <AuthStoreProvider profile={profile}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="light"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthStoreProvider>
    </ReactQueryProvider>
  );
}