import { describe, expect, it } from "vitest";

import { SYNTHETIC_SEED_IDS, syntheticSeedData } from "@/db/seed-data";
import { loadAuthorizedStudentRoster } from "@/data/student-roster";

const identity = (userId: string) => {
  const user = syntheticSeedData.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("Missing synthetic identity.");
  }
  return user;
};

describe("development student roster", () => {
  it("shows the teacher all three synthetic students", async () => {
    const roster = await loadAuthorizedStudentRoster(
      identity(SYNTHETIC_SEED_IDS.teacher),
    );

    expect(roster.source).toBe("SYNTHETIC_FIXTURE");
    expect(roster.students.map((student) => student.displayName)).toEqual([
      "River",
      "Sage",
      "Micah",
    ]);
  });

  it("shows the assigned assistant only River and Sage", async () => {
    const roster = await loadAuthorizedStudentRoster(
      identity(SYNTHETIC_SEED_IDS.assignedAssistant),
    );

    expect(roster.students.map((student) => student.displayName)).toEqual([
      "River",
      "Sage",
    ]);
  });

  it("shows the unassigned assistant an empty roster", async () => {
    const roster = await loadAuthorizedStudentRoster(
      identity(SYNTHETIC_SEED_IDS.unassignedAssistant),
    );

    expect(roster.students).toEqual([]);
  });
});
