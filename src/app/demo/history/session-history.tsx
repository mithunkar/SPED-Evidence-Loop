"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import {
  DEMO_STORAGE_UNAVAILABLE,
  getDemoSubmissionsSnapshot,
  subscribeToDemoSubmissions,
} from "@/demo/demo-browser-store";
import {
  restoreDemoSubmissions,
  type DemoSubmission,
} from "@/demo/demo-storage";
import {
  FIDELITY_LABELS,
  NO_DATA_REASON_LABELS,
} from "@/demo/scoring-labels";

type SessionHistoryProps = {
  studentName: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatSubmittedAt = (submittedAt: string) =>
  dateFormatter.format(new Date(submittedAt));

const getObservationCounts = (submission: DemoSubmission) => {
  const valid = submission.observations.filter(
    (observation) => observation.score !== null,
  ).length;

  return {
    valid,
    noData: submission.observations.length - valid,
  };
};

export function SessionHistory({ studentName }: SessionHistoryProps) {
  const storedSnapshot = useSyncExternalStore(
    subscribeToDemoSubmissions,
    getDemoSubmissionsSnapshot,
    () => null,
  );
  const submissions = restoreDemoSubmissions(
    storedSnapshot === DEMO_STORAGE_UNAVAILABLE ? null : storedSnapshot,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSubmission =
    submissions.find((submission) => submission.id === selectedId) ?? null;
  const storageUnavailable = storedSnapshot === DEMO_STORAGE_UNAVAILABLE;

  useEffect(() => {
    if (selectedId) {
      document.getElementById("history-detail-title")?.focus();
    }
  }, [selectedId]);

  if (selectedSubmission) {
    const counts = getObservationCounts(selectedSubmission);

    return (
      <section className="history-detail" aria-labelledby="history-detail-title">
        <button
          type="button"
          className="history-back-button"
          onClick={() => setSelectedId(null)}
        >
          <span aria-hidden="true">←</span> All synthetic sessions
        </button>

        <div className="history-detail-heading">
          <div>
            <p className="session-kicker">Submitted session</p>
            <h1 id="history-detail-title" tabIndex={-1}>
              {selectedSubmission.sessionType}
            </h1>
            <p>
              {formatSubmittedAt(selectedSubmission.submittedAt)} · Recorded by{" "}
              {selectedSubmission.scorerLabel}
            </p>
          </div>
          <div className="history-counts" aria-label="Observation counts">
            <span>
              <strong>{counts.valid}</strong> valid
            </span>
            <span>
              <strong>{counts.noData}</strong> ND
            </span>
          </div>
        </div>

        <div className="history-observations">
          {selectedSubmission.observations.map((observation) => (
            <article className="history-observation" key={observation.goalId}>
              <div className="history-observation-heading">
                <div>
                  <p>Goal observation</p>
                  <h2>{observation.goalTitle}</h2>
                </div>
                <strong className="history-score">
                  {observation.score ?? "ND"}
                </strong>
              </div>
              <dl>
                {observation.score === null ? (
                  <div>
                    <dt>No-data reason</dt>
                    <dd>
                      {observation.noDataReason
                        ? NO_DATA_REASON_LABELS[observation.noDataReason]
                        : "Reason unavailable"}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Strategy</dt>
                  <dd>{observation.strategyName ?? "No strategy assigned"}</dd>
                </div>
                {observation.strategyName ? (
                  <div>
                    <dt>Strategy fidelity</dt>
                    <dd>
                      {observation.fidelityStatus
                        ? FIDELITY_LABELS[observation.fidelityStatus]
                        : "Not recorded"}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Context note</dt>
                  <dd>{observation.note.trim() || "No note added"}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <p className="local-storage-note">
          This fictional record is stored only in this browser. It is not a
          production student record or security model.
        </p>
      </section>
    );
  }

  return (
    <section className="history-surface" aria-labelledby="history-title">
      <div className="history-heading">
        <div>
          <p className="session-kicker">Submitted sessions</p>
          <h1 id="history-title">{studentName}&rsquo;s history</h1>
          <p>
            Review fictional sessions submitted from this browser. Numeric
            observations and no-data entries remain separate.
          </p>
        </div>
        <Link className="history-new-link" href="/demo/session">
          Record a new session
        </Link>
      </div>

      {storageUnavailable ? (
        <div className="history-empty" role="status">
          <span aria-hidden="true">!</span>
          <h2>Browser storage is unavailable</h2>
          <p>
            Synthetic session history cannot be loaded or retained in this
            browser configuration.
          </p>
          <Link href="/demo/session">Return to scoring</Link>
        </div>
      ) : submissions.length === 0 ? (
        <div className="history-empty" role="status">
          <span aria-hidden="true">0</span>
          <h2>No submitted sessions yet</h2>
          <p>
            Complete the fictional scoring flow to create the first device-local
            session for review.
          </p>
          <Link href="/demo/session">Start a synthetic session</Link>
        </div>
      ) : (
        <ol className="history-list" aria-label="Synthetic submitted sessions">
          {submissions.map((submission) => {
            const counts = getObservationCounts(submission);

            return (
              <li key={submission.id}>
                <button
                  type="button"
                  className="history-row"
                  onClick={() => setSelectedId(submission.id)}
                  aria-label={`Review ${submission.sessionType} submitted ${formatSubmittedAt(submission.submittedAt)}`}
                >
                  <span className="history-row-date">
                    {formatSubmittedAt(submission.submittedAt)}
                  </span>
                  <span className="history-row-title">
                    <strong>{submission.sessionType}</strong>
                    <span>{submission.scorerLabel}</span>
                  </span>
                  <span className="history-row-counts">
                    <span>{counts.valid} valid</span>
                    <span>{counts.noData} ND</span>
                  </span>
                  <span className="history-row-arrow" aria-hidden="true">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <p className="local-storage-note">
        Device-local demo only. History can disappear if browser storage is
        cleared and is not shared with other devices or staff.
      </p>
    </section>
  );
}
