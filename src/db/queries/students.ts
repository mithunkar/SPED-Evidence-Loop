import { and, asc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { AuthorizationActor } from "@/auth/authorization";
import { students, userStudentAssignments } from "@/db/schema";

const studentSelection = {
  id: students.id,
  workspaceId: students.workspaceId,
  displayName: students.displayName,
  status: students.status,
};

export function buildAuthorizedStudentListQuery(
  database: NodePgDatabase,
  actor: AuthorizationActor,
) {
  if (actor.role === "TEACHER") {
    return database
      .select(studentSelection)
      .from(students)
      .where(eq(students.workspaceId, actor.workspaceId))
      .orderBy(asc(students.displayName));
  }

  return database
    .select(studentSelection)
    .from(students)
    .innerJoin(
      userStudentAssignments,
      and(
        eq(userStudentAssignments.workspaceId, students.workspaceId),
        eq(userStudentAssignments.studentId, students.id),
      ),
    )
    .where(
      and(
        eq(students.workspaceId, actor.workspaceId),
        eq(userStudentAssignments.workspaceId, actor.workspaceId),
        eq(userStudentAssignments.userId, actor.id),
      ),
    )
    .orderBy(asc(students.displayName));
}

export async function listAuthorizedStudents(
  database: NodePgDatabase,
  actor: AuthorizationActor,
) {
  if (actor.status !== "ACTIVE") {
    return [];
  }

  return buildAuthorizedStudentListQuery(database, actor);
}
