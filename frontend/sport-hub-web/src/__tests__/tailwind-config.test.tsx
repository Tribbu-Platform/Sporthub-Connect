/**
 * T005, T006: Unit tests for Tailwind v4 @theme Configuration (US-002)
 *
 * These tests verify that the @theme block in globals.css correctly maps
 * design tokens from US-001 to Tailwind utility classes, so that classes
 * like bg-primary-container, text-on-surface, font-sans, rounded-lg,
 * shadow-level-2, and backdrop-blur-glass produce the correct computed styles.
 *
 * TDD: RED phase — all tests should FAIL because the current @theme block
 * only has minimal shadcn/ui mappings, not the full design system palette.
 *
 * Approach:
 * 1. Read globals.css and extract both :root variables and @theme entries
 * 2. Generate the CSS utility classes that Tailwind v4 would produce from @theme
 * 3. Inject both into jsdom
 * 4. Render elements with Tailwind classes and verify computed styles
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ==========================================================================
// Test Helpers
// ==========================================================================

/**
 * Cache of resolved CSS variable values from :root
 */
let cssVarCache: Record<string, string> = {};

/**
 * Parses :root CSS block and extracts all --variable: value pairs.
 */
function parseRootVariables(rawCSS: string): Record<string, string> {
  const vars: Record<string, string> = {};

  // Extract :root block
  const rootMatch = rawCSS.match(/:root\s*\{([^}]*)\}/s);
  if (!rootMatch) return vars;

  const rootBlock = rootMatch[1];
  const lines = rootBlock.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*')) continue;

    const match = trimmed.match(/^\s*(--[\w-]+)\s*:\s*(.+?);?\s*$/);
    if (!match) continue;

    const [, key, value] = match;
    vars[key] = value.replace(/;\s*$/, '').trim();
  }

  return vars;
}

/**
 * Resolves var() references in a CSS value using the variable cache.
 * Handles: var(--color-foo), var(--font-family-primary), etc.
 */
function resolveVarRef(value: string): string {
  // Handle multiple var() references
  return value.replace(/var\((--[\w-]+)\)/g, (_match, varName) => {
    const resolved = cssVarCache[varName];
    if (resolved) {
      // Recursively resolve nested var() refs
      return resolveVarRef(resolved);
    }
    // If not found in cache, return the var() ref as-is (fallback)
    return _match;
  });
}

/**
 * Reads globals.css, extracts :root variables and @theme entries,
 * generates Tailwind-compatible utility CSS, and injects into jsdom.
 *
 * CSS variable references (var(--foo)) are resolved to their actual
 * values because jsdom does not fully resolve var() in computed styles.
 */
function loadTailwindThemeCSS(): void {
  const cssPath = resolve(__dirname, '../app/globals.css');
  let raw = readFileSync(cssPath, 'utf-8');

  // Remove @import directives (PostCSS — not valid in browser <style>)
  raw = raw.replace(/@import\s+[^;]+;\s*/g, '');

  // Extract @theme block content (between @theme { and })
  const themeMatch = raw.match(/@theme\s*\{([^}]*)\}/s);
  const themeBlock = themeMatch ? themeMatch[1] : '';

  // Remove @theme block from raw CSS (keep :root and other standard CSS)
  raw = raw.replace(/@theme\s*\{[^}]*\}/g, '');

  // Parse :root variables into cache for var() resolution
  cssVarCache = parseRootVariables(raw);

  // Inject :root variables (with var() references resolved) into jsdom
  let resolvedRoot = raw;
  // Resolve var() references in :root block for jsdom
  resolvedRoot = resolvedRoot.replace(
    /:root\s*\{[^}]*\}/s,
    (rootBlock) => {
      return rootBlock.replace(
        /(--[\w-]+)\s*:\s*(.+?);/g,
        (_m, varName, varValue) => {
          const resolved = resolveVarRef(varValue.trim());
          return `${varName}: ${resolved};`;
        }
      );
    }
  );

  const rootStyle = document.createElement('style');
  rootStyle.setAttribute('data-testid', 'design-tokens-root');
  rootStyle.textContent = resolvedRoot;
  document.head.appendChild(rootStyle);

  // Generate Tailwind utility CSS from @theme entries
  const tailwindCSS = generateTailwindUtilityCSS(themeBlock);
  const twStyle = document.createElement('style');
  twStyle.setAttribute('data-testid', 'tailwind-utilities');
  twStyle.textContent = tailwindCSS;
  document.head.appendChild(twStyle);
}

