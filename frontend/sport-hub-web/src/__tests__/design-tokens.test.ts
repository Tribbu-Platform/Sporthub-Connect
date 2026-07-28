/**
 * T006, T007, T008: Unit tests for Design Tokens (CSS Custom Properties)
 *
 * These tests verify that all design tokens defined in DESIGN.md are
 * correctly defined as CSS custom properties in :root of globals.css
 * and are accessible at runtime via getComputedStyle.
 *
 * TDD: RED phase - all color/glass/glow/spacing tests should FAIL
 * because globals.css currently has shadcn/ui theme, not Apex Athletic
 * Intelligence design tokens. After GREEN phase (updating globals.css),
 * all tests will PASS.
 *
 * Approach: Read globals.css directly via fs, strip PostCSS-only
 * directives (@import, @theme), inject standard CSS into jsdom,
 * then verify via getComputedStyle.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Helper: read globals.css, strip PostCSS directives, inject into jsdom
// ---------------------------------------------------------------------------

/**
 * Reads the globals.css file from disk, strips PostCSS directives
 * (@import, @theme blocks) that the browser/jsdom cannot process,
 * and injects the remaining standard CSS into a <style> element.
 */
function loadAndInjectGlobalsCSS(): void {
  const cssPath = resolve(__dirname, '../app/globals.css');
  const raw = readFileSync(cssPath, 'utf-8');

  // Extract only the :root { ... } block — this contains all design tokens.
  // Other blocks (@import, @theme, @utility, @layer, @keyframes, @media)
  // are PostCSS/Tailwind v4 constructs that jsdom cannot parse and would
  // silently discard the entire stylesheet if left in.
  const rootMatch = raw.match(/:root\s*\{([^}]*)\}/s);
  const rootCSS = rootMatch ? `:root { ${rootMatch[1]} }` : '';

  // Inject into jsdom
  const style = document.createElement('style');
  style.setAttribute('data-testid', 'design-tokens-globals');
  style.textContent = rootCSS;
  document.head.appendChild(style);
}

/**
 * Returns the trimmed value of a CSS custom property from :root
 */
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// ---------------------------------------------------------------------------
// Expected design token values (from DESIGN.md / data-model.md)
// These are the "source of truth" that globals.css MUST match
// ---------------------------------------------------------------------------

const expectedColorTokens: Record<string, string> = {
  // Surface hierarchy (11 tokens)
  '--color-surface': '#111317',
  '--color-surface-dim': '#111317',
  '--color-surface-bright': '#37393d',
  '--color-surface-container-lowest': '#0c0e11',
  '--color-surface-container-low': '#1a1c1f',
  '--color-surface-container': '#1e2023',
  '--color-surface-container-high': '#282a2d',
  '--color-surface-container-highest': '#333538',
  '--color-on-surface': '#e2e2e6',
  '--color-on-surface-variant': '#b9cbbc',
  '--color-surface-variant': '#333538',

  // Inverse surface (2 tokens)
  '--color-inverse-surface': '#e2e2e6',
  '--color-inverse-on-surface': '#2f3034',

  // Outline (2 tokens)
  '--color-outline': '#849587',
  '--color-outline-variant': '#3b4a3f',

  // Surface tint (1 token)
  '--color-surface-tint': '#00e38b',

  // Primary palette (9 tokens)
  '--color-primary': '#f4fff3',
  '--color-on-primary': '#00391f',
  '--color-primary-container': '#00ff9d',
  '--color-on-primary-container': '#007143',
  '--color-inverse-primary': '#006d40',
  '--color-primary-fixed': '#56ffa8',
  '--color-primary-fixed-dim': '#00e38b',
  '--color-on-primary-fixed': '#002110',
  '--color-on-primary-fixed-variant': '#00522f',

  // Secondary palette (7 tokens)
  '--color-secondary': '#c6c6ca',
  '--color-on-secondary': '#2f3034',
  '--color-secondary-container': '#47494c',
  '--color-on-secondary-container': '#b7b8bc',
  '--color-secondary-fixed': '#e2e2e6',
  '--color-secondary-fixed-dim': '#c6c6ca',
  '--color-on-secondary-fixed': '#1a1c1f',
  '--color-on-secondary-fixed-variant': '#45474a',

  // Tertiary palette (7 tokens)
  '--color-tertiary': '#f4fff0',
  '--color-on-tertiary': '#003915',
  '--color-tertiary-container': '#67fb8c',
  '--color-on-tertiary-container': '#007231',
  '--color-tertiary-fixed': '#6bff8f',
  '--color-tertiary-fixed-dim': '#4ae176',
  '--color-on-tertiary-fixed': '#002109',
  '--color-on-tertiary-fixed-variant': '#005321',

  // Error palette (4 tokens)
  '--color-error': '#ffb4ab',
  '--color-on-error': '#690005',
  '--color-error-container': '#93000a',
  '--color-on-error-container': '#ffdad6',

  // Background (2 tokens)
  '--color-background': '#111317',
  '--color-on-background': '#e2e2e6',
};

