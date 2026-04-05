# CLAUDE.md — TODO TCG Developer Reference

This file is the canonical reference for Claude Code when working on this project. Read it before making any changes.

---

## Project Overview

TODO TCG is a Next.js web app that gamifies task distribution using a trading card game metaphor. A Game Master creates tasks, assigns rarities manually, configures pack parameters, and generates shareable links. Players open animated booster packs revealing cards with AI-generated art and custom PNG frames. Players mark cards complete; the GM dashboard tracks progress in real time via Supabase Realtime.

See `PRD.md` for full product requirements.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 + CSS Modules for card effects |
| Database | Supabase (Postgres + Realtime + Storage) |
| Image generation | OpenAI DALL-E 3 (default) — swappable via env var |
| State (client) | React built-ins; Zustand only if prop drilling becomes deep |
| Animations | CSS keyframes (MVP) |
| Package manager | npm |
| Deployment | Vercel |

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, global styles, metadata)
│   ├── page.tsx                      # Landing page
│   ├── create/
│   │   └── page.tsx                  # GM game creation wizard (Client Component)
│   ├── gm/
│   │   └── [gameId]/
│   │       └── page.tsx              # GM dashboard (Server Component → passes data to client)
│   ├── play/
│   │   └── [gameId]/
│   │       └── [playerId]/
│   │           └── page.tsx          # Player pack opening + todo list
│   └── api/
│       └── generate-game/
│           └── route.ts              # API route: deal packs + generate AI art + save to Supabase
│
├── components/
│   ├── cards/
│   │   ├── Card.tsx                  # Single card — pure presentational, accepts Card + isComplete
│   │   ├── CardBack.tsx              # Card back face (shown during flip animation)
│   │   ├── CardGrid.tsx              # Grid of cards for todo list view
│   │   └── card.module.css           # Card frame positioning, shimmer, parallax keyframes
│   ├── pack/
│   │   ├── BoosterPack.tsx           # Animated pack shell (tap to tear)
│   │   ├── PackReveal.tsx            # Orchestrates sequential card flip reveal
│   │   └── pack.module.css           # Pack tear burst animation
│   ├── dashboard/
│   │   ├── GMDashboard.tsx           # GM overview — Realtime subscription lives here
│   │   ├── PlayerRow.tsx             # Single player status row
│   │   └── MiniCard.tsx              # Small card chip (rarity color, complete/incomplete state)
│   ├── wizard/
│   │   ├── GameSetupWizard.tsx       # Multi-step GM setup flow (manages step state)
│   │   ├── TaskInput.tsx             # Add task + manual rarity picker
│   │   ├── CardPoolPreview.tsx       # Summary before generation (X Common, Y Rare, Z Legendary)
│   │   ├── PackSettings.tsx          # Player count, cards per pack, rarity distribution, duplicates
│   │   └── PlayerLinkList.tsx        # Generated links list + copy buttons
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── ProgressBar.tsx
│
├── lib/
│   ├── types.ts                      # All shared TypeScript interfaces — single source of truth
│   ├── constants.ts                  # Flavor text pools, rarity config, defaults
│   ├── game-engine.ts                # Pure functions: pack dealing, validation, seeded shuffle
│   ├── flavor-text.ts                # Deterministic flavor text selection
│   ├── hash.ts                       # djb2 string hash + mulberry32 seeded PRNG
│   └── supabase/
│       ├── client.ts                 # Browser-side Supabase client (singleton)
│       ├── server.ts                 # Server-side Supabase client (for Server Components / API routes)
│       └── queries.ts                # ALL Supabase calls — no component imports supabase directly
│
├── hooks/
│   ├── useCompletions.ts             # Player: mark complete + sync to Supabase
│   └── useGMDashboard.ts             # GM: Realtime subscription on completions table
│
├── public/
│   └── frames/
│       ├── common.png                # Card frame for Common rarity (user-provided)
│       ├── rare.png                  # Card frame for Rare rarity (user-provided)
│       └── legendary.png             # Card frame for Legendary rarity (user-provided)
│
├── styles/
│   └── globals.css                   # Tailwind base + CSS custom properties
│
├── .env.local                        # Environment variables (never committed)
├── tailwind.config.ts
├── tsconfig.json                     # Strict mode on
└── next.config.ts
```

---

## Environment Variables

```bash
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server-side only, never NEXT_PUBLIC_

