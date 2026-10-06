import { z } from "zod";

import type { AuthorizedScoringContext } from "@/data/scoring-context";
import { observationEntrySchema } from "@/domain/scoring";

const observationSubmissionSchema = z
  .object({ goalId: z.uuid() })
  .and(observationEntrySchema);

export const sessionSubmissionSchema = z.object({
  occurredAt: z.iso.datetime({ offset: true }),
  contextTags: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  note: z.string().trim().max(2_000).nullable().default(null),
  observations: z.array(observationSubmissionSchema).min(1).max(100),
});

export type SessionSubmissionInput = z.input<typeof sessionSubmissionSchema>;

export type PreparedSessionSubmission = {
  session: {
    studentId: string;
    sessionType: string;
    occurredAt: Date;
    contextTags: string[];
    note: string | null;
  };
  observations: Array<{
    goalId: string;
    goalVersion: number;
    score: 0 | 1 | 2 | 3 | 4 | null;
    noDataReason:
      | "NO_OPPORTUNITY"
      | "STUDENT_ABSENT"
      | "GOAL_NOT_OBSERVED"
      | "SESSION_INTERRUPTED"
      | "OTHER"
      | null;
    strategyAssignmentId: string | null;
    strategyVersion: number | null;
    fidelityStatus:
      | "FULL"
      | "PARTIAL"
      | "NOT_USED"
      | "NOT_APPLICABLE"
      | null;
    note: string | null;
  }>;
};

/**
 * Validates an untrusted submission against the authorized context loaded on
 * the server. Goal and strategy versions always come from that context rather
 * than from client input, preserving the exact definitions that were scored.
 */
export function prepareAuthorizedSessionSubmission(
  input: unknown,
  context: AuthorizedScoringContext,
): PreparedSessionSubmission {
  const submission = sessionSubmissionSchema.parse(input);
  const observationsByGoal = new Map(
    submission.observations.map((observation) => [
      observation.goalId,
      observation,
    ]),
  );

  if (observationsByGoal.size !== submission.observations.length) {
    throw new Error("Each goal may be observed only once per session.");
  }

  if (
    observationsByGoal.size !== context.goals.length ||
    context.goals.some((goal) => !observationsByGoal.has(goal.id))
  ) {
    throw new Error("Submission must contain every authorized active goal.");
  }

  const observations = context.goals.map((goal) => {
    const observation = observationsByGoal.get(goal.id);
    if (!observation) {
      throw new Error("Submission is missing an authorized active goal.");
    }

    if (goal.strategy && observation.fidelityStatus === null) {
      throw new Error(`Goal ${goal.id} requires a strategy fidelity status.`);
    }

    if (!goal.strategy && observation.fidelityStatus !== null) {
      throw new Error(`Goal ${goal.id} does not have an assigned strategy.`);
    }

    return {
      goalId: goal.id,
      goalVersion: goal.version,
      score: observation.score,
      noDataReason: observation.noDataReason,
      strategyAssignmentId: goal.strategy?.assignmentId ?? null,
      strategyVersion: goal.strategy?.version ?? null,
      fidelityStatus: observation.fidelityStatus,
      note: observation.note,
    };
  });

  return {
    session: {
      studentId: context.student.id,
      sessionType: context.sessionType,
      occurredAt: new Date(submission.occurredAt),
      contextTags: submission.contextTags,
      note: submission.note,
    },
    observations,
  };
}
