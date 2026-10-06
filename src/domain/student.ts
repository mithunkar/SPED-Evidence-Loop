import { z } from "zod";

export const createStudentSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a student name.")
    .max(80, "Student name must be 80 characters or fewer."),
});

export type CreateStudentInput = z.output<typeof createStudentSchema>;

export type StudentActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialStudentActionState: StudentActionState = {
  status: "idle",
};
