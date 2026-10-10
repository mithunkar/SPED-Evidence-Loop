const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export type ReportingPeriod = { start: string; end: string; startAt: Date; endAt: Date };

export function reportingPeriodFromSearch(input: { start?: string; end?: string }, timeZone = "America/Los_Angeles"): ReportingPeriod {
  const now = new Date();
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(now).map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const fallbackStart = `${parts.year}-${parts.month}-01`;
  const fallbackEnd = `${parts.year}-${parts.month}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
  const start = input.start && datePattern.test(input.start) ? input.start : fallbackStart;
  const end = input.end && datePattern.test(input.end) && input.end >= start ? input.end : fallbackEnd >= start ? fallbackEnd : start;
  return { start, end, startAt: new Date(`${start}T00:00:00.000Z`), endAt: new Date(`${end}T23:59:59.999Z`) };
}
