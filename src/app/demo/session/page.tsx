import Link from "next/link";

import { RUBRIC_SCORE_VALUES } from "@/domain/scoring";
import { DEMO_SESSION } from "@/demo/fixtures";

export default function DemoSessionPage() {
  return (
    <main className="demo-shell">
      <div className="demo-banner" role="note">
        <span className="demo-banner-dot" aria-hidden="true" />
        Synthetic local demo — no student information is stored
      </div>

      <header className="demo-header">
        <Link className="demo-brand" href="/" aria-label="Back to project overview">
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>Evidence Loop</span>
        </Link>
        <span className="demo-user">{DEMO_SESSION.scorerLabel}</span>
      </header>

      <section className="session-heading" aria-labelledby="session-title">
        <div>
          <p className="session-kicker">New observation session</p>
          <h1 id="session-title">{DEMO_SESSION.student.displayName}</h1>
          <p className="session-meta">
            {DEMO_SESSION.sessionType}
            <span aria-hidden="true">·</span>
            {DEMO_SESSION.goals.length} active goals
          </p>
        </div>
        <div className="session-progress" aria-label="Session progress">
          <span>Session progress</span>
          <strong>0 of {DEMO_SESSION.goals.length}</strong>
          <div className="progress-track" aria-hidden="true">
            <span />
          </div>
        </div>
      </section>

      <section className="goal-list" aria-label="Active goals">
        {DEMO_SESSION.goals.map((goal, index) => (
          <article className="goal-card" key={goal.id}>
            <div className="goal-card-heading">
              <div>
                <p className="goal-domain">Goal {index + 1} · {goal.domain}</p>
                <h2>{goal.title}</h2>
              </div>
              <span className="goal-status">Not scored</span>
            </div>

            <p className="goal-objective">{goal.objective}</p>

            <div className={goal.strategy ? "strategy-panel" : "strategy-panel strategy-panel-empty"}>
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

            <div className="score-preview">
              <div>
                <p>How much support was needed?</p>
                <span>Scoring controls are the next prototype step.</span>
              </div>
              <div className="score-options" aria-label="Score options preview">
                {RUBRIC_SCORE_VALUES.map((score) => (
                  <span key={score}>{score}</span>
                ))}
                <span className="score-option-nd">ND</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="demo-footer">
        <p>This fixture is for interface testing only.</p>
        <Link href="/">Return to project overview</Link>
      </footer>
    </main>
  );
}
