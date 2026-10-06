import { describe, expect, it } from "vitest";

import { createDatabasePoolConfig } from "./connection";

describe("database pool configuration", () => {
  it("uses one encrypted connection per serverless instance", () => {
    const config = createDatabasePoolConfig(
      "postgresql://postgres.example:secret@pooler.supabase.com:6543/postgres",
      { serverless: true },
    );

    expect(config.max).toBe(1);
    expect(config.allowExitOnIdle).toBe(false);
    expect(config.connectionString).toContain("sslmode=require");
  });

  it("keeps local development connections unencrypted", () => {
    const config = createDatabasePoolConfig(
      "postgresql://sped:sped_local@localhost:5432/sped_evidence_loop",
    );

    expect(config.max).toBe(10);
    expect(config.allowExitOnIdle).toBe(true);
    expect(config.connectionString).not.toContain("sslmode");
  });

  it("preserves an explicit stricter SSL mode", () => {
    const config = createDatabasePoolConfig(
      "postgresql://postgres.example:secret@db.example.com/postgres?sslmode=verify-full",
      { serverless: true },
    );

    expect(config.connectionString).toContain("sslmode=verify-full");
    expect(config.connectionString).not.toContain("sslmode=require");
  });
});
