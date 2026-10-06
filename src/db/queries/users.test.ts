import { drizzle } from "drizzle-orm/node-postgres";
import { describe, expect, it } from "vitest";

import { buildApplicationUserQuery } from "./users";

describe("application user queries", () => {
  it("loads a profile only by its authenticated user id", () => {
    const database = drizzle.mock();
    const query = buildApplicationUserQuery(
      database,
      "20000000-0000-4000-8000-000000000001",
    ).toSQL();

    expect(query.sql).toContain('from "users"');
    expect(query.sql).toContain('where "users"."id" = $1');
    expect(query.sql).toContain("limit $2");
    expect(query.params).toEqual([
      "20000000-0000-4000-8000-000000000001",
      1,
    ]);
  });
});
