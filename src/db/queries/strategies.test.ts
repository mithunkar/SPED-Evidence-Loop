import { drizzle } from "drizzle-orm/node-postgres";
import { describe, expect, it } from "vitest";

import type { AuthorizationActor } from "@/auth/authorization";
import { buildAuthorizedGoalQuery } from "@/db/queries/strategies";
import { SYNTHETIC_SEED_IDS, syntheticSeedData } from "@/db/seed-data";

const database = drizzle.mock();
const teacher: AuthorizationActor = {
  id: SYNTHETIC_SEED_IDS.teacher,
  workspaceId: SYNTHETIC_SEED_IDS.workspace,
  role: "TEACHER",
  status: "ACTIVE",
};

describe("strategy assignment queries", () => {
  it("scopes a goal to the teacher workspace and student", () => {
    const query = buildAuthorizedGoalQuery(
      database,
      teacher,
      syntheticSeedData.students[0],
      SYNTHETIC_SEED_IDS.riverDirectionsGoal,
    ).toSQL();

    expect(query.sql).toContain('from "goals"');
    expect(query.sql).toContain('"goals"."workspace_id" = $1');
    expect(query.sql).toContain('"goals"."student_id" = $2');
    expect(query.sql).toContain('"goals"."id" = $3');
    expect(query.params.slice(0, 3)).toEqual([
      SYNTHETIC_SEED_IDS.workspace,
      syntheticSeedData.students[0].id,
      SYNTHETIC_SEED_IDS.riverDirectionsGoal,
    ]);
  });
});
