import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentApplicationIdentity } from "@/auth/application-session";
import { canManageClassroom } from "@/auth/authorization";
import { findAuthorizedStudent } from "@/db/queries/students";

import { createGoalAction } from "./actions";
import { GoalForm } from "./goal-form";

export const dynamic = "force-dynamic";

export default async function NewGoalPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const identity = await getCurrentApplicationIdentity();
  if (!identity) {
    redirect("/sign-in");
  }
  if (!canManageClassroom(identity)) {
    redirect("/dashboard");
  }

  const { studentId } = await params;
  const { db } = await import("@/db/client");
  const student = await findAuthorizedStudent(db, identity, studentId);
  if (!student) {
    notFound();
  }

  const action = createGoalAction.bind(null, studentId);

  return (
    <main className="auth-shell onboarding-shell">
      <Link className="back-link" href={`/students/${studentId}`}>
        ← {student.displayName}
      </Link>
      <section className="auth-surface" aria-labelledby="new-goal-title">
        <div className="auth-heading">
          <h1 id="new-goal-title">Add a goal</h1>
        </div>
        <GoalForm action={action} />
      </section>
    </main>
  );
}
