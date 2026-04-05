# PRD: TODO TCG — Trading Card Game Todo Manager

**Version:** 1.0
**Date:** 2026-04-05
**Status:** Draft

---

## 1. Product Overview

### 1.1 Summary

TODO TCG is a web application that transforms chores and tasks into a collectible trading card game experience. A Game Master (GM) creates a game session by entering tasks, manually tagging each with a rarity tier, and configuring pack distribution rules. The system generates unique shareable URLs for each player. Players open their booster pack through an animated card-reveal experience, receive a hand of task-cards styled like trading cards (with custom PNG frames and AI-generated art), and work through their personal todo list. As players complete tasks, the GM's dashboard updates in real time via Supabase Realtime.

### 1.2 Problem Statement

Assigning chores or tasks in a household, classroom, or small team suffers from two problems: unfairness in distribution and zero engagement. A random, game-like distribution mechanism with visual flair transforms obligation into something players look forward to. The rarity system creates perceived value around harder or more unusual tasks.

### 1.3 Target Audience

- Families assigning household chores (primary)
- Teachers assigning student tasks or classroom jobs
- Small teams running lightweight sprint-style task games
- Friend groups running event planning or party prep tasks

### 1.4 Success Metrics (MVP)

- A GM can create and share a full game in under 3 minutes
- A player can open their pack and view their card list in under 30 seconds
- AI-generated card art is produced at game-creation time (not on player load)
- Real-time GM dashboard reflects player completions within 2 seconds

---

## 2. User Roles

### 2.1 Game Master (GM)

The GM is the session creator and administrator. Responsibilities:

- Enter all tasks that will become cards
- **Manually assign rarity** to each card (Common / Rare / Legendary)
- Set game parameters (number of players, cards per pack, allow/disallow duplicate cards across players)
- Trigger game generation, which:
  - Calls the image generation API for each card's art area
  - Stores generated images in Supabase Storage
  - Deals packs and saves the game record to Supabase
  - Produces one shareable URL per player
- Monitor the GM dashboard for per-player and overall task completion
- Optionally reset or regenerate the game

The GM does not receive a pack.

### 2.2 Player

The player is an end-user who receives a unique link. Responsibilities:

- Open their booster pack through the animated reveal flow
- View their personal card collection (their todo list)
- Mark individual cards as complete
- View their completion progress

Players do not see other players' cards or progress in MVP.

---

## 3. Core User Flows

### 3.1 GM: Create Game

```
Landing Page → "Create New Game"
  → Step 1: Enter game title (optional description)
  → Step 2: Add tasks
              - Task name (text input)
              - Manual rarity picker: [Common] [Rare] [Legendary]
              - Repeat until card pool is complete
  → Step 3: Set parameters
              - Number of players (1–20)
              - Cards per pack (e.g. 5)
              - Rarity distribution per pack (e.g. 3 Common, 1 Rare, 1 Legendary)
              - Allow duplicate cards across packs? (Yes/No)
  → Step 4: Preview card pool summary (X Common, Y Rare, Z Legendary)
            Validation: enough cards to fulfill all packs
  → "Generate Game" → loading state (AI art generation in progress)
  → Game Generated Screen
      - One link per player with copy-to-clipboard
      - "Go to GM Dashboard" button
```

### 3.2 Player: Open Pack

```
Player opens unique URL /play/[gameId]/[playerId]
  → Pack Opening Screen
      - Animated booster pack displayed
      - Tap/click to tear open
      - Cards fly out face-down in a fan
      - Tap each card to flip face-up (one at a time)
      - Each card reveals:
          [1] PNG frame (rarity-appropriate asset)
          [2] AI-generated illustration in the art area
          [3] Task name as card title
          [4] Flavor text (italic, deterministic)
          [5] Rarity CSS effect (none / shimmer / parallax)
      - "View My Deck" appears after all cards flipped
  → Player Todo List (Card Collection View)
      - Card grid
      - Each card has a "Mark Complete" button
      - Completed cards dim + show a completion stamp overlay
      - Progress bar (X of Y complete)
```

### 3.3 Player: Mark Complete → GM Sync

```
Player clicks "Mark Complete" on a card
  → Optimistic UI: card visually completes immediately
  → INSERT into Supabase completions table
  → Supabase Realtime notifies GM dashboard
  → GM dashboard card chip updates to completed state
```

### 3.4 GM: Dashboard

```
GM visits /gm/[gameId]?token=[gmToken]
  → Server validates gmToken against games table
  → Dashboard displays:
      - Game title + overall completion %
      - Per-player row:
          - Player label
          - X / Y cards complete
          - Mini-card chips (color-coded by rarity, greyed if complete)
  → Supabase Realtime subscription on completions table
  → Live updates as players mark cards done
  → "Regenerate Game" button (with confirmation)
```