const expectedGlassTokens: Record<string, string> = {
  '--glass-opacity': '0.6',
  '--glass-blur': '20px',
  '--glass-border': '#1a1c1f',
  '--glass-modal-opacity': '0.8',
  '--glass-modal-blur': '30px',
};

const expectedGlowTokens: Record<string, string> = {
  '--glow-primary': '0 0 15px rgba(0, 255, 157, 0.3)',
  '--glow-primary-strong': '0 0 30px rgba(0, 255, 157, 0.5)',
  '--shadow-level-0': 'none',
  '--shadow-level-1': '0 1px 3px rgba(0, 0, 0, 0.4)',
  '--shadow-level-2': '0 4px 12px rgba(0, 0, 0, 0.5)',
  '--shadow-level-3': '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 8px rgba(0, 255, 157, 0.1)',
};

const expectedSpacingTokens: Record<string, string> = {
  '--spacing-base': '8px',
  '--spacing-gutter': '24px',
  '--spacing-margin-mobile': '16px',
  '--spacing-margin-desktop': '32px',
  '--sidebar-width': '260px',
};

const expectedRadiusTokens: Record<string, string> = {
  '--radius-sm': '0.25rem',
  '--radius-DEFAULT': '0.5rem',
  '--radius-md': '0.75rem',
  '--radius-lg': '1rem',
  '--radius-xl': '1.5rem',
  '--radius-full': '9999px',
};

const expectedTransitionTokens: Record<string, string> = {
  '--transition-fast': '150ms ease',
  '--transition-base': '200ms ease',
  '--transition-slow': '300ms ease',
};

const expectedTypographyTokens: Record<string, string> = {
  '--font-family-primary': "'Montserrat', sans-serif",
  '--font-family-mono': "'JetBrains Mono', monospace",
};

// ---------------------------------------------------------------------------
// Load the ACTUAL globals.css content into jsdom (via fs, stripping PostCSS)
// ---------------------------------------------------------------------------

beforeAll(() => {
  loadAndInjectGlobalsCSS();
});

// ==========================================================================
// T006: Color Tokens (45 tokens from DESIGN.md)
// In RED phase: these tests FAIL because globals.css has shadcn theme
// In GREEN phase: after updating globals.css with :root color tokens → PASS
// ==========================================================================
describe('Design Tokens - Colors (T006)', () => {
  it('should define all 47 color tokens from DESIGN.md', () => {
    const keys = Object.keys(expectedColorTokens);
    expect(keys).toHaveLength(47);
  });

  // Parameterized test for each color token
  Object.entries(expectedColorTokens).forEach(([tokenName, expectedValue]) => {
    it(`--color CSS: should define ${tokenName} = "${expectedValue}"`, () => {
      const computed = getCSSVar(tokenName);
      expect(computed).toBe(expectedValue);
    });
  });
});

