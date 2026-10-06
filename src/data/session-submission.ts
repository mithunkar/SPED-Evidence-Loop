import { and, eq, gte, lte } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { AuthorizationActor } from "@/auth/authorization";
import type { AuthorizedScoringContext } from "@/data/scoring-context";
import { observations, sessions } from "@/db/schema";
import {
  prepareAuthorizedSessionSubmission,
  type SessionSubmissionInput,
} from "@/domain/session-submission";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1_000;

type PersistenceOptions = {
  now?: Date;
  sessionId?: string;
};

export type PotentialDuplicateSession = {
  id: string;
  occurredAt: Date;
};

export async function persistAuthorizedSession(
  database: NodePgDatabase,
  actor: AuthorizationActor,
  context: AuthorizedScoringContext,
  input: SessionSubmissionInput,
  options: PersistenceOptions = {},
) {
  if (actor.status !== "ACTIVE") {
    throw new Error("Only active staff may submit observation sessions.");
  }

  const prepared = prepareAuthorizedSessionSubmission(input, context);
  const now = options.now ?? new Date();
  const sessionId = options.sessionId ?? crypto.randomUUID();
  const duplicateWindowStart = new Date(
    prepared.session.occurredAt.getTime() - DUPLICATE_WINDOW_MS,
  );
  const duplicateWindowEnd = new Date(
    prepared.session.occurredAt.getTime() + DUPLICATE_WINDOW_MS,
  );

  const potentialDuplicates = await database.transaction(async (transaction) => {
    const duplicateRows = await transaction
      .select({ id: sessions.id, occurredAt: sessions.occurredAt })
      .from(sessions)
      .where(
        and(
          eq(sessions.workspaceId, actor.workspaceId),
          eq(sessions.studentId, prepared.session.studentId),
          eq(sessions.sessionType, prepared.session.sessionType),
          eq(sessions.recordedByUserId, actor.id),
          eq(sessions.status, "SUBMITTED"),
          gte(sessions.occurredAt, duplicateWindowStart),
          lte(sessions.occurredAt, duplicateWindowEnd),
        ),
      )
      .limit(5);

    await transaction.insert(sessions).values({
      id: sessionId,
      workspaceId: actor.workspaceId,
      studentId: prepared.session.studentId,
      sessionType: prepared.session.sessionType,
      occurredAt: prepared.session.occurredAt,
      recordedByUserId: actor.id,
      contextTags: prepared.session.contextTags,
      note: prepared.session.note,
      status: "SUBMITTED",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await transaction.insert(observations).values(
      prepared.observations.map((observation) => ({
        id: crypto.randomUUID(),
        workspaceId: actor.workspaceId,
        studentId: prepared.session.studentId,
        sessionId,
        ...observation,
        createdAt: now,
        updatedAt: now,
      })),
    );

    return duplicateRows;
  });

  return {
    sessionId,
    potentialDuplicates: potentialDuplicates satisfies PotentialDuplicateSession[],
  };
}
