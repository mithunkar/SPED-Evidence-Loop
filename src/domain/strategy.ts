import { z } from "zod";

export const assignStrategySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a strategy name.")
    .max(100, "Strategy name must be 100 characters or fewer."),
  instructions: z
    .string()
    .trim()
    .min(5, "Describe what staff should do.")
    .max(1000, "Instructions must be 1,000 characters or fewer."),
  fidelityPrompt: z
    .string()
    .trim()
    .min(5, "Enter a quick strategy-use check.")
    .max(300, "Strategy-use check must be 300 characters or fewer."),
});

export type AssignStrategyInput = z.output<typeof assignStrategySchema>;

export type StrategyActionState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialStrategyActionState: StrategyActionState = {
  status: "idle",
};
