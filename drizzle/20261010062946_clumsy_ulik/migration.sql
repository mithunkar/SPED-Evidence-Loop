CREATE TYPE "skill_area" AS ENUM('Social Communication', 'Social Emotional', 'Fine Motor', 'Gross Motor', 'Adaptive', 'Cognitive', 'Receptive Communication');--> statement-breakpoint
CREATE TYPE "student_group" AS ENUM('AM_MW', 'AM_TTH', 'PM');--> statement-breakpoint
CREATE TABLE "goal_revisions" (
	"workspace_id" uuid,
	"goal_id" uuid,
	"version" integer,
	"title" text NOT NULL,
	"objective_text" text NOT NULL,
	"domain" "skill_area" NOT NULL,
	"target_score" integer,
	"expected_frequency" text NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goal_revisions_primary_key" PRIMARY KEY("workspace_id","goal_id","version"),
	CONSTRAINT "goal_revisions_version_positive" CHECK ("version" > 0),
	CONSTRAINT "goal_revisions_target_score_range" CHECK ("target_score" is null or "target_score" between 0 and 4)
);
--> statement-breakpoint
-- The product owner authorized a one-time reset of classroom content only.
-- Workspace, application users, and approved sign-in emails are preserved.
DELETE FROM "observations";--> statement-breakpoint
DELETE FROM "sessions";--> statement-breakpoint
DELETE FROM "goal_strategy_assignments";--> statement-breakpoint
DELETE FROM "strategies";--> statement-breakpoint
DELETE FROM "goals";--> statement-breakpoint
DELETE FROM "user_student_assignments";--> statement-breakpoint
DELETE FROM "students";--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "group" "student_group" NOT NULL;--> statement-breakpoint
ALTER TABLE "goals" ALTER COLUMN "domain" SET DATA TYPE "skill_area" USING "domain"::"skill_area";--> statement-breakpoint
CREATE INDEX "students_workspace_group_status_name_index" ON "students" ("workspace_id","group","status","display_name");--> statement-breakpoint
ALTER TABLE "goal_revisions" ADD CONSTRAINT "goal_revisions_goal_foreign_key" FOREIGN KEY ("workspace_id","goal_id") REFERENCES "goals"("workspace_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goal_revisions" ADD CONSTRAINT "goal_revisions_creator_foreign_key" FOREIGN KEY ("workspace_id","created_by_user_id") REFERENCES "users"("workspace_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_goal_revision_foreign_key" FOREIGN KEY ("workspace_id","goal_id","goal_version") REFERENCES "goal_revisions"("workspace_id","goal_id","version") ON DELETE RESTRICT;
--> statement-breakpoint
ALTER TABLE "goal_revisions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL PRIVILEGES ON TABLE "goal_revisions" FROM anon, authenticated;
