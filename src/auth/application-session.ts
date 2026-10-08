import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { redirect } from "next/navigation";

import type { AuthorizationActor } from "@/auth/authorization";
import { CLASSROOM_WORKSPACE_ID } from "@/classroom/classroom";
import {
  findApplicationUser,
  isApprovedEmail,
  provisionClassroomTeacher,
} from "@/db/queries/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ApplicationIdentity = AuthorizationActor & {
  displayName: string;
  email: string;
};

type VerifiedSupabaseUser = {
  id: string;
  email: string;
};

const valueAsString = (value: unknown) =>
  typeof value === "string" ? value : null;

export const getVerifiedSupabaseUser = cache(
  async (): Promise<VerifiedSupabaseUser | null> => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;
    const id = valueAsString(claims?.sub);
    const email = valueAsString(claims?.email);

    if (error || !id || !email) {
      return null;
    }

    return { id, email };
  },
);

export const getCurrentApplicationIdentity = cache(
  async (): Promise<ApplicationIdentity | null> => {
    const supabaseUser = await getVerifiedSupabaseUser();
    if (!supabaseUser || !process.env.DATABASE_URL) {
      return null;
    }

    const { db } = await import("@/db/client");
    const [approved, identity] = await Promise.all([
      isApprovedEmail(db, supabaseUser.email),
      findApplicationUser(db, supabaseUser.id),
    ]);

    if (!approved || !identity || identity.status !== "ACTIVE") {
      return null;
    }

    return identity;
  },
);

export async function requireCurrentApplicationIdentity(): Promise<ApplicationIdentity> {
  const supabaseUser = await getVerifiedSupabaseUser();
  if (!supabaseUser) {
    redirect("/sign-in");
  }

  const identity = await getCurrentApplicationIdentity();
  if (!identity) {
    redirect("/access-denied");
  }

  return identity;
}

/** Creates the classroom profile from the user returned by the OAuth exchange. */
export async function provisionGoogleUser(
  user: User | null,
): Promise<ApplicationIdentity | null> {
  if (
    !user?.email ||
    user.app_metadata?.provider !== "google" ||
    !process.env.DATABASE_URL
  ) {
    return null;
  }

  const metadata = user.user_metadata ?? {};
  const displayName =
    valueAsString(metadata.full_name)?.trim() ||
    valueAsString(metadata.name)?.trim() ||
    user.email.split("@")[0] ||
    "Classroom staff";

  const { db } = await import("@/db/client");
  if (!(await isApprovedEmail(db, user.email))) {
    return null;
  }

  return provisionClassroomTeacher(db, {
    id: user.id,
    email: user.email,
    displayName,
    workspaceId: CLASSROOM_WORKSPACE_ID,
  });
}
