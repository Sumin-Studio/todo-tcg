# TODO TCG

TODO TCG is a Next.js 16 app that stores games in Supabase and deploys cleanly to Vercel.

## Stack

- Next.js 16 App Router
- React 19
- Supabase Postgres, Realtime, and Storage
- Vercel for hosting

## Environment variables

Copy [.env.example](./.env.example) to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DASHSCOPE_API_KEY` (optional, only needed for AI card art)

`NEXT_PUBLIC_*` variables are compiled into the browser bundle, so they must be present before a Vercel build starts.

## Local development

```bash
npm install
npm run dev
```

## Supabase setup

### Option 1: SQL editor

1. Create a new Supabase project.
2. Open the SQL editor in Supabase.
3. Run [`supabase/migrations/20260405121500_init.sql`](./supabase/migrations/20260405121500_init.sql).
4. Copy the project URL, anon key, and service role key into `.env.local`.

This migration creates:

- `games`
- `completions`
- the public `card-art` storage bucket
- RLS policies for anonymous completion reads/inserts
- Realtime on `completions`

### Option 2: Supabase CLI

You do not need a global install. `npx` works fine:

```bash
npx supabase@latest login
npx supabase@latest init
npx supabase@latest link --project-ref <your-project-ref>
npx supabase@latest db push
```

If `supabase init` creates a fresh `supabase` folder, keep the migration file in `supabase/migrations/`.

## Vercel deployment

### Vercel dashboard

1. Import this repository into Vercel.
2. Add the same environment variables to the Vercel project:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DASHSCOPE_API_KEY` (optional)
3. Deploy.

### Vercel CLI

You can also deploy without installing anything globally:

```bash
npx vercel@latest
```

For a production deployment:

```bash
npx vercel@latest --prod
```

## Notes

- The game-generation route is pinned to the Node.js runtime and allows up to 60 seconds, which is friendlier to Vercel when AI art generation is enabled.
- If `DASHSCOPE_API_KEY` is missing, the app still works and falls back to gradient card art.
- The current app is link-based and anonymous. If you want stronger privacy controls later, the next step is adding Supabase Auth and per-user policies.

## Verification

```bash
npm run typecheck
npm run build
```
