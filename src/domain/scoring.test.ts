import { describe, expect, it } from "vitest";

import {
  DEFAULT_RUBRIC,
  NO_DATA_REASONS,
  RUBRIC_SCORE_VALUES,
  STRATEGY_FIDELITY_STATUSES,
  observationEntrySchema,
} from "@/domain/scoring";

const baseEntry = {
  fidelityStatus: null,
  note: null,
};

describe("default rubric", () => {
  it("keeps support levels in descending order", () => {
    expect(DEFAULT_RUBRIC.map(({ value }) => value)).toEqual(
      RUBRIC_SCORE_VALUES,
    );
  });

  it.each(RUBRIC_SCORE_VALUES)("accepts %i as a valid observed score", (score) => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score,
      noDataReason: null,
    });

    expect(result.success).toBe(true);
  });

  it.each([-1, 5, 2.5])("rejects %s as an invalid score", (score) => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score,
      noDataReason: null,
    });

    expect(result.success).toBe(false);
  });
});

describe("no-data observations", () => {
  it.each(NO_DATA_REASONS)("accepts the %s reason", (noDataReason) => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score: null,
      noDataReason,
    });

    expect(result.success).toBe(true);
  });

  it("requires a reason when score is null", () => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score: null,
      noDataReason: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a no-data reason when a numeric score exists", () => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score: 0,
      noDataReason: "NO_OPPORTUNITY",
    });

    expect(result.success).toBe(false);
  });
});

describe("strategy fidelity", () => {
  it.each(STRATEGY_FIDELITY_STATUSES)("accepts %s", (fidelityStatus) => {
    const result = observationEntrySchema.safeParse({
      ...baseEntry,
      score: 3,
      noDataReason: null,
      fidelityStatus,
    });

    expect(result.success).toBe(true);
  });

  it("does not silently default fidelity", () => {
    const result = observationEntrySchema.safeParse({
      note: null,
      score: 3,
      noDataReason: null,
    });

    expect(result.success).toBe(false);
  });
});
