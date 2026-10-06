"use server";

import { redirect } from "next/navigation";

import { getCurrentApplicationIdentity } from "@/auth/application-session";
import { canManageClassroom } from "@/auth/authorization";
import { createStudent } from "@/db/queries/students";
import {
  createStudentSchema,
  type StudentActionState,
} from "@/domain/student";

export async function createStudentAction(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const identity = await getCurrentApplicationIdentity();
  if (!identity || !canManageClassroom(identity)) {
    return {
      status: "error",
      message: "You do not have permission to add students.",
    };
  }

  const parsed = createStudentSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const { db } = await import("@/db/client");
    const student = await createStudent(db, identity, parsed.data);
    if (!student) {
      throw new Error("Student creation returned no record.");
    }
  } catch (error) {
    console.error("Student creation failed", error);
    return {
      status: "error",
      message: "We could not add this student. Please try again.",
    };
  }

  redirect("/dashboard");
}
