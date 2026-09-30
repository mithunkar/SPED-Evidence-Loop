import type {
  NoDataReason,
  RubricScore,
  StrategyFidelityStatus,
} from "@/domain/scoring";

export type DemoScore = RubricScore | "ND";

export type DemoGoalDraft = {
  score: DemoScore | null;
  noDataReason: NoDataReason | null;
  fidelityStatus: StrategyFidelityStatus | null;
  note: string;
};

export const createEmptyDemoGoalDraft = (): DemoGoalDraft => ({
  score: null,
  noDataReason: null,
  fidelityStatus: null,
  note: "",
});

export function isDemoGoalDraftComplete(
  draft: DemoGoalDraft,
  hasStrategy: boolean,
) {
  if (draft.score === null) {
    return false;
  }

  if (draft.score === "ND" && draft.noDataReason === null) {
    return false;
  }

  return !hasStrategy || draft.fidelityStatus !== null;
}
