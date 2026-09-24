CREATE TYPE "goal_status" AS ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "student_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('TEACHER', 'ASSISTANT');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"title" text NOT NULL,
	"objective_text" text NOT NULL,
	"domain" text NOT NULL,
	"target_score" integer,
	"expected_frequency" text NOT NULL,
	"status" "goal_status" DEFAULT 'DRAFT'::"goal_status" NOT NULL,
	"active_from" date NOT NULL,
	"active_to" date,
	"position" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goals_target_score_range" CHECK ("target_score" is null or "target_score" between 0 and 4),
	CONSTRAINT "goals_version_positive" CHECK ("version" > 0),
	CONSTRAINT "goals_position_nonnegative" CHECK ("position" >= 0),
	CONSTRAINT "goals_active_date_range" CHECK ("active_to" is null or "active_to" >= "active_from")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"external_reference" text,
	"teacher_notes" text,
	"status" "student_status" DEFAULT 'ACTIVE'::"student_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_student_assignments" (
	"workspace_id" uuid NOT NULL,
	"user_id" uuid,
	"student_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_student_assignments_primary_key" PRIMARY KEY("user_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE'::"user_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "goals_workspace_student_status_index" ON "goals" ("workspace_id","student_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "students_workspace_id_id_unique" ON "students" ("workspace_id","id");--> statement-breakpoint
CREATE INDEX "students_workspace_status_index" ON "students" ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "user_student_assignments_student_index" ON "user_student_assignments" ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_workspace_email_unique" ON "users" ("workspace_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_workspace_id_id_unique" ON "users" ("workspace_id","id");--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_student_foreign_key" FOREIGN KEY ("workspace_id","student_id") REFERENCES "students"("workspace_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_student_assignments" ADD CONSTRAINT "user_student_assignments_user_foreign_key" FOREIGN KEY ("workspace_id","user_id") REFERENCES "users"("workspace_id","id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_student_assignments" ADD CONSTRAINT "user_student_assignments_student_foreign_key" FOREIGN KEY ("workspace_id","student_id") REFERENCES "students"("workspace_id","id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT;