# SPED Evidence Loop

SPED Evidence Loop is a private classroom data-collection application for
recording student goal observations, tracking teaching strategies, and preparing
teacher-reviewed progress summaries.

The project is currently in its local-foundation milestone and uses synthetic
data only. See [`docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md`](docs/SPED_EVIDENCE_LOOP_PRODUCT_REQUIREMENTS.md)
for the product requirements and implementation plan.

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

Replace `DEVELOPMENT_AUTH_SECRET` in `.env` with at least 32 random bytes before
using the local role selector. The selector is disabled when `NODE_ENV` is
`production` and is not a production authentication system.

Database schemas live in `src/db/schema/`. Generate and apply migrations with:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed command is safe to rerun. It inserts or updates a clearly labeled
synthetic classroom with a teacher, two assistants, three student aliases,
representative goals, and one active strategy assignment. It must not be used
to import real student information.

### Supabase and hosted environments

Supabase can provide the managed PostgreSQL database without changing the
Drizzle schema. Configure two server-only connection strings:

- `DATABASE_URL`: the Supabase transaction-pooler URI (port `6543`) used by the
  deployed application.
- `DATABASE_MIGRATION_URL`: the direct or session-pooler URI used only by
  Drizzle migrations and the synthetic seed command.

Add `sslmode=require` to hosted connection strings if it is not already present.
The application automatically limits Vercel runtime instances to one database
connection. Never expose either connection string with a `NEXT_PUBLIC_` prefix
or commit credentials to Git.

The current role selector is development-only. A hosted interactive demo still
requires an explicitly synthetic production demo mode or real authentication;
do not enable it for real student information.

## Quality checks

```bash
npm run lint
npm test
npm run typecheck
npm run build
```
