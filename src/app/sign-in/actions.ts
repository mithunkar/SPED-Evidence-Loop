"use server";

import { redirect } from "next/navigation";

import {
  emailPasswordSchema,
  type AccountActionState,
} from "@/auth/credentials";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function readCredentials(formData: FormData) {
  return emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function validationError(
  result: Extract<ReturnType<typeof readCredentials>, { success: false }>,
): AccountActionState {
  return {
    status: "error",
    message: "Check the highlighted fields.",
    errors: result.error.flatten().fieldErrors,
  };
}

export async function signInWithPassword(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = readCredentials(formData);
  if (!parsed.success) {
    return validationError(parsed);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      status: "error",
      message: "That email and password do not match.",
    };
  }

  redirect("/dashboard");
}

export async function signUpWithPassword(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = readCredentials(formData);
  if (!parsed.success) {
    return validationError(parsed);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return {
      status: "error",
      message: "Account creation is not configured yet.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: "We could not create that account. Please try again.",
    };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    status: "success",
    message: "Check your email to finish creating your account.",
  };
}
