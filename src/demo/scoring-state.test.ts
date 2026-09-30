import { describe, expect, it } from "vitest";

import {
  createEmptyDemoGoalDraft,
  isDemoGoalDraftComplete,
} from "@/demo/scoring-state";

describe("demo scoring state", () => {
  it("does not silently complete an untouched goal", () => {
    expect(isDemoGoalDraftComplete(createEmptyDemoGoalDraft(), false)).toBe(
      false,
    );
  });

  it("treats zero as a complete observed score", () => {
    expect(
      isDemoGoalDraftComplete(
        {
          ...createEmptyDemoGoalDraft(),
          score: 0,
        },
        false,
      ),
    ).toBe(true);
  });

  it("requires a reason when no data is selected", () => {
    const draft = {
      ...createEmptyDemoGoalDraft(),
      score: "ND" as const,
    };

    expect(isDemoGoalDraftComplete(draft, false)).toBe(false);
    expect(
      isDemoGoalDraftComplete(
        { ...draft, noDataReason: "NO_OPPORTUNITY" },
        false,
      ),
    ).toBe(true);
  });

  it("requires explicit fidelity when a strategy is assigned", () => {
    const draft = {
      ...createEmptyDemoGoalDraft(),
      score: 3 as const,
    };

    expect(isDemoGoalDraftComplete(draft, true)).toBe(false);
    expect(
      isDemoGoalDraftComplete(
        { ...draft, fidelityStatus: "PARTIAL" },
        true,
      ),
    ).toBe(true);
  });
});
