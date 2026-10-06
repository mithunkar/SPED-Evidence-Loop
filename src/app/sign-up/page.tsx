import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getCurrentApplicationIdentity,
  getVerifiedSupabaseUser,
} from "@/auth/application-session";
import { signUpWithPassword } from "@/app/sign-in/actions";
import { AuthForm } from "@/app/sign-in/auth-form";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const [identity, supabaseUser] = await Promise.all([
    getCurrentApplicationIdentity(),
    getVerifiedSupabaseUser(),
  ]);

  if (identity) {
    redirect("/dashboard");
  }
  if (supabaseUser) {
    redirect("/onboarding");
  }

  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/" aria-label="Evidence Loop home">
        <span className="brand-mark" aria-hidden="true">
          EL
        </span>
        <span>Evidence Loop</span>
      </Link>

      <section className="auth-surface" aria-labelledby="sign-up-title">
        <div className="auth-heading">
          <h1 id="sign-up-title">Create your account</h1>
        </div>
        <AuthForm action={signUpWithPassword} mode="sign-up" />
      </section>
    </main>
  );
}
