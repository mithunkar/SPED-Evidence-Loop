-- The application uses a server-only Postgres connection and performs its own
-- workspace, role, and student authorization. Keep every table inaccessible
-- through Supabase's public Data API unless explicit policies are added later.
alter table "workspaces" enable row level security;--> statement-breakpoint
alter table "users" enable row level security;--> statement-breakpoint
alter table "students" enable row level security;--> statement-breakpoint
alter table "user_student_assignments" enable row level security;--> statement-breakpoint
alter table "goals" enable row level security;--> statement-breakpoint
alter table "strategies" enable row level security;--> statement-breakpoint
alter table "goal_strategy_assignments" enable row level security;--> statement-breakpoint
alter table "sessions" enable row level security;--> statement-breakpoint
alter table "observations" enable row level security;--> statement-breakpoint
revoke all privileges on table "workspaces" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "users" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "students" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "user_student_assignments" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "goals" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "strategies" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "goal_strategy_assignments" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "sessions" from anon, authenticated;--> statement-breakpoint
revoke all privileges on table "observations" from anon, authenticated;
