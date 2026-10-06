import "server-only";

import { cache } from "react";

import type { AuthorizationActor } from "@/auth/authorization";
import { findApplicationUser } from "@/db/queries/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ApplicationIdentity = AuthorizationActor & {
  displayName: string;
  email: string;
};

export type VerifiedSupabaseUser = {
  id: string;
  email: string;
};

export const getVerifiedSupabaseUser = cache(async (): Promise<VerifiedSupabaseUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  const email = data?.claims?.email;

  if (error || typeof id !== "string" || typeof email !== "string") {
    return null;
  }

  return { id, email };
});

export async function getCurrentApplicationIdentity(): Promise<ApplicationIdentity | null> {
  const supabaseUser = await getVerifiedSupabaseUser();

  if (!supabaseUser || !process.env.DATABASE_URL) {
    return null;
  }

  const { db } = await import("@/db/client");
  return findApplicationUser(db, supabaseUser.id);
}
