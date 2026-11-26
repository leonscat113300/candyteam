---
name: CandyGame Studio
colors:
  surface: '#151123'
  surface-dim: '#151123'
  surface-bright: '#3b364b'
  surface-container-lowest: '#0f0b1e'
  surface-container-low: '#1d192c'
  surface-container: '#211d30'
  surface-container-high: '#2c273b'
  surface-container-highest: '#363247'
  on-surface: '#e7defa'
  on-surface-variant: '#cbc3d6'
  inverse-surface: '#e7defa'
  inverse-on-surface: '#322e42'
  outline: '#948e9f'
  outline-variant: '#494453'
  surface-tint: '#cebdff'
  primary: '#cebdff'
  on-primary: '#390093'
  primary-container: '#7652d6'
  on-primary-container: '#f2eaff'
  inverse-primary: '#6944c8'
  secondary: '#d0bcff'
  on-secondary: '#38206f'
  secondary-container: '#4f3887'
  on-secondary-container: '#c0a7ff'
  tertiary: '#cebdff'
  on-tertiary: '#362070'
  tertiary-container: '#725eb0'
  on-tertiary-container: '#f2eaff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005d'
  on-primary-fixed-variant: '#5027af'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#22025a'
  on-secondary-fixed-variant: '#4f3887'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cebdff'
  on-tertiary-fixed: '#21025b'
  on-tertiary-fixed-variant: '#4d3988'
  background: '#151123'
  on-background: '#e7defa'
  surface-variant: '#363247'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an atmospheric, top-tier mobile entertainment aesthetic that bridges imaginative fantasy with Silicon Valley-grade digital product precision. Designed for an internationally renowned mobile game development studio, the visual architecture balances high-energy playfulness with executive-level studio craft.

The aesthetic philosophy fuses **Modern Glassmorphic Depth** with **Vibrant Tactile Luminescence**:
- **Atmospheric Gaming Immersion:** Deep violet spatial foundations simulate cinematic loading screens and rich in-game universes, abandoning cold, lifeless tech neutrals for energetic chromatic dark fields.
- **Controlled Playfulness:** Characterful geometry, luminous purple blooms, and high-gloss accents project joy and wonder without descending into juvenile clutter.
- **Premium Production Polish:** Translucent structural planes, precise border highlights, and refined typographic contrast signal engineering mastery, platform dependability, and AAA mobile craftsmanship.

## Colors

The palette is engineered around luminous purples floating above rich, layered obsidian-violet voids, prioritizing high contrast and neon visual cues.

- **Primary (`#7652D6`):** The signature electric violet. Used for high-impact action triggers, active states, key interactive indicators, and primary visual anchors.
- **Secondary (`#38206F`):** Deep royal purple. Serves as structural containment, inner glow backings, and supportive dimensional surfaces.
- **Tertiary / Accent (`#BDA7FF`):** Soft luminous lavender. Reserved for ambient highlights, glowing borders, active icon highlights, and sub-tier callouts.
- **Neutral Base (`#171326`):** The ultra-deep spatial background canvas, providing infinite depth while retaining a warm chromatic hue.
- **Surface Cards (`#1F1A35` & `#272143`):** Progressive elevation planes creating modular dimensionality for game showcases, studio metrics, and interactive cards.
- **Typography & Content Values:**
  - High-Emphasis Content: `#FFFFFF` (pure white for headlines and key stats).
  - Low-Emphasis / Secondary Text: `#77718B` (muted lavender-grey for secondary body and metadata).
  - Inverse Text: `#252033` (used when rendering over pale lavender tags or bright badges).
  - Light Background Context: `#F8F6FF` (utilized exclusively in external light-mode documents or whitepaper embeds).

## Typography

The typographic hierarchy combines the expressive, tech-forward character of **Space Grotesk** with the utilitarian precision of **Inter**.

- **Display & Headlines (Space Grotesk):** Provides structured playfulness, game-culture momentum, and bold modernism. Headlines benefit from tight negative tracking (`-0.02em` to `-0.03em`) to create dense, impactful title locks.
- **Body & Functional Labels (Inter):** Maximizes readability across all screen densities. Maintains clean optical clarity for production credits, technical game mechanics, and UI labels.
- **Scale Rules:** Headings larger than 32px automatically compress into their mobile variants below 768px viewports to prevent awkward line breaks and layout collapse.

## Layout & Spacing

The layout is built upon an 8pt modular system framed inside a 12-column responsive fluid grid.

- **Desktop (1024px+):** Max width container capped at 1280px with a 12-column grid, `gutter` set to `1.5rem` (24px), and canvas `margin` at `2.5rem` (40px). Feature cards span 4, 6, or 12 columns.
- **Tablet (768px – 1023px):** 8-column layout with `1.5rem` gutters and `2rem` outer margins. Multi-column showcase cards compress into 2-column pairs.
- **Mobile (< 768px):** 4-column layout with `1rem` (16px) gutters and `1.25rem` (20px) outer margins. Multi-column card sets stack vertically or convert into horizontal kinetic carousels.
- **Vertical Cadence:** Component interiors use `space-sm` and `space-md`, while section separation defaults to `space-xl` scaled up with dynamic section multipliers (up to 5rem) for wide screens.

