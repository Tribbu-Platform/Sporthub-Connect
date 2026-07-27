# Data Model: Design System "Apex Athletic Intelligence"

> Feature: F024
> Stack: React 19 + TypeScript + Next.js 16 + Tailwind CSS v4 + shadcn/ui
> Fuente: `prototipes/stitch_krewletics_sports_community/DESIGN.md`
> Fecha: 2026-07-26

## 1. Flujo de Design Tokens

El sistema de diseño sigue un flujo unidireccional de tokens:

```
DESIGN.md (especificacion)
    │
    ▼
CSS Custom Properties (:root en globals.css)
    │
    ▼
Tailwind CSS v4 @theme (referencia las CSS variables)
    │
    ▼
Componentes React (consumen clases Tailwind)
    │
    ▼
TypeScript Interfaces (tipado de props para cada componente)
```

**Principio**: Los tokens viven en CSS. TypeScript solo los tipifica para consumo programatico y documentacion. Tailwind los expone como clases utilitarias.

---

## 2. Modelo de Design Tokens (TypeScript)

### 2.1 Definicion del modulo `design-tokens.ts`

Archivo: `frontend/sport-hub-web/src/types/design-tokens.ts`

```typescript
// ============================================================
// Design Tokens: "Apex Athletic Intelligence"
// Basado en Material Design 3 color system + custom tokens
// ============================================================

// --- 2.1.1 Paleta de Color (45 tokens MD3) ---

/**
 * Nombres de todos los tokens de color del design system.
 * Cada nombre mapea a una CSS custom property `--color-{name}`.
 */
export const ColorTokenNames = [
  // Surface hierarchy (11 tokens)
  'surface',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'on-surface',
  'on-surface-variant',
  'surface-variant',

  // Inverse surface (2 tokens)
  'inverse-surface',
  'inverse-on-surface',

  // Outline (2 tokens)
  'outline',
  'outline-variant',

  // Surface tint (1 token)
  'surface-tint',

  // Primary palette (7 tokens)
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',

  // Secondary palette (7 tokens)
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',

  // Tertiary palette (7 tokens)
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',

  // Error palette (5 tokens)
  'error',
  'on-error',
  'error-container',
  'on-error-container',

  // Background (2 tokens)
  'background',
  'on-background',
] as const;

export type ColorToken = (typeof ColorTokenNames)[number];

/** Mapa completo de tokens de color a sus valores hexadecimales */
export const ColorTokens: Record<ColorToken, string> = {
  // Surface hierarchy
  'surface': '#111317',
  'surface-dim': '#111317',
  'surface-bright': '#37393d',
  'surface-container-lowest': '#0c0e11',
  'surface-container-low': '#1a1c1f',
  'surface-container': '#1e2023',
  'surface-container-high': '#282a2d',
  'surface-container-highest': '#333538',
  'on-surface': '#e2e2e6',
  'on-surface-variant': '#b9cbbc',
  'surface-variant': '#333538',

  // Inverse surface
  'inverse-surface': '#e2e2e6',
  'inverse-on-surface': '#2f3034',

  // Outline
  'outline': '#849587',
  'outline-variant': '#3b4a3f',

  // Surface tint
  'surface-tint': '#00e38b',

  // Primary palette
  'primary': '#f4fff3',
  'on-primary': '#00391f',
  'primary-container': '#00ff9d',
  'on-primary-container': '#007143',
  'inverse-primary': '#006d40',
  'primary-fixed': '#56ffa8',
  'primary-fixed-dim': '#00e38b',
  'on-primary-fixed': '#002110',
  'on-primary-fixed-variant': '#00522f',

  // Secondary palette
  'secondary': '#c6c6ca',
  'on-secondary': '#2f3034',
  'secondary-container': '#47494c',
  'on-secondary-container': '#b7b8bc',
  'secondary-fixed': '#e2e2e6',
  'secondary-fixed-dim': '#c6c6ca',
  'on-secondary-fixed': '#1a1c1f',
  'on-secondary-fixed-variant': '#45474a',

  // Tertiary palette
  'tertiary': '#f4fff0',
  'on-tertiary': '#003915',
  'tertiary-container': '#67fb8c',
  'on-tertiary-container': '#007231',
  'tertiary-fixed': '#6bff8f',
  'tertiary-fixed-dim': '#4ae176',
  'on-tertiary-fixed': '#002109',
  'on-tertiary-fixed-variant': '#005321',

  // Error palette
  'error': '#ffb4ab',
  'on-error': '#690005',
  'error-container': '#93000a',
  'on-error-container': '#ffdad6',

  // Background
  'background': '#111317',
  'on-background': '#e2e2e6',
};

// --- 2.1.2 Glassmorphism Tokens ---

export interface GlassmorphismTokens {
  /** Opacidad del fondo glass (cards Level 2) */
  glassOpacity: number;
  /** Blur del fondo glass (cards Level 2) */
  glassBlur: string;
  /** Color del borde glass */
  glassBorder: string;
  /** Opacidad del glass en modales (Level 3) */
  glassModalOpacity: number;
  /** Blur del glass en modales (Level 3) */
  glassModalBlur: string;
}

export const GlassmorphismDefaults: GlassmorphismTokens = {
  glassOpacity: 0.6,
  glassBlur: '20px',
  glassBorder: '#1a1c1f',
  glassModalOpacity: 0.8,
  glassModalBlur: '30px',
};

// --- 2.1.3 Glow & Shadow Tokens ---

export interface ShadowTokens {
  /** Glow primario esmeralda sutil */
  glowPrimary: string;
  /** Glow primario esmeralda fuerte */
  glowPrimaryStrong: string;
  /** Sombra de elevacion Level 0 (base, sin sombra) */
  shadowLevel0: string;
  /** Sombra de elevacion Level 1 (sidebar) */
  shadowLevel1: string;
  /** Sombra de elevacion Level 2 (cards estandar) */
  shadowLevel2: string;
  /** Sombra de elevacion Level 3 (modales) */
  shadowLevel3: string;
}

export const ShadowDefaults: ShadowTokens = {
  glowPrimary: '0 0 15px rgba(0, 255, 157, 0.3)',
  glowPrimaryStrong: '0 0 30px rgba(0, 255, 157, 0.5)',
  shadowLevel0: 'none',
  shadowLevel1: '0 1px 3px rgba(0, 0, 0, 0.4)',
  shadowLevel2: '0 4px 12px rgba(0, 0, 0, 0.5)',
  shadowLevel3: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 255, 157, 0.1)',
};

// --- 2.1.4 Typography Tokens ---

export type TypographyLevel =
  | 'display-lg'
  | 'headline-md'
  | 'headline-sm'
  | 'body-lg'
  | 'body-md'
  | 'label-caps'
  | 'meta-sm';

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: string;
}

export const TypographyTokens: Record<TypographyLevel, TypographyToken> = {
  'display-lg': {
    fontFamily: 'Montserrat',
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },
  'headline-md': {
    fontFamily: 'Montserrat',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
  },
  'headline-sm': {
    fontFamily: 'Montserrat',
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  'body-lg': {
    fontFamily: 'Montserrat',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  'body-md': {
    fontFamily: 'Montserrat',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  'label-caps': {
    fontFamily: 'Montserrat',
    fontSize: '11px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  'meta-sm': {
    fontFamily: 'Montserrat',
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.4',
  },
};

// --- 2.1.5 Spacing Tokens ---

export interface SpacingTokens {
  /** Unidad base de espaciado (8px grid) */
  base: string;
  /** Gutter entre modulos del dashboard */
  gutter: string;
  /** Margen/padding en mobile */
  marginMobile: string;
  /** Margen/padding en desktop */
  marginDesktop: string;
  /** Ancho fijo del sidebar */
  sidebarWidth: string;
}

export const SpacingDefaults: SpacingTokens = {
  base: '8px',
  gutter: '24px',
  marginMobile: '16px',
  marginDesktop: '32px',
  sidebarWidth: '260px',
};

// --- 2.1.6 Border Radius Tokens ---

export type RadiusSize = 'sm' | 'DEFAULT' | 'md' | 'lg' | 'xl' | 'full';

export const RadiusTokens: Record<RadiusSize, string> = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

// --- 2.1.7 Transition Tokens ---

export type TransitionSpeed = 'fast' | 'base' | 'slow';

export const TransitionTokens: Record<TransitionSpeed, string> = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
};

// --- 2.1.8 Elevation Levels ---

export type ElevationLevel = 0 | 1 | 2 | 3;

export interface ElevationConfig {
  /** Nivel de elevacion */
  level: ElevationLevel;
  /** Descripcion del uso */
  usage: string;
  /** Color de fondo esperado */
  background: string;
  /** Si aplica backdrop-blur */
  hasBlur: boolean;
  /** Valor de blur si aplica */
  blurValue?: string;
  /** Opacidad del fondo si aplica glassmorphism */
  opacity?: number;
  /** Sombra aplicada */
  shadow: string;
  /** Indice z */
  zIndex: number;
}

export const ElevationConfigs: Record<ElevationLevel, ElevationConfig> = {
  0: {
    level: 0,
    usage: 'Base canvas / pagina',
    background: '#0c0e11',
    hasBlur: false,
    shadow: 'none',
    zIndex: 0,
  },
  1: {
    level: 1,
    usage: 'Sidebar / navegacion',
    background: '#111317',
    hasBlur: false,
    shadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  2: {
    level: 2,
    usage: 'Cards / contenedores estandar',
    background: 'rgba(26, 28, 31, 0.6)',
    hasBlur: true,
    blurValue: '20px',
    opacity: 0.6,
    shadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  3: {
    level: 3,
    usage: 'Modales / popovers',
    background: 'rgba(26, 28, 31, 0.8)',
    hasBlur: true,
    blurValue: '30px',
    opacity: 0.8,
    shadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 255, 157, 0.1)',
    zIndex: 50,
  },
};

// --- 2.1.9 Resolucion en runtime de CSS custom properties ---

/** Obtiene el valor computado de un token CSS desde el DOM */
export function getCSSToken(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/** Obtiene un color del design system desde CSS custom properties */
export function getColorToken(token: ColorToken): string {
  return getCSSToken(`--color-${token}`);
}
```