---

## 4. Feature List

### 4.1 MVP Features

| Feature | Description |
|---|---|
| GM task entry | Add/remove tasks, set task name, assign rarity manually |
| Rarity tiers | Common, Rare, Legendary — each with distinct PNG frame + CSS effect |
| Game parameters | Player count, cards per pack, rarity distribution per pack, allow cross-player duplicates |
| AI card art | Image generation API called per card at game-creation time; images stored in Supabase Storage |
| Card CSS effects | Common: none · Rare: shimmer keyframe · Legendary: parallax mouse-tracking effect |
| Seeded pack dealing | Deterministic distribution using gameId as PRNG seed |
| Shareable player URLs | `/play/[gameId]/[playerId]` — no state in URL, game fetched from Supabase |
| Pack opening animation | Booster pack tear → card fan → individual card flip (CSS 3D transform) |
| Flavor text | Static pool per rarity, deterministically assigned via `hash(cardId) % poolSize` |
| Player todo list | Card grid, mark-complete, completion stamp overlay, progress bar |
| GM dashboard | Per-player rows, mini-card chips, overall progress |
| Realtime sync | Supabase Realtime on completions table → GM dashboard live updates |
| GM token auth | gmToken in URL validated server-side; never exposed to client |
| Responsive design | Mobile + desktop |
| Reduced motion support | All animations respect `prefers-reduced-motion` |

### 4.2 Phase 2 Features

| Feature | Description |
|---|---|
| Player naming | Players enter their own name on first visit |
| Task categories | Tag tasks with a type (Cleaning, Cooking, etc.) → card type icon |
| Leaderboard | Optional completion leaderboard across players |
| QR code links | GM dashboard generates QR codes per player link |
| Expiry / due dates | Cards carry a due date; overdue cards show visual indicator |
| Multiple rounds | GM issues a second round of packs to same players |
| Export to PDF | Print-ready card sheet |
| Player un-complete | Allow players to undo a completion (requires separate table design) |
| Pack sharing | Shareable screenshot/GIF of pack opening moment |

### 4.3 Out of Scope (MVP)

- User accounts / authentication system
- Card trading between players
- Push notifications
- Native mobile apps
- Leaderboard

---

## 5. Data Model

```typescript
type Rarity = "common" | "rare" | "legendary";

interface Card {
  id: string;              // crypto.randomUUID()
  taskName: string;        // "Wash the dishes"
  rarity: Rarity;          // GM-assigned
  flavorText: string;      // Deterministically selected from static pool
  artUrl: string;          // Supabase Storage URL for AI-generated image
  createdAt: string;       // ISO timestamp
}

interface Player {
  id: string;              // crypto.randomUUID()
  label: string;           // "Player 1", "Player 2", etc.
  packCards: string[];     // Array of Card IDs dealt to this player
}

interface GameSettings {
  playerCount: number;             // 1–20
  cardsPerPack: number;            // Must equal sum of rarityDistribution
  allowCrossPlayerDuplicates: boolean;
  rarityDistribution: {
    common: number;
    rare: number;
    legendary: number;
  };
}

interface Game {
  id: string;              // crypto.randomUUID() — appears in all URLs
  gmToken: string;         // crypto.randomUUID() — GM auth, server-side only
  title: string;
  description?: string;
  cardPool: Card[];        // All cards created by GM
  players: Player[];       // All player records (completedCards not stored here)
  settings: GameSettings;
  status: "active" | "completed";
  createdAt: string;
}

// Supabase completions table — append-only event log
interface Completion {
  id: string;
  gameId: string;
  playerId: string;
  cardId: string;
  completedAt: string;
}
```

---

## 6. Card Visual Specification

### 6.1 Card Dimensions

Standard TCG aspect ratio: **240px × 336px** (5:7). Scales up to 300px × 420px on desktop.

### 6.2 Layered Rendering (HTML/CSS stacking)

Cards are rendered as CSS layers — no server-side image compositing:

```
z-index 3: CSS rarity effect overlay (shimmer / parallax)
z-index 2: Text layer — task name (title area) + flavor text (text area)
z-index 1: AI-generated image (positioned in art-area cutout)
z-index 0: PNG frame (background-image, covers full card)
```

The PNG frames define the layout. The art area and text area positions are hardcoded in CSS to align with the frame design. The user will provide frames as:
- `public/frames/common.png`
- `public/frames/rare.png`
- `public/frames/legendary.png`

### 6.3 CSS Effects Per Rarity

| Rarity | Effect | Implementation |
|---|---|---|
| Common | None | No additional CSS |
| Rare | Shimmer | `@keyframes shimmer` — diagonal gradient sweep over the card |
| Legendary | Parallax | Mouse-tracking `transform: rotateX() rotateY()` with CSS perspective; subtle holographic gradient follows cursor |

