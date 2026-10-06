import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getCurrentApplicationIdentity,
  getVerifiedSupabaseUser,
} from "@/auth/application-session";
import { loadAuthorizedStudentRoster } from "@/data/student-roster";

import { signOutUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getCurrentApplicationIdentity();
  if (!identity) {
    if (await getVerifiedSupabaseUser()) {
      redirect("/onboarding");
    }
    redirect("/sign-in");
  }

  const roster = await loadAuthorizedStudentRoster(identity);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="demo-brand" href="/dashboard" aria-label="Student roster">
          <span className="brand-mark" aria-hidden="true">
            EL
          </span>
          <span>Evidence Loop</span>
        </Link>
        <div className="dashboard-account">
          <span>
            <strong>{identity.displayName}</strong>
            <small>{identity.role.toLowerCase()}</small>
          </span>
          <form action={signOutUser}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <section className="roster-heading" aria-labelledby="roster-title">
        <div>
          <h1 id="roster-title">Your students</h1>
        </div>
        <div className="roster-count">
          <strong>{roster.students.length}</strong>
          <span>
            {roster.students.length === 1 ? "student" : "students"}
          </span>
        </div>
      </section>

      {roster.students.length === 0 ? (
        <section className="roster-empty" aria-labelledby="roster-empty-title">
          <span aria-hidden="true">0</span>
          <h2 id="roster-empty-title">No students assigned</h2>
          <p>Add your first student to begin collecting data.</p>
        </section>
      ) : (
        <ul className="student-roster" aria-label="Authorized students">
          {roster.students.map((student) => (
            <li key={student.id}>
              <Link
                className="student-roster-card"
                href={`/students/${student.id}/sessions/new`}
                aria-label={`Open ${student.displayName}`}
              >
                <span className="student-avatar" aria-hidden="true">
                  {student.displayName.slice(0, 1)}
                </span>
                <div>
                  <h2>{student.displayName}</h2>
                </div>
                <span className="student-status">{student.status}</span>
                <span className="student-card-action">
                  Start session <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