---

## 3. Arquitectura de Componentes

### 3.1 Jerarquia Visual

```
Layout (US-008)
├── Sidebar (260px, fijo, Level 1)
│   ├── Logo + Brand
│   ├── SidebarNav (links con indicador esmeralda)
│   └── UserProfileFooter (avatar + nombre)
│
├── MobileSidebar (drawer overlay, < 1024px)
│   └── (misma estructura que Sidebar)
│
└── MainContent (padding responsive)
    ├── Cards (US-004) — glassmorphism Level 2/3
    │   ├── CardHeader (gradiente opcional)
    │   │   ├── CardTitle (headline-sm)
    │   │   └── CardDescription (body-md)
    │   ├── CardContent
    │   │   ├── Buttons (US-003)
    │   │   ├── Badges (US-005)
    │   │   ├── Inputs (US-006)
    │   │   └── StatusDots (US-007)
    │   └── CardFooter
    │
    └── Typography (US-009) — clases utilitarias
```

### 3.2 Arbol de Dependencias de Componentes

```
globals.css (:root CSS variables)
  → globals.css (@theme Tailwind v4)
    → layout.tsx (next/font/google Montserrat)
      → Typography utility classes
        → Button (US-003)
        │   └── basado en shadcn/ui Button (Radix)
        │       └── variantes: primary, secondary, ghost, icon
        → Card (US-004)
        │   ├── basado en shadcn/ui Card
        │   ├── CardHeader, CardTitle, CardDescription
        │   ├── CardContent
        │   └── CardFooter
        → Badge (US-005)
        │   └── basado en shadcn/ui Badge
        │       └── variantes: owner, captain, coach, member, success, warning, error, info
        → Input (US-006)
        │   └── basado en shadcn/ui Input
        │       └── compatible con React Hook Form
        → StatusDot (US-007)
        │   └── componente standalone (no shadcn/ui)
        │       └── variantes: active, pending, error, inactive
        → Layout Components (US-008)
            ├── Sidebar
            │   └── SidebarNav
            ├── MobileSidebar
            └── MainContent
```

