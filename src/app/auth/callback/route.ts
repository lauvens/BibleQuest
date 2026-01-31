import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const type = searchParams.get("type");
  const error_description = searchParams.get("error_description");

  // Handle errors from Supabase
  if (error_description) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if this is an email confirmation:
      // - type is signup, email, or email_change
      // - OR no next parameter and user was recently created (within 5 minutes)
      const isEmailConfirmation =
        type === "signup" ||
        type === "email" ||
        type === "email_change";

      // Also check if user was just created (for cases where type param is missing)
      const userCreatedAt = data.session.user.created_at;
      const isNewUser = userCreatedAt &&
        (Date.now() - new Date(userCreatedAt).getTime()) < 5 * 60 * 1000; // 5 minutes

      if (isEmailConfirmation || (isNewUser && !next)) {
        return NextResponse.redirect(`${origin}/auth/confirmed`);
      }

      // For other flows (OAuth returning users, password reset), use next or default to home
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
