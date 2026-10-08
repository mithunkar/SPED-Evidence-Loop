import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { approvedEmails, users } from "@/db/schema";

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

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isApprovedEmail(
  database: NodePgDatabase,
  email: string,
) {
  const [approvedEmail] = await database
    .select({ email: approvedEmails.email })
    .from(approvedEmails)
    .where(eq(approvedEmails.email, normalizeEmail(email)))
    .limit(1);

  return Boolean(approvedEmail);
}

export async function provisionClassroomTeacher(
  database: NodePgDatabase,
  input: {
    id: string;
    email: string;
    displayName: string;
    workspaceId: string;
  },
) {
  const email = normalizeEmail(input.email);
  const existingUser = await findApplicationUser(database, input.id);

  if (existingUser) {
    return existingUser;
  }

  const [user] = await database
    .insert(users)
    .values({
      id: input.id,
      workspaceId: input.workspaceId,
      displayName: input.displayName,
      email,
      role: "TEACHER",
      status: "ACTIVE",
    })
    .onConflictDoNothing()
    .returning(applicationUserSelection);

  if (user) {
    return user;
  }

  const concurrentUser = await findApplicationUser(database, input.id);
  if (concurrentUser) {
    return concurrentUser;
  }

  throw new Error("An approved email is already linked to another account.");
}
