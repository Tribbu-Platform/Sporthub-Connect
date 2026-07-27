---
name: Apex Athletic Intelligence
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#b9cbbc'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#849587'
  outline-variant: '#3b4a3f'
  surface-tint: '#00e38b'
  primary: '#f4fff3'
  on-primary: '#00391f'
  primary-container: '#00ff9d'
  on-primary-container: '#007143'
  inverse-primary: '#006d40'
  secondary: '#c6c6ca'
  on-secondary: '#2f3034'
  secondary-container: '#47494c'
  on-secondary-container: '#b7b8bc'
  tertiary: '#f4fff0'
  on-tertiary: '#003915'
  tertiary-container: '#67fb8c'
  on-tertiary-container: '#007231'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#56ffa8'
  primary-fixed-dim: '#00e38b'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#e2e2e6'
  secondary-fixed-dim: '#c6c6ca'
  on-secondary-fixed: '#1a1c1f'
  on-secondary-fixed-variant: '#45474a'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#111317'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  meta-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered for elite sports performance and management. It targets athletes, coaches, and club administrators who require high-performance tools that feel as precise and energetic as the sports they manage.

The aesthetic is **High-Tech Athletic**. It blends a deep, cinematic "Dark Mode" foundation with high-visibility accents to create a sense of focus and urgency. The style utilizes **Glassmorphism** for depth, creating a multi-layered interface that feels light despite its dark palette. Surfaces are sleek and polished, using subtle gradients and thin borders to define structure without adding visual bulk.

The emotional response should be one of **authority, speed, and precision**.

## Colors

This design system is anchored by an absolute **Deep Dark (#0c0e11)** background to maximize the vibrance of data and interface elements. 

- **Primary Emerald (#00ff9d):** Used exclusively for high-priority actions, status indicators, and active selection states. It provides a "neon" glow against the dark canvas.
- **Surface Gradients:** Cards and containers use a semi-transparent dark grey (#1a1c1f at 60% opacity) with a subtle 1px border.
- **Accents:** Role-based badges use low-opacity versions of their respective status colors to create a "glass-tag" effect that remains legible without overpowering the primary layout.

## Typography

The typography is built on **Montserrat** to provide a geometric, assertive, and modern athletic feel. 

- **Hierarchy:** Strong contrast between bold headlines and muted metadata ensures data-heavy dashboards remain scannable.
- **Uppercase Labels:** Used for table headers and sidebar categories to establish clear section divisions.
- **Numerical Data:** Use `fontWeight: 700` for metrics (XP, Scores) to ensure they are the most prominent part of the row.
- **Mobile Scaling:** Headlines scale down by 15% on mobile devices to preserve horizontal space.

## Layout & Spacing

The design system utilizes a **Fluid Grid** with a strict 8px base unit. 

- **Sidebar:** A fixed-width vertical container on the left, using a slightly lighter background than the main canvas to create a distinct functional zone.
- **Main Content:** Padded with 32px on desktop and 16px on mobile. 
- **Card Spacing:** Standardized 24px gap between dashboard modules.
- **Data Tables:** High-density vertical padding (12px - 16px) to maximize information density while maintaining legibility through clear horizontal separators.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Backdrop Blurs** rather than traditional drop shadows.

1.  **Level 0 (Base):** Deep Dark (#0c0e11) — The canvas.
2.  **Level 1 (Sidebar/Navigation):** Slightly raised dark tint (#111317).
3.  **Level 2 (Cards/Containers):** Glassmorphic surface (60% opacity) with a `backdrop-filter: blur(20px)`.
4.  **Level 3 (Modals/Popovers):** Higher opacity glass (80%) with a subtle 1px primary-color tinted border (#00ff9d at 20% opacity).

Interactive elements like buttons use a "glow" effect (outer shadow with the primary color at low opacity) when hovered or active.

## Shapes

The shape language is **Rounded**, balancing the aggressive tech feel with approachable modern aesthetics.

- **Main Cards:** 1rem (16px) radius to create a soft, contained look for complex data.
- **Interactive Elements:** Buttons and input fields use 0.75rem (12px) to match the card language but feel more tactile.
- **Status Badges:** Pill-shaped (fully rounded) to differentiate them from functional UI blocks.
- **Avatars:** Strictly circular or significantly rounded squares (12px) for consistency.

## Components

### Buttons
- **Primary:** Solid Emerald (#00ff9d) background with black text. High contrast, bold weight.
- **Secondary/Ghost:** Transparent background with a 1px Emerald border and Emerald text.
- **Action Icons:** Transparent circular containers that fill with a low-opacity Emerald tint on hover.

### Cards
All cards feature a subtle `1px solid #1a1c1f` border. The header of the card may include a secondary dark gradient to anchor titles.

### Badges (Roles)
Role badges (Owner, Captain, Coach) use a semi-transparent background derived from their status color (e.g., Captain uses 15% opacity Emerald) with a high-saturation text color for readability.

### Input Fields
Dark backgrounds (#0c0e11) with a subtle border. On focus, the border transitions to Primary Emerald with a soft outer glow.

### Status Indicators
Small 8px circular dots. Use the neon status palette. These should have a `box-shadow` of the same color at 50% opacity to simulate a glowing LED.