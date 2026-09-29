import { describe, expect, it } from "vitest";

import { DEMO_SESSION } from "@/demo/fixtures";

describe("synthetic scoring fixture", () => {
  it("uses visibly synthetic identifiers and representative goals", () => {
    expect(DEMO_SESSION.student.id).toMatch(/^synthetic-/);
    expect(DEMO_SESSION.goals).toHaveLength(3);
    expect(new Set(DEMO_SESSION.goals.map((goal) => goal.id)).size).toBe(
      DEMO_SESSION.goals.length,
    );
    expect(DEMO_SESSION.goals.every((goal) => goal.id.startsWith("synthetic-")))
      .toBe(true);
  });

  it("includes strategy guidance without requiring every goal to have one", () => {
    expect(DEMO_SESSION.goals.some((goal) => goal.strategy !== null)).toBe(true);
    expect(DEMO_SESSION.goals.some((goal) => goal.strategy === null)).toBe(true);
  });
});
