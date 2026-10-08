import Link from "next/link";

import { signOut } from "@/app/sign-in/actions";

export default function AccessDeniedPage() {
  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/" aria-label="Evidence Loop home">
        <span className="brand-mark" aria-hidden="true">EL</span>
        <span>Evidence Loop</span>
      </Link>

      <section className="auth-surface" aria-labelledby="access-denied-title">
        <div className="auth-heading">
          <h1 id="access-denied-title">Access not approved</h1>
          <p>
            This Google account is not on the classroom access list. Ask the
            classroom owner to add your email in Supabase before trying again.
          </p>
        </div>
        <form className="account-form" action={signOut}>
          <button className="form-submit" type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}
