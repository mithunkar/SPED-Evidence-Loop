import { drizzle } from "drizzle-orm/node-postgres";
import { describe, expect, it } from "vitest";

import type { AuthorizationActor } from "@/auth/authorization";
import { buildStudentGoalListQuery } from "@/db/queries/goals";
import { SYNTHETIC_SEED_IDS, syntheticSeedData } from "@/db/seed-data";

const database = drizzle.mock();
const teacher: AuthorizationActor = {
  id: SYNTHETIC_SEED_IDS.teacher,
  workspaceId: SYNTHETIC_SEED_IDS.workspace,
  role: "TEACHER",
  status: "ACTIVE",
};

describe("student goal queries", () => {
  it("scopes the goal list to the actor workspace and student", () => {
    const query = buildStudentGoalListQuery(
      database,
      teacher,
      syntheticSeedData.students[0],
    ).toSQL();

    expect(query.sql).toContain('from "goals"');
    expect(query.sql).toContain('"goals"."workspace_id" = $1');
    expect(query.sql).toContain('"goals"."student_id" = $2');
    expect(query.params).toEqual([
      SYNTHETIC_SEED_IDS.workspace,
      syntheticSeedData.students[0].id,
    ]);
  });
});
