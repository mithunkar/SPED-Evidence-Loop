import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StudentForm } from "@/app/students/new/student-form";
import { requireCurrentApplicationIdentity } from "@/auth/application-session";
import { canManageClassroom } from "@/auth/authorization";
import { findAuthorizedStudent } from "@/db/queries/students";
import { updateStudentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const identity = await requireCurrentApplicationIdentity();
  if (!canManageClassroom(identity)) redirect("/dashboard");
  const { studentId } = await params;
  const { db } = await import("@/db/client");
  const student = await findAuthorizedStudent(db, identity, studentId);
  if (!student) notFound();
  return (
    <main className="auth-shell onboarding-shell">
      <Link className="back-link" href={`/students/${studentId}`}>← {student.displayName}</Link>
      <section className="auth-surface" aria-labelledby="edit-student-title">
        <div className="auth-heading"><h1 id="edit-student-title">Edit student</h1></div>
        <StudentForm action={updateStudentAction.bind(null, studentId)} submitLabel="Save changes" initialStudent={student} />
      </section>
    </main>
  );
}