All effects wrap in `@media (prefers-reduced-motion: reduce) { animation: none; transform: none; }`.

### 6.4 Flavor Text Pool

Stored as a static constant in `lib/constants.ts`. Selection: `flavorPool[rarity][hash(card.id) % flavorPool[rarity].length]`.

**Common (examples):**
- "Every epic quest begins with a single step."
- "The humble task, completed faithfully."
- "Strength is built through small consistencies."

**Rare (examples):**
- "Few dare attempt it. Fewer succeed."
- "A challenge worthy of your skills."
- "This task holds power beyond its appearance."

**Legendary (examples):**
- "Of all the heroes across all the realms, only you were chosen."
- "The stuff of legend. The kind songs are written about."
- "Complete this, and your name shall echo through the ages."

### 6.5 AI Art Generation

- Called server-side during game creation (Next.js Server Action or API Route)
- Prompt template: `"Fantasy trading card illustration of [taskName], epic style, detailed, no text"`
- Images stored in Supabase Storage bucket `card-art` at path `[gameId]/[cardId].png`
- Public URLs stored in `Card.artUrl`
- If generation fails for a card, fallback to a rarity-colored gradient placeholder

---

## 7. Pack Distribution Algorithm

### 7.1 Dealing Logic

```
Input: cardPool (Card[]), settings (GameSettings), seed (gameId string)

1. Separate pool into buckets: commons[], rares[], legendaries[]
2. Validate pool has enough cards (see 7.2)
3. Shuffle each bucket using seeded PRNG (seed = hash(gameId))
4. For each player i in [0..playerCount):
     deal settings.rarityDistribution.legendary cards from legendaries
     deal settings.rarityDistribution.rare cards from rares
     deal settings.rarityDistribution.common cards from commons
     if allowCrossPlayerDuplicates = false: remove dealt cards from buckets
5. If any bucket runs empty mid-deal: promote from next rarity down (fallback)
6. Return Player[] with packCards populated
```

### 7.2 Validation Rules

- `cardsPerPack === rarityDistribution.common + rare + legendary`
- If duplicates disallowed: each bucket must have `≥ rarityDistribution[rarity] × playerCount` cards
- If duplicates allowed: each bucket must have `≥ rarityDistribution[rarity]` cards
- Warning surfaced in wizard UI if legendary pool < playerCount (when duplicates disallowed)

---

## 8. URL Scheme

| Route | Audience | Contents |
|---|---|---|
| `/` | Public | Landing page |
| `/create` | GM | Multi-step game creation wizard |
| `/gm/[gameId]?token=[gmToken]` | GM only | Dashboard (token validated server-side) |
| `/play/[gameId]/[playerId]` | Player | Pack opening + todo list |

---

## 9. Technical Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS Modules for card effects |
| Database | Supabase (Postgres + Realtime + Storage) |
| Image generation | OpenAI DALL-E 3 (or Stability AI — configurable via env var) |
| State (client) | React built-ins; Zustand if cross-component sharing becomes complex |
| Animations | CSS keyframes (MVP) |
| Deployment | Vercel |

### 9.1 Supabase Schema

```sql
create table games (
  id uuid primary key,
  gm_token text not null,
  title text not null,
  description text,
  card_pool jsonb not null,   -- Card[]
  players jsonb not null,     -- Player[]
  settings jsonb not null,    -- GameSettings
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

-- Storage bucket: card-art (public)
-- Path pattern: [gameId]/[cardId].png
```

### 9.2 Row Level Security (MVP)

```sql
alter table games enable row level security;
alter table completions enable row level security;

create policy "public read games" on games for select using (true);
create policy "public insert games" on games for insert with check (true);
create policy "public read completions" on completions for select using (true);
create policy "public insert completions" on completions for insert with check (true);
```

---

## 10. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Pack opening animation | 60fps on modern mobile |
| AI art generation per card | < 15s (shown as loading state during game creation) |
| GM dashboard Realtime latency | < 2s from player action |
| Max card pool size | 100 cards per game (MVP) |
| Max players per game | 20 (MVP) |
| Browser support | Last 2 versions of Chrome, Safari, Firefox, Edge |
| Accessibility | Cards readable at 16px min; animations respect `prefers-reduced-motion` |

---

## 11. Open Questions / Assumptions

| Question | Assumption for MVP |
|---|---|
| Can a player re-open their pack animation? | No — once opened, card list shown directly |
| Can the GM edit cards after generation? | No — regenerate the whole game |
| What if a player loses their URL? | GM must re-share; no account recovery |
| Can a player un-complete a card? | No — completions are append-only in MVP |
| Should games auto-expire? | No — rows persist indefinitely in MVP |
| Which image gen API? | OpenAI DALL-E 3 as default; swap via `IMAGE_GEN_PROVIDER` env var |
