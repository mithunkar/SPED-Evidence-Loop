"use client";

import { useActionState } from "react";

import {
  initialAccountActionState,
  type AccountActionState,
} from "@/auth/credentials";

type OnboardingFormProps = {
  action: (
    state: AccountActionState,
    formData: FormData,
  ) => Promise<AccountActionState>;
};

export function OnboardingForm({ action }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAccountActionState,
  );

  return (
    <form className="account-form" action={formAction} noValidate>
      <label className="form-field">
        <span>Your name</span>
        <input
          autoComplete="name"
          name="displayName"
          aria-invalid={Boolean(state.errors?.displayName)}
          aria-describedby={
            state.errors?.displayName ? "display-name-error" : undefined
          }
          autoFocus
          required
        />
        {state.errors?.displayName ? (
          <small id="display-name-error">{state.errors.displayName[0]}</small>
        ) : null}
      </label>

      <label className="form-field">
        <span>Classroom name</span>
        <input
          name="workspaceName"
          placeholder="My classroom"
          aria-invalid={Boolean(state.errors?.workspaceName)}
          aria-describedby={
            state.errors?.workspaceName ? "workspace-name-error" : undefined
          }
          required
        />
        {state.errors?.workspaceName ? (
          <small id="workspace-name-error">{state.errors.workspaceName[0]}</small>
        ) : null}
      </label>

      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="form-submit" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Continue"}
      </button>
    </form>
  );
}