OPENAI_API_KEY=your-openai-key                    # Used server-side for DALL-E 3
IMAGE_GEN_PROVIDER=openai                         # "openai" | "stability" — future swap point
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm start            # Start production server
npm run typecheck    # tsc --noEmit (no emit, just type check)
npm run lint         # next lint
```

---

## Key Architectural Patterns

### 1. Server vs Client Component Boundary

- **Server Components** (default, no directive): data fetching, GM token validation, passing initial data as props
- **Client Components** (`"use client"` at top): animations, interactivity, Realtime subscriptions, browser APIs
- Never fetch data in a Client Component's initial render if a Server Component parent can pass it as props
- Never use the browser Supabase client in a Server Component — use `lib/supabase/server.ts`

### 2. Game Engine Is Pure

All logic in `lib/game-engine.ts` must be:
- Pure functions with no side effects
- No React, no Supabase imports
- Deterministic: same inputs → same outputs (seeded PRNG)
- Primary export: `dealPacks(cardPool: Card[], settings: GameSettings, seed: string): Player[]`

### 3. Supabase Query Isolation

All Supabase calls live in `lib/supabase/queries.ts`. No component or hook calls `supabase.from(...)` directly. This ensures a single place to update if schema changes and consistent error handling.

### 4. Card Component Is Pure Presentational

`Card.tsx` must:
- Accept `card: Card` and `isComplete: boolean` as props
- Never fetch data
- Use CSS Modules (`card.module.css`) for rarity-specific styles, not Tailwind class conditionals
- The completion state is passed as a prop — the card object is never mutated to track completion

### 5. GM Token Security

- `gmToken` is validated server-side in the Server Component for `/gm/[gameId]`
- Never pass `gmToken` to any Client Component as a prop
- Never log it in the browser console
- The token lives only in the GM's bookmarked URL and the Supabase `games` table

### 6. Flavor Text Determinism

```typescript
// lib/flavor-text.ts
import { djb2Hash } from "./hash";
import { FLAVOR_POOLS } from "./constants";

export function getFlavorText(cardId: string, rarity: Rarity): string {
  const pool = FLAVOR_POOLS[rarity];
  return pool[djb2Hash(cardId) % pool.length];
}
```

Same card ID always returns the same flavor text across all devices without storing it in the database.

### 7. Seeded PRNG for Pack Dealing

`Math.random()` is not seedable. Use **mulberry32** seeded from `hash(gameId)`:

```typescript
// lib/hash.ts
export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

