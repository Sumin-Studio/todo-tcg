# DESIGN.md — TODO TCG Visual Design Reference

Extracted from Figma file `EHTqsQcL2mXQZXgTQvLadE`. This is the canonical source of truth for all UI implementation decisions.

---

## Design Language

**Aesthetic**: Minimalist, almost entirely achromatic. The palette is grayscale except for rarity badge accents and card art. The overall feel is soft neomorphic — panels appear as raised slabs through inner white top-edge highlights.

**Typography voice**: All UI text uses monospace fonts. This gives the app a terminal / retro-computing character that contrasts with the playful card game content.

**Mode**: Light mode only.

---

## Color Palette

| Token | Hex / Value | Usage |
|---|---|---|
| `bg-page` | `#EEEEEE` | Full-page background |
| `bg-panel-from` | `#FAFAFA` | Panel gradient start (top) |
| `bg-panel-to` | `#E2E2E2` | Panel gradient end (bottom) |
| `bg-input` | `#FFFFFF` | Input / textarea fill |
| `border` | `#D2D2D2` | All UI borders (panels, inputs) |
| `border-button` | `#B2B2B2` | Button outer border |
| `btn-from` | `#BEBEBE` | Button gradient start (top) |
| `btn-to` | `#FBFBFB` | Button gradient end (bottom) |
| `text-heading` | `#535353` | Logo, section headings |
| `text-body` | `#202020` | Labels, body text |
| `text-placeholder` | `#858585` | Input placeholder text |
| `text-button` | `#070707` | Button label text |
| `badge-legendary` | `rgba(255, 158, 22, 0.5)` | Legendary rarity badge fill |
| `badge-rare` | `rgba(255, 255, 255, 0.35)` | Rare rarity badge fill (glass) |
| `badge-common` | `rgba(255, 255, 255, 0.25)` | Common rarity badge fill (glass) |

### CSS Custom Properties

Add these to `globals.css` `:root`:

```css
:root {
  --bg-page: #EEEEEE;
  --bg-panel-from: #FAFAFA;
  --bg-panel-to: #E2E2E2;
  --bg-input: #FFFFFF;
  --border: #D2D2D2;
  --border-button: #B2B2B2;
  --btn-from: #BEBEBE;
  --btn-to: #FBFBFB;
  --text-heading: #535353;
  --text-body: #202020;
  --text-placeholder: #858585;
  --text-button: #070707;
}
```

---

## Typography

| Role | Font | Weight | Size | Line Height | Notes |
|---|---|---|---|---|---|
| Logo / Title | Anonymous Pro | Bold (700) | 68px | 75% (51px) | `TO-DO` on landing page |
| Subtitle | IBM Plex Mono | Regular (400) | 16px | 130% | Tagline below logo |
| Label | IBM Plex Mono | Regular (400) | 13px | 130% | Input field labels |
| Input text | IBM Plex Mono | Regular (400) | 16px | 130% | Values inside inputs |
| Button | IBM Plex Mono | Regular (400) | 21px | 130% | CTA buttons |
| Card task name | Helvetica Neue | Bold (700) | ~7px design / scale to ~16px | — | Inside card component |
| Card flavor text | Courier Prime | Regular (400) | ~6px design / scale to ~11px | — | Inside card component |

**Font loading**: IBM Plex Mono and Anonymous Pro are available on Google Fonts. Courier Prime is also on Google Fonts. Load all in `app/layout.tsx`.

```tsx
// app/layout.tsx — next/font/google
import { IBM_Plex_Mono, Anonymous_Pro } from 'next/font/google'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

const anonymousPro = Anonymous_Pro({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-title',
})
```

---

## Component Specs

### Panel

The primary container surface. Used for the main form card on the landing page and both columns on the game setup page.

```
Background:  linear-gradient(to bottom, #FAFAFA, #E2E2E2)
Border:      3px solid #D2D2D2
Border radius: 25px
Inner shadow: inset 0 14px 0 0 rgba(255, 255, 255, 1)   ← top-edge white highlight
```