// ==========================================================================
// T007: Glassmorphism, Glow/Shadows, and Spacing Tokens
// ==========================================================================
describe('Design Tokens - Glassmorphism, Glow, Spacing (T007)', () => {
  // --- Glassmorphism ---
  describe('Glassmorphism tokens', () => {
    Object.entries(expectedGlassTokens).forEach(([tokenName, expectedValue]) => {
      it(`--glass CSS: should define ${tokenName} = "${expectedValue}"`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });
  });

  // --- Glow and Shadow ---
  describe('Glow and shadow tokens', () => {
    Object.entries(expectedGlowTokens).forEach(([tokenName, expectedValue]) => {
      it(`--glow/shadow CSS: should define ${tokenName}`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });

    it('--glow-primary should contain emerald rgba(0, 255, 157...)', () => {
      const computed = getCSSVar('--glow-primary');
      expect(computed).toContain('rgba(0, 255, 157');
    });

    it('--glow-primary-strong should contain emerald rgba(0, 255, 157...)', () => {
      const computed = getCSSVar('--glow-primary-strong');
      expect(computed).toContain('rgba(0, 255, 157');
    });

    it('should have all 4 shadow level tokens (level-0 to level-3)', () => {
      expect(getCSSVar('--shadow-level-0')).toBeTruthy();
      expect(getCSSVar('--shadow-level-1')).toBeTruthy();
      expect(getCSSVar('--shadow-level-2')).toBeTruthy();
      expect(getCSSVar('--shadow-level-3')).toBeTruthy();
    });
  });

  // --- Spacing ---
  describe('Spacing tokens', () => {
    Object.entries(expectedSpacingTokens).forEach(([tokenName, expectedValue]) => {
      it(`--spacing CSS: should define ${tokenName} = "${expectedValue}"`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });
  });
});

// ==========================================================================
// T008: Radius, Transitions, and Typography Tokens
// ==========================================================================
describe('Design Tokens - Radius, Transitions, Typography (T008)', () => {
  // --- Border Radius ---
  describe('Border radius tokens', () => {
    it('should define all 6 radius tokens', () => {
      const radii = Object.keys(expectedRadiusTokens);
      expect(radii).toHaveLength(6);
    });

    Object.entries(expectedRadiusTokens).forEach(([tokenName, expectedValue]) => {
      it(`--radius CSS: should define ${tokenName} = "${expectedValue}"`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });
  });

  // --- Transitions ---
  describe('Transition tokens', () => {
    it('should define all 3 transition tokens', () => {
      const transitions = Object.keys(expectedTransitionTokens);
      expect(transitions).toHaveLength(3);
    });

    Object.entries(expectedTransitionTokens).forEach(([tokenName, expectedValue]) => {
      it(`--transition CSS: should define ${tokenName} = "${expectedValue}"`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });
  });

  // --- Typography ---
  describe('Typography tokens', () => {
    it('should define all 2 typography tokens', () => {
      const fonts = Object.keys(expectedTypographyTokens);
      expect(fonts).toHaveLength(2);
    });

    Object.entries(expectedTypographyTokens).forEach(([tokenName, expectedValue]) => {
      it(`--font CSS: should define ${tokenName} = "${expectedValue}"`, () => {
        const computed = getCSSVar(tokenName);
        expect(computed).toBe(expectedValue);
      });
    });
  });
});

// ==========================================================================
// T001 + T002: TypeScript Types Validation
// ==========================================================================
describe('Design Tokens - TypeScript Types (T001, T002)', () => {
  it('should export ColorTokenNames as readonly array with >= 45 entries', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.ColorTokenNames).toBeDefined();
    expect(Array.isArray(mod.ColorTokenNames)).toBe(true);
    expect(mod.ColorTokenNames.length).toBeGreaterThanOrEqual(47);
  });

  it('should export ColorTokens record with all expected values', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.ColorTokens).toBeDefined();
    expect(mod.ColorTokens['surface']).toBe('#111317');
    expect(mod.ColorTokens['primary-container']).toBe('#00ff9d');
    expect(mod.ColorTokens['background']).toBe('#111317');
    expect(mod.ColorTokens['error']).toBe('#ffb4ab');
  });

  it('should export GlassmorphismDefaults with correct values', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.GlassmorphismDefaults).toBeDefined();
    expect(mod.GlassmorphismDefaults.glassOpacity).toBe(0.6);
    expect(mod.GlassmorphismDefaults.glassBlur).toBe('20px');
    expect(mod.GlassmorphismDefaults.glassBorder).toBe('#1a1c1f');
    expect(mod.GlassmorphismDefaults.glassModalOpacity).toBe(0.8);
    expect(mod.GlassmorphismDefaults.glassModalBlur).toBe('30px');
  });

  it('should export ShadowDefaults with glow and shadow values', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.ShadowDefaults).toBeDefined();
    expect(mod.ShadowDefaults.glowPrimary).toContain('rgba(0, 255, 157');
    expect(mod.ShadowDefaults.shadowLevel0).toBe('none');
    expect(mod.ShadowDefaults.shadowLevel2).toBe('0 4px 12px rgba(0, 0, 0, 0.5)');
  });

  it('should export SpacingDefaults with correct grid values', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.SpacingDefaults).toBeDefined();
    expect(mod.SpacingDefaults.base).toBe('8px');
    expect(mod.SpacingDefaults.gutter).toBe('24px');
    expect(mod.SpacingDefaults.marginMobile).toBe('16px');
    expect(mod.SpacingDefaults.marginDesktop).toBe('32px');
    expect(mod.SpacingDefaults.sidebarWidth).toBe('260px');
  });

  it('should export RadiusTokens with all 6 sizes', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.RadiusTokens).toBeDefined();
    expect(Object.keys(mod.RadiusTokens)).toHaveLength(6);
    expect(mod.RadiusTokens.sm).toBe('0.25rem');
    expect(mod.RadiusTokens.md).toBe('0.75rem');
    expect(mod.RadiusTokens.full).toBe('9999px');
  });

  it('should export TransitionTokens with all 3 speeds', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.TransitionTokens).toBeDefined();
    expect(Object.keys(mod.TransitionTokens)).toHaveLength(3);
    expect(mod.TransitionTokens.fast).toBe('150ms ease');
    expect(mod.TransitionTokens.slow).toBe('300ms ease');
  });

  it('should export TypographyTokens with 7 levels', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.TypographyTokens).toBeDefined();
    const levels = Object.keys(mod.TypographyTokens);
    expect(levels).toHaveLength(7);
  });

  it('should export getCSSToken() and getColorToken() helper functions', async () => {
    const mod = await import('@/types/design-tokens');
    expect(mod.getCSSToken).toBeDefined();
    expect(typeof mod.getCSSToken).toBe('function');
    expect(mod.getColorToken).toBeDefined();
    expect(typeof mod.getColorToken).toBe('function');
  });
});