---

## 4. Interfaces de Componentes (TypeScript Props)

### 4.1 Button (US-003)

Archivo: `frontend/sport-hub-web/src/components/ui/button.tsx`

```typescript
import { VariantProps } from 'class-variance-authority';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual del boton */
  variant?: ButtonVariant;
  /** Tamano del boton */
  size?: ButtonSize;
  /** Contenido del boton (texto, iconos, etc.) */
  children: React.ReactNode;
  /** Si el boton esta en estado deshabilitado */
  disabled?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Permite que el boton actue como wrapper (Radix asChild) */
  asChild?: boolean;
}
```

### 4.2 Card (US-004)

Archivo: `frontend/sport-hub-web/src/components/ui/card.tsx`

```typescript
export type ElevationLevel = 0 | 1 | 2 | 3;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nivel de elevacion (0-3). Default: 2 */
  elevation?: ElevationLevel;
  /** Si el header debe tener gradiente oscuro */
  gradientHeader?: boolean;
  /** Contenido de la card */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}
```

### 4.3 Badge (US-005)

Archivo: `frontend/sport-hub-web/src/components/ui/badge.tsx`

```typescript
export type BadgeVariant =
  // Role variants
  | 'owner'
  | 'captain'
  | 'coach'
  | 'member'
  // Status variants
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type BadgeSize = 'sm' | 'default' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante de rol o estado */
  variant: BadgeVariant;
  /** Tamano del badge */
  size?: BadgeSize;
  /** Contenido (texto o icono + texto) */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}
```

