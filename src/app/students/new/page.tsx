import Link from "next/link";
import { redirect } from "next/navigation";

import { canManageClassroom } from "@/auth/authorization";
import { getPublicClassroomIdentity } from "@/classroom/public-classroom";

import { createStudentAction } from "./actions";
import { StudentForm } from "./student-form";

export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const identity = await getPublicClassroomIdentity();
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
