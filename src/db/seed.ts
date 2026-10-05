import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "@/db/schema";
import { syntheticSeedData } from "@/db/seed-data";

export async function seedSyntheticDevelopmentData(
  database: NodePgDatabase,
) {
  await database.transaction(async (transaction) => {
    const workspace = syntheticSeedData.workspaces[0];
    await transaction
      .insert(schema.workspaces)
      .values(workspace)
      .onConflictDoUpdate({
        target: schema.workspaces.id,
        set: { name: workspace.name, timezone: workspace.timezone },
      });

    for (const user of syntheticSeedData.users) {
      await transaction
        .insert(schema.users)
        .values(user)
        .onConflictDoUpdate({
          target: schema.users.id,
          set: {
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            status: user.status,
            updatedAt: user.updatedAt,
          },
        });
    }

    for (const student of syntheticSeedData.students) {
      await transaction
        .insert(schema.students)
        .values(student)
        .onConflictDoUpdate({
          target: schema.students.id,
          set: {
            displayName: student.displayName,
            status: student.status,
            updatedAt: student.updatedAt,
          },
        });
    }

    for (const assignment of syntheticSeedData.userStudentAssignments) {
      await transaction
        .insert(schema.userStudentAssignments)
        .values(assignment)
        .onConflictDoNothing();
    }

    for (const goal of syntheticSeedData.goals) {
      await transaction
        .insert(schema.goals)
        .values(goal)
        .onConflictDoUpdate({
          target: schema.goals.id,
          set: {
            title: goal.title,
            objectiveText: goal.objectiveText,
            domain: goal.domain,
            targetScore: goal.targetScore,
            expectedFrequency: goal.expectedFrequency,
            status: goal.status,
            activeFrom: goal.activeFrom,
            position: goal.position,
            version: goal.version,
            updatedAt: goal.updatedAt,
          },
        });
    }

    for (const strategy of syntheticSeedData.strategies) {
      await transaction
        .insert(schema.strategies)
        .values(strategy)
        .onConflictDoUpdate({
          target: [
            schema.strategies.workspaceId,
            schema.strategies.id,
            schema.strategies.version,
          ],
          set: {
            name: strategy.name,
            purpose: strategy.purpose,
            instructions: strategy.instructions,
            fidelityPrompt: strategy.fidelityPrompt,
            status: strategy.status,
            createdByUserId: strategy.createdByUserId,
            updatedAt: strategy.updatedAt,
          },
        });
    }

    for (const assignment of syntheticSeedData.goalStrategyAssignments) {
      await transaction
        .insert(schema.goalStrategyAssignments)
        .values(assignment)
        .onConflictDoUpdate({
          target: schema.goalStrategyAssignments.id,
          set: {
            strategyId: assignment.strategyId,
            strategyVersion: assignment.strategyVersion,
            startsOn: assignment.startsOn,
            reason: assignment.reason,
            plannedReviewOn: assignment.plannedReviewOn,
            status: assignment.status,
            updatedAt: assignment.updatedAt,
          },
        });
    }
  });
}
