"use server";

import { redirect } from "next/navigation";

import { clearDevelopmentIdentity } from "@/auth/server-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutUser() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearDevelopmentIdentity();
  redirect("/sign-in");
}
