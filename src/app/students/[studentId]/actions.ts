"use server";

import { redirect } from "next/navigation";

import { canManageClassroom } from "@/auth/authorization";
import { getPublicClassroomIdentity } from "@/classroom/public-classroom";
import { archiveStudent } from "@/db/queries/students";

export async function archiveStudentAction(studentId: string) {
  const identity = await getPublicClassroomIdentity();
  if (!canManageClassroom(identity)) {
    redirect("/dashboard");
  }

  const { db } = await import("@/db/client");
  await archiveStudent(db, identity, studentId);
  redirect("/dashboard");
}
