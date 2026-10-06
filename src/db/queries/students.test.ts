import { drizzle } from "drizzle-orm/node-postgres";
import { describe, expect, it } from "vitest";

import type { AuthorizationActor } from "@/auth/authorization";
import { SYNTHETIC_SEED_IDS } from "@/db/seed-data";
import { buildAuthorizedStudentListQuery } from "@/db/queries/students";
import { buildCreateStudentQuery } from "@/db/queries/students";

const database = drizzle.mock();

const teacher: AuthorizationActor = {
  id: SYNTHETIC_SEED_IDS.teacher,
  workspaceId: SYNTHETIC_SEED_IDS.workspace,
  role: "TEACHER",
  status: "ACTIVE",
};

const assistant: AuthorizationActor = {
  id: SYNTHETIC_SEED_IDS.assignedAssistant,
  workspaceId: SYNTHETIC_SEED_IDS.workspace,
  role: "ASSISTANT",
  status: "ACTIVE",
};

describe("authorized student queries", () => {
  it("scopes a teacher list to the current workspace", () => {
    const query = buildAuthorizedStudentListQuery(database, teacher).toSQL();

    expect(query.sql).toContain('from "students"');
    expect(query.sql).toContain('"students"."workspace_id" = $1');
    expect(query.sql).not.toContain('join "user_student_assignments"');
    expect(query.params).toEqual([SYNTHETIC_SEED_IDS.workspace]);
  });

  it("requires an assistant assignment inside the same workspace", () => {
    const query = buildAuthorizedStudentListQuery(database, assistant).toSQL();

    expect(query.sql).toContain('inner join "user_student_assignments"');
    expect(query.sql).toContain('"user_student_assignments"."user_id"');
    expect(query.params).toEqual([
      SYNTHETIC_SEED_IDS.workspace,
      SYNTHETIC_SEED_IDS.workspace,
      SYNTHETIC_SEED_IDS.assignedAssistant,
    ]);
  });

  it("creates a student inside the teacher's workspace", () => {
    const query = buildCreateStudentQuery(database, teacher, {
      displayName: "Avery",
    }).toSQL();

    expect(query.sql).toContain('insert into "students"');
    expect(query.sql).toContain('"workspace_id"');
    expect(query.params).toContain(SYNTHETIC_SEED_IDS.workspace);
    expect(query.params).toContain("Avery");
  });

  it("prevents assistants from creating students", () => {
    expect(() =>
      buildCreateStudentQuery(database, assistant, {
        displayName: "Avery",
      }),
    ).toThrow("The current user is not authorized for this action.");
  });
});
