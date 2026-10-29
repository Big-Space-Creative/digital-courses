---
name: Pullse
description: Paid video-course platform — pulse-orange energy expressed through a soft, oversized-radius bento system.
colors:
  ink: "#1d1e1f"
  surface: "#f5f7f8"
  surface-soft: "#fefefe"
  accent: "#ff6b07"
  accent-400: "#ff6a07"
  accent-500: "#fb7502"
  accent-ink: "#582807"
typography:
  display:
    fontFamily: "Lexend, sans-serif"
    fontSize: "clamp(2.5rem, 1.5rem + 4vw, 5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Lexend, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Lexend, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lexend, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "40px"
  full: "9999px"
spacing:
  gutter: "24px"
  section: "clamp(4rem, 3rem + 5vw, 10rem)"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  bento-tile-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "32px"
  bento-tile-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "32px"
  bento-tile-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.xl}"
    padding: "32px"
  pill-bar:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    height: "56px"
  glass-card:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Pullse

## 1. Overview

**Creative North Star: "The Pulse Bento"**

Pullse is a paid video-course platform organized around a single motif: the pulse waveline (`PulseWave.tsx`) as a live, energetic signal. The system has two layers now. The **established layer** — one orange accent used sparingly, Lexend as the sole type family carrying hierarchy through scale rather than weight soup, and glassmorphism as a rare, purposeful overlay treatment — stays intact and unchanged from the original implementation. The **new layer**, sourced from the `new-design/` Figma exports, introduces an oversized-radius **bento grid**: flat, opaque, high-contrast tiles (light surface, near-black ink, pulse orange, and photo/screenshot fills) tiled edge-to-edge with generous gutters, each corner rounded far beyond the system's original 1rem default. This is the platform's new rounded style for hero, marketing, and showcase surfaces.

The two layers are deliberately kept apart, not merged: bento tiles are solid and shadow-free; glass stays translucent and blurred but is now scoped strictly to true overlays (modals, sticky headers, banners). Conflating them — a blurred bento tile, or a flat-opaque modal — breaks the read of which system a given surface belongs to.

