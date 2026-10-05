"use server";

import { redirect } from "next/navigation";

import { clearDevelopmentIdentity } from "@/auth/server-session";

export async function signOutDevelopmentUser() {
  await clearDevelopmentIdentity();
  redirect("/sign-in");
}
