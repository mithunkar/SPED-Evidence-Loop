"use client";

import { useActionState } from "react";

import {
  initialGoalActionState,
  type GoalActionState,
} from "@/domain/goal";
import { SKILL_AREAS, type SkillArea } from "@/domain/catalog";

type GoalFormProps = {
  action: (
    state: GoalActionState,
    formData: FormData,
  ) => Promise<GoalActionState>;
  initialGoal?: {
    title: string;
    objectiveText: string;
    domain: SkillArea;
    targetScore: number | null;
    status?: "ACTIVE" | "PAUSED" | "ARCHIVED";
  };
  submitLabel?: string;
};

export function GoalForm({ action, initialGoal, submitLabel = "Save goal" }: GoalFormProps) {
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
          defaultValue={initialGoal?.title}
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
          defaultValue={initialGoal?.objectiveText}
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
            defaultValue={initialGoal?.domain ?? ""}
            aria-invalid={Boolean(state.errors?.domain)}
            aria-describedby={
              state.errors?.domain ? "goal-domain-error" : undefined
            }
            required
          >
            <option value="" disabled>
              Choose one
            </option>
            {SKILL_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
          </select>
          {state.errors?.domain ? (
            <small id="goal-domain-error">{state.errors.domain[0]}</small>
          ) : null}
        </label>

        <label className="form-field">
          <span>Target score</span>
          <select name="targetScore" defaultValue={initialGoal?.targetScore?.toString() ?? ""}>
            <option value="">No target</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </label>
      </div>

      {initialGoal?.status ? (
        <label className="form-field">
          <span>Goal status</span>
          <select name="status" defaultValue={initialGoal.status}>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      ) : null}

      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="form-submit" type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
