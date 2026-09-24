import { sql } from "drizzle-orm";
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull();

export const userRole = pgEnum("user_role", ["TEACHER", "ASSISTANT"]);
export const userStatus = pgEnum("user_status", ["ACTIVE", "INACTIVE"]);
export const studentStatus = pgEnum("student_status", [
  "ACTIVE",
  "ARCHIVED",
]);
export const goalStatus = pgEnum("goal_status", [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
]);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  createdAt,
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(),
    email: text("email").notNull(),
    role: userRole("role").notNull(),
    status: userStatus("status").default("ACTIVE").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("users_workspace_email_unique").on(
      table.workspaceId,
      table.email,
    ),
    uniqueIndex("users_workspace_id_id_unique").on(
      table.workspaceId,
      table.id,
    ),
  ],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(),
    externalReference: text("external_reference"),
    teacherNotes: text("teacher_notes"),
    status: studentStatus("status").default("ACTIVE").notNull(),
    createdAt,
    updatedAt,
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("students_workspace_id_id_unique").on(
      table.workspaceId,
      table.id,
    ),
    index("students_workspace_status_index").on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const userStudentAssignments = pgTable(
  "user_student_assignments",
  {
    workspaceId: uuid("workspace_id").notNull(),
    userId: uuid("user_id").notNull(),
    studentId: uuid("student_id").notNull(),
    createdAt,
  },
  (table) => [
    primaryKey({
      name: "user_student_assignments_primary_key",
      columns: [table.userId, table.studentId],
    }),
    foreignKey({
      name: "user_student_assignments_user_foreign_key",
      columns: [table.workspaceId, table.userId],
      foreignColumns: [users.workspaceId, users.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "user_student_assignments_student_foreign_key",
      columns: [table.workspaceId, table.studentId],
      foreignColumns: [students.workspaceId, students.id],
    }).onDelete("cascade"),
    index("user_student_assignments_student_index").on(table.studentId),
  ],
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id").notNull(),
    studentId: uuid("student_id").notNull(),
    title: text("title").notNull(),
    objectiveText: text("objective_text").notNull(),
    domain: text("domain").notNull(),
    targetScore: integer("target_score"),
    expectedFrequency: text("expected_frequency").notNull(),
    status: goalStatus("status").default("DRAFT").notNull(),
    activeFrom: date("active_from", { mode: "string" }).notNull(),
    activeTo: date("active_to", { mode: "string" }),
    position: integer("position").default(0).notNull(),
    version: integer("version").default(1).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    foreignKey({
      name: "goals_student_foreign_key",
      columns: [table.workspaceId, table.studentId],
      foreignColumns: [students.workspaceId, students.id],
    }).onDelete("restrict"),
    index("goals_workspace_student_status_index").on(
      table.workspaceId,
      table.studentId,
      table.status,
    ),
    check(
      "goals_target_score_range",
      sql`${table.targetScore} is null or ${table.targetScore} between 0 and 4`,
    ),
    check("goals_version_positive", sql`${table.version} > 0`),
    check("goals_position_nonnegative", sql`${table.position} >= 0`),
    check(
      "goals_active_date_range",
      sql`${table.activeTo} is null or ${table.activeTo} >= ${table.activeFrom}`,
    ),
  ],
);