```css
.panel {
  background: linear-gradient(to bottom, #FAFAFA, #E2E2E2);
  border: 3px solid #D2D2D2;
  border-radius: 25px;
  box-shadow: inset 0 14px 0 0 rgba(255, 255, 255, 1);
}
```

### Input Field

Used for single-line numeric inputs (player count, cards per pack).

```
Background:   #FFFFFF
Border:       3px solid #D2D2D2  (outside / box-shadow, NOT border, to avoid layout shift)
Border radius: 7px
Height:       46px
Padding:      0 16px (horizontal only — vertical centering via flexbox)
Font:         IBM Plex Mono Regular 16px
Text color:   #858585 (placeholder) / #202020 (value)
Text align:   center
```

```css
.input {
  background: #FFFFFF;
  box-shadow: 0 0 0 3px #D2D2D2;
  border-radius: 7px;
  height: 46px;
  font-family: var(--font-mono);
  font-size: 16px;
  text-align: center;
  color: #202020;
}
.input::placeholder {
  color: #858585;
}
```

### Textarea

Used for the task list entry on the landing page.

```
Background:   #FFFFFF
Border:       1px solid #D2D2D2
Border radius: 7px
Padding:      16px
Font:         IBM Plex Mono Regular 16px
Placeholder:  #858585
```

### Button (Pill)

Primary CTA. All action buttons share this style. Examples: "Generates Cards →", "+ Create", "Play →".

```
Background:   linear-gradient(to bottom, #BEBEBE, #FBFBFB)
Border:       2px solid #B2B2B2  (outside)
Border radius: 39px  (full pill)
Padding:      20px 28px
Font:         IBM Plex Mono Regular ~21px
Text color:   #070707
Inner shadow: inset 0 9px 5px rgba(255, 255, 255, 1)   ← top white glow
```

```css
.btn {
  background: linear-gradient(to bottom, #BEBEBE 0%, #FBFBFB 100%);
  border-radius: 39px;
  padding: 20px 28px;
  font-family: var(--font-mono);
  font-size: 21px;
  color: #070707;
  outline: 2px solid #B2B2B2;
  outline-offset: 0px;
  box-shadow: inset 0 9px 5px rgba(255, 255, 255, 1);
  cursor: pointer;
}
```

### Rarity Badge (on Card)

Small pill overlay in the top-left corner of each card. Baked into the PNG frame for Common/Rare/Legendary, but the badge component is needed for UI previews.

```
Legendary:  rgba(255, 158, 22, 0.5)  + backdrop-filter: blur(4px)
Rare:       rgba(255, 255, 255, 0.35) + backdrop-filter: blur(4px)
Common:     rgba(255, 255, 255, 0.25) + backdrop-filter: blur(4px)
Border radius: ~12px (pill)
Padding:    2px 4px
Font:       Helvetica Neue Bold, white, ~4.5px (scales to ~10px in full-size card)
Letter spacing: -0.06em
```

### Card Thumbnail (in Grid)

The card as displayed in the game setup preview and GM dashboard mini views.

```
Background:   #E0E0E0
Border:       PNG frame overlay (common.png / rare.png / legendary.png)
Border radius: ~13px
Drop shadow:  0 6px 6px rgba(0, 0, 0, 0.25)
Slight rotation: ±0.08deg on alternating cards (organic scatter feel)
```

---

## Page Layouts

### Landing Page (`app/page.tsx`)

