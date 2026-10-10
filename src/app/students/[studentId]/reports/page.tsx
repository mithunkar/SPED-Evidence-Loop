import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/app/print-button";
import { ReportCard, ScoreDistribution, SummaryMetrics } from "@/app/reporting-components";
import { requireCurrentApplicationIdentity } from "@/auth/application-session";
import { canManageClassroom } from "@/auth/authorization";
import { listAnalyticsObservations } from "@/db/queries/analytics";
import { findAuthorizedStudent } from "@/db/queries/students";
import { findWorkspaceTimezone } from "@/db/queries/users";
import { summarizeGoals, type AnalyticsObservation } from "@/data/analytics";
import { reportingPeriodFromSearch } from "@/data/reporting-period";

export const dynamic = "force-dynamic";

export default async function StudentReportPage({ params, searchParams }: { params: Promise<{ studentId: string }>; searchParams: Promise<{ start?: string; end?: string }> }) {
  const identity = await requireCurrentApplicationIdentity();
  if (!canManageClassroom(identity)) redirect("/dashboard");
  const [{ studentId }, search] = await Promise.all([params, searchParams]);
  const { db } = await import("@/db/client");
  const period = reportingPeriodFromSearch(search, await findWorkspaceTimezone(db, identity.workspaceId));
  const student = await findAuthorizedStudent(db, identity, studentId);
  if (!student) notFound();
  const rows = await listAnalyticsObservations(db, identity, { start: period.startAt, end: period.endAt, studentId }) as AnalyticsObservation[];
  const goals = summarizeGoals(rows);
  return <main className="dashboard-shell report-shell parent-report"><header className="dashboard-header no-print"><Link className="back-link" href={`/students/${studentId}/progress?start=${period.start}&end=${period.end}`}>← Progress</Link><PrintButton /></header><section className="student-plan-heading"><div><p className="session-kicker">Progress summary</p><h1>{student.displayName}</h1><p>{period.start} to {period.end}</p></div></section><form className="report-filters no-print" method="get"><label>Start<input type="date" name="start" defaultValue={period.start} /></label><label>End<input type="date" name="end" defaultValue={period.end} /></label><button className="secondary-action" type="submit">Update period</button></form>{goals.length ? goals.map(({ goal, summary }) => <ReportCard key={`${goal.goalId}:${goal.goalVersion}`} title={goal.goalTitle}><p>{goal.goalObjective}</p><p>{goal.domain}</p><div className="report-grid"><SummaryMetrics summary={summary} /><ScoreDistribution summary={summary} /></div></ReportCard>) : <section className="roster-empty"><h2>No reportable data for this period</h2><p>Choose another date range after sessions have been recorded.</p></section>}</main>;
}
