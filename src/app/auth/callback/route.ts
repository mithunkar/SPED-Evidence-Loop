import { NextResponse, type NextRequest } from "next/server";

import { provisionGoogleUser } from "@/auth/application-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=google", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=google", request.url));
  }

  const identity = await provisionGoogleUser(data.user);
  if (!identity) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
