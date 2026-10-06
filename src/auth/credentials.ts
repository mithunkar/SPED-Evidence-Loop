import { z } from "zod";

export const emailPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const workspaceSetupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  workspaceName: z
    .string()
    .trim()
    .min(2, "Enter a classroom name.")
    .max(120, "Classroom name must be 120 characters or fewer."),
});

export type AccountActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialAccountActionState: AccountActionState = {
  status: "idle",
};
