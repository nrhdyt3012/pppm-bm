import { environment } from "@/configs/environtment";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = environment;

  const supabase = createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Route publik (tidak perlu login)
  const publicRoutes = ["/login", "/beranda"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🚫 Jika belum login dan akses route private → lempar ke login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔁 Jika sudah login tapi masih di login → lempar ke dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match semua route kecuali:
     * - _next (static files)
     * - favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};