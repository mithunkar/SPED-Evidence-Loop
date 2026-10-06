import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { describe, expect, it, vi } from "vitest";

import type { AuthorizationActor } from "@/auth/authorization";
import type { AuthorizedScoringContext } from "@/data/scoring-context";
import { observations, sessions } from "@/db/schema";
import { SYNTHETIC_SEED_IDS } from "@/db/seed-data";

import { persistAuthorizedSession } from "./session-submission";

const actor: AuthorizationActor = {
  id: SYNTHETIC_SEED_IDS.teacher,
  workspaceId: SYNTHETIC_SEED_IDS.workspace,
  role: "TEACHER",
  status: "ACTIVE",
};

const context: AuthorizedScoringContext = {
  source: "DATABASE",
  student: { id: SYNTHETIC_SEED_IDS.river, displayName: "River" },
  sessionType: "Morning centers",
  scorerLabel: "Demo teacher",
  goals: [
    {
      id: SYNTHETIC_SEED_IDS.riverDirectionsGoal,
      version: 4,
      title: "Following directions",
      domain: "Classroom routines",
      objective: "Follow a direction.",
      strategy: {
        assignmentId: SYNTHETIC_SEED_IDS.visualCueAssignment,
        id: SYNTHETIC_SEED_IDS.visualCueStrategy,
        version: 2,
        name: "Visual cue",
        reminder: "Show the cue.",
        fidelityPrompt: "Was the cue used?",
      },
    },
  ],
};

const input = {
  occurredAt: "2026-10-05T16:30:00.000Z",
  contextTags: ["centers"],
  note: "Quiet classroom",
  observations: [
    {
      goalId: SYNTHETIC_SEED_IDS.riverDirectionsGoal,
      score: 3 as const,
      noDataReason: null,
      fidelityStatus: "FULL" as const,
      note: "One prompt",
    },
  ],
};

function createDatabaseDouble(duplicateRows: PotentialDuplicate[] = []) {
  const inserts: Array<{ table: unknown; values: unknown }> = [];
  const transaction = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => duplicateRows),
        })),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: vi.fn(async (values: unknown) => {
        inserts.push({ table, values });
      }),
    })),
  };
  const database = {
    transaction: vi.fn(
      async (callback: (value: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    ),
  } as unknown as NodePgDatabase;

  return { database, inserts };
}

type PotentialDuplicate = { id: string; occurredAt: Date };

describe("session submission persistence", () => {
  it("writes the session and all observations in one transaction", async () => {
    const { database, inserts } = createDatabaseDouble();
    const submittedAt = new Date("2026-10-05T16:31:00.000Z");
    const sessionId = "70000000-0000-4000-8000-000000000001";

    await persistAuthorizedSession(database, actor, context, input, {
      now: submittedAt,
      sessionId,
    });

    expect(inserts).toHaveLength(2);
    expect(inserts[0]).toMatchObject({
      table: sessions,
      values: {
        id: sessionId,
        workspaceId: SYNTHETIC_SEED_IDS.workspace,
        studentId: SYNTHETIC_SEED_IDS.river,
        recordedByUserId: SYNTHETIC_SEED_IDS.teacher,
        status: "SUBMITTED",
        submittedAt,
      },
    });
    expect(inserts[1].table).toBe(observations);
    expect(inserts[1].values).toEqual([
      expect.objectContaining({
        sessionId,
        goalId: SYNTHETIC_SEED_IDS.riverDirectionsGoal,
        goalVersion: 4,
        strategyAssignmentId: SYNTHETIC_SEED_IDS.visualCueAssignment,
        strategyVersion: 2,
        score: 3,
        fidelityStatus: "FULL",
      }),
    ]);
  });

  it("returns nearby matching sessions as non-blocking duplicate warnings", async () => {
    const duplicate = {
      id: "70000000-0000-4000-8000-000000000002",
      occurredAt: new Date("2026-10-05T16:25:00.000Z"),
    };
    const { database } = createDatabaseDouble([duplicate]);

    await expect(
      persistAuthorizedSession(database, actor, context, input, {
        sessionId: "70000000-0000-4000-8000-000000000003",
      }),
    ).resolves.toMatchObject({ potentialDuplicates: [duplicate] });
  });

  it("rejects inactive staff before opening a transaction", async () => {
    const { database } = createDatabaseDouble();

    await expect(
      persistAuthorizedSession(
        database,
        { ...actor, status: "INACTIVE" },
        context,
        input,
      ),
    ).rejects.toThrow("Only active staff");
    expect(database.transaction).not.toHaveBeenCalled();
  });
});
