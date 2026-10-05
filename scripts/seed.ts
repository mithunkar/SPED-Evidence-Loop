import "dotenv/config";

import { seedSyntheticDevelopmentData } from "../src/db/seed";

if (process.env.NODE_ENV === "production") {
  throw new Error("Synthetic development seed data cannot run in production.");
}

const { databasePool, db } = await import("../src/db/client");

try {
  await seedSyntheticDevelopmentData(db);
  console.info("Seeded deterministic synthetic classroom data.");
} finally {
  await databasePool.end();
}
