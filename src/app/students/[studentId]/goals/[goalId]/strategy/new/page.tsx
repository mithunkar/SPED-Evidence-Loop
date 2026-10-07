import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { canManageClassroom } from "@/auth/authorization";
import { getPublicClassroomIdentity } from "@/classroom/public-classroom";
import { findAuthorizedStudent } from "@/db/queries/students";
import { findAuthorizedGoal } from "@/db/queries/strategies";

import { assignStrategyAction } from "./actions";
import { StrategyForm } from "./strategy-form";

export const dynamic = "force-dynamic";

export default async function NewStrategyPage({
  params,
}: {
  params: Promise<{ studentId: string; goalId: string }>;
}) {
  const identity = await getPublicClassroomIdentity();
  if (!canManageClassroom(identity)) {
    redirect("/dashboard");
  }

  const { studentId, goalId } = await params;
  const { db } = await import("@/db/client");
  const student = await findAuthorizedStudent(db, identity, studentId);
  if (!student) {
    notFound();
  }
  const goal = await findAuthorizedGoal(db, identity, student, goalId);
  if (!goal) {
    notFound();
  }

  const action = assignStrategyAction.bind(null, studentId, goalId);

  return (
    <main className="auth-shell onboarding-shell">
      <Link className="back-link" href={`/students/${studentId}`}>
        ← {student.displayName}
      </Link>
      <section className="auth-surface" aria-labelledby="strategy-title">
        <div className="auth-heading">
          <p className="session-kicker">{goal.title}</p>
          <h1 id="strategy-title">Assign a strategy</h1>
        </div>
        <StrategyForm action={action} />
      </section>
    </main>
  );
}
