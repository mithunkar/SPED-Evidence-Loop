import {
  RUBRIC_SCORE_VALUES,
  type ObservationEntry,
  type RubricScore,
} from "@/domain/scoring";

export type RateSummary = {
  numerator: number;
  denominator: number;
  value: number | null;
};

export type ObservationSummary = {
  validObservationCount: number;
  noDataCount: number;
  scoreDistribution: Record<RubricScore, RateSummary>;
  medianScore: number | null;
  independenceRate: RateSummary;
  targetRate: RateSummary | null;
  fullFidelityRate: RateSummary;
};

function calculateRate(numerator: number, denominator: number): RateSummary {
  return {
    numerator,
    denominator,
    value: denominator === 0 ? null : numerator / denominator,
  };
}

function calculateMedian(scores: RubricScore[]): number | null {
  if (scores.length === 0) {
    return null;
  }

  const sortedScores = [...scores].sort((left, right) => left - right);
  const midpoint = Math.floor(sortedScores.length / 2);

  if (sortedScores.length % 2 === 1) {
    return sortedScores[midpoint];
  }

  return (sortedScores[midpoint - 1] + sortedScores[midpoint]) / 2;
}

/**
 * Produces descriptive statistics for a goal and period. Null scores are kept
 * as a separate no-data count and never participate in numeric calculations.
 */
export function summarizeObservations(
  observations: readonly ObservationEntry[],
  targetScore: RubricScore | null = null,
): ObservationSummary {
  const scores = observations.flatMap(({ score }) =>
    score === null ? [] : [score],
  );
  const validObservationCount = scores.length;

  const scoreDistribution = Object.fromEntries(
    RUBRIC_SCORE_VALUES.map((score) => {
      const count = scores.filter((value) => value === score).length;
      return [score, calculateRate(count, validObservationCount)];
    }),
  ) as Record<RubricScore, RateSummary>;

  const applicableFidelityStatuses = observations.flatMap(
    ({ fidelityStatus }) =>
      fidelityStatus === null || fidelityStatus === "NOT_APPLICABLE"
        ? []
        : [fidelityStatus],
  );

  return {
    validObservationCount,
    noDataCount: observations.length - validObservationCount,
    scoreDistribution,
    medianScore: calculateMedian(scores),
    independenceRate: calculateRate(
      scoreDistribution[4].numerator,
      validObservationCount,
    ),
    targetRate:
      targetScore === null
        ? null
        : calculateRate(
            scores.filter((score) => score >= targetScore).length,
            validObservationCount,
          ),
    fullFidelityRate: calculateRate(
      applicableFidelityStatuses.filter((status) => status === "FULL").length,
      applicableFidelityStatuses.length,
    ),
  };
}