/**
 * Parses @theme block entries and generates the CSS utility classes
 * that Tailwind v4 would produce for those theme values.
 *
 * Tailwind v4 theme → utility mapping:
 *   --color-NAME → .bg-NAME, .text-NAME, .border-NAME
 *   --font-NAME  → .font-NAME
 *   --radius-NAME → .rounded-NAME
 *   --shadow-NAME → .shadow-NAME
 *   --backdrop-blur-NAME → .backdrop-blur-NAME
 *
 * var() references in theme values are resolved to their actual values
 * from the :root definitions to ensure jsdom computes correct styles.
 */
function generateTailwindUtilityCSS(themeBlock: string): string {
  const rules: string[] = [];

  // Parse each line: --key: value;
  const lines = themeBlock.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*')) continue;

    const match = trimmed.match(/^\s*--([\w-]+)\s*:\s*(.+?);?\s*$/);
    if (!match) continue;

    const [, key, value] = match;

    // Clean the value and resolve var() references
    const rawValue = value.replace(/;\s*$/, '').trim();
    const resolvedValue = resolveVarRef(rawValue);

    // Determine the CSS property based on the key prefix
    if (key.startsWith('color-')) {
      const colorName = key.replace('color-', '');
      rules.push(`.bg-${colorName}{background-color:${resolvedValue}}`);
      rules.push(`.text-${colorName}{color:${resolvedValue}}`);
      rules.push(`.border-${colorName}{border-color:${resolvedValue}}`);
    } else if (key.startsWith('font-')) {
      const fontName = key.replace('font-', '');
      rules.push(`.font-${fontName}{font-family:${resolvedValue}}`);
    } else if (key === 'radius') {
      // --radius (shadcn/ui compat) → .rounded
      rules.push(`.rounded{border-radius:${resolvedValue}}`);
    } else if (key.startsWith('radius-')) {
      const radiusName = key.replace('radius-', '');
      // DEFAULT → no suffix (just .rounded)
      const className = radiusName === 'DEFAULT' ? 'rounded' : `rounded-${radiusName}`;
      rules.push(`.${className}{border-radius:${resolvedValue}}`);
    } else if (key.startsWith('shadow-')) {
      const shadowName = key.replace('shadow-', '');
      rules.push(`.shadow-${shadowName}{box-shadow:${resolvedValue}}`);
    } else if (key.startsWith('backdrop-blur-')) {
      const blurName = key.replace('backdrop-blur-', '');
      rules.push(`.backdrop-blur-${blurName}{backdrop-filter:blur(${resolvedValue})}`);
    }
  }

  return rules.join('\n');
}

/**
 * Creates a div with given classNames, appends to document.body,
 * and returns its computed style.
 */
function getComputedStyleForClass(className: string): CSSStyleDeclaration {
  const el = document.createElement('div');
  el.className = className;
  el.setAttribute('data-testid', `test-el-${className.replace(/\s+/g, '-')}`);
  document.body.appendChild(el);
  const style = getComputedStyle(el);
  return style;
}

/**
 * Helper: clean up all test elements from document.body
 */
function cleanupTestElements(): void {
  document.body.querySelectorAll('[data-testid^="test-el-"]').forEach(el => el.remove());
}

// ==========================================================================
// Load Tailwind theme CSS into jsdom before tests
// ==========================================================================

beforeAll(() => {
  loadTailwindThemeCSS();
});

