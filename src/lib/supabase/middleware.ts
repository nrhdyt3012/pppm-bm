import { environment } from "../../configs/environtment";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = environment;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

const isAuthPage = pathname === "/login";

// Semua halaman yang boleh diakses tanpa login
const publicPages = [
  "/beranda",
  "/profil",
  "/fasilitas",
  "/info-sekolah",
  "/kontak",
  "/ppdb",
];
const isPublicPage = publicPages.some(
  (page) => pathname === page || pathname.startsWith(page + "/")
);

// Jika tidak ada user dan bukan halaman public → redirect ke beranda
if (!user && !isAuthPage && !isPublicPage) {
  const url = request.nextUrl.clone();
  url.pathname = "/beranda";
  return NextResponse.redirect(url);
}

// Jika sudah login dan buka halaman login → redirect ke home
if (user && isAuthPage) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}
}