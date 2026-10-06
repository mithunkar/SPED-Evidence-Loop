import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { createDatabasePoolConfig } from "@/db/connection";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before connecting to PostgreSQL.");
}

const globalForDatabase = globalThis as unknown as {
  pool: Pool | undefined;
};

export const databasePool =
  globalForDatabase.pool ??
  new Pool(
    createDatabasePoolConfig(connectionString, {
      serverless: process.env.VERCEL === "1",
    }),
  );

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.pool = databasePool;
}

export const db = drizzle({ client: databasePool });
