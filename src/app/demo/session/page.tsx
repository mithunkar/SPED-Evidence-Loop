import Link from "next/link";

import {
  DEFAULT_RUBRIC,
  NO_DATA_REASONS,
  STRATEGY_FIDELITY_STATUSES,
} from "@/domain/scoring";
import { DEMO_SESSION } from "@/demo/fixtures";

import { ScoringSession } from "./scoring-session";

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

      <ScoringSession
        session={DEMO_SESSION}
        rubric={DEFAULT_RUBRIC}
        noDataReasons={NO_DATA_REASONS}
        fidelityStatuses={STRATEGY_FIDELITY_STATUSES}
      />

      <footer className="demo-footer">
        <p>This fixture is for interface testing only.</p>
        <Link href="/">Return to project overview</Link>
      </footer>
    </main>
  );
}
