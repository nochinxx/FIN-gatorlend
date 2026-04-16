import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isEmailAllowedForDemo } from "./lib/auth/allowlist";
import { getSupabaseAnonKey, getSupabaseUrl } from "./lib/supabase/config";

function isProtectedPath(pathname: string): boolean {
  return pathname === "/catalog" || pathname === "/textbooks/new" || pathname.startsWith("/assets/");
}

function buildLoginRedirect(request: NextRequest, reason?: "not-authorized") {
  const redirectUrl = new URL("/login", request.url);

  if (request.nextUrl.pathname !== "/login") {
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
  }

  if (reason) {
    redirectUrl.searchParams.set("error", reason);
  }

  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return buildLoginRedirect(request);
  }

  if (!isEmailAllowedForDemo(user.email)) {
    return buildLoginRedirect(request, "not-authorized");
  }

  return response;
}

export const config = {
  matcher: ["/catalog", "/textbooks/new", "/assets/:path*"]
};
