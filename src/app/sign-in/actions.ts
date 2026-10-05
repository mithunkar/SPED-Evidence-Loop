"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDevelopmentIdentity } from "@/auth/development-session";
import { setDevelopmentIdentity } from "@/auth/server-session";

const signInSchema = z.object({
  userId: z.uuid(),
});

export async function signInAsDevelopmentUser(formData: FormData) {
  const parsed = signInSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success || !getDevelopmentIdentity(parsed.data.userId)) {
    throw new Error("Invalid synthetic development identity.");
  }

  await setDevelopmentIdentity(parsed.data.userId);
  redirect("/demo/session");
}
