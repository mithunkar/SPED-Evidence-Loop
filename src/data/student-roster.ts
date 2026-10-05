import type { AuthorizationActor } from "@/auth/authorization";
import { filterAuthorizedStudents } from "@/auth/authorization";
import {
  syntheticSeedData,
} from "@/db/seed-data";
import { listAuthorizedStudents } from "@/db/queries/students";

export async function loadAuthorizedStudentRoster(
  actor: AuthorizationActor,
) {
  if (process.env.DATABASE_URL) {
    const { db } = await import("@/db/client");
    return {
      source: "DATABASE" as const,
      students: await listAuthorizedStudents(db, actor),
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production.");
  }

  return {
    source: "SYNTHETIC_FIXTURE" as const,
    students: filterAuthorizedStudents(
      actor,
      syntheticSeedData.students,
      syntheticSeedData.userStudentAssignments,
    ).map(({ id, workspaceId, displayName, status }) => ({
      id,
      workspaceId,
      displayName,
      status,
    })),
  };
}
