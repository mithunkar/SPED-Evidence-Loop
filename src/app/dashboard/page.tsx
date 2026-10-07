import Link from "next/link";

import { getPublicClassroomIdentity } from "@/classroom/public-classroom";
import { loadAuthorizedStudentRoster } from "@/data/student-roster";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const identity = await getPublicClassroomIdentity();

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
            <small>Public · no sign-in</small>
          </span>
        </div>
      </header>

      <section className="roster-heading" aria-labelledby="roster-title">
        <div>
          <h1 id="roster-title">Your students</h1>
        </div>
        <div className="roster-tools">
          {identity.role === "TEACHER" ? (
            <Link className="add-student-link" href="/students/new">
              Add student
            </Link>
          ) : null}
          <div className="roster-count">
            <strong>{roster.students.length}</strong>
            <span>
              {roster.students.length === 1 ? "student" : "students"}
            </span>
          </div>
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
                href={`/students/${student.id}`}
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
                  Open <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
