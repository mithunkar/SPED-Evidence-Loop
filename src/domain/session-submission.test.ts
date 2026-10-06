import { describe, expect, it } from "vitest";

import type { AuthorizedScoringContext } from "@/data/scoring-context";
import { SYNTHETIC_SEED_IDS } from "@/db/seed-data";

import {
  prepareAuthorizedSessionSubmission,
  type SessionSubmissionInput,
} from "./session-submission";

const context: AuthorizedScoringContext = {
  source: "SYNTHETIC_FIXTURE",
  student: { id: SYNTHETIC_SEED_IDS.river, displayName: "River" },
  sessionType: "Morning centers",
  scorerLabel: "Demo teacher",
  goals: [
    {
      id: SYNTHETIC_SEED_IDS.riverDirectionsGoal,
      version: 3,
      title: "Following directions",
      domain: "Classroom routines",
      objective: "Follow a classroom direction.",
      strategy: {
        assignmentId: SYNTHETIC_SEED_IDS.visualCueAssignment,
        id: SYNTHETIC_SEED_IDS.visualCueStrategy,
        version: 2,
        name: "Visual cue",
        reminder: "Show the cue.",
        fidelityPrompt: "Was the cue used?",
      },
    },
    {
      id: SYNTHETIC_SEED_IDS.riverHelpGoal,
      version: 1,
      title: "Requesting help",
      domain: "Communication",
      objective: "Request help.",
      strategy: null,
    },
  ],
};

const validInput = (): SessionSubmissionInput => ({
  occurredAt: "2026-10-05T16:30:00.000Z",
  contextTags: ["centers"],
  note: "Short session note",
  observations: [
    {
      goalId: SYNTHETIC_SEED_IDS.riverDirectionsGoal,
      score: 3,
      noDataReason: null,
      fidelityStatus: "FULL",
      note: "Used one verbal prompt.",
    },
    {
      goalId: SYNTHETIC_SEED_IDS.riverHelpGoal,
      score: null,
      noDataReason: "NO_OPPORTUNITY",
      fidelityStatus: null,
      note: null,
    },
  ],
});

describe("authorized session submission", () => {
  it("uses server-authorized goal and strategy versions", () => {
    const prepared = prepareAuthorizedSessionSubmission(validInput(), context);

    expect(prepared.session).toMatchObject({
      studentId: SYNTHETIC_SEED_IDS.river,
      sessionType: "Morning centers",
      occurredAt: new Date("2026-10-05T16:30:00.000Z"),
    });
    expect(prepared.observations[0]).toMatchObject({
      goalVersion: 3,
      strategyAssignmentId: SYNTHETIC_SEED_IDS.visualCueAssignment,
      strategyVersion: 2,
      fidelityStatus: "FULL",
    });
    expect(prepared.observations[1]).toMatchObject({
      score: null,
      noDataReason: "NO_OPPORTUNITY",
      strategyAssignmentId: null,
      strategyVersion: null,
    });
  });

  it("rejects duplicate, missing, or unauthorized goals", () => {
    const duplicate = validInput();
    duplicate.observations[1].goalId = duplicate.observations[0].goalId;
    expect(() =>
      prepareAuthorizedSessionSubmission(duplicate, context),
    ).toThrow("only once");

    const missing = validInput();
    missing.observations.pop();
    expect(() => prepareAuthorizedSessionSubmission(missing, context)).toThrow(
      "every authorized active goal",
    );

    const unauthorized = validInput();
    unauthorized.observations[1].goalId = SYNTHETIC_SEED_IDS.micahCleanupGoal;
    expect(() =>
      prepareAuthorizedSessionSubmission(unauthorized, context),
    ).toThrow("every authorized active goal");
  });

  it("keeps zero distinct from no data", () => {
    const zero = validInput();
    zero.observations[1].score = 0;
    zero.observations[1].noDataReason = null;
    expect(
      prepareAuthorizedSessionSubmission(zero, context).observations[1],
    ).toMatchObject({ score: 0, noDataReason: null });

    const invalidNoData = validInput();
    invalidNoData.observations[1].score = null;
    invalidNoData.observations[1].noDataReason = null;
    expect(() =>
      prepareAuthorizedSessionSubmission(invalidNoData, context),
    ).toThrow();
  });

  it("requires fidelity only when a strategy is assigned", () => {
    const missingFidelity = validInput();
    missingFidelity.observations[0].fidelityStatus = null;
    expect(() =>
      prepareAuthorizedSessionSubmission(missingFidelity, context),
    ).toThrow("requires a strategy fidelity status");

    const unexpectedFidelity = validInput();
    unexpectedFidelity.observations[1].fidelityStatus = "PARTIAL";
    expect(() =>
      prepareAuthorizedSessionSubmission(unexpectedFidelity, context),
    ).toThrow("does not have an assigned strategy");
  });
});