## Elevation & Depth

Visual hierarchy uses a layered, luminous dark-mode paradigm combining surface tiers, glassmorphism, and colored photonic blooms:

- **Tier 0 (Canvas):** Pure `#171326`. The deep cosmic void foundation.
- **Tier 1 (Surface Default):** `#1F1A35` with an ultra-fine translucent top border highlight: `1px solid rgba(189, 167, 255, 0.12)`.
- **Tier 2 (Surface Elevated / Cards):** `#272143` overlaid with a backdrop blur of `16px` and faint gradient washes (`linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)`).
- **Tier 3 (Floating Modals / Flyouts):** Frosted glass `rgba(39, 33, 67, 0.85)` with `backdrop-filter: blur(24px)`, framed by a crisp border `1px solid rgba(189, 167, 255, 0.25)`.
- **Photonic Glows & Shadows:**
  - Standard Elevation: Soft multi-layered ambient shadow `0 12px 32px -4px rgba(10, 8, 18, 0.6)`.
  - Radiant Button & Active Glow: Luminous colored bloom `0 0 24px rgba(118, 82, 214, 0.45)`, expanding to `0 0 36px rgba(189, 167, 255, 0.65)` on hover.

## Shapes

The design system employs a soft, highly rounded geometry (`roundedness: 3`) to match the playful energy of mobile gaming while retaining tailored architectural discipline:

- **Base Radius (1rem / 16px):** Standard interactive elements including input fields, badges, and smaller utility components.
- **Large Radius (`rounded-lg`, 2rem / 32px):** Primary content containers, game feature modules, interactive game tiles, and preview panels.
- **Extra Large Radius (`rounded-xl`, 3rem / 48px):** Hero feature banners, modal frames, and prominent showcase cards.
- **Full Pill (`rounded-full`):** Buttons, status chips, game category filters, and numerical metrics badges.

## Components

### Buttons
- **Primary Glowing Action:** Pill-shaped (`rounded-full`), background `#7652D6`, text `#FFFFFF`, typography `label-lg`. Features an ambient purple drop-glow (`box-shadow: 0 4px 20px rgba(118, 82, 214, 0.4)`). Hover state elevates scale to `1.02` with an expanded neon bloom (`0 6px 28px rgba(189, 167, 255, 0.6)`).
- **Secondary Glass Action:** Pill-shaped, background `rgba(39, 33, 67, 0.6)` with backdrop blur `12px`, border `1px solid rgba(189, 167, 255, 0.25)`, text `#BDA7FF`. On hover: border brightens to `#BDA7FF` with text shifting to `#FFFFFF`.

### Chips & Badges
- **Status & Category Chips:** Pill-shaped, padding `6px 14px`, text `label-md`.
- **Game Tag:** Background `rgba(118, 82, 214, 0.15)`, text `#BDA7FF`, border `1px solid rgba(189, 167, 255, 0.2)`.
- **Live / Featured Badge:** Solid high-contrast accent with subtle pulse animation, text `#252033` on `#BDA7FF`.

### Cards & Game Modules
- **Game Showcase Card:** Rounded corners (`2rem`), background `linear-gradient(180deg, #272143 0%, #1F1A35 100%)`, border `1px solid rgba(189, 167, 255, 0.15)`. Overflow hidden to house rich game artwork with a permanent dark-gradient scrim at the base. Hover state triggers a subtle upward drift (`-4px`) and illuminates the border to `rgba(189, 167, 255, 0.4)`.

### Input Fields
- **Search & Interactive Inputs:** Rounded (`1rem`), surface `#1F1A35`, text `#FFFFFF`, placeholder `#77718B`, border `1px solid rgba(119, 113, 139, 0.3)`. Focus state introduces a glowing primary ring (`box-shadow: 0 0 0 3px rgba(118, 82, 214, 0.35)`) and border color `#7652D6`.

### Checkboxes & Radios
- **Selection Controls:** Rounded squircle (checkbox) or circle (radio). Inactive state: `#1F1A35` with `1.5px solid #77718B`. Active state: filled with `#7652D6`, white checkmark or center dot, accompanied by an ambient purple halo glow.

### Lists & Activity Rows
- **Studio Feed & Stat Rows:** Surface `#1F1A35` with gentle hover highlight `rgba(39, 33, 67, 0.7)`. Separated by transparent dividers (`1px solid rgba(255, 255, 255, 0.05)`), featuring bold numerical counters in Space Grotesk and metadata in `#77718B`.