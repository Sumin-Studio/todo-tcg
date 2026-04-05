# CONTEXT.md — Handoff for Next Claude Instance

Last updated: 2026-04-05
Status: Full implementation complete. Design styling does NOT match Figma — needs complete UI reskin.

---

## What Has Been Done

### 1. Full Implementation (by previous Claude instances)
Every file in the planned file structure exists and TypeScript passes clean (`npm run typecheck` → no errors):

**Lib layer (pure logic + data)**
- `lib/types.ts` — all interfaces: `Rarity`, `Card`, `Player`, `PackSettings`, `Game`, `Completion`, `Result<T,E>`
- `lib/hash.ts` — `djb2Hash` + `mulberry32` seeded PRNG
- `lib/game-engine.ts` — `dealPacks`, `generateGameId`, `generateGmToken`
- `lib/flavor-text.ts` — deterministic flavor text via `djb2Hash(cardId) % pool.length`
- `lib/constants.ts` — flavor text pools, `DEFAULT_PACK_SETTINGS`
- `lib/supabase/client.ts`, `server.ts`, `queries.ts` — full Supabase layer

**Components**
- `components/cards/Card.tsx`, `CardBack.tsx`, `CardGrid.tsx`, `card.module.css`
- `components/pack/BoosterPack.tsx`, `PackReveal.tsx`, `pack.module.css`
- `components/dashboard/GMDashboard.tsx`, `PlayerRow.tsx`, `MiniCard.tsx`
- `components/wizard/GameSetupWizard.tsx`, `TaskInput.tsx`, `PackSettings.tsx`, `CardPoolPreview.tsx`, `PlayerLinkList.tsx`
- `components/ui/Button.tsx`, `Input.tsx`, `Modal.tsx`, `ProgressBar.tsx`

**Pages + API**
- `app/page.tsx` — landing page
- `app/create/page.tsx` — GM game creation (wires to GameSetupWizard)
- `app/gm/[gameId]/page.tsx` — GM dashboard
- `app/play/[gameId]/[playerId]/page.tsx` + `PlayerPackView.tsx` — player pack opening
- `app/api/generate-game/route.ts` — AI art generation + pack dealing + Supabase save

**Hooks**
- `hooks/useCompletions.ts` — player completion sync
- `hooks/useGMDashboard.ts` — GM Realtime subscription

**Assets**
- `public/frames/common.png`, `rare.png`, `legendary.png` — card frame PNGs are in place

### 2. Image Generation Provider
Switched from DALL-E 3 → **qwen-image-2.0-pro** via Alibaba Cloud DashScope.
- API route uses `DASHSCOPE_API_KEY` env var
- Endpoint: `https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`
- Response path: `output.choices[0].message.content[0].image` (temp URL, expires 24h)
- Image is downloaded immediately and uploaded to Supabase Storage

### 3. Design Reference
`DESIGN.md` contains the full design spec extracted from Figma. Read it before touching any UI.

---

## Critical Issue: UI Does Not Match Figma Design

**The entire UI was built with a dark theme that does not match the Figma design.**

| What was built | What the Figma shows |
|---|---|
| Dark background `bg-gray-950` | Light gray background `#EEEEEE` |
| White text, violet accents | Near-black text `#202020`, no color accents |
| Generic sans-serif fonts | IBM Plex Mono + Anonymous Pro (monospace-first) |
| Standard rounded cards | Neomorphic panels with inner white shadow |
| Violet gradient buttons | Gray gradient pill buttons |

**The next task is a full UI reskin to match `DESIGN.md`.**

---

## What Needs To Be Done Next

### Priority 1 — UI Reskin (blocks everything visual)

Read `DESIGN.md` fully before starting. Key changes needed across ALL pages and components:

