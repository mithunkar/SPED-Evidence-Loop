import type { ReactNode } from "react";
import { RUBRIC_SCORE_VALUES, type RubricScore } from "@/domain/scoring";
import type { ObservationSummary } from "@/domain/analytics";

export function formatRate(value: { numerator: number; denominator: number; value: number | null }) {
  return value.value === null ? "No valid observations" : `${Math.round(value.value * 100)}% (${value.numerator}/${value.denominator})`;
}

export function ScoreDistribution({ summary }: { summary: ObservationSummary }) {
  return <div className="score-distribution" aria-label="Score distribution">
    {RUBRIC_SCORE_VALUES.map((score) => {
      const rate = summary.scoreDistribution[score];
      return <div className="distribution-row" key={score}><strong>{score}</strong><span className="distribution-track"><span style={{ width: `${(rate.value ?? 0) * 100}%` }} /></span><span>{rate.numerator}/{rate.denominator}</span></div>;
    })}
  </div>;
}

export function SummaryMetrics({ summary, includeTarget = true }: { summary: ObservationSummary; includeTarget?: boolean }) {
  const metrics: Array<[string, string]> = [
    ["Valid observations", String(summary.validObservationCount)],
    ["No data", String(summary.noDataCount)],
    ["Median score", summary.medianScore === null ? "—" : String(summary.medianScore)],
    ["Independent (4)", formatRate(summary.independenceRate)],
  ];
  if (includeTarget && summary.targetRate) metrics.push(["Meeting target", formatRate(summary.targetRate)]);
  metrics.push(["Strategy used as planned", formatRate(summary.fullFidelityRate)]);
  return <dl className="summary-metrics">{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}

export function ReportCard({ title, children }: { title: string; children: ReactNode }) {
  return <section className="report-card"><h2>{title}</h2>{children}</section>;
}

export function scoreLabel(score: RubricScore | null, noDataReason: string | null) {
  return score === null ? `ND${noDataReason ? ` — ${noDataReason.replaceAll("_", " ")}` : ""}` : String(score);
}