### 4.4 Input (US-006)

Archivo: `frontend/sport-hub-web/src/components/ui/input.tsx`

```typescript
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Indica si el input tiene un error de validacion */
  error?: boolean;
  /** Mensaje de error (se muestra debajo del input) */
  errorMessage?: string;
  /** Placeholder del input */
  placeholder?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Ref forwarding para compatibilidad con React Hook Form */
  ref?: React.Ref<HTMLInputElement>;
}
```

### 4.5 StatusDot (US-007)

Archivo: `frontend/sport-hub-web/src/components/ui/status-dot.tsx`

```typescript
export type StatusDotVariant = 'active' | 'pending' | 'error' | 'inactive';
export type StatusDotSize = 'sm' | 'default' | 'lg';

export interface StatusDotProps {
  /** Variante de color del indicador */
  variant: StatusDotVariant;
  /** Tamano del circulo LED */
  size?: StatusDotSize;
  /** Texto del tooltip (usa atributo title nativo como fallback) */
  tooltip?: string;
  /** Si debe animarse con pulso */
  pulsing?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}
```

### 4.6 Sidebar (US-008)

Archivo: `frontend/sport-hub-web/src/components/layout/sidebar.tsx`

```typescript
export interface SidebarProps {
  /** Si la sidebar esta expandida (mobile: controla el drawer) */
  isOpen: boolean;
  /** Callback para cerrar la sidebar (mobile) */
  onClose: () => void;
  /** Contenido de navegacion */
  children: React.ReactNode;
}

export interface SidebarNavProps {
  /** Items de navegacion */
  items: SidebarNavItem[];
  /** Ruta actual para marcar el item activo */
  currentPath: string;
}

export interface SidebarNavItem {
  /** Etiqueta visible */
  label: string;
  /** Ruta de navegacion (Next.js) */
  href: string;
  /** Icono (componente React) */
  icon: React.ComponentType<{ className?: string }>;
  /** Si esta deshabilitado */
  disabled?: boolean;
}
```

### 4.7 MainContent (US-008)

Archivo: `frontend/sport-hub-web/src/components/layout/main-content.tsx`

```typescript
export interface MainContentProps {
  /** Contenido principal de la pagina */
  children: React.ReactNode;
  /** Clases CSS adicionales */
  className?: string;
}
```

### 4.8 Layout (US-008)

Archivo: `frontend/sport-hub-web/src/app/layout.tsx`

```typescript
export interface RootLayoutProps {
  children: React.ReactNode;
}
```

---

## 5. Relaciones: Tokens → Tailwind → Componentes

