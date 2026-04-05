# CONTEXT.md — Handoff for Next Claude Instance

Last updated: 2026-04-05
Status: Project bootstrapped, ready to begin implementation

---

## What Has Been Done

### 1. Project Documentation
- **`PRD.md`** — Full product requirements (user flows, data model, card visual spec, pack algorithm, Supabase schema SQL, non-functional requirements)
- **`CLAUDE.md`** — Complete developer reference (tech stack, full file structure, all architectural patterns, CSS conventions, implementation order, common pitfalls)

### 2. Next.js Project Initialized
- `create-next-app` with TypeScript, Tailwind CSS v3, App Router, ESLint
- Package name: `todo-tcg`
- Node at `/usr/local/bin/node` (needed for launch.json — PATH doesn't include it by default)
- Dev server runs via: `/usr/local/bin/node node_modules/next/dist/bin/next dev`

### 3. GitHub
- Repo: `https://github.com/Sumin-Studio/todo-tcg`
- Branch: `main`
- All files committed and pushed

### 4. Card Frames Reviewed
Three PNG frames were shown by the user and design notes are captured in CLAUDE.md:
- `public/frames/common.png` — gray border, "COMMON" text top-left (plain, no badge)
- `public/frames/rare.png` — silver/chrome border, green pill badge top-left
- `public/frames/legendary.png` — gold border, orange pill badge top-left
- **The rarity badge is baked into the PNG** — do NOT render a separate rarity label in CSS
- Full white interior — content layout is entirely CSS-defined
- **These files have NOT been added to the repo yet** — the user needs to drop the PNGs into `public/frames/`

---

## Key Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Rarity assignment | GM tags each card manually | User confirmed |
| Player sync | Supabase Realtime | User confirmed |
| Card frames | Custom PNG per rarity | User provided designs |
| Card art | AI-generated via DALL-E 3 | User confirmed |
| Card effects | Common: none, Rare: shimmer, Legendary: parallax | User confirmed |
| Card rendering | HTML/CSS layers (not server composited PNG) | Simpler, more flexible |
| GM auth | gmToken in URL, validated server-side only | Never sent to client |

---

## What Is Blocked (User Action Required)

1. **Drop PNG frames** into `public/frames/common.png`, `public/frames/rare.png`, `public/frames/legendary.png`
2. **Create Supabase project** and run the SQL schema from `CLAUDE.md` → provides `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. **Get OpenAI API key** for DALL-E 3 image generation → `OPENAI_API_KEY`
4. **Create `.env.local`** with all env vars (template in `CLAUDE.md`)

---

## What To Build Next (Ordered)

Work through these in order — each step unblocks the next:

### Step 1 — Data model (`lib/types.ts`)
Define all TypeScript interfaces: `Rarity`, `Card`, `Player`, `GameSettings`, `Game`, `Completion`, `Result<T,E>`. This is the foundation everything else depends on.

### Step 2 — Pure logic (`lib/hash.ts`, `lib/game-engine.ts`)
- `djb2Hash(str)` and `mulberry32(seed)` in `lib/hash.ts`
- `dealPacks(cardPool, settings, seed)` in `lib/game-engine.ts` — seeded shuffle, rarity bucket dealing, validation
- These are pure functions with no deps — build and verify in isolation

### Step 3 — Flavor text (`lib/constants.ts`, `lib/flavor-text.ts`)
- Static flavor text pools per rarity in `constants.ts` (10+ entries each)
- `getFlavorText(cardId, rarity)` using `djb2Hash(cardId) % pool.length`

### Step 4 — Supabase layer (`lib/supabase/`)
- `client.ts` — browser Supabase singleton
- `server.ts` — server-side Supabase client
- `queries.ts` — all DB calls: `createGame`, `getGame`, `insertCompletion`, `getCompletions`
- **Requires `.env.local` to be set up first**

### Step 5 — Card component (`components/cards/Card.tsx`, `card.module.css`)
CSS layer stack (z-index 0→3): frame PNG → AI art → text → FX overlay
- Common: no effect
- Rare: `.shimmer` keyframe (diagonal gradient sweep)
- Legendary: `.parallax` with `mousemove` listener writing `--rotateX`/`--rotateY` CSS vars
- `isComplete` prop dims card + shows stamp overlay
- `CardBack.tsx` for flip animation (solid colored back)
- **Requires PNG frames to be in `public/frames/` first**

### Step 6 — GM wizard (`components/wizard/`, `app/create/page.tsx`)
4-step flow: title → add tasks (name + rarity picker) → pack settings → preview + generate
- Validate `cardsPerPack === sum(rarityDistribution)` before allowing generation
- On submit: POST to `/api/generate-game`

### Step 7 — Generate game API (`app/api/generate-game/route.ts`)
Server-side only:
1. Validate request body
2. Call `dealPacks()` from game-engine
3. For each card: call DALL-E 3, upload image to Supabase Storage `card-art/[gameId]/[cardId].png`
4. Save full game record to Supabase `games` table
5. Return `{ gameId, gmToken, playerLinks: [{ playerId, url }] }`

### Step 8 — Pack opening (`app/play/[gameId]/[playerId]/page.tsx`, pack components)
- Server Component fetches game from Supabase, finds player, passes cards as props
- `BoosterPack.tsx` — animated pack that tears open on click
- `PackReveal.tsx` — sequences card flips (face-down fan → tap each to reveal)
- After all flipped: show "View My Deck" → card grid todo list

### Step 9 — Player completion (`hooks/useCompletions.ts`)
- Reads completions from Supabase on mount
- `markComplete(cardId)` — optimistic UI + INSERT to completions table
- Completions are append-only (no delete/update in MVP)

### Step 10 — GM dashboard (`app/gm/[gameId]/page.tsx`, `hooks/useGMDashboard.ts`)
- Server Component validates `gmToken` query param against DB — redirect if invalid
- `GMDashboard.tsx` (Client Component) subscribes to Supabase Realtime on `completions`
- Per-player rows with mini card chips, overall progress bar

### Step 11 — Landing page (`app/page.tsx`)
Simple hero: title, tagline, "Create a Game" CTA → `/create`

---

## Architecture Reminders

- **Never** call `supabase.from(...)` directly in a component — use `lib/supabase/queries.ts`
- **Never** pass `gmToken` to any Client Component prop
- **Never** use `Math.random()` for pack dealing — use `mulberry32` from `lib/hash.ts`
- **Never** render a rarity label in CSS/HTML — it's baked into the PNG frames
- AI art is generated **once at game creation**, stored in Supabase Storage — player URLs never trigger generation
- `Card.tsx` is a pure presentational component — `isComplete` is a prop, card object is never mutated

---

## Dev Server Note

The preview dev server launch config is at `.claude/launch.json`. It uses full paths because the MCP process PATH doesn't include `/usr/local/bin`:
```json
{
  "runtimeExecutable": "/usr/local/bin/node",
  "runtimeArgs": ["/Users/simon.weng/Desktop/MyProject/TODO-TCG/node_modules/next/dist/bin/next", "dev"]
}
```
