// src/app/layout.tsx - UPDATED dengan metadata SEO yang lengkap

import { Geist, Geist_Mono } from "next/font/google";
import "../app/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AuthStoreProvider from "@/providers/auth-store-provider";
import { cookies } from "next/headers";
import ReactQueryProvider from "@/providers/react-query-provider";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paudaba1buduran.my.id"),
  title: {
    default: "PAUD Aisyiyah Bustanul Athfal 1 Buduran",
    template: "%s | PAUD ABA 1 Buduran",
  },
  description:
    "KB TK Aisyiyah Bustanul Athfal 1 Buduran - Pendidikan anak usia dini dengan metode Ramah Otak Anak. Sholih, Ceria, Mandiri. Berlokasi di Buduran, Sidoarjo.",
  keywords: [
    "PAUD Buduran",
    "TK Buduran Sidoarjo",
    "KB Buduran Sidoarjo",
    "Aisyiyah Bustanul Athfal",
    "TK Islam Buduran",
    "PAUD Islam Sidoarjo",
    "sekolah PAUD Buduran",
    "pendidikan anak usia dini Sidoarjo",
    "KB TK Aisyiyah",
    "PPDB TK Buduran 2026",
  ],
  authors: [{ name: "PAUD Aisyiyah Bustanul Athfal 1 Buduran" }],
  creator: "PAUD Aisyiyah Bustanul Athfal 1 Buduran",
  publisher: "PAUD Aisyiyah Bustanul Athfal 1 Buduran",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://paudaba1buduran.my.id",
    siteName: "PAUD ABA 1 Buduran",
    title: "PAUD Aisyiyah Bustanul Athfal 1 Buduran",
    description:
      "KB TK Aisyiyah Bustanul Athfal 1 Buduran - Sholih, Ceria, Mandiri. Pendidikan anak usia dini dengan metode Ramah Otak Anak di Buduran, Sidoarjo.",
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "Logo PAUD ABA 1 Buduran",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "https://paudaba1buduran.my.id",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const userProfileCookie = cookiesStore.get("user_profile");

  let profile = {};
  try {
    profile = userProfileCookie?.value
      ? JSON.parse(userProfileCookie.value)
      : {};
  } catch {
    profile = {};
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}