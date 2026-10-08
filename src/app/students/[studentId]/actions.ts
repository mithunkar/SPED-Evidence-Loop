"use server";

import { redirect } from "next/navigation";

import { canManageClassroom } from "@/auth/authorization";
import { requireCurrentApplicationIdentity } from "@/auth/application-session";
import { archiveStudent } from "@/db/queries/students";

export async function archiveStudentAction(studentId: string) {
  const identity = await requireCurrentApplicationIdentity();
  if (!canManageClassroom(identity)) {
    redirect("/dashboard");
  }

  const { db } = await import("@/db/client");
  await archiveStudent(db, identity, studentId);
  redirect("/dashboard");
}
