import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this is an email confirmation (signup), show the confirmed page
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(`${origin}/auth/confirmed`);
      }

      // For other flows (OAuth, password reset), use next or default to home
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
