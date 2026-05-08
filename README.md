# 4Founders MVP

4Founders is a GitHub-native evaluation and launch-readiness platform for early software founders.
It helps teams improve products through structured feedback while protecting sensitive work until they are ready for broader visibility.

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn-style UI components
- Prisma ORM + PostgreSQL
- NextAuth (GitHub OAuth + credentials for demo accounts)
- Zod validation
- React Hook Form (project and review flows)

## Core Capabilities in this MVP

- Public marketing and discovery pages
- Authenticated workspace with role-aware sidebar
- Founder project creation wizard (7 steps)
- Visibility model: Public, Limited, Protected, Expert-only
- Structured reviews with rubric dimensions (1-10)
- Version iteration flow for project improvements
- Expert support request and assessment flow
- Moderation queue and case creation
- Access log audit views
- Leaderboards focused on signal quality, not vanity metrics
- GitHub Pages static project page in `docs/`
- GitHub Actions for CI and Pages publishing

## Public Routes

- `/`
- `/how-it-works`
- `/categories`
- `/categories/[slug]`
- `/projects/[slug]`
- `/trust-safety`
- `/about`
- `/sign-in`
- `/register`

## Authenticated Routes

- `/app/dashboard`
- `/app/projects`
- `/app/projects/new`
- `/app/projects/[id]`
- `/app/projects/[id]/versions`
- `/app/projects/[id]/visibility`
- `/app/projects/[id]/feedback`
- `/app/projects/[id]/access-log`
- `/app/reviews`
- `/app/reviews/[id]`
- `/app/expert`
- `/app/moderation`
- `/app/profile`
- `/app/settings`

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migrations:

```bash
npm run prisma:migrate
```

5. Seed demo data:

```bash
npm run prisma:seed
```

6. Start development server:

```bash
npm run dev
```

## GitHub Publishing

The full 4Founders app is a server-rendered Next.js application backed by PostgreSQL, so it needs a Node host for production app deployment. GitHub Pages can host the static project webpage at `docs/index.html`.

After pushing this repository to GitHub, enable Pages from GitHub Actions. The included `.github/workflows/pages.yml` workflow publishes the `docs/` webpage on every push to `main`.

The included `.github/workflows/ci.yml` workflow runs install, Prisma generation, schema validation, and `next build`.

## Demo Accounts

All seeded accounts use password: `Demo123!`

- Founder: `founder@4founders.dev`
- Founder 2: `founder2@4founders.dev`
- Reviewer: `reviewer@4founders.dev`
- Trusted Reviewer: `trusted@4founders.dev`
- Senior Expert: `expert@4founders.dev`
- Admin/Moderator: `admin@4founders.dev`

## Environment Variables

See `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`

## Prisma

- Schema: `prisma/schema.prisma`
- Initial migration: `prisma/migrations/20260417_init/migration.sql`
- Seed script: `prisma/seed.ts`

## Core Architecture Decisions

1. **Role-based server-side authorization**
   - API handlers and middleware enforce access checks.
   - Frontend visibility is never the only access control.

2. **Protected-by-default workflows**
   - Projects default to protected visibility.
   - Visibility policy and disclosure requests support progressive disclosure.

3. **Structured feedback model**
   - Reviews require strengths, weaknesses, unclear areas, top improvement, and confidence.
   - Rubric dimensions are explicit and persisted per review.

4. **Iteration and launch readiness focus**
   - Project versions track improvement loops.
   - Expert support requests and launch assessments cover finalization.

5. **Trust and accountability**
   - Access logs, moderation cases, reputation events, badges, and notifications are modeled.

## Notes

- GitHub OAuth is wired in NextAuth and can be enabled by setting `GITHUB_ID` and `GITHUB_SECRET`.
- Credentials auth is included to support seeded demo accounts for rapid local testing.
