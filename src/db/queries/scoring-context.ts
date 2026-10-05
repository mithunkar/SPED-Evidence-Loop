import { and, asc, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { AuthorizationActor } from "@/auth/authorization";
import {
  goals,
  goalStrategyAssignments,
  strategies,
  students,
  userStudentAssignments,
} from "@/db/schema";

const scoringSelection = {
  studentId: students.id,
  studentDisplayName: students.displayName,
  studentStatus: students.status,
  goalId: goals.id,
  goalTitle: goals.title,
  goalObjective: goals.objectiveText,
  goalDomain: goals.domain,
  goalVersion: goals.version,
  strategyAssignmentId: goalStrategyAssignments.id,
  strategyId: strategies.id,
  strategyVersion: strategies.version,
  strategyName: strategies.name,
  strategyInstructions: strategies.instructions,
  strategyFidelityPrompt: strategies.fidelityPrompt,
};

const activeGoalConditions = (
  actor: AuthorizationActor,
  studentId: string,
) =>
  and(
    eq(students.workspaceId, actor.workspaceId),
    eq(students.id, studentId),
    eq(students.status, "ACTIVE"),
    eq(goals.workspaceId, actor.workspaceId),
    eq(goals.status, "ACTIVE"),
  );

const strategyAssignmentJoin = and(
  eq(goalStrategyAssignments.workspaceId, goals.workspaceId),
  eq(goalStrategyAssignments.goalId, goals.id),
  eq(goalStrategyAssignments.status, "ACTIVE"),
);

const strategyJoin = and(
  eq(strategies.workspaceId, goalStrategyAssignments.workspaceId),
  eq(strategies.id, goalStrategyAssignments.strategyId),
  eq(strategies.version, goalStrategyAssignments.strategyVersion),
  eq(strategies.status, "ACTIVE"),
);

export function buildAuthorizedScoringContextQuery(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  studentId: string,
) {
  if (actor.role === "TEACHER") {
    return database
      .select(scoringSelection)
      .from(goals)
      .innerJoin(
        students,
        and(
          eq(students.workspaceId, goals.workspaceId),
          eq(students.id, goals.studentId),
        ),
      )
      .leftJoin(goalStrategyAssignments, strategyAssignmentJoin)
      .leftJoin(strategies, strategyJoin)
      .where(activeGoalConditions(actor, studentId))
      .orderBy(asc(goals.position));
  }

  return database
    .select(scoringSelection)
    .from(goals)
    .innerJoin(
      students,
      and(
        eq(students.workspaceId, goals.workspaceId),
        eq(students.id, goals.studentId),
      ),
    )
    .innerJoin(
      userStudentAssignments,
      and(
        eq(userStudentAssignments.workspaceId, students.workspaceId),
        eq(userStudentAssignments.studentId, students.id),
        eq(userStudentAssignments.userId, actor.id),
      ),
    )
    .leftJoin(goalStrategyAssignments, strategyAssignmentJoin)
    .leftJoin(strategies, strategyJoin)
    .where(activeGoalConditions(actor, studentId))
    .orderBy(asc(goals.position));
}
