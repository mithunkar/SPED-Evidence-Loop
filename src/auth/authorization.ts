export type AuthorizationActor = {
  id: string;
  workspaceId: string;
  role: "TEACHER" | "ASSISTANT";
  status: "ACTIVE" | "INACTIVE";
};

export type StudentAuthorizationScope = {
  id: string;
  workspaceId: string;
  status: "ACTIVE" | "ARCHIVED";
};

export type StudentAuthorizationAssignment = {
  workspaceId: string;
  userId: string;
  studentId: string;
};

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";

  constructor() {
    super("The current user is not authorized for this student.");
    this.name = "AuthorizationError";
  }
}

const isActiveActor = (
  actor: AuthorizationActor | null,
): actor is AuthorizationActor => actor?.status === "ACTIVE";

export function canViewStudent(
  actor: AuthorizationActor | null,
  student: StudentAuthorizationScope,
  assignments: readonly StudentAuthorizationAssignment[],
) {
  if (!isActiveActor(actor) || actor.workspaceId !== student.workspaceId) {
    return false;
  }

  if (actor.role === "TEACHER") {
    return true;
  }

  return assignments.some(
    (assignment) =>
      assignment.workspaceId === actor.workspaceId &&
      assignment.userId === actor.id &&
      assignment.studentId === student.id,
  );
}

export function canCreateStudentSession(
  actor: AuthorizationActor | null,
  student: StudentAuthorizationScope,
  assignments: readonly StudentAuthorizationAssignment[],
) {
  return (
    student.status === "ACTIVE" &&
    canViewStudent(actor, student, assignments)
  );
}

export function canManageClassroom(actor: AuthorizationActor | null) {
  return isActiveActor(actor) && actor.role === "TEACHER";
}

export function assertCanViewStudent(
  actor: AuthorizationActor | null,
  student: StudentAuthorizationScope,
  assignments: readonly StudentAuthorizationAssignment[],
) {
  if (!canViewStudent(actor, student, assignments)) {
    throw new AuthorizationError();
  }
}

export function filterAuthorizedStudents<
  Student extends StudentAuthorizationScope,
>(
  actor: AuthorizationActor | null,
  students: readonly Student[],
  assignments: readonly StudentAuthorizationAssignment[],
) {
  return students.filter((student) =>
    canViewStudent(actor, student, assignments),
  );
}
