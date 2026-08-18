// ============================================================
// Design Tokens: "Apex Athletic Intelligence"
// Basado en Material Design 3 color system + custom tokens
// Fuente: prototipes/stitch_krewletics_sports_community/DESIGN.md
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

  // Primary palette (9 tokens)
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',

  // Secondary palette (8 tokens)
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',

  // Tertiary palette (8 tokens)
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',

  // Error palette (4 tokens)
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
