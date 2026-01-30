import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Only consider user authenticated if getUser succeeded without error
  const isAuthenticated = !userError && !!user;

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  const isAuthPage =
    request.nextUrl.pathname === "/connexion" ||
    request.nextUrl.pathname === "/inscription";
  if (isAuthPage && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Security headers
  const headers = supabaseResponse.headers;
  const isDev = process.env.NODE_ENV === "development";

  // Content Security Policy (allow eval in dev for HMR/React Refresh)
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://*.supabase.co wss://*.supabase.co`,
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; ")
  );

  // Force HTTPS for the next 1 year, including subdomains
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Prevent MIME-type sniffing (e.g. executing a disguised script)
  headers.set("X-Content-Type-Options", "nosniff");

  // Block the page from being embedded in iframes (clickjacking protection)
  headers.set("X-Frame-Options", "DENY");

  // Control Referer header — send origin only on cross-origin requests
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features (camera, mic, geolocation, etc.)
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  return supabaseResponse;
}
