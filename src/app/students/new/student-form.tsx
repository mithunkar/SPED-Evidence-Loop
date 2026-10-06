"use client";

import { useActionState } from "react";

import {
  initialStudentActionState,
  type StudentActionState,
} from "@/domain/student";

type StudentFormProps = {
  action: (
    state: StudentActionState,
    formData: FormData,
  ) => Promise<StudentActionState>;
};

export function StudentForm({ action }: StudentFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialStudentActionState,
  );

  return (
    <form className="account-form" action={formAction} noValidate>
      <label className="form-field">
        <span>Student name</span>
        <input
          name="displayName"
          maxLength={80}
          aria-invalid={Boolean(state.errors?.displayName)}
          aria-describedby={
            state.errors?.displayName ? "student-name-error" : undefined
          }
          autoFocus
          required
        />
        {state.errors?.displayName ? (
          <small id="student-name-error">{state.errors.displayName[0]}</small>
        ) : null}
      </label>

      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="form-submit" type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add student"}
      </button>
    </form>
  );
}
