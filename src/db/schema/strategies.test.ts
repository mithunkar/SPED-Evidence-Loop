import { describe, expect, it } from "vitest";

import { getTableConfig } from "drizzle-orm/pg-core";

import {
  goalStrategyAssignments,
  goalStrategyAssignmentStatus,
  strategies,
  strategyStatus,
} from "@/db/schema";

describe("strategy database schema", () => {
  it("defines strategy and assignment lifecycle values", () => {
    expect(strategyStatus.enumValues).toEqual([
      "DRAFT",
      "ACTIVE",
      "ARCHIVED",
    ]);
    expect(goalStrategyAssignmentStatus.enumValues).toEqual([
      "PLANNED",
      "ACTIVE",
      "ENDED",
    ]);
  });

  it("identifies each strategy version with a composite primary key", () => {
    const strategyConfig = getTableConfig(strategies);
    const primaryKey = strategyConfig.primaryKeys.find(
      (key) => key.getName() === "strategies_primary_key",
    );

    expect(primaryKey?.columns.map((column) => column.name)).toEqual([
      "workspace_id",
      "id",
      "version",
    ]);
    expect(strategyConfig.checks.map((item) => item.name)).toContain(
      "strategies_version_positive",
    );
  });

  it("keeps goals and exact strategy versions in the same workspace", () => {
    const assignmentConfig = getTableConfig(goalStrategyAssignments);
    const foreignKeys = Object.fromEntries(
      assignmentConfig.foreignKeys.map((key) => {
        const reference = key.reference();
        return [
          key.getName(),
          {
            columns: reference.columns.map((column) => column.name),
            foreignColumns: reference.foreignColumns.map(
              (column) => column.name,
            ),
          },
        ];
      }),
    );

    expect(foreignKeys).toMatchObject({
      goal_strategy_assignments_goal_foreign_key: {
        columns: ["workspace_id", "goal_id"],
        foreignColumns: ["workspace_id", "id"],
      },
      goal_strategy_assignments_strategy_foreign_key: {
        columns: ["workspace_id", "strategy_id", "strategy_version"],
        foreignColumns: ["workspace_id", "id", "version"],
      },
    });
  });

  it("allows only one active primary strategy per goal", () => {
    const activeIndex = getTableConfig(goalStrategyAssignments).indexes.find(
      (item) =>
        item.config.name ===
        "goal_strategy_assignments_one_active_per_goal_unique",
    );

    expect(activeIndex?.config.unique).toBe(true);
    expect(activeIndex?.config.columns.map((column) =>
      "name" in column ? column.name : undefined,
    )).toEqual(["workspace_id", "goal_id"]);
    expect(activeIndex?.config.where).toBeDefined();
  });

  it("enforces assignment date boundaries and ended state", () => {
    const checkNames = getTableConfig(goalStrategyAssignments).checks.map(
      (item) => item.name,
    );

    expect(checkNames).toEqual(
      expect.arrayContaining([
        "goal_strategy_assignments_date_range",
        "goal_strategy_assignments_review_date_range",
        "goal_strategy_assignments_ended_date_required",
      ]),
    );
  });
});
