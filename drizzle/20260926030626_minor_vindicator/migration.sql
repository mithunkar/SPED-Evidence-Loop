CREATE TYPE "no_data_reason" AS ENUM('NO_OPPORTUNITY', 'STUDENT_ABSENT', 'GOAL_NOT_OBSERVED', 'SESSION_INTERRUPTED', 'OTHER');--> statement-breakpoint
CREATE TYPE "session_status" AS ENUM('DRAFT', 'SUBMITTED');--> statement-breakpoint
CREATE TYPE "strategy_fidelity_status" AS ENUM('FULL', 'PARTIAL', 'NOT_USED', 'NOT_APPLICABLE');--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	"goal_version" integer NOT NULL,
	"score" integer,
	"no_data_reason" "no_data_reason",
	"strategy_assignment_id" uuid,
	"strategy_version" integer,
	"fidelity_status" "strategy_fidelity_status",
	"fidelity_note" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "observations_goal_version_positive" CHECK ("goal_version" > 0),
	CONSTRAINT "observations_score_or_no_data" CHECK (("score" between 0 and 4 and "no_data_reason" is null) or ("score" is null and "no_data_reason" is not null)),
	CONSTRAINT "observations_strategy_fidelity_consistency" CHECK (("strategy_assignment_id" is null and "strategy_version" is null and "fidelity_status" is null and "fidelity_note" is null) or ("strategy_assignment_id" is not null and "strategy_version" is not null and "fidelity_status" is not null))
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"session_type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"recorded_by_user_id" uuid NOT NULL,
	"context_tags" text[],
	"note" text,
	"status" "session_status" DEFAULT 'DRAFT'::"session_status" NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_submission_state" CHECK (("status" = 'DRAFT' and "submitted_at" is null) or ("status" = 'SUBMITTED' and "submitted_at" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "goals_workspace_student_id_id_unique" ON "goals" ("workspace_id","student_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "observations_session_goal_unique" ON "observations" ("workspace_id","session_id","goal_id");--> statement-breakpoint
CREATE INDEX "observations_goal_created_at_index" ON "observations" ("workspace_id","goal_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_workspace_id_id_unique" ON "sessions" ("workspace_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_workspace_student_id_id_unique" ON "sessions" ("workspace_id","student_id","id");--> statement-breakpoint
CREATE INDEX "sessions_student_occurred_at_index" ON "sessions" ("workspace_id","student_id","occurred_at");--> statement-breakpoint
CREATE INDEX "sessions_duplicate_warning_index" ON "sessions" ("workspace_id","student_id","session_type","recorded_by_user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "goal_strategy_assignments_workspace_goal_id_version_unique" ON "goal_strategy_assignments" ("workspace_id","goal_id","id","strategy_version");--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_session_foreign_key" FOREIGN KEY ("workspace_id","student_id","session_id") REFERENCES "sessions"("workspace_id","student_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_goal_foreign_key" FOREIGN KEY ("workspace_id","student_id","goal_id") REFERENCES "goals"("workspace_id","student_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_strategy_assignment_foreign_key" FOREIGN KEY ("workspace_id","goal_id","strategy_assignment_id","strategy_version") REFERENCES "goal_strategy_assignments"("workspace_id","goal_id","id","strategy_version") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_foreign_key" FOREIGN KEY ("workspace_id","student_id") REFERENCES "students"("workspace_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_recorder_foreign_key" FOREIGN KEY ("workspace_id","recorded_by_user_id") REFERENCES "users"("workspace_id","id") ON DELETE RESTRICT;