import { z } from "zod";

export const RUBRIC_SCORE_VALUES = [4, 3, 2, 1, 0] as const;

export type RubricScore = (typeof RUBRIC_SCORE_VALUES)[number];

type RubricLevel = {
  value: RubricScore;
  label: string;
  description: string;
};

export const DEFAULT_RUBRIC = [
  {
    value: 4,
    label: "Independent",
    description:
      "Performs the skill independently or with a group direction; no adult intervention is needed.",
  },
  {
    value: 3,
    label: "Prompted",
    description:
      "Performs the skill after an adult points, gestures, models, or gives a verbal direction.",
  },
  {
    value: 2,
    label: "Partial physical support",
    description:
      "Completes part of the skill independently with partial physical assistance.",
  },
  {
    value: 1,
    label: "Full physical support",
    description: "Completes the skill with full physical assistance.",
  },
  {
    value: 0,
    label: "Did not perform",
    description: "Does not perform the skill during the opportunity.",
  },
] as const satisfies readonly RubricLevel[];

export const rubricScoreSchema = z.union([
  z.literal(4),
  z.literal(3),
  z.literal(2),
  z.literal(1),
  z.literal(0),
]);

export const NO_DATA_REASONS = [
  "NO_OPPORTUNITY",
  "STUDENT_ABSENT",
  "GOAL_NOT_OBSERVED",
  "SESSION_INTERRUPTED",
  "OTHER",
] as const;

export const noDataReasonSchema = z.enum(NO_DATA_REASONS);

export const STRATEGY_FIDELITY_STATUSES = [
  "FULL",
  "PARTIAL",
  "NOT_USED",
  "NOT_APPLICABLE",
] as const;

export const strategyFidelityStatusSchema = z.enum(
  STRATEGY_FIDELITY_STATUSES,
);

const observationContextSchema = z.object({
  fidelityStatus: strategyFidelityStatusSchema.nullable(),
  note: z.string().trim().max(1_000).nullable(),
});

const scoredObservationSchema = observationContextSchema.extend({
  score: rubricScoreSchema,
  noDataReason: z.null(),
});

const noDataObservationSchema = observationContextSchema.extend({
  score: z.null(),
  noDataReason: noDataReasonSchema,
});

/**
 * A score of zero is an observed outcome. No data is represented separately as
 * a null score with an explicit reason, so it can never enter numeric analysis.
 */
export const observationEntrySchema = z.union([
  scoredObservationSchema,
  noDataObservationSchema,
]);

export type NoDataReason = z.infer<typeof noDataReasonSchema>;
export type StrategyFidelityStatus = z.infer<
  typeof strategyFidelityStatusSchema
>;
export type ObservationEntry = z.infer<typeof observationEntrySchema>;