```
┌──────────────────────────────────────────────────┐
│                   #EEEEEE bg                     │
│                                                  │
│              [decorative tick marks]             │
│                                                  │
│                   TO-DO                          │  Anonymous Pro Bold 68px #535353
│                                                  │
│      gamble and trade cards and finally          │  IBM Plex Mono 16px #2C2C2C center
│         get some s*** done for once              │
│                                                  │
│  ┌── Panel (max-w ~795px, centered) ───────────┐ │
│  │ ┌─────────────────────────────────────────┐ │ │
│  │ │  Enter your chores...          textarea │ │ │  ~199px tall
│  │ └─────────────────────────────────────────┘ │ │
│  │                                             │ │
│  │  How many players                           │ │  label 13px
│  │  ┌──────────────┐         ┌──────────────┐ │ │
│  │  │      1       │         │Generates  →  │ │ │  input + button same row
│  │  └──────────────┘         └──────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Notes:**
- The panel is a single horizontal row at the bottom: left-aligned input, right-aligned button
- All content (title + panel) is vertically centered in the viewport
- Decorative tick marks are SVG/CSS lines scattered near the title — hand-drawn feel

### Game Setup Page (`app/create/page.tsx`)

```
┌──────────────────────────────────────────────────────────────┐
│                        #EEEEEE bg                            │
│                                                              │
│  ┌── Left Panel (~315px) ──┐  ┌── Right Panel (flex-1) ───┐ │
│  │ How many players        │  │                           │ │
│  │ ┌─────────────────────┐ │  │  [Card] [Card] [Card] ... │ │
│  │ │         3           │ │  │                           │ │
│  │ └─────────────────────┘ │  │  [Card] [Card]            │ │
│  │                         │  │                           │ │
│  │ Cards per pack          │  │                           │ │
│  │ ┌─────────────────────┐ │  │                           │ │
│  │ │         5           │ │  │                           │ │
│  │ └─────────────────────┘ │  │                           │ │
│  │                         │  │                           │ │
│  │ [+ Create]  [Play →]    │  │                           │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Notes:**
- Two panels side by side with a gap (~24px) between them
- Left panel: fixed width ~315px, contains all form controls
- Right panel: flex-grow 1, contains card grid preview
- Buttons in left panel are side by side (flex row), not stacked
- Card grid uses `flex-wrap: wrap` with consistent gaps

---

## Decorative Elements

### Page Texture

A very subtle tiled texture (appears to be a halftone or noise pattern) is layered over the `#EEEEEE` background at **4% opacity**. Apply as a `::before` pseudo-element or background-image.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('/texture.png');  /* tiled noise/halftone */
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}
```

### Title Tick Marks

Small hand-drawn-style tick/dash marks scattered asymmetrically around the "TO-DO" title. These are thin black lines (~2px stroke, round caps) at various angles. Approximate positions relative to title center:

- Top-right cluster: 2–3 short diagonal lines
- Right cluster: 1–2 lines
- Bottom-right: 1 line

Implement as inline SVG absolute-positioned around the title, or as CSS `::before`/`::after` with `transform: rotate()`.

---

## Tailwind Config Additions

Add these to `tailwind.config.ts` to expose design tokens as Tailwind utilities:

```ts
theme: {
  extend: {
    colors: {
      page: '#EEEEEE',
      border: '#D2D2D2',
      'btn-border': '#B2B2B2',
      'text-heading': '#535353',
      'text-body': '#202020',
      'text-placeholder': '#858585',
      'text-btn': '#070707',
    },
    fontFamily: {
      mono: ['var(--font-mono)', 'monospace'],
      title: ['var(--font-title)', 'monospace'],
    },
    borderRadius: {
      panel: '25px',
      pill: '39px',
      input: '7px',
    },
    boxShadow: {
      panel: 'inset 0 14px 0 0 rgba(255,255,255,1)',
      btn: 'inset 0 9px 5px rgba(255,255,255,1)',
    },
  },
},
```

---

## What Is NOT in This Design (yet)

The Figma currently shows the landing page and game setup page only. The following screens are not yet designed — implement them consistently with the above tokens when ready:

- GM dashboard (`/gm/[gameId]`)
- Player pack opening (`/play/[gameId]/[playerId]`)
- Card flip / booster pack animation
- Card grid / todo list view
