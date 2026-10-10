import { and, asc, eq, max } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  AuthorizationError,
  canManageClassroom,
  type AuthorizationActor,
  type StudentAuthorizationScope,
} from "@/auth/authorization";
import { goalRevisions, goals, goalStrategyAssignments, strategies } from "@/db/schema";
import type { CreateGoalInput, UpdateGoalInput } from "@/domain/goal";

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
    .returning({ id: goals.id, version: goals.version });

  if (!goal) {
    return null;
  }

  await database.insert(goalRevisions).values({
    workspaceId: actor.workspaceId,
    goalId: goal.id,
    version: goal.version,
    title: input.title,
    objectiveText: input.objectiveText,
    domain: input.domain,
    targetScore: input.targetScore,
    expectedFrequency: "Each session",
    createdByUserId: actor.id,
  });

  return goal;
}

export async function updateGoal(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  student: StudentAuthorizationScope,
  goalId: string,
  input: UpdateGoalInput,
) {
  if (!canManageClassroom(actor) || actor.workspaceId !== student.workspaceId) {
    throw new AuthorizationError();
  }

  return database.transaction(async (transaction) => {
    const [current] = await transaction
      .select({ version: goals.version, expectedFrequency: goals.expectedFrequency })
      .from(goals)
      .where(
        and(
          eq(goals.workspaceId, actor.workspaceId),
          eq(goals.studentId, student.id),
          eq(goals.id, goalId),
        ),
      )
      .limit(1);
    if (!current) return null;

    const version = current.version + 1;
    const [goal] = await transaction
      .update(goals)
      .set({
        title: input.title,
        objectiveText: input.objectiveText,
        domain: input.domain,
        targetScore: input.targetScore,
        status: input.status,
        version,
        activeTo: input.status === "ARCHIVED" ? new Date().toISOString().slice(0, 10) : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(goals.workspaceId, actor.workspaceId),
          eq(goals.studentId, student.id),
          eq(goals.id, goalId),
        ),
      )
      .returning({ id: goals.id, version: goals.version });
    if (!goal) return null;

    await transaction.insert(goalRevisions).values({
      workspaceId: actor.workspaceId,
      goalId: goal.id,
      version: goal.version,
      title: input.title,
      objectiveText: input.objectiveText,
      domain: input.domain,
      targetScore: input.targetScore,
      expectedFrequency: current.expectedFrequency,
      createdByUserId: actor.id,
    });
    return goal;
  });
}