### 5.1 CSS Custom Properties → @theme

En `globals.css`, las variables definidas en `:root` son referenciadas por el bloque `@theme` de Tailwind v4:

```css
@import "tailwindcss";

@theme {
  /* Colores: mapean CSS variables → clases Tailwind como bg-primary-container */
  --color-surface: var(--color-surface);
  --color-primary-container: var(--color-primary-container);
  --color-on-surface: var(--color-on-surface);
  /* ... 45 tokens de color ... */

  /* Tipografia */
  --font-sans: var(--font-montserrat);
  --font-mono: 'JetBrains Mono', monospace;

  /* Border radius */
  --radius-sm: var(--radius-sm);
  --radius-DEFAULT: var(--radius-DEFAULT);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);

  /* Sombras */
  --shadow-level-1: var(--shadow-level-1);
  --shadow-level-2: var(--shadow-level-2);
  --shadow-level-3: var(--shadow-level-3);
  --shadow-glow-primary: var(--glow-primary);

  /* Backdrop blur */
  --backdrop-blur-glass: blur(20px);
  --backdrop-blur-glass-modal: blur(30px);
}
```

### 5.2 Componentes → Clases Tailwind → CSS Variables

```
Componente Button variant="primary"
  → className="bg-primary-container text-on-primary-container font-bold rounded-md"
    → Tailwind resuelve bg-primary-container → var(--color-primary-container)
      → CSS :root define --color-primary-container: #00ff9d
        → Render: background-color: #00ff9d
```

---

## 6. Estados de Componentes

### 6.1 Estados comunes a todos los componentes interactivos

| Estado | Comportamiento | Implementacion |
|--------|---------------|----------------|
| **Default** | Apariencia base | Clases Tailwind estandar |
| **Hover** | Feedback visual (glow, tint, cambio de color) | `hover:` variants |
| **Focus** | Outline visible para accesibilidad | `focus-visible:` + `ring` |
| **Active** | Presionado (escala 0.98) | `active:scale-[0.98]` |
| **Disabled** | Opacidad 40%, cursor not-allowed, aria-disabled | `disabled:opacity-40 disabled:cursor-not-allowed` |

### 6.2 Estados especificos por componente

| Componente | Estados adicionales |
|------------|-------------------|
| Button (icon) | Hover tint esmeralda 15% |
| Card | Elevation 0-3 (fondo, blur, sombra, borde) |
| Card | gradientHeader (gradiente oscuro) |
| Input | Error (borde rojo + glow rojo), Placeholder estilizado |
| StatusDot | Pulsing (animacion CSS), Tooltip (title + hover) |
| Badge | 8 variantes de color (4 role + 4 status) |
| Sidebar | Mobile: abierto/cerrado (drawer overlay) |
| Layout | Responsive: desktop (>=1024px), mobile (< 1024px) |

---

## 7. Estrategia de Responsive Design

| Breakpoint | Comportamiento |
|------------|---------------|
| **Desktop** (>= 1024px) | Sidebar visible (260px), MainContent con ml-[260px], padding 32px |
| **Mobile/Tablet** (< 1024px) | Sidebar oculta, hamburger menu, MainContent 100% width, padding 16px |
| **Tipografia mobile** (< 768px) | Headlines escalan -15%: display-lg 27.2px, headline-md 20.4px, headline-sm 17px |
| **Gutter** | 24px entre modulos en todos los breakpoints |

---

## 8. Integracion con shadcn/ui

Los componentes de shadcn/ui instalados en el proyecto se modifican para consumir los design tokens:

| Componente shadcn/ui | Modificacion |
|---------------------|--------------|
| `Button` | Nuevas variantes: `primary`, `secondary`, `ghost`, `icon`. Colores desde tokens. |
| `Card` | Nueva prop `elevation` (0-3). Glassmorphism. `gradientHeader` opcional. |
| `Badge` | Nuevas variantes de rol y estado. Forma pill. |
| `Input` | Estados visuales custom (glow esmeralda focus, borde rojo error). |
| `Label` | Verificar colores y tipografia del design system. |

Los componentes se registran en `src/components/ui/` y se exportan desde el barrel export de shadcn/ui.
