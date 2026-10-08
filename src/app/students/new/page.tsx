import Link from "next/link";
import { redirect } from "next/navigation";

import { canManageClassroom } from "@/auth/authorization";
import { requireCurrentApplicationIdentity } from "@/auth/application-session";

import { createStudentAction } from "./actions";
import { StudentForm } from "./student-form";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const identity = await requireCurrentApplicationIdentity();
  if (!canManageClassroom(identity)) {
    redirect("/dashboard");
  }

  return (
    <main className="auth-shell onboarding-shell">
      <Link className="back-link" href="/dashboard">
        ← Students
      </Link>
      <section className="auth-surface" aria-labelledby="new-student-title">
        <div className="auth-heading">
          <h1 id="new-student-title">Add a student</h1>
        </div>
        <StudentForm action={createStudentAction} />
      </section>
    </main>
  );
}
