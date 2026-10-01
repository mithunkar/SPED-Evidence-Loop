import type { DemoSession } from "@/demo/fixtures";
import type { DemoDrafts } from "@/demo/demo-storage";
import {
  FIDELITY_LABELS,
  NO_DATA_REASON_LABELS,
} from "@/demo/scoring-labels";
import type { RubricScore } from "@/domain/scoring";

type RubricLevel = {
  value: RubricScore;
  label: string;
};

type SessionReviewProps = {
  session: DemoSession;
  drafts: DemoDrafts;
  rubric: readonly RubricLevel[];
  onBack: () => void;
  onSubmit: () => void;
};

export function SessionReview({
  session,
  drafts,
  rubric,
  onBack,
  onSubmit,
}: SessionReviewProps) {
  return (
    <section className="review-surface" aria-labelledby="session-review-title">
      <div className="review-heading">
        <p className="session-kicker">Check before submitting</p>
        <h2 id="session-review-title" tabIndex={-1}>
          Review synthetic session
        </h2>
        <p>
          Confirm each outcome and strategy-use entry. This submission stays in
          this browser and does not represent a production student record.
        </p>
      </div>

      <div className="review-list">
        {session.goals.map((goal) => {
          const draft = drafts[goal.id];
          const rubricLevel =
            typeof draft.score === "number"
              ? rubric.find((level) => level.value === draft.score)
              : null;

          return (
            <article className="review-card" key={goal.id}>
              <div>
                <p>{goal.domain}</p>
                <h3>{goal.title}</h3>
              </div>
              <dl>
                <div>
                  <dt>Outcome</dt>
                  <dd>
                    {draft.score === "ND"
                      ? `ND — ${
                          draft.noDataReason
                            ? NO_DATA_REASON_LABELS[draft.noDataReason]
                            : "Reason missing"
                        }`
                      : `${draft.score} — ${rubricLevel?.label}`}
                  </dd>
                </div>
                {goal.strategy ? (
                  <div>
                    <dt>Strategy fidelity</dt>
                    <dd>
                      {draft.fidelityStatus
                        ? FIDELITY_LABELS[draft.fidelityStatus]
                        : "Not recorded"}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Context note</dt>
                  <dd>{draft.note.trim() || "No note added"}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>

      <div className="review-actions">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back to scoring
        </button>
        <button type="button" className="primary-button" onClick={onSubmit}>
          Submit synthetic session
        </button>
      </div>
    </section>
  );
}
