import { drizzle } from "drizzle-orm/node-postgres";
import { describe, expect, it } from "vitest";

import { buildApplicationUserQuery, normalizeEmail } from "./users";

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

describe("approved email normalization", () => {
  it("trims and lowercases the email used for authorization", () => {
    expect(normalizeEmail("  Staff.Member@Example.edu ")).toBe(
      "staff.member@example.edu",
    );
  });
});
