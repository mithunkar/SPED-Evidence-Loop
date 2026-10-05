import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentDevelopmentIdentity } from "@/auth/server-session";
import { loadAuthorizedStudentRoster } from "@/data/student-roster";

import { signOutDevelopmentUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getCurrentDevelopmentIdentity();
  if (!identity) {
    redirect("/sign-in");
  }

  const roster = await loadAuthorizedStudentRoster(identity);

  return (
    <main className="dashboard-shell">
      <div className="demo-banner" role="note">
        <span className="demo-banner-dot" aria-hidden="true" />
        Synthetic development workspace — fictional aliases only
      </div>

      <header className="dashboard-header">
        <Link className="demo-brand" href="/" aria-label="Project overview">
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
          <form action={signOutDevelopmentUser}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <section className="roster-heading" aria-labelledby="roster-title">
        <div>
          <p className="session-kicker">Authorized student roster</p>
          <h1 id="roster-title">Your students</h1>
          <p>
            {identity.role === "TEACHER"
              ? "Teachers can view every student in their classroom workspace."
              : "Assistants see only students explicitly assigned to them."}
          </p>
        </div>
        <div className="roster-count">
          <strong>{roster.students.length}</strong>
          <span>
            {roster.students.length === 1 ? "student" : "students"} visible
          </span>
        </div>
      </section>

      {roster.students.length === 0 ? (
        <section className="roster-empty" aria-labelledby="roster-empty-title">
          <span aria-hidden="true">0</span>
          <h2 id="roster-empty-title">No students assigned</h2>
          <p>
            This synthetic assistant account has no student assignments. A
            teacher must assign access before student records become visible.
          </p>
        </section>
      ) : (
        <ul className="student-roster" aria-label="Authorized students">
          {roster.students.map((student) => (
            <li key={student.id}>
              <article className="student-roster-card">
                <span className="student-avatar" aria-hidden="true">
                  {student.displayName.slice(0, 1)}
                </span>
                <div>
                  <h2>{student.displayName}</h2>
                  <p>Fictional classroom alias</p>
                </div>
                <span className="student-status">{student.status}</span>
              </article>
            </li>
          ))}
        </ul>
      )}

      <p className="roster-source">
        {roster.source === "DATABASE"
          ? "Loaded from the local development database."
          : "Database not configured; showing the authorization-tested synthetic seed fixture."}
      </p>
    </main>
  );
}