**Key Characteristics:**
- One accent color (#FF6B07), used rarely — CTAs, active state, at most one bento tile per composition.
- Oversized corner radius is now the platform's signature shape language: nothing sharper than 12px, hero bento tiles at 40px.
- Bento tiles are flat and opaque — depth comes from color contrast and gutter spacing, never blur or shadow.
- Glass is demoted to overlay-only duty: it no longer competes with bento tiles as a general card treatment.
- The dark accent-ink canvas (#582807) is new vocabulary, reserved for hero/marketing sections — the admin and aluno app shell stays on the light surface background for long working and learning sessions.
- Lexend, one family, multiple weights — no second typeface introduced by the new direction.

## 2. Colors

A tight four-role palette, unchanged in hue by the new direction — the bento system reorganizes how these colors are *used*, not what they *are*.

### Primary
- **Pulse Orange** (`#FF6B07` / accent): CTAs, active nav, progress, the live/now state, one accent-fill bento tile per composition. The signature gradient (`linear-gradient(135deg, #FB7502 0%, #FF6A07 100%)`, tokens `accent-500` → `accent-400`) drives the primary button sweep and the hero pulse mark; it is not a general-purpose background.

### Secondary
- **Deep Signal Brown** (`#582807` / accent-ink): dual role. Original use is text/icon color *on* orange (never mid-grey there). New use, confirmed for this direction: the dark canvas background for hero and marketing bento showcases only — it does not spread into the admin or aluno app shell.

### Neutral
- **Ink** (`#1D1E1F`): primary text; also one of the four bento tile fills (dark tile, light text).
- **Surface** (`#F5F7F8`): default page background across the app shell; also the light bento tile fill.
- **Surface Soft** (`#FEFEFE`): raised/card surfaces, glass base tone.

### Named Rules
**The Rare Orange Rule.** The accent carries ≤10–15% of any given screen, bento grids included. One accent-fill tile per composition, not a repeating pattern.

**The Canvas Split Rule.** `--color-accent-ink` as a full-bleed page background is hero/marketing territory only. Admin (`/admin/*`) and aluno (`/aluno/*`) surfaces stay on `--color-surface`; the dark canvas never bleeds into the working app shell.

## 3. Typography

**Display Font:** Lexend (`next/font/google`, `--font-lexend`)
**Body Font:** Lexend

**Character:** A clean, geometric sans carries the whole system in multiple weights. It stays crisp and technical on purpose — a deliberate counterweight to the new direction's soft, oversized-radius shapes, so the type doesn't read as equally "rounded" as the containers around it.

### Hierarchy
- **Display** (600, `clamp(2.5rem, 1.5rem + 4vw, 5rem)`, line-height 1.05, letter-spacing -0.02em): hero headlines, one per page.
- **Headline** (600, `clamp(1.75rem, 1.2rem + 2vw, 2.75rem)`, line-height 1.15): section titles, bento tile headlines.
- **Body** (400, 1rem, line-height 1.6): running copy, capped at 65–75ch.
- **Label** (500, 0.875rem, line-height 1.4): buttons, pills, nav items, tags.

### Named Rules
**The Scale-Contrast Rule.** Hierarchy is built through size and weight steps within one family, never a second typeface. If Figma ever specifies a display font distinct from Lexend, that's the one exception to reopen this rule.

## 4. Elevation

Two distinct depth languages coexist, deliberately unmixed:

1. **Bento tiles (new, flat).** Zero elevation — no `box-shadow`, no blur. Depth reads through solid color contrast between adjacent tiles (light / dark / accent / photo) and a generous gutter, not through shadow.
2. **Glass overlays (existing, now overlay-only).** True floating elevation via `backdrop-filter: blur()` plus a soft ambient shadow. Previously the default card treatment; now scoped to modals, sticky headers, banners, and at most one featured/active-state surface at a time.

### Shadow Vocabulary
- **Glass ambient** (`box-shadow: 0 8px 32px -12px color-mix(in oklab, var(--color-ink) 30%, transparent)`): the resting shadow under any `.glass` overlay.
- **Glass hover/focus** (`box-shadow: 0 18px 48px -16px color-mix(in oklab, var(--color-ink) 40%, transparent)`): deepens on hover/focus-within, paired with a 4px lift.

### Named Rules
**The Flat Bento Rule.** Bento tiles never receive `box-shadow` or `backdrop-filter`. If a surface needs elevation, it isn't a bento tile — it's a glass overlay, and belongs in that system instead.

## 5. Components

### Buttons
- **Shape:** full pill (`rounded: 9999px`) — unchanged by the new direction.
- **Primary:** `--gradient-pulse` background, white text, `.gradient-animate` slow sweep, `12px 24px` padding.
- **Hover / Focus:** `translateY(-2px)` lift on hover, always-visible `focus-visible:ring-2` in accent orange, 150ms ease-out.
- **Disabled:** 60% opacity, pointer-events none.

### Bento Tiles (signature component — new)
- **Corner Style:** xl radius (`40px`) — the flagship shape of the new direction, well above every other radius in the system.
- **Fills:** rotate through exactly four roles per grid — light (`--color-surface`), dark (`--color-ink`, light text), accent (`--color-accent`, `--color-accent-ink` text), and photo/screenshot (object-fit cover, masked to the same 40px radius). No other hues.
- **Background:** solid and opaque — see Elevation §4, no blur or shadow.
- **Border:** none.
- **Internal Padding:** 32px desktop, scales down at narrower breakpoints.
- **Grid Gutter:** 24px between tiles.

### Pills / Tags
- **Style:** full radius, ~48–56px height, solid accent or ink fill, white or accent-ink text. Used for stat bars and label bars inside bento hero collages, and for filter/status chips elsewhere in the app.

### Glass Cards / Containers (existing, scope narrowed)
- **Corner Style:** lg radius (`28px`) — raised from the prior flat `1rem`/16px so it stays visually distinct from, and clearly subordinate to, the new xl bento radius.
- **Background:** `.glass` / `.glass-strong` / `.glass-accent` tiers, unchanged recipe (`blur(16–28px) saturate(140–150%)`).
- **Border:** 1px light border (`color-mix(in oklab, white 55%, transparent)`) — required for edge legibility over light backdrops.
- **Usage:** modals, sticky headers, cookie banner, one featured/active card. Not the default treatment for standard content cards — those are bento tiles now.
- **Guardrail:** ≤3 simultaneously-blurred glass layers in viewport; opaque `@supports not` fallback required.

### Inputs / Fields
- **Style:** md radius (`20px`) under the new scale — up from the prior implicit default. 1px border in `color-mix(in oklab, var(--color-ink) 12%, transparent)`, `--color-surface-soft` background.
- **Focus:** 2px accent-orange ring, matching the button focus treatment.
- **Error / Disabled:** to confirm during implementation — no distinct treatment extracted from existing code yet.

### PulseWave (signature component — existing)
- The animated brand waveline (`src/components/brand/PulseWave.tsx`): stroke-dasharray draw-on plus a traveling bright "head," reduced-motion aware. Hero mark, loaders, section dividers. Sits independently of the bento grid — it is a line motif, not a tile.

## 6. Do's and Don'ts

### Do:
- **Do** build hero, marketing, and showcase surfaces as bento grids: xl-radius (40px), flat, opaque tiles in exactly four fills (light / dark / accent / photo), 24px gutter.
- **Do** reserve the dark accent-ink (#582807) canvas for hero/marketing sections and bento showcases; keep admin and aluno app-shell screens on `--color-surface`.
- **Do** keep glass (`.glass` / `.glass-strong` / `.glass-accent`) for true overlays only — modals, sticky headers, banners, one featured card at a time.
- **Do** use the full radius scale by role: sm 12px (inputs baseline, chips), md 20px (buttons, inputs, small cards), lg 28px (glass overlay cards), xl 40px (bento tiles), full (pills, tags, avatars).
- **Do** keep motion compositor-only (`transform`, `opacity`, `filter`, `clip-path`) with expo ease-out and a reduced-motion alternative for every animation, per the existing `globals.css` pattern.
- **Do** cap the accent orange at ≤10–15% of any screen, bento grids included.

### Don't:
- **Don't** apply `backdrop-filter` or translucency to bento tiles — they are flat and opaque; blur is an overlay-only signal now.
- **Don't** let the dark accent-ink canvas bleed into `/admin/*` or `/aluno/*` — those stay light for extended sessions.
- **Don't** use more than one accent-orange bento tile per composition — the Rare Orange Rule holds inside the bento grid too.
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe.
- **Don't** clip a gradient to text (`background-clip: text`) outside the existing `.text-gradient` utility's narrow, single-hero-word use — never body copy.
- **Don't** ship anything below the sm radius (12px) in new work — the old sharp-cornered default is retired.
