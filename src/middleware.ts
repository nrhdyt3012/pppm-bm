// src/middleware.ts
import { environment } from "./configs/environtment";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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

  // ✅ Bypass semua API route yang dipanggil server-to-server (tanpa cookie user)
  // Midtrans webhook, email kwitansi, dan notifikasi WA semuanya dipanggil
  // dari server action / webhook eksternal — tidak punya session user
  const isPublicApiRoute =
    pathname.startsWith("/api/payment/") ||
    pathname.startsWith("/api/send-receipt") ||
    pathname.startsWith("/api/notifications/"); // ← TAMBAHAN FIX

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

  const isSeoFile =
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap-0.xml";

  if (isSeoFile) {
    return supabaseResponse;
  }

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

  // API routes privat selain yang sudah di-bypass → wajib login
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
  const userRole = getUserRole(request);

  if (pathname.startsWith("/superadmin")) {
    if (userRole !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = userRole ? "/" : "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin" && userRole !== "superadmin") {
      const url = request.nextUrl.clone();
      url.pathname = userRole === "siswa" ? "/siswa/info" : "/login";
      return NextResponse.redirect(url);
    }
  }

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