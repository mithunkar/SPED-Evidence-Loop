import { and, asc, eq, max } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  AuthorizationError,
  canManageClassroom,
  type AuthorizationActor,
  type StudentAuthorizationScope,
} from "@/auth/authorization";
import { goals, goalStrategyAssignments, strategies } from "@/db/schema";
import type { CreateGoalInput } from "@/domain/goal";

const goalSelection = {
  id: goals.id,
  title: goals.title,
  objectiveText: goals.objectiveText,
  domain: goals.domain,
  targetScore: goals.targetScore,
  expectedFrequency: goals.expectedFrequency,
  status: goals.status,
  position: goals.position,
  strategyName: strategies.name,
  strategyInstructions: strategies.instructions,
};

export function buildStudentGoalListQuery(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  student: StudentAuthorizationScope,
) {
  if (!canManageClassroom(actor) || actor.workspaceId !== student.workspaceId) {
    throw new AuthorizationError();
  }

  return database
    .select(goalSelection)
    .from(goals)
    .leftJoin(
      goalStrategyAssignments,
      and(
        eq(goalStrategyAssignments.workspaceId, goals.workspaceId),
        eq(goalStrategyAssignments.goalId, goals.id),
        eq(goalStrategyAssignments.status, "ACTIVE"),
      ),
    )
    .leftJoin(
      strategies,
      and(
        eq(strategies.workspaceId, goalStrategyAssignments.workspaceId),
        eq(strategies.id, goalStrategyAssignments.strategyId),
        eq(strategies.version, goalStrategyAssignments.strategyVersion),
        eq(strategies.status, "ACTIVE"),
      ),
    )
    .where(
      and(
        eq(goals.workspaceId, actor.workspaceId),
        eq(goals.studentId, student.id),
      ),
    )
    .orderBy(asc(goals.position), asc(goals.createdAt));
}

export async function listStudentGoals(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  student: StudentAuthorizationScope,
) {
  return buildStudentGoalListQuery(database, actor, student);
}

export async function createGoal(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  student: StudentAuthorizationScope,
  input: CreateGoalInput,
  activeFrom: string,
) {
  if (!canManageClassroom(actor) || actor.workspaceId !== student.workspaceId) {
    throw new AuthorizationError();
  }

  const [lastGoal] = await database
    .select({ position: max(goals.position) })
    .from(goals)
    .where(
      and(
        eq(goals.workspaceId, actor.workspaceId),
        eq(goals.studentId, student.id),
      ),
    );

  const [goal] = await database
    .insert(goals)
    .values({
      workspaceId: actor.workspaceId,
      studentId: student.id,
      title: input.title,
      objectiveText: input.objectiveText,
      domain: input.domain,
      targetScore: input.targetScore,
      expectedFrequency: "Each session",
      status: "ACTIVE",
      activeFrom,
      position: (lastGoal?.position ?? -1) + 1,
      version: 1,
    })
    .returning({ id: goals.id });

  return goal ?? null;
}
