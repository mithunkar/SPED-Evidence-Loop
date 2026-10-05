import { describe, expect, it } from "vitest";

import {
  assertCanViewStudent,
  AuthorizationError,
  canCreateStudentSession,
  canManageClassroom,
  canViewStudent,
  filterAuthorizedStudents,
  type AuthorizationActor,
} from "@/auth/authorization";
import {
  SYNTHETIC_SEED_IDS,
  syntheticSeedData,
} from "@/db/seed-data";

const actor = (userId: string): AuthorizationActor => {
  const user = syntheticSeedData.users.find((candidate) => candidate.id === userId);
  if (!user) {
    throw new Error("Missing synthetic test user.");
  }

  return user;
};

const river = syntheticSeedData.students[0];
const micah = syntheticSeedData.students[2];
const assignments = syntheticSeedData.userStudentAssignments;

describe("student authorization", () => {
  it("allows an active teacher to view every student in the workspace", () => {
    const teacher = actor(SYNTHETIC_SEED_IDS.teacher);

    expect(
      filterAuthorizedStudents(teacher, syntheticSeedData.students, assignments),
    ).toEqual(syntheticSeedData.students);
    expect(canManageClassroom(teacher)).toBe(true);
  });

  it("limits an assistant to explicitly assigned students", () => {
    const assistant = actor(SYNTHETIC_SEED_IDS.assignedAssistant);

    expect(canViewStudent(assistant, river, assignments)).toBe(true);
    expect(canViewStudent(assistant, micah, assignments)).toBe(false);
    expect(canManageClassroom(assistant)).toBe(false);
  });

  it("gives an unassigned assistant no student access", () => {
    const assistant = actor(SYNTHETIC_SEED_IDS.unassignedAssistant);

    expect(
      filterAuthorizedStudents(assistant, syntheticSeedData.students, assignments),
    ).toEqual([]);
  });

  it("rejects cross-workspace access even for a teacher", () => {
    const teacher = actor(SYNTHETIC_SEED_IDS.teacher);

    expect(
      canViewStudent(
        teacher,
        { ...river, workspaceId: "90000000-0000-4000-8000-000000000001" },
        assignments,
      ),
    ).toBe(false);
  });

  it("rejects inactive users", () => {
    const inactiveTeacher = {
      ...actor(SYNTHETIC_SEED_IDS.teacher),
      status: "INACTIVE" as const,
    };

    expect(canViewStudent(inactiveTeacher, river, assignments)).toBe(false);
    expect(canManageClassroom(inactiveTeacher)).toBe(false);
  });

  it("prevents new sessions for archived students", () => {
    const teacher = actor(SYNTHETIC_SEED_IDS.teacher);

    expect(
      canCreateStudentSession(
        teacher,
        { ...river, status: "ARCHIVED" },
        assignments,
      ),
    ).toBe(false);
  });

  it("throws a stable authorization error when access is denied", () => {
    const assistant = actor(SYNTHETIC_SEED_IDS.assignedAssistant);

    expect(() =>
      assertCanViewStudent(assistant, micah, assignments),
    ).toThrow(AuthorizationError);
  });
});
