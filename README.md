# SPED Evidence Loop

SPED Evidence Loop is a private classroom data-collection application for
recording student goal observations and tracking teaching strategies. Only
Google accounts entered in the Supabase `approved_emails` table can create an
account or access the one classroom. See
[`docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md`](docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md)
for the product requirements and implementation plan.

## Hosted classroom

The Vercel deployment opens at the sign-in screen. An approved staff member
uses Google to access the persistent Supabase-backed classroom.

## Local development

This project requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Local database

The development database is PostgreSQL 17. With Docker installed, copy the
example environment file and start the database:

```bash
cp .env.example .env
docker compose up -d
```

Database schemas live in `src/db/schema/`. Generate and apply migrations with:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed command inserts a separate, clearly labeled synthetic classroom for
development tests. The production classroom is created by the
`public-classroom` migration and starts empty.

### Supabase and hosted environments

Supabase can provide the managed PostgreSQL database without changing the
Drizzle schema. Configure two server-only connection strings:

- `DATABASE_URL`: the Supabase transaction-pooler URI (port `6543`) used by the
  deployed application.
- `DATABASE_MIGRATION_URL`: the direct or session-pooler URI used only by
  Drizzle migrations and the synthetic seed command.

Add `sslmode=require&uselibpqcompat=true` to hosted connection strings if those
parameters are not already present. The compatibility flag gives Node's `pg`
driver the standard libpq meaning of `require`: encrypt the connection without
requiring a locally installed CA certificate. Use `sslmode=verify-full` instead
when the Supabase CA is installed and configured. The application automatically
limits Vercel runtime instances to one database connection. Never expose either
connection string with a `NEXT_PUBLIC_` prefix or commit credentials to Git.

The application connects to Supabase only through the server-side PostgreSQL
connection. Its public browser does not receive database credentials or direct
Data API table access.

### Google sign-in and classroom allowlist

Before enabling authentication in a hosted environment:

1. Apply the database migration, then add each permitted, lower-case email to
   `public.approved_emails` in Supabase Studio. Add your own email before
   deploying or nobody will be able to enter.
2. In Google Cloud, create a Web OAuth client. Add the production and local
   site URLs as authorized JavaScript origins and add Supabase's callback URL
   from **Authentication → Providers → Google** as an authorized redirect URI.
3. In Supabase **Authentication → Providers**, enable Google and enter that
   client ID and secret. Disable email/password and anonymous sign-in.
4. In Supabase **Authentication → Hooks**, enable the **Before User Created**
   database hook using `pg-functions://postgres/public/before_user_created_allowlist`.
   The included local configuration enables the same hook.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
   `NEXT_PUBLIC_SITE_URL` in Vercel. The redirect URLs must include
   `<site-url>/auth/callback`.

Removing an email from `approved_emails` blocks that account on its next page
request or server action. The old public teacher record is retained as inactive
historical authorship.

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```
