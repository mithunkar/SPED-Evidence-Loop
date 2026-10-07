import "server-only";

import { findApplicationUser } from "@/db/queries/users";

import type { AuthorizationActor } from "@/auth/authorization";

export const PUBLIC_CLASSROOM_WORKSPACE_ID =
  "f0000000-0000-4000-8000-000000000001";
export const PUBLIC_CLASSROOM_TEACHER_ID =
  "f0000000-0000-4000-8000-000000000002";

export type PublicClassroomIdentity = AuthorizationActor & {
  displayName: string;
  email: string;
};

/**
 * Temporary single-classroom identity used while the product is intentionally
 * public. The fixed database row keeps all reads and writes scoped to one
 * workspace and gives saved sessions stable authorship until login returns.
 */
export async function getPublicClassroomIdentity(): Promise<PublicClassroomIdentity> {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production.");
    }

    return {
      id: PUBLIC_CLASSROOM_TEACHER_ID,
      workspaceId: PUBLIC_CLASSROOM_WORKSPACE_ID,
      displayName: "Teacher",
      email: "public-classroom@evidence-loop.local",
      role: "TEACHER",
      status: "ACTIVE",
    };
  }

  const { db } = await import("@/db/client");
  const identity = await findApplicationUser(db, PUBLIC_CLASSROOM_TEACHER_ID);

  if (!identity || identity.status !== "ACTIVE") {
    throw new Error("The public classroom teacher is not configured.");
  }

  return identity;
}