export function mulberry32(seed: number) {
  return function(): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

### 8. AI Art Generation Flow

Triggered server-side in `app/api/generate-game/route.ts`:

```
For each card in cardPool:
  1. Call OpenAI DALL-E 3 with prompt:
     "Fantasy trading card illustration of [taskName], epic detailed art, no text, no borders"
  2. Download image buffer
  3. Upload to Supabase Storage: bucket=card-art, path=[gameId]/[cardId].png
  4. Set card.artUrl = public storage URL
If generation fails for a card → set artUrl to "" (CSS gradient fallback in Card component)
```

Generation happens once, at game creation. Players load images from Supabase Storage CDN.

### 9. Card Compositing — CSS Layers

Cards are HTML/CSS layers, not server-side composited PNGs:

```
Position: relative (card container)
  z-index 0: <img src="/frames/[rarity].png" /> — full card background
  z-index 1: <img src={card.artUrl} />          — positioned in art-area cutout
  z-index 2: <div className={styles.textLayer}> — task name + flavor text
  z-index 3: <div className={styles.fxOverlay}> — shimmer or parallax overlay
```

The exact pixel positions of the art area and text area must be calibrated to match the PNG frame assets once they are dropped in.

---

## CSS Conventions

### Custom Properties (globals.css)

```css
:root {
  --color-common: #9CA3AF;
  --color-rare: #3B82F6;
  --color-legendary: #7C3AED;
  --color-gold: #F59E0B;
  --card-width: 240px;
  --card-height: 336px;
  --card-radius: 12px;

  /* Content positioning within card — see "Card Frame Assets" section for calibration */
  --art-area-top: 50px;
  --art-area-left: 20px;
  --art-area-width: 200px;
  --art-area-height: 150px;

  --text-area-top: 208px;
  --text-area-left: 20px;
  --text-area-width: 200px;
  --text-area-height: 108px;
}
```

### Rarity Effects (card.module.css)

```css
/* Rare: diagonal shimmer sweep */
.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmerSweep 2.5s ease-in-out infinite;
}

@keyframes shimmerSweep {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Legendary: parallax on mouse move (JS sets --rotateX and --rotateY CSS vars) */
.parallax {
  transform: perspective(600px)
    rotateX(var(--rotateX, 0deg))
    rotateY(var(--rotateY, 0deg));
  transition: transform 0.1s ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .shimmer::after { animation: none; }
  .parallax { transform: none; transition: none; }
}
```

The Legendary parallax is driven by a `mousemove` event listener in `Card.tsx` (Client Component) that writes `--rotateX` and `--rotateY` CSS custom properties.

### Tailwind Usage

- Use Tailwind for layout, spacing, typography, colors outside of card effects
- Use CSS Modules (`*.module.css`) for anything requiring `@keyframes`, `::after`, or complex `transform` chains
- No inline `style` props except for dynamic CSS custom property updates (parallax effect)

---

## TypeScript Conventions

- Strict mode is on. No `any`. No `@ts-ignore`.
- All shared types in `lib/types.ts` — import only from there
- Rarity is always `"common" | "rare" | "legendary"` — never a plain `string`
- Use `Result<T, E>` pattern for all async operations instead of throwing:

```typescript
// lib/types.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
```

- Use `type` for object shapes, `interface` for extendable contracts

---

## Supabase Setup

### 1. Create project at supabase.com

### 2. Run in SQL Editor:

```sql
create table games (
  id uuid primary key,
  gm_token text not null,
  title text not null,
  description text,
  card_pool jsonb not null,
  players jsonb not null,
  settings jsonb not null,
  status text default 'active',
  created_at timestamptz default now()
);

create table completions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id text not null,
  card_id text not null,
  completed_at timestamptz default now(),
  unique(game_id, player_id, card_id)
);

-- RLS: open read/insert for MVP
alter table games enable row level security;
alter table completions enable row level security;

create policy "public read games" on games for select using (true);
create policy "public insert games" on games for insert with check (true);
create policy "public read completions" on completions for select using (true);
create policy "public insert completions" on completions for insert with check (true);
```

### 3. Storage bucket:
- Name: `card-art`
- Public: true
- Enable Realtime on the `completions` table in Supabase Dashboard → Database → Replication

---

## Card Frame Assets

Drop PNG frame files here before implementing the Card component:

```
public/frames/common.png
public/frames/rare.png
public/frames/legendary.png
```

### Frame Design Notes (from reviewed assets)

The frames have the following characteristics — important for Card component implementation:

- **Rarity badge is baked into the PNG** — the COMMON / RARE / LEGENDARY label is already rendered in the frame image (top-left corner). Do NOT render a separate rarity label in CSS or HTML; it would duplicate what's in the PNG.
- **Full white interior** — the entire card interior is blank white. There is no pre-cut art area or text area in the frame. We define our own content layout within the white space.
- **Border width** — the frame border occupies approximately 8–10% on each side.
- **Badge position** — top-left area, approximately 16px from left and 16px from top. Content should not overlap this area.

### Suggested Content Layout Within White Interior

```
Card: 240px × 336px

  y=0   ┌─────────────────────────┐
        │  [frame border ~20px]   │
  y=20  │  [badge in PNG ~30px]   │  ← leave clear, baked into PNG
  y=50  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
        │                         │
        │    AI Art Area          │  height: ~150px
        │    (object-fit: cover)  │
        │                         │
  y=200 ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
        │  Task Name (bold)       │  ~18px font
        │  ─────────────────      │
        │  Flavor text (italic)   │  ~11px font
        │  (2–3 lines max)        │
  y=316 ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
        │  [frame border ~20px]   │
  y=336 └─────────────────────────┘
```

### CSS Custom Properties to Calibrate

After dropping in the PNGs, verify these values in `globals.css` visually align with the frames:

```css
:root {
  /* Art area — starts below the badge */
  --art-area-top: 50px;
  --art-area-left: 20px;
  --art-area-width: 200px;
  --art-area-height: 150px;

  /* Text area — below art */
  --text-area-top: 208px;
  --text-area-left: 20px;
  --text-area-width: 200px;
  --text-area-height: 108px;
}
```

---

## Implementation Order

Build in this order to enable end-to-end testing at each step:

1. `lib/types.ts` — data model foundation
2. `lib/hash.ts` + `lib/game-engine.ts` — pure logic, testable immediately
3. `lib/flavor-text.ts` + `lib/constants.ts` — flavor text pools
4. `lib/supabase/client.ts` + `server.ts` + `queries.ts` — persistence layer
5. Drop in PNG frame assets → calibrate CSS variables
6. `components/cards/Card.tsx` + `card.module.css` — all three rarities, complete/incomplete states
7. `components/wizard/` — GM creation wizard
8. `app/api/generate-game/route.ts` — AI art generation + pack dealing + Supabase save
9. `app/play/[gameId]/[playerId]/page.tsx` + pack animation components
10. `hooks/useCompletions.ts` — player completion sync
11. `app/gm/[gameId]/page.tsx` + `hooks/useGMDashboard.ts` — GM dashboard + Realtime
12. `app/page.tsx` — landing page
13. `app/create/page.tsx` — wire wizard to API route

---

## Common Pitfalls

- **Seeded shuffle**: Never use `Math.random()` for pack dealing — use `mulberry32` from `lib/hash.ts`
- **gmToken on client**: The GM token must never appear in any Client Component prop or rendered HTML. Validate it in the Server Component and gate access there.
- **Card component purity**: `isComplete` is a prop, not derived from the card object. The card object is immutable after creation.
- **Supabase client vs server**: Browser client (`lib/supabase/client.ts`) for Client Components and hooks. Server client (`lib/supabase/server.ts`) for Server Components and API routes.
- **AI art at creation time**: Generate and store art during game creation, not when players load. Player URLs should never trigger image generation.
- **Art area calibration**: The CSS position of the art area is hardcoded to match the PNG frames. If frames change, update `globals.css` custom properties — do not add per-card overrides.
- **Completion is append-only**: Never `UPDATE` or `DELETE` from the `completions` table in MVP. Un-completing is a Phase 2 feature.
- **Validate before generating**: `cardsPerPack === sum(rarityDistribution)` and bucket sizes must be checked in the wizard UI before calling the API route. Surface clear error messages.
