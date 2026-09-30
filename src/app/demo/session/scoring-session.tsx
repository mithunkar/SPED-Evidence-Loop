"use client";

import { useState } from "react";

import type { DemoSession } from "@/demo/fixtures";
import {
  createEmptyDemoGoalDraft,
  isDemoGoalDraftComplete,
  type DemoGoalDraft,
  type DemoScore,
} from "@/demo/scoring-state";
import type {
  NoDataReason,
  RubricScore,
  StrategyFidelityStatus,
} from "@/domain/scoring";

type RubricLevel = {
  value: RubricScore;
  label: string;
  description: string;
};

type ScoringSessionProps = {
  session: DemoSession;
  rubric: readonly RubricLevel[];
  noDataReasons: readonly NoDataReason[];
  fidelityStatuses: readonly StrategyFidelityStatus[];
};

const noDataReasonLabels: Record<NoDataReason, string> = {
  NO_OPPORTUNITY: "No opportunity",
  STUDENT_ABSENT: "Student absent",
  GOAL_NOT_OBSERVED: "Goal not observed",
  SESSION_INTERRUPTED: "Session interrupted",
  OTHER: "Other",
};

const fidelityLabels: Record<StrategyFidelityStatus, string> = {
  FULL: "Used as planned",
  PARTIAL: "Partly used",
  NOT_USED: "Not used",
  NOT_APPLICABLE: "N/A",
};

