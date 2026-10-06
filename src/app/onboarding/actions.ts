"use server";

import { redirect } from "next/navigation";

import {
  type AccountActionState,
  workspaceSetupSchema,
} from "@/auth/credentials";
import { findApplicationUser } from "@/db/queries/users";
import { users, workspaces } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createClassroom(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = workspaceSetupSchema.safeParse({
    displayName: formData.get("displayName"),
    workspaceName: formData.get("workspaceName"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    return { status: "error", message: "Please sign in again." };
  }
  const userEmail = data.user.email;

  const { db } = await import("@/db/client");
  const existingUser = await findApplicationUser(db, data.user.id);
  if (existingUser) {
    redirect("/dashboard");
  }

  try {
    await db.transaction(async (transaction) => {
      const [workspace] = await transaction
        .insert(workspaces)
        .values({
          name: parsed.data.workspaceName,
          timezone:
            process.env.DEFAULT_WORKSPACE_TIMEZONE ?? "America/Los_Angeles",
        })
        .returning({ id: workspaces.id });

      if (!workspace) {
        throw new Error("Workspace creation returned no record.");
      }

      await transaction.insert(users).values({
        id: data.user.id,
        workspaceId: workspace.id,
        displayName: parsed.data.displayName,
        email: userEmail.toLowerCase(),
        role: "TEACHER",
        status: "ACTIVE",
      });
    });
  } catch (creationError) {
    console.error("Classroom creation failed", creationError);
    return {
      status: "error",
      message: "We could not create your classroom. Please try again.",
    };
  }

  redirect("/dashboard");
}
