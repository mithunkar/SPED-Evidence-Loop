CREATE TYPE "goal_strategy_assignment_status" AS ENUM('PLANNED', 'ACTIVE', 'ENDED');--> statement-breakpoint
CREATE TYPE "strategy_status" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "goal_strategy_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	"strategy_id" uuid NOT NULL,
	"strategy_version" integer NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date,
	"reason" text NOT NULL,
	"planned_review_on" date,
	"implementation_notes" text,
	"conclusion" text,
	"status" "goal_strategy_assignment_status" DEFAULT 'PLANNED'::"goal_strategy_assignment_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goal_strategy_assignments_date_range" CHECK ("ends_on" is null or "ends_on" >= "starts_on"),
	CONSTRAINT "goal_strategy_assignments_review_date_range" CHECK ("planned_review_on" is null or ("planned_review_on" >= "starts_on" and ("ends_on" is null or "planned_review_on" <= "ends_on"))),
	CONSTRAINT "goal_strategy_assignments_ended_date_required" CHECK ("status" <> 'ENDED' or "ends_on" is not null)
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" uuid DEFAULT gen_random_uuid(),
	"workspace_id" uuid,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"instructions" text NOT NULL,
	"fidelity_prompt" text NOT NULL,
	"source_reference" text,
	"version" integer DEFAULT 1,
	"status" "strategy_status" DEFAULT 'DRAFT'::"strategy_status" NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strategies_primary_key" PRIMARY KEY("workspace_id","id","version"),
	CONSTRAINT "strategies_version_positive" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "goals_workspace_id_id_unique" ON "goals" ("workspace_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "goal_strategy_assignments_workspace_id_id_unique" ON "goal_strategy_assignments" ("workspace_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "goal_strategy_assignments_one_active_per_goal_unique" ON "goal_strategy_assignments" ("workspace_id","goal_id") WHERE "status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "goal_strategy_assignments_goal_dates_index" ON "goal_strategy_assignments" ("workspace_id","goal_id","starts_on");--> statement-breakpoint
CREATE INDEX "strategies_workspace_status_index" ON "strategies" ("workspace_id","status");--> statement-breakpoint
ALTER TABLE "goal_strategy_assignments" ADD CONSTRAINT "goal_strategy_assignments_goal_foreign_key" FOREIGN KEY ("workspace_id","goal_id") REFERENCES "goals"("workspace_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goal_strategy_assignments" ADD CONSTRAINT "goal_strategy_assignments_strategy_foreign_key" FOREIGN KEY ("workspace_id","strategy_id","strategy_version") REFERENCES "strategies"("workspace_id","id","version") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_creator_foreign_key" FOREIGN KEY ("workspace_id","created_by_user_id") REFERENCES "users"("workspace_id","id") ON DELETE RESTRICT;