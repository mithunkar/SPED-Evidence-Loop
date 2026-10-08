CREATE TABLE "approved_emails" (
	"email" text PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "approved_emails_email_normalized" CHECK ("email" = lower(trim("email")))
);
--> statement-breakpoint
alter table "approved_emails" enable row level security;
--> statement-breakpoint
revoke all privileges on table "approved_emails" from anon, authenticated;
--> statement-breakpoint
grant select on table "approved_emails" to supabase_auth_admin;
--> statement-breakpoint
create policy "Supabase Auth reads approved email list"
on "approved_emails"
for select
to supabase_auth_admin
using (true);
--> statement-breakpoint
create or replace function public.before_user_created_allowlist(event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  requested_email text := lower(trim(event -> 'user' ->> 'email'));
  provider text := event -> 'user' -> 'app_metadata' ->> 'provider';
begin
  if provider is distinct from 'google' then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 403,
        'message', 'Only Google sign-in is available for this classroom.'
      )
    );
  end if;

  if requested_email is null or not exists (
    select 1
    from public.approved_emails
    where email = requested_email
  ) then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 403,
        'message', 'This Google account is not approved for the classroom.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;
--> statement-breakpoint
grant execute on function public.before_user_created_allowlist(jsonb)
to supabase_auth_admin;
--> statement-breakpoint
revoke execute on function public.before_user_created_allowlist(jsonb)
from anon, authenticated, public;
--> statement-breakpoint
update "users"
set "status" = 'INACTIVE'
where "id" = 'f0000000-0000-4000-8000-000000000002';
