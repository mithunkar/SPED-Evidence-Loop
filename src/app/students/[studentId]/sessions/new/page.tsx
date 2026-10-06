import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ScoringSession } from "@/app/demo/session/scoring-session";
import { getCurrentApplicationIdentity } from "@/auth/application-session";
import { loadAuthorizedScoringContext } from "@/data/scoring-context";
import {
  DEFAULT_RUBRIC,
  NO_DATA_REASONS,
  STRATEGY_FIDELITY_STATUSES,
} from "@/domain/scoring";

import { submitAuthorizedScoringSession } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewStudentSessionPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const identity = await getCurrentApplicationIdentity();
  if (!identity) {
    redirect("/sign-in");
  }

  const { studentId } = await params;
  const context = await loadAuthorizedScoringContext(identity, studentId);
  if (!context) {
    notFound();
  }

  const submitSession = submitAuthorizedScoringSession.bind(null, studentId);

  return (
    <main className="demo-shell">
      <header className="demo-header">
        <Link className="demo-brand" href="/dashboard" aria-label="Student roster">
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>Evidence Loop</span>
        </Link>
        <div className="demo-header-actions">
          <Link className="demo-history-link" href="/dashboard">
            Your students
          </Link>
          <span className="demo-user">{identity.displayName}</span>
        </div>
      </header>

      <ScoringSession
        session={context}
        rubric={DEFAULT_RUBRIC}
        noDataReasons={NO_DATA_REASONS}
        fidelityStatuses={STRATEGY_FIDELITY_STATUSES}
        persistSubmission={
          context.source === "DATABASE" ? submitSession : undefined
        }
      />

      <footer className="demo-footer">
        <Link href="/dashboard">Return to your students</Link>
      </footer>
    </main>
  );
}
