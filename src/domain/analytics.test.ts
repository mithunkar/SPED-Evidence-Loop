import { describe, expect, it } from "vitest";

import { summarizeObservations } from "@/domain/analytics";
import type {
  ObservationEntry,
  StrategyFidelityStatus,
} from "@/domain/scoring";

type ObservationOptions = {
  fidelityStatus?: StrategyFidelityStatus | null;
};

function observation(
  score: ObservationEntry["score"],
  { fidelityStatus = null }: ObservationOptions = {},
): ObservationEntry {
  if (score === null) {
    return {
      score: null,
      noDataReason: "NO_OPPORTUNITY",
      fidelityStatus,
      note: null,
    };
  }

  return {
    score,
    noDataReason: null,
    fidelityStatus,
    note: null,
  };
}

describe("observation summaries", () => {
  it("keeps no-data entries out of every numeric score calculation", () => {
    const summary = summarizeObservations(
      [
        observation(4),
        observation(2),
        observation(null),
        observation(0),
        observation(4),
      ],
      2,
    );

    expect(summary.validObservationCount).toBe(4);
    expect(summary.noDataCount).toBe(1);
    expect(summary.medianScore).toBe(3);
    expect(summary.scoreDistribution[4]).toEqual({
      numerator: 2,
      denominator: 4,
      value: 0.5,
    });
    expect(summary.scoreDistribution[0]).toEqual({
      numerator: 1,
      denominator: 4,
      value: 0.25,
    });
    expect(summary.independenceRate).toEqual({
      numerator: 2,
      denominator: 4,
      value: 0.5,
    });
    expect(summary.targetRate).toEqual({
      numerator: 3,
      denominator: 4,
      value: 0.75,
    });
  });

  it("calculates the median for an odd number of observations", () => {
    const summary = summarizeObservations([
      observation(4),
      observation(0),
      observation(3),
    ]);

    expect(summary.medianScore).toBe(3);
  });

  it("does not calculate rates when there are no valid observations", () => {
    const summary = summarizeObservations([observation(null)], 3);

    expect(summary.validObservationCount).toBe(0);
    expect(summary.noDataCount).toBe(1);
    expect(summary.medianScore).toBeNull();
    expect(summary.independenceRate).toEqual({
      numerator: 0,
      denominator: 0,
      value: null,
    });
    expect(summary.targetRate).toEqual({
      numerator: 0,
      denominator: 0,
      value: null,
    });
    expect(summary.scoreDistribution[0].value).toBeNull();
  });

  it("omits the target rate when no target is configured", () => {
    const summary = summarizeObservations([observation(4)]);

    expect(summary.targetRate).toBeNull();
  });

  it("reports full fidelity only among applicable strategy observations", () => {
    const summary = summarizeObservations([
      observation(3, { fidelityStatus: "FULL" }),
      observation(2, { fidelityStatus: "PARTIAL" }),
      observation(4, { fidelityStatus: "NOT_USED" }),
      observation(null, { fidelityStatus: "NOT_APPLICABLE" }),
      observation(3),
    ]);

    expect(summary.fullFidelityRate).toEqual({
      numerator: 1,
      denominator: 3,
      value: 1 / 3,
    });
  });

  it("does not calculate fidelity when no strategy observation applies", () => {
    const summary = summarizeObservations([
      observation(3),
      observation(null, { fidelityStatus: "NOT_APPLICABLE" }),
    ]);

    expect(summary.fullFidelityRate).toEqual({
      numerator: 0,
      denominator: 0,
      value: null,
    });
  });
});
