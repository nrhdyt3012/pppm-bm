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

  const isAuthPage = request.nextUrl.pathname === "/login";
  const isHomePage = request.nextUrl.pathname === "/beranda";
  const isRootPage = request.nextUrl.pathname === "/";

  // ✅ Jika tidak ada user dan bukan di halaman public
  if (!user && !isAuthPage && !isHomePage) {
    const url = request.nextUrl.clone();
    url.pathname = "/beranda";
    return NextResponse.redirect(url);
  }

  // ✅ Jika ada user dan di halaman login, redirect ke root (akan di-handle oleh page.tsx)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ Jika ada user dan di halaman beranda, redirect ke root
  if (user && isHomePage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}