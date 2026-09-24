import "dotenv/config";

import { defineConfig } from "drizzle-kit";

const localDatabaseUrl =
  "postgresql://sped:sped_local@localhost:5432/sped_evidence_loop";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? localDatabaseUrl,
  },
});
