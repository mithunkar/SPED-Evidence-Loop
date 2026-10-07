insert into "workspaces" ("id", "name", "timezone")
values (
  'f0000000-0000-4000-8000-000000000001',
  'My Classroom',
  'America/Los_Angeles'
)
on conflict ("id") do nothing;--> statement-breakpoint

insert into "users" (
  "id",
  "workspace_id",
  "display_name",
  "email",
  "role",
  "status"
)
values (
  'f0000000-0000-4000-8000-000000000002',
  'f0000000-0000-4000-8000-000000000001',
  'Teacher',
  'public-classroom@evidence-loop.local',
  'TEACHER',
  'ACTIVE'
)
on conflict ("id") do nothing;
