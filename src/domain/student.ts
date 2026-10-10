import { z } from "zod";
import { studentGroupSchema } from "@/domain/catalog";

export const createStudentSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter a student name.")
    .max(80, "Student name must be 80 characters or fewer."),
  group: studentGroupSchema,
  teacherNotes: z
    .string()
    .trim()
    .max(2_000, "Teacher notes must be 2,000 characters or fewer.")
    .optional(),
});

export type CreateStudentInput = z.output<typeof createStudentSchema>;
export const updateStudentSchema = createStudentSchema;
export type UpdateStudentInput = z.output<typeof updateStudentSchema>;

export type StudentActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialStudentActionState: StudentActionState = {
  status: "idle",
};
