import { describe, expect, it } from "vitest";

import {
  appendDemoSubmission,
  createDemoSubmission,
  createEmptyDemoDrafts,
  restoreDemoDrafts,
  serializeDemoDrafts,
} from "@/demo/demo-storage";
import { DEMO_SESSION } from "@/demo/fixtures";

const goalIds = DEMO_SESSION.goals.map((goal) => goal.id);

const createCompleteDrafts = () => {
  const drafts = createEmptyDemoDrafts(goalIds);
  drafts[goalIds[0]] = {
    score: "ND",
    noDataReason: "NO_OPPORTUNITY",
    fidelityStatus: "NOT_APPLICABLE",
    note: "",
  };
  drafts[goalIds[1]] = {
    score: 3,
    noDataReason: null,
    fidelityStatus: "PARTIAL",
    note: "",
  };
  drafts[goalIds[2]] = {
    score: 0,
    noDataReason: null,
    fidelityStatus: null,
    note: "",
  };
  return drafts;
};

describe("synthetic demo storage", () => {
  it("round-trips valid drafts for known goals", () => {
    const drafts = createEmptyDemoDrafts(goalIds);
    drafts[goalIds[0]] = {
      score: 0,
      noDataReason: null,
      fidelityStatus: "FULL",
      note: "Fictional context note",
    };

    expect(restoreDemoDrafts(serializeDemoDrafts(drafts), goalIds)).toEqual(
      drafts,
    );
  });

  it("replaces malformed stored values with empty drafts", () => {
    const restored = restoreDemoDrafts(
      JSON.stringify({
        version: 1,
        drafts: {
          [goalIds[0]]: {
            score: 8,
            noDataReason: null,
            fidelityStatus: null,
            note: "",
          },
        },
      }),
      goalIds,
    );

    expect(restored).toEqual(createEmptyDemoDrafts(goalIds));
    expect(restoreDemoDrafts("not-json", goalIds)).toEqual(
      createEmptyDemoDrafts(goalIds),
    );
  });

  it("stores ND as a null submitted score with its reason", () => {
    const drafts = createCompleteDrafts();

    const submission = createDemoSubmission(
      DEMO_SESSION,
      drafts,
      "synthetic-submission-1",
      "2026-09-30T16:00:00.000Z",
    );

    expect(submission.observations[0]).toMatchObject({
      score: null,
      noDataReason: "NO_OPPORTUNITY",
    });
    expect(submission.observations[2]).toMatchObject({
      score: 0,
      noDataReason: null,
    });
  });

  it("starts a safe submission list when prior storage is malformed", () => {
    const drafts = createCompleteDrafts();
    const submission = createDemoSubmission(
      DEMO_SESSION,
      drafts,
      "synthetic-submission-1",
      "2026-09-30T16:00:00.000Z",
    );
    const stored = JSON.parse(appendDemoSubmission("not-json", submission));

    expect(stored).toEqual({ version: 1, submissions: [submission] });
  });

  it("refuses to create an incomplete submission", () => {
    expect(() =>
      createDemoSubmission(
        DEMO_SESSION,
        createEmptyDemoDrafts(goalIds),
        "synthetic-submission-1",
        "2026-09-30T16:00:00.000Z",
      ),
    ).toThrow("Cannot submit an incomplete synthetic session.");
  });
});
