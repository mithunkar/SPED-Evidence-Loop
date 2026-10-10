import { z } from "zod";

export const STUDENT_GROUPS = ["AM_MW", "AM_TTH", "PM"] as const;
export type StudentGroup = (typeof STUDENT_GROUPS)[number];

export const STUDENT_GROUP_LABELS: Record<StudentGroup, string> = {
  AM_MW: "AM (M/W)",
  AM_TTH: "AM (T/Th)",
  PM: "PM",
};

export const SKILL_AREAS = [
  "Social Communication",
  "Social Emotional",
  "Fine Motor",
  "Gross Motor",
  "Adaptive",
  "Cognitive",
  "Receptive Communication",
] as const;
export type SkillArea = (typeof SKILL_AREAS)[number];

export const studentGroupSchema = z.enum(STUDENT_GROUPS);
export const skillAreaSchema = z.enum(SKILL_AREAS);
