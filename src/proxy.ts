import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/admin", "/pro", "/conta", "/super"];
const AUTH_ROUTES = ["/entrar", "/cadastro", "/esqueci-senha"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  const pathname = request.nextUrl.pathname;

  // Extract tenant slug from subdomain (slug.Agendaê.app)
  const hostname = request.headers.get("host") ?? "";
  const isSubdomain =
    hostname.includes(".Agendaê.app") &&
    !hostname.startsWith("www.") &&
    !hostname.startsWith("Agendaê.");

  if (isSubdomain) {
    const slug = hostname.split(".Agendaê.app")[0];
    supabaseResponse.headers.set("x-tenant-slug", slug ?? "");
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Protect authenticated routes
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = new URL("/entrar", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Super admin protection
  if (pathname.startsWith("/super") && user) {
    // Role check happens in the page/layout with server-side query
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
