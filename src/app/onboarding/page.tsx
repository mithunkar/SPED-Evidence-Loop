import { redirect } from "next/navigation";

import {
  getCurrentApplicationIdentity,
  getVerifiedSupabaseUser,
} from "@/auth/application-session";

import { createClassroom } from "./actions";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [identity, supabaseUser] = await Promise.all([
    getCurrentApplicationIdentity(),
    getVerifiedSupabaseUser(),
  ]);

  if (identity) {
    redirect("/dashboard");
  }
  if (!supabaseUser) {
    redirect("/sign-in");
  }

  return (
    <main className="auth-shell onboarding-shell">
      <section className="auth-surface" aria-labelledby="setup-title">
        <div className="auth-heading">
          <h1 id="setup-title">Set up your classroom</h1>
        </div>
        <OnboardingForm action={createClassroom} />
      </section>
    </main>
  );
}
