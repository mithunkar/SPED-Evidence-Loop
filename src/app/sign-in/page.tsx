import Link from "next/link";
import { notFound } from "next/navigation";

import {
  isSyntheticIdentityAccessEnabled,
  listDevelopmentIdentities,
} from "@/auth/development-session";
import { getCurrentDevelopmentIdentity } from "@/auth/server-session";

import { signInAsDevelopmentUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (!isSyntheticIdentityAccessEnabled()) {
    notFound();
  }

  const identities = listDevelopmentIdentities();
  const currentIdentity = await getCurrentDevelopmentIdentity();
  const isHostedDemo = process.env.NODE_ENV === "production";

  return (
    <main className="auth-shell">
      <Link className="auth-brand" href="/" aria-label="Back to project overview">
        <span className="brand-mark" aria-hidden="true">
          EL
        </span>
        <span>SPED Evidence Loop</span>
      </Link>

      <section className="auth-surface" aria-labelledby="sign-in-title">
        <div className="auth-heading">
          <p className="eyebrow">
            {isHostedDemo ? "Hosted synthetic demo" : "Local development access"}
          </p>
          <h1 id="sign-in-title">Choose a synthetic staff role</h1>
          <p>
            This temporary role selector exists only for testing authorization
            with fictional classroom data.
          </p>
        </div>

        {currentIdentity ? (
          <p className="auth-current" role="status">
            Currently signed in as <strong>{currentIdentity.displayName}</strong>.
            Choose another role below to switch.
          </p>
        ) : null}

        <div className="identity-list">
          {identities.map((identity) => (
            <form action={signInAsDevelopmentUser} key={identity.id}>
              <input type="hidden" name="userId" value={identity.id} />
              <button
                type="submit"
                className="identity-option"
                aria-label={`Sign in as ${identity.displayName}, ${identity.role.toLowerCase()}`}
              >
                <span className="identity-initial" aria-hidden="true">
                  {identity.role === "TEACHER" ? "T" : "A"}
                </span>
                <span>
                  <strong>{identity.displayName}</strong>
                  <small>
                    {identity.role === "TEACHER"
                      ? "Teacher · all synthetic students"
                      : identity.displayName.includes("unassigned")
                        ? "Assistant · no assigned students"
                        : "Assistant · River and Sage assigned"}
                  </small>
                </span>
                <span className="identity-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </form>
          ))}
        </div>

        <p className="auth-warning">
          Synthetic demonstration only. This is not authentication for real
          student information.
        </p>
      </section>
    </main>
  );
}
