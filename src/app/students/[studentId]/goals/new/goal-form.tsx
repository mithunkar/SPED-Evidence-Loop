"use client";

import { useActionState } from "react";

import {
  initialGoalActionState,
  type GoalActionState,
} from "@/domain/goal";

type GoalFormProps = {
  action: (
    state: GoalActionState,
    formData: FormData,
  ) => Promise<GoalActionState>;
};

export function GoalForm({ action }: GoalFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialGoalActionState,
  );

  return (
    <form className="account-form" action={formAction} noValidate>
      <label className="form-field">
        <span>Goal name</span>
        <input
          name="title"
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={state.errors?.title ? "goal-title-error" : undefined}
          autoFocus
          required
        />
        {state.errors?.title ? (
          <small id="goal-title-error">{state.errors.title[0]}</small>
        ) : null}
      </label>

      <label className="form-field">
        <span>What should the student do?</span>
        <textarea
          name="objectiveText"
          rows={4}
          maxLength={1000}
          aria-invalid={Boolean(state.errors?.objectiveText)}
          aria-describedby={
            state.errors?.objectiveText ? "goal-objective-error" : undefined
          }
          required
        />
        {state.errors?.objectiveText ? (
          <small id="goal-objective-error">{state.errors.objectiveText[0]}</small>
        ) : null}
      </label>

      <div className="form-row">
        <label className="form-field">
          <span>Skill area</span>
          <select
            name="domain"
            defaultValue=""
            aria-invalid={Boolean(state.errors?.domain)}
            aria-describedby={
              state.errors?.domain ? "goal-domain-error" : undefined
            }
            required
          >
            <option value="" disabled>
              Choose one
            </option>
            <option>Communication</option>
            <option>Following directions</option>
            <option>Social interaction</option>
            <option>Motor</option>
            <option>Self-help</option>
            <option>Other</option>
          </select>
          {state.errors?.domain ? (
            <small id="goal-domain-error">{state.errors.domain[0]}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Target score</span>
          <select name="targetScore" defaultValue="">
            <option value="">No target</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </label>
      </div>

      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="form-submit" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save goal"}
      </button>
    </form>
  );
}
