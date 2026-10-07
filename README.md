# SPED Evidence Loop

SPED Evidence Loop is a classroom data-collection application for recording
student goal observations and tracking teaching strategies.

The current iteration intentionally uses one public classroom with no sign-in.
Anyone with the production URL can view or change its records, so use aliases
and fictional information only until authentication is restored. See
[`docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md`](docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md)
for the product requirements and implementation plan.

## Hosted classroom

The current Vercel deployment is available at
[sped-evidence-loop.vercel.app](https://sped-evidence-loop.vercel.app).
It opens directly to the persistent Supabase-backed roster. Add a student, add
goals and strategies, then open **Start session** to collect rubric data.

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
development tests. The public classroom is created by the
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

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```
