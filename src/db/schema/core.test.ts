import { describe, expect, it } from "vitest";

import { getTableConfig } from "drizzle-orm/pg-core";

import {
  goalStatus,
  goals,
  studentStatus,
  userRole,
  userStatus,
  userStudentAssignments,
} from "@/db/schema";

describe("core database schema", () => {
  it("defines the supported lifecycle values", () => {
    expect(userRole.enumValues).toEqual(["TEACHER", "ASSISTANT"]);
    expect(userStatus.enumValues).toEqual(["ACTIVE", "INACTIVE"]);
    expect(studentStatus.enumValues).toEqual(["ACTIVE", "ARCHIVED"]);
    expect(goalStatus.enumValues).toEqual([
      "DRAFT",
      "ACTIVE",
      "PAUSED",
      "ARCHIVED",
    ]);
  });

  it("prevents cross-workspace student assignments", () => {
    const assignmentConfig = getTableConfig(userStudentAssignments);
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
      user_student_assignments_user_foreign_key: {
        columns: ["workspace_id", "user_id"],
        foreignColumns: ["workspace_id", "id"],
      },
      user_student_assignments_student_foreign_key: {
        columns: ["workspace_id", "student_id"],
        foreignColumns: ["workspace_id", "id"],
      },
    });
  });

  it("keeps goals in the same workspace as their student", () => {
    const goalConfig = getTableConfig(goals);
    const studentReference = goalConfig.foreignKeys
      .find((key) => key.getName() === "goals_student_foreign_key")
      ?.reference();

    expect(studentReference?.columns.map((column) => column.name)).toEqual([
      "workspace_id",
      "student_id",
    ]);
    expect(
      studentReference?.foreignColumns.map((column) => column.name),
    ).toEqual(["workspace_id", "id"]);
  });

  it("enforces score, ordering, version, and date checks on goals", () => {
    const checkNames = getTableConfig(goals).checks.map((item) => item.name);

    expect(checkNames).toEqual(
      expect.arrayContaining([
        "goals_target_score_range",
        "goals_version_positive",
        "goals_position_nonnegative",
        "goals_active_date_range",
      ]),
    );
  });
});
