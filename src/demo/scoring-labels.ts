import type {
  NoDataReason,
  StrategyFidelityStatus,
} from "@/domain/scoring";

export const NO_DATA_REASON_LABELS: Record<NoDataReason, string> = {
  NO_OPPORTUNITY: "No opportunity",
  STUDENT_ABSENT: "Student absent",
  GOAL_NOT_OBSERVED: "Goal not observed",
  SESSION_INTERRUPTED: "Session interrupted",
  OTHER: "Other",
};

export const FIDELITY_LABELS: Record<StrategyFidelityStatus, string> = {
  FULL: "Used as planned",
  PARTIAL: "Partly used",
  NOT_USED: "Not used",
  NOT_APPLICABLE: "N/A",
};
