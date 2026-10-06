"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  initialAccountActionState,
  type AccountActionState,
} from "@/auth/credentials";

type AuthFormProps = {
  action: (
    state: AccountActionState,
    formData: FormData,
  ) => Promise<AccountActionState>;
  mode: "sign-in" | "sign-up";
};

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAccountActionState,
  );
  const isSignIn = mode === "sign-in";

  return (
    <form className="account-form" action={formAction} noValidate>
      <label className="form-field">
        <span>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          type="email"
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          required
        />
        {state.errors?.email ? (
          <small id="email-error">{state.errors.email[0]}</small>
        ) : null}
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          autoComplete={isSignIn ? "current-password" : "new-password"}
          name="password"
          type="password"
          aria-invalid={Boolean(state.errors?.password)}
          aria-describedby={state.errors?.password ? "password-error" : undefined}
          required
        />
        {state.errors?.password ? (
          <small id="password-error">{state.errors.password[0]}</small>
        ) : null}
      </label>

      {state.message ? (
        <p
          className={state.status === "success" ? "form-success" : "form-error"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      <button className="form-submit" type="submit" disabled={pending}>
        {pending
          ? "Please wait…"
          : isSignIn
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="auth-switch">
        {isSignIn ? "New here?" : "Already have an account?"}{" "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