// ==========================================================================
// T005: Color Token Verification
// ==========================================================================
describe('T005: Tailwind Color Utility Classes', () => {
  // ------------------------------------------------------------------
  // Primary palette
  // ------------------------------------------------------------------
  it('bg-primary-container should resolve to #00ff9d', () => {
    const style = getComputedStyleForClass('bg-primary-container');
    expect(style.backgroundColor).toBe('rgb(0, 255, 157)');
    cleanupTestElements();
  });

  it('text-on-primary-container should resolve to #007143', () => {
    const style = getComputedStyleForClass('text-on-primary-container');
    expect(style.color).toBe('rgb(0, 113, 67)');
    cleanupTestElements();
  });

  it('bg-primary should resolve to #f4fff3', () => {
    const style = getComputedStyleForClass('bg-primary');
    expect(style.backgroundColor).toBe('rgb(244, 255, 243)');
    cleanupTestElements();
  });

  it('text-on-primary should resolve to #00391f', () => {
    const style = getComputedStyleForClass('text-on-primary');
    expect(style.color).toBe('rgb(0, 57, 31)');
    cleanupTestElements();
  });

  it('bg-primary-fixed should resolve to #56ffa8', () => {
    const style = getComputedStyleForClass('bg-primary-fixed');
    expect(style.backgroundColor).toBe('rgb(86, 255, 168)');
    cleanupTestElements();
  });

  it('bg-primary-fixed-dim should resolve to #00e38b', () => {
    const style = getComputedStyleForClass('bg-primary-fixed-dim');
    expect(style.backgroundColor).toBe('rgb(0, 227, 139)');
    cleanupTestElements();
  });

  it('text-on-primary-fixed should resolve to #002110', () => {
    const style = getComputedStyleForClass('text-on-primary-fixed');
    expect(style.color).toBe('rgb(0, 33, 16)');
    cleanupTestElements();
  });

  it('text-on-primary-fixed-variant should resolve to #00522f', () => {
    const style = getComputedStyleForClass('text-on-primary-fixed-variant');
    expect(style.color).toBe('rgb(0, 82, 47)');
    cleanupTestElements();
  });

  it('border-inverse-primary should resolve to #006d40', () => {
    const style = getComputedStyleForClass('border-inverse-primary');
    expect(style.borderColor).toBe('rgb(0, 109, 64)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Surface hierarchy
  // ------------------------------------------------------------------
  it('bg-surface should resolve to #111317', () => {
    const style = getComputedStyleForClass('bg-surface');
    expect(style.backgroundColor).toBe('rgb(17, 19, 23)');
    cleanupTestElements();
  });

  it('bg-surface-dim should resolve to #111317', () => {
    const style = getComputedStyleForClass('bg-surface-dim');
    expect(style.backgroundColor).toBe('rgb(17, 19, 23)');
    cleanupTestElements();
  });

  it('bg-surface-bright should resolve to #37393d', () => {
    const style = getComputedStyleForClass('bg-surface-bright');
    expect(style.backgroundColor).toBe('rgb(55, 57, 61)');
    cleanupTestElements();
  });

  it('bg-surface-container-lowest should resolve to #0c0e11', () => {
    const style = getComputedStyleForClass('bg-surface-container-lowest');
    expect(style.backgroundColor).toBe('rgb(12, 14, 17)');
    cleanupTestElements();
  });

  it('bg-surface-container-low should resolve to #1a1c1f', () => {
    const style = getComputedStyleForClass('bg-surface-container-low');
    expect(style.backgroundColor).toBe('rgb(26, 28, 31)');
    cleanupTestElements();
  });

  it('bg-surface-container should resolve to #1e2023', () => {
    const style = getComputedStyleForClass('bg-surface-container');
    expect(style.backgroundColor).toBe('rgb(30, 32, 35)');
    cleanupTestElements();
  });

  it('bg-surface-container-high should resolve to #282a2d', () => {
    const style = getComputedStyleForClass('bg-surface-container-high');
    expect(style.backgroundColor).toBe('rgb(40, 42, 45)');
    cleanupTestElements();
  });

  it('bg-surface-container-highest should resolve to #333538', () => {
    const style = getComputedStyleForClass('bg-surface-container-highest');
    expect(style.backgroundColor).toBe('rgb(51, 53, 56)');
    cleanupTestElements();
  });

  it('text-on-surface should resolve to #e2e2e6', () => {
    const style = getComputedStyleForClass('text-on-surface');
    expect(style.color).toBe('rgb(226, 226, 230)');
    cleanupTestElements();
  });

  it('text-on-surface-variant should resolve to #b9cbbc', () => {
    const style = getComputedStyleForClass('text-on-surface-variant');
    expect(style.color).toBe('rgb(185, 203, 188)');
    cleanupTestElements();
  });

  it('bg-surface-variant should resolve to #333538', () => {
    const style = getComputedStyleForClass('bg-surface-variant');
    expect(style.backgroundColor).toBe('rgb(51, 53, 56)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Inverse surface
  // ------------------------------------------------------------------
  it('bg-inverse-surface should resolve to #e2e2e6', () => {
    const style = getComputedStyleForClass('bg-inverse-surface');
    expect(style.backgroundColor).toBe('rgb(226, 226, 230)');
    cleanupTestElements();
  });

  it('text-inverse-on-surface should resolve to #2f3034', () => {
    const style = getComputedStyleForClass('text-inverse-on-surface');
    expect(style.color).toBe('rgb(47, 48, 52)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Outline
  // ------------------------------------------------------------------
  it('text-outline should resolve to #849587', () => {
    const style = getComputedStyleForClass('text-outline');
    expect(style.color).toBe('rgb(132, 149, 135)');
    cleanupTestElements();
  });

  it('border-outline-variant should resolve to #3b4a3f', () => {
    const style = getComputedStyleForClass('border-outline-variant');
    expect(style.borderColor).toBe('rgb(59, 74, 63)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Surface tint
  // ------------------------------------------------------------------
  it('text-surface-tint should resolve to #00e38b', () => {
    const style = getComputedStyleForClass('text-surface-tint');
    expect(style.color).toBe('rgb(0, 227, 139)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Secondary palette
  // ------------------------------------------------------------------
  it('bg-secondary should resolve to #c6c6ca', () => {
    const style = getComputedStyleForClass('bg-secondary');
    expect(style.backgroundColor).toBe('rgb(198, 198, 202)');
    cleanupTestElements();
  });

  it('text-on-secondary should resolve to #2f3034', () => {
    const style = getComputedStyleForClass('text-on-secondary');
    expect(style.color).toBe('rgb(47, 48, 52)');
    cleanupTestElements();
  });

  it('bg-secondary-container should resolve to #47494c', () => {
    const style = getComputedStyleForClass('bg-secondary-container');
    expect(style.backgroundColor).toBe('rgb(71, 73, 76)');
    cleanupTestElements();
  });

  it('text-on-secondary-container should resolve to #b7b8bc', () => {
    const style = getComputedStyleForClass('text-on-secondary-container');
    expect(style.color).toBe('rgb(183, 184, 188)');
    cleanupTestElements();
  });

  it('bg-secondary-fixed should resolve to #e2e2e6', () => {
    const style = getComputedStyleForClass('bg-secondary-fixed');
    expect(style.backgroundColor).toBe('rgb(226, 226, 230)');
    cleanupTestElements();
  });

  it('bg-secondary-fixed-dim should resolve to #c6c6ca', () => {
    const style = getComputedStyleForClass('bg-secondary-fixed-dim');
    expect(style.backgroundColor).toBe('rgb(198, 198, 202)');
    cleanupTestElements();
  });

  it('text-on-secondary-fixed should resolve to #1a1c1f', () => {
    const style = getComputedStyleForClass('text-on-secondary-fixed');
    expect(style.color).toBe('rgb(26, 28, 31)');
    cleanupTestElements();
  });

  it('text-on-secondary-fixed-variant should resolve to #45474a', () => {
    const style = getComputedStyleForClass('text-on-secondary-fixed-variant');
    expect(style.color).toBe('rgb(69, 71, 74)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Tertiary palette
  // ------------------------------------------------------------------
  it('bg-tertiary should resolve to #f4fff0', () => {
    const style = getComputedStyleForClass('bg-tertiary');
    expect(style.backgroundColor).toBe('rgb(244, 255, 240)');
    cleanupTestElements();
  });

  it('text-on-tertiary should resolve to #003915', () => {
    const style = getComputedStyleForClass('text-on-tertiary');
    expect(style.color).toBe('rgb(0, 57, 21)');
    cleanupTestElements();
  });

  it('bg-tertiary-container should resolve to #67fb8c', () => {
    const style = getComputedStyleForClass('bg-tertiary-container');
    expect(style.backgroundColor).toBe('rgb(103, 251, 140)');
    cleanupTestElements();
  });

  it('text-on-tertiary-container should resolve to #007231', () => {
    const style = getComputedStyleForClass('text-on-tertiary-container');
    expect(style.color).toBe('rgb(0, 114, 49)');
    cleanupTestElements();
  });

  it('bg-tertiary-fixed should resolve to #6bff8f', () => {
    const style = getComputedStyleForClass('bg-tertiary-fixed');
    expect(style.backgroundColor).toBe('rgb(107, 255, 143)');
    cleanupTestElements();
  });

  it('bg-tertiary-fixed-dim should resolve to #4ae176', () => {
    const style = getComputedStyleForClass('bg-tertiary-fixed-dim');
    expect(style.backgroundColor).toBe('rgb(74, 225, 118)');
    cleanupTestElements();
  });

  it('text-on-tertiary-fixed should resolve to #002109', () => {
    const style = getComputedStyleForClass('text-on-tertiary-fixed');
    expect(style.color).toBe('rgb(0, 33, 9)');
    cleanupTestElements();
  });

  it('text-on-tertiary-fixed-variant should resolve to #005321', () => {
    const style = getComputedStyleForClass('text-on-tertiary-fixed-variant');
    expect(style.color).toBe('rgb(0, 83, 33)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Error palette
  // ------------------------------------------------------------------
  it('bg-error should resolve to #ffb4ab', () => {
    const style = getComputedStyleForClass('bg-error');
    expect(style.backgroundColor).toBe('rgb(255, 180, 171)');
    cleanupTestElements();
  });

  it('text-on-error should resolve to #690005', () => {
    const style = getComputedStyleForClass('text-on-error');
    expect(style.color).toBe('rgb(105, 0, 5)');
    cleanupTestElements();
  });

  it('bg-error-container should resolve to #93000a', () => {
    const style = getComputedStyleForClass('bg-error-container');
    expect(style.backgroundColor).toBe('rgb(147, 0, 10)');
    cleanupTestElements();
  });

  it('text-on-error-container should resolve to #ffdad6', () => {
    const style = getComputedStyleForClass('text-on-error-container');
    expect(style.color).toBe('rgb(255, 218, 214)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Background
  // ------------------------------------------------------------------
  it('bg-background should resolve to #111317', () => {
    const style = getComputedStyleForClass('bg-background');
    expect(style.backgroundColor).toBe('rgb(17, 19, 23)');
    cleanupTestElements();
  });

  it('text-on-background should resolve to #e2e2e6', () => {
    const style = getComputedStyleForClass('text-on-background');
    expect(style.color).toBe('rgb(226, 226, 230)');
    cleanupTestElements();
  });

  // ------------------------------------------------------------------
  // Shadcn/ui compatibility: existing @theme entries must still work
  // ------------------------------------------------------------------
  it('bg-background should work (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('bg-background');
    expect(style.backgroundColor).toBe('rgb(17, 19, 23)');
    cleanupTestElements();
  });

  it('text-foreground should resolve to #e2e2e6 (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('text-foreground');
    expect(style.color).toBe('rgb(226, 226, 230)');
    cleanupTestElements();
  });

  it('text-muted-foreground should resolve to #b9cbbc (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('text-muted-foreground');
    expect(style.color).toBe('rgb(185, 203, 188)');
    cleanupTestElements();
  });

  it('bg-muted should resolve to #1a1c1f (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('bg-muted');
    expect(style.backgroundColor).toBe('rgb(26, 28, 31)');
    cleanupTestElements();
  });

  it('bg-accent should resolve to #47494c (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('bg-accent');
    expect(style.backgroundColor).toBe('rgb(71, 73, 76)');
    cleanupTestElements();
  });

  it('text-accent-foreground should resolve to #b7b8bc (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('text-accent-foreground');
    expect(style.color).toBe('rgb(183, 184, 188)');
    cleanupTestElements();
  });

  it('text-destructive should resolve to #ffb4ab (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('text-destructive');
    expect(style.color).toBe('rgb(255, 180, 171)');
    cleanupTestElements();
  });

  it('text-destructive-foreground should resolve to #690005 (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('text-destructive-foreground');
    expect(style.color).toBe('rgb(105, 0, 5)');
    cleanupTestElements();
  });

  it('border-border should resolve to #3b4a3f (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('border-border');
    expect(style.borderColor).toBe('rgb(59, 74, 63)');
    cleanupTestElements();
  });

  it('border-input should resolve to #3b4a3f (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('border-input');
    expect(style.borderColor).toBe('rgb(59, 74, 63)');
    cleanupTestElements();
  });

  it('border-ring should resolve to #00ff9d (shadcn/ui compat)', () => {
    const style = getComputedStyleForClass('border-ring');
    expect(style.borderColor).toBe('rgb(0, 255, 157)');
    cleanupTestElements();
  });
});

// ==========================================================================
// T006: Font Family, Border Radius, Box Shadow, Backdrop Blur
// ==========================================================================
describe('T006: Tailwind Typography, Radius, Shadow & Backdrop Blur', () => {
  // ------------------------------------------------------------------
  // Font Family
  // ------------------------------------------------------------------
  describe('Font Family', () => {
    it('font-sans should resolve to Montserrat', () => {
      const style = getComputedStyleForClass('font-sans');
      expect(style.fontFamily).toContain('Montserrat');
      cleanupTestElements();
    });

    it('font-mono should resolve to JetBrains Mono', () => {
      const style = getComputedStyleForClass('font-mono');
      expect(style.fontFamily).toContain('JetBrains Mono');
      cleanupTestElements();
    });
  });

  // ------------------------------------------------------------------
  // Border Radius
  // ------------------------------------------------------------------
  describe('Border Radius', () => {
    it('rounded-sm should resolve to 0.25rem', () => {
      const style = getComputedStyleForClass('rounded-sm');
      expect(style.borderRadius).toBe('0.25rem');
      cleanupTestElements();
    });

    it('rounded (DEFAULT) should resolve to 0.5rem', () => {
      const style = getComputedStyleForClass('rounded');
      expect(style.borderRadius).toBe('0.5rem');
      cleanupTestElements();
    });

    it('rounded-md should resolve to 0.75rem', () => {
      const style = getComputedStyleForClass('rounded-md');
      expect(style.borderRadius).toBe('0.75rem');
      cleanupTestElements();
    });

    it('rounded-lg should resolve to 1rem', () => {
      const style = getComputedStyleForClass('rounded-lg');
      expect(style.borderRadius).toBe('1rem');
      cleanupTestElements();
    });

    it('rounded-xl should resolve to 1.5rem', () => {
      const style = getComputedStyleForClass('rounded-xl');
      expect(style.borderRadius).toBe('1.5rem');
      cleanupTestElements();
    });

    it('rounded-full should resolve to 9999px', () => {
      const style = getComputedStyleForClass('rounded-full');
      expect(style.borderRadius).toBe('9999px');
      cleanupTestElements();
    });
  });

  // ------------------------------------------------------------------
  // Box Shadow (Elevation)
  // ------------------------------------------------------------------
  describe('Box Shadow', () => {
    it('shadow-level-0 should resolve to none', () => {
      const style = getComputedStyleForClass('shadow-level-0');
      expect(style.boxShadow).toBe('none');
      cleanupTestElements();
    });

    it('shadow-level-1 should have a box-shadow applied', () => {
      const style = getComputedStyleForClass('shadow-level-1');
      expect(style.boxShadow).toBeTruthy();
      expect(style.boxShadow).not.toBe('none');
      expect(style.boxShadow).toContain('rgba(0, 0, 0, 0.4)');
      cleanupTestElements();
    });

    it('shadow-level-2 should have a box-shadow applied', () => {
      const style = getComputedStyleForClass('shadow-level-2');
      expect(style.boxShadow).toBeTruthy();
      expect(style.boxShadow).not.toBe('none');
      expect(style.boxShadow).toContain('rgba(0, 0, 0, 0.5)');
      cleanupTestElements();
    });

    it('shadow-level-3 should have box-shadow with emerald glow', () => {
      const style = getComputedStyleForClass('shadow-level-3');
      expect(style.boxShadow).toBeTruthy();
      expect(style.boxShadow).not.toBe('none');
      expect(style.boxShadow).toContain('rgba(0, 255, 157');
      cleanupTestElements();
    });

    it('shadow-glow-primary should have emerald glow shadow', () => {
      const style = getComputedStyleForClass('shadow-glow-primary');
      expect(style.boxShadow).toBeTruthy();
      expect(style.boxShadow).toContain('rgba(0, 255, 157');
      cleanupTestElements();
    });

    it('shadow-glow-primary-strong should have stronger emerald glow', () => {
      const style = getComputedStyleForClass('shadow-glow-primary-strong');
      expect(style.boxShadow).toBeTruthy();
      expect(style.boxShadow).toContain('rgba(0, 255, 157');
      cleanupTestElements();
    });
  });

  // ------------------------------------------------------------------
  // Backdrop Blur (Glassmorphism)
  // ------------------------------------------------------------------
  describe('Backdrop Blur', () => {
    it('backdrop-blur-glass should generate a CSS rule with blur(20px)', () => {
      // jsdom does not support backdrop-filter in computed styles.
      // Verify by inspecting the injected stylesheet directly.
      const twStyle = document.querySelector('[data-testid="tailwind-utilities"]');
      expect(twStyle).toBeTruthy();
      const cssText = twStyle!.textContent || '';
      expect(cssText).toContain('backdrop-blur-glass');
      expect(cssText).toContain('blur(20px)');
    });

    it('backdrop-blur-glass-modal should generate a CSS rule with blur(30px)', () => {
      const twStyle = document.querySelector('[data-testid="tailwind-utilities"]');
      const cssText = twStyle!.textContent || '';
      expect(cssText).toContain('backdrop-blur-glass-modal');
      expect(cssText).toContain('blur(30px)');
    });
  });
});