export function ScoringSession({
  session,
  rubric,
  noDataReasons,
  fidelityStatuses,
}: ScoringSessionProps) {
  const [drafts, setDrafts] = useState<Record<string, DemoGoalDraft>>(() =>
    Object.fromEntries(
      session.goals.map((goal) => [goal.id, createEmptyDemoGoalDraft()]),
    ),
  );

  const completedCount = session.goals.filter((goal) =>
    isDemoGoalDraftComplete(drafts[goal.id], goal.strategy !== null),
  ).length;
  const progress = session.goals.length
    ? (completedCount / session.goals.length) * 100
    : 0;

  const updateDraft = (goalId: string, patch: Partial<DemoGoalDraft>) => {
    setDrafts((current) => ({
      ...current,
      [goalId]: { ...current[goalId], ...patch },
    }));
  };

  const selectScore = (goalId: string, score: DemoScore) => {
    setDrafts((current) => ({
      ...current,
      [goalId]: {
        ...current[goalId],
        score,
        noDataReason:
          score === "ND" ? current[goalId].noDataReason : null,
      },
    }));
  };

  return (
    <>
      <section className="session-heading" aria-labelledby="session-title">
        <div>
          <p className="session-kicker">New observation session</p>
          <h1 id="session-title">{session.student.displayName}</h1>
          <p className="session-meta">
            {session.sessionType}
            <span aria-hidden="true">·</span>
            {session.goals.length} active goals
          </p>
        </div>
        <div className="session-progress">
          <span>Session progress</span>
          <strong aria-live="polite">
            {completedCount} of {session.goals.length}
          </strong>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Completed goal entries"
            aria-valuemin={0}
            aria-valuemax={session.goals.length}
            aria-valuenow={completedCount}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <section className="goal-list" aria-label="Active goals">
        {session.goals.map((goal, index) => {
          const draft = drafts[goal.id];
          const isComplete = isDemoGoalDraftComplete(
            draft,
            goal.strategy !== null,
          );
          const needsDetails = draft.score !== null && !isComplete;
          const selectedRubricLevel =
            typeof draft.score === "number"
              ? rubric.find((level) => level.value === draft.score)
              : null;

          return (
            <article
              className="goal-card"
              data-complete={isComplete}
              key={goal.id}
              aria-labelledby={`${goal.id}-title`}
            >
              <div className="goal-card-heading">
                <div>
                  <p className="goal-domain">
                    Goal {index + 1} · {goal.domain}
                  </p>
                  <h2 id={`${goal.id}-title`}>{goal.title}</h2>
                </div>
                <span className="goal-status" data-complete={isComplete}>
                  {isComplete
                    ? "Ready"
                    : needsDetails
                      ? "Needs details"
                      : "Not scored"}
                </span>
              </div>

              <p className="goal-objective">{goal.objective}</p>

              <div
                className={
                  goal.strategy
                    ? "strategy-panel"
                    : "strategy-panel strategy-panel-empty"
                }
              >
                <p>{goal.strategy ? "Current strategy" : "Strategy"}</p>
                {goal.strategy ? (
                  <>
                    <strong>{goal.strategy.name}</strong>
                    <span>{goal.strategy.reminder}</span>
                  </>
                ) : (
                  <span>No primary strategy is assigned to this goal.</span>
                )}
              </div>

              <fieldset className="entry-fieldset score-fieldset">
                <legend>How much support was needed?</legend>
                <div className="score-options">
                  {rubric.map((level) => {
                    const selected = draft.score === level.value;

                    return (
                      <button
                        type="button"
                        className="score-button"
                        data-selected={selected}
                        aria-pressed={selected}
                        aria-label={`${level.value} — ${level.label}`}
                        onClick={() => selectScore(goal.id, level.value)}
                        key={level.value}
                      >
                        <span>{level.value}</span>
                        {selected ? (
                          <span className="selected-mark" aria-hidden="true">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="score-button score-option-nd"
                    data-selected={draft.score === "ND"}
                    aria-pressed={draft.score === "ND"}
                    aria-label="ND — No data collected"
                    onClick={() => selectScore(goal.id, "ND")}
                  >
                    <span>ND</span>
                    {draft.score === "ND" ? (
                      <span className="selected-mark" aria-hidden="true">
                        ✓
                      </span>
                    ) : null}
                  </button>
                </div>
                <p className="score-help" aria-live="polite">
                  {selectedRubricLevel ? (
                    <>
                      <strong>{selectedRubricLevel.label}:</strong>{" "}
                      {selectedRubricLevel.description}
                    </>
                  ) : draft.score === "ND" ? (
                    "No data was collected. Choose a reason below."
                  ) : (
                    "Choose one value. A score of 0 is an observed outcome; ND means no data."
                  )}
                </p>
              </fieldset>

              {draft.score === "ND" ? (
                <fieldset className="entry-fieldset detail-fieldset">
                  <legend>Why was no data collected?</legend>
                  <div className="choice-grid">
                    {noDataReasons.map((reason) => (
                      <label className="choice-option" key={reason}>
                        <input
                          type="radio"
                          name={`${goal.id}-no-data-reason`}
                          value={reason}
                          checked={draft.noDataReason === reason}
                          onChange={() =>
                            updateDraft(goal.id, { noDataReason: reason })
                          }
                          required
                        />
                        <span>{noDataReasonLabels[reason]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              {goal.strategy ? (
                <fieldset className="entry-fieldset detail-fieldset">
                  <legend>{goal.strategy.fidelityPrompt}</legend>
                  <div className="choice-grid fidelity-grid">
                    {fidelityStatuses.map((status) => (
                      <label className="choice-option" key={status}>
                        <input
                          type="radio"
                          name={`${goal.id}-fidelity-status`}
                          value={status}
                          checked={draft.fidelityStatus === status}
                          onChange={() =>
                            updateDraft(goal.id, { fidelityStatus: status })
                          }
                          required
                        />
                        <span>{fidelityLabels[status]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div className="note-field">
                <label htmlFor={`${goal.id}-note`}>Context note (optional)</label>
                <textarea
                  id={`${goal.id}-note`}
                  value={draft.note}
                  onChange={(event) =>
                    updateDraft(goal.id, { note: event.target.value })
                  }
                  maxLength={1000}
                  rows={2}
                  placeholder="Add something that may help interpret this observation."
                />
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
