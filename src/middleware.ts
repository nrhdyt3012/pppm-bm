// src/middleware.ts
import { environment } from "./configs/environtment";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Helper function to get user role from cookie
function getUserRole(request: NextRequest): string | null {
  const profileCookie = request.cookies.get("user_profile")?.value;
  if (!profileCookie) return null;
  try {
    const profile = JSON.parse(profileCookie);
    return profile.role || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  // ✅ PALING ATAS: Bypass webhook Midtrans & API payment dari semua auth check
  // Midtrans server tidak punya cookie/session user → harus dibebaskan sebelum apapun
  const isPublicApiRoute =
    pathname.startsWith("/api/payment/") ||
    pathname.startsWith("/api/send-receipt");

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    environment.SUPABASE_URL!,
    environment.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api/");

  // ✅ File SEO — harus selalu bisa diakses tanpa login (termasuk oleh Googlebot)
  const isSeoFile =
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap-0.xml";

  if (isSeoFile) {
    return supabaseResponse;
  }

  // Halaman publik yang bisa diakses tanpa login
  const publicPages = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/beranda",
    "/profil",
    "/fasilitas",
    "/info-sekolah",
    "/kontak",
    "/ppdb",
    "/berita",
    "/sitemap.xml",
    "/robots.txt",
    "/siswa/payment",
    "/kwitansi",
  ];

  const isPublicPage =
    pathname === "/" ||
    publicPages.some(
      (page) => pathname === page || pathname.startsWith(page + "/")
    );

  // API routes privat (selain yang sudah di-bypass di atas) → wajib login
  if (isApiRoute) {
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return supabaseResponse;
  }

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ ROLE-BASED ROUTE PROTECTION
  // Cek apakah user memiliki role
  const userRole = getUserRole(request);

  // Guard /superadmin/* — hanya superadmin yang bisa akses
  if (pathname.startsWith("/superadmin")) {
    if (userRole !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = userRole ? "/" : "/login";
      return NextResponse.redirect(url);
    }
  }

  // Guard /admin/* — hanya admin dan superadmin yang bisa akses
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin" && userRole !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = userRole === "siswa" ? "/siswa/info" : "/login";
      return NextResponse.redirect(url);
    }
  }

  // Guard /siswa/* — hanya siswa yang bisa akses
  if (pathname.startsWith("/siswa")) {
    if (userRole !== "siswa") {
      const url = request.nextUrl.clone();
      url.pathname =
        userRole === "admin" || userRole === "superadmin" ? "/admin" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};