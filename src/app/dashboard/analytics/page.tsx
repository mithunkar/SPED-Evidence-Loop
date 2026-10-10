import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportCard, ScoreDistribution, SummaryMetrics } from "@/app/reporting-components";
import { requireCurrentApplicationIdentity } from "@/auth/application-session";
import { canManageClassroom } from "@/auth/authorization";
import { listAnalyticsObservations } from "@/db/queries/analytics";
import { findWorkspaceTimezone } from "@/db/queries/users";
import { summarizeAnalytics, uniqueSessionCount, type AnalyticsObservation } from "@/data/analytics";
import { reportingPeriodFromSearch } from "@/data/reporting-period";
import { SKILL_AREAS, STUDENT_GROUP_LABELS, STUDENT_GROUPS, type SkillArea, type StudentGroup } from "@/domain/catalog";

export const dynamic = "force-dynamic";

export default async function ClassroomAnalyticsPage({ searchParams }: { searchParams: Promise<{ start?: string; end?: string; group?: string; domain?: string }> }) {
  const identity = await requireCurrentApplicationIdentity();
  if (!canManageClassroom(identity)) redirect("/dashboard");
  const search = await searchParams;
  const group = STUDENT_GROUPS.includes(search.group as StudentGroup) ? search.group as StudentGroup : undefined;
  const domain = SKILL_AREAS.includes(search.domain as SkillArea) ? search.domain as SkillArea : undefined;
  const { db } = await import("@/db/client");
  const period = reportingPeriodFromSearch(search, await findWorkspaceTimezone(db, identity.workspaceId));
  const rows = await listAnalyticsObservations(db, identity, { start: period.startAt, end: period.endAt, group, domain }) as AnalyticsObservation[];
  const summary = summarizeAnalytics(rows);
  const byGroup = STUDENT_GROUPS.map((item) => [item, summarizeAnalytics(rows.filter((row) => row.studentGroup === item))] as const);
  const byDomain = SKILL_AREAS.map((item) => [item, summarizeAnalytics(rows.filter((row) => row.domain === item))] as const).filter(([, value]) => value.validObservationCount + value.noDataCount > 0);
  return <main className="dashboard-shell report-shell"><header className="dashboard-header"><Link className="back-link" href="/dashboard">← Students</Link></header><section className="student-plan-heading"><div><p className="session-kicker">Classroom insights</p><h1>Instructional overview</h1><p>Descriptive data only — students are never ranked.</p></div></section><form className="report-filters" method="get"><label>Start<input type="date" name="start" defaultValue={period.start} /></label><label>End<input type="date" name="end" defaultValue={period.end} /></label><label>Group<select name="group" defaultValue={group ?? ""}><option value="">All groups</option>{STUDENT_GROUPS.map((item) => <option value={item} key={item}>{STUDENT_GROUP_LABELS[item]}</option>)}</select></label><label>Skill area<select name="domain" defaultValue={domain ?? ""}><option value="">All skill areas</option>{SKILL_AREAS.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><button className="secondary-action" type="submit">Apply</button></form><div className="report-grid"><ReportCard title="Collection snapshot"><SummaryMetrics summary={summary} includeTarget={false} /><p>{uniqueSessionCount(rows)} submitted sessions · {new Set(rows.map((row) => row.studentId)).size} students represented</p></ReportCard><ReportCard title="Rubric distribution"><ScoreDistribution summary={summary} /></ReportCard></div><section className="report-card"><h2>By schedule group</h2><div className="report-grid">{byGroup.map(([item, groupSummary]) => <div key={item}><h3>{STUDENT_GROUP_LABELS[item]}</h3><SummaryMetrics summary={groupSummary} includeTarget={false} /></div>)}</div></section><section className="report-card"><h2>By skill area</h2>{byDomain.length ? <div className="report-grid">{byDomain.map(([item, areaSummary]) => <div key={item}><h3>{item}</h3><SummaryMetrics summary={areaSummary} includeTarget={false} /></div>)}</div> : <p>No observations match this period and filter.</p>}</section></main>;
}