**`app/globals.css`**
- Replace `--background: #0a0a0a` / `--foreground: #ededed` with light theme tokens from DESIGN.md
- Add all CSS custom properties from DESIGN.md (panel gradient, border colors, etc.)
- Import IBM Plex Mono + Anonymous Pro via `next/font/google` in `app/layout.tsx`

**`app/layout.tsx`**
- Load fonts: `IBM_Plex_Mono` (weights 400, 700) + `Anonymous_Pro` (weight 700)
- Set `--font-mono` and `--font-title` CSS variables

**`app/page.tsx`** (landing page)
- Current: dark bg, violet gradient, generic heading
- Target: `#EEEEEE` bg, "TO-DO" in Anonymous Pro Bold 68px `#535353`, subtitle in IBM Plex Mono
- Single rounded panel (neomorphic) containing textarea + player count input + "Generates Cards →" pill button
- Decorative hand-drawn tick marks near title
- Very subtle texture overlay at 4% opacity

**`app/create/page.tsx`** (game setup)
- Current: dark bg, multi-step wizard centered in a small column
- Target: two-column layout — left panel (form inputs + buttons) + right panel (card preview grid)
- Both panels use neomorphic style from DESIGN.md

**All form inputs** (`components/ui/Input.tsx`, inline inputs)
- White fill, 3px `#D2D2D2` border (outside), 7px radius, 46px height, IBM Plex Mono 16px centered

**All buttons** (`components/ui/Button.tsx`)
- Gray gradient fill (`#BEBEBE` → `#FBFBFB`), 2px `#B2B2B2` outside border, 39px radius (pill)
- Inner white glow shadow, IBM Plex Mono ~21px, text `#070707`

**Panel container** (used in wizard, GM dashboard, etc.)
- `linear-gradient(to bottom, #FAFAFA, #E2E2E2)`, 3px `#D2D2D2` border, 25px radius
- `box-shadow: inset 0 14px 0 0 rgba(255,255,255,1)`

---

### Priority 2 — Supabase Setup (user action required)

The user still needs to:
1. Create a Supabase project at supabase.com
2. Run the SQL schema from `CLAUDE.md` in the SQL Editor
3. Enable Realtime on the `completions` table
4. Create `card-art` storage bucket (public: true)
5. Fill in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

`.env.local` already has `DASHSCOPE_API_KEY` filled in.

---

### Priority 3 — End-to-End Test

Once Supabase is set up:
1. `npm run dev`
2. Go to `/create` — create a game with 2–3 tasks
3. Verify AI art generates and uploads to Supabase Storage
4. Open a player link → verify pack opening flow
5. Complete a card → verify it syncs to GM dashboard via Realtime

---

## Key Decisions Already Made

| Decision | Choice |
|---|---|
| Image generation | qwen-image-2.0-pro via DashScope (Singapore region) |
| Rarity assignment | GM tags each card manually |
| Player sync | Supabase Realtime |
| Card frames | Custom PNG per rarity (files already in `public/frames/`) |
| Card effects | Common: none, Rare: shimmer, Legendary: parallax |
| Card rendering | HTML/CSS layers (not server composited PNG) |
| GM auth | gmToken in URL, validated server-side only, never passed to client |
| Completion | Append-only (`completions` table, no UPDATE/DELETE in MVP) |

---

## Architecture Reminders

- **Never** call `supabase.from(...)` directly in a component — use `lib/supabase/queries.ts`
- **Never** pass `gmToken` to any Client Component prop
- **Never** use `Math.random()` for pack dealing — use `mulberry32` from `lib/hash.ts`
- **Never** render a rarity label in CSS/HTML — it's baked into the PNG frames
- AI art is generated **once at game creation**, stored in Supabase Storage — player URLs never trigger generation
- DashScope image URLs expire in 24h — always download + re-upload to Supabase immediately
- `Card.tsx` is a pure presentational component — `isComplete` is a prop, card object is never mutated

---

## Dev Server

```bash
npm run dev       # localhost:3000
npm run typecheck # currently passes clean — keep it that way
```
