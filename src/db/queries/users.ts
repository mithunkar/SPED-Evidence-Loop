import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { users } from "@/db/schema";

const applicationUserSelection = {
  id: users.id,
  workspaceId: users.workspaceId,
  displayName: users.displayName,
  email: users.email,
  role: users.role,
  status: users.status,
};

export function buildApplicationUserQuery(
  database: NodePgDatabase,
  userId: string,
) {
  return database
    .select(applicationUserSelection)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
}

export async function findApplicationUser(
  database: NodePgDatabase,
  userId: string,
) {
  const [user] = await buildApplicationUserQuery(database, userId);
  return user ?? null;
}
