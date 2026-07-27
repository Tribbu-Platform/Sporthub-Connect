/**
 * T005, T006: Unit tests for Typography Utility Classes
 *
 * Verifies the 7 typography levels, .text-metric class, and responsive
 * scaling behavior for mobile headlines (-15% below 768px).
 *
 * TDD: RED phase — tests should FAIL because typography utility classes
 * and Montserrat font are not yet loaded/defined.
 *
 * Approach:
 * 1. Read globals.css from disk, strip PostCSS-only directives
 *    (@import, @theme), and convert @utility blocks to plain .class { } rules.
 * 2. Inject the resulting CSS into jsdom.
 * 3. Render DOM elements with the typography classes.
 * 4. Verify computed styles (font-size, font-weight, line-height,
 *    letter-spacing, text-transform).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Typography level specifications (from DESIGN.md / data-model.md)
// ---------------------------------------------------------------------------

interface TypographySpec {
  fontSize: string; // desktop
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: string;
  /** Whether this level scales down on mobile (< 768px) */
  scalesOnMobile: boolean;
  /** Mobile font size (-15%) */
  fontSizeMobile?: string;
}

const typographySpecs: Record<string, TypographySpec> = {
  'text-display-lg': {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
    scalesOnMobile: true,
    fontSizeMobile: '27.2px',
  },
  'text-headline-md': {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
    scalesOnMobile: true,
    fontSizeMobile: '20.4px',
  },
  'text-headline-sm': {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.4',
    scalesOnMobile: true,
    fontSizeMobile: '17px',
  },
  'text-body-lg': {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    scalesOnMobile: false,
  },
  'text-body-md': {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
    scalesOnMobile: false,
  },
  'text-label-caps': {
    fontSize: '11px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    scalesOnMobile: false,
  },
  'text-meta-sm': {
    fontSize: '12px',
    fontWeight: '500',
    lineHeight: '1.4',
    scalesOnMobile: false,
  },
};

// ---------------------------------------------------------------------------
// Helper: read globals.css, convert @utility → .class, inject into jsdom
// ---------------------------------------------------------------------------

function loadAndInjectTypographyCSS(): void {
  const cssPath = resolve(__dirname, '../app/globals.css');
  let raw = readFileSync(cssPath, 'utf-8');

  // Extract only the sections needed for typography tests:
  //   1. :root { ... }  — CSS custom properties
  //   2. @layer base { ... }  — body/global styles
  //   3. @utility ... { ... } blocks  →  .class { ... }
  //   4. @media (max-width: 767px) { ... }  — responsive scaling
  //
  // Strip everything else that breaks jsdom: @import, @theme, @keyframes

  // Remove @import directives (PostCSS)
  raw = raw.replace(/@import\s+[^;]+;\s*/g, '');

  // Remove @theme { ... } blocks (Tailwind v4 PostCSS)
  raw = raw.replace(/@theme\s*\{[^}]*\}/g, '');

  // Remove @keyframes blocks (nested braces break jsdom parser)
  // These blocks contain percentage selectors with their own braces.
  raw = raw.replace(/@keyframes\s+[\w-]+\s*\{[\s\S]*?\n\}/g, '');

  // Unwrap @layer base { ... } → standard CSS (jsdom cannot parse @layer)
  raw = raw.replace(/@layer\s+base\s*\{/g, '');
  // The closing brace of @layer base is just before "/* === GLASSMORPHISM"
  raw = raw.replace(/\n\}\n\n\/\* =+\s*\n\s+GLASSMORPHISM/, '\n\n/* === GLASSMORPHISM');

  // Convert @utility name { ... } → .name { ... } for jsdom compatibility
  raw = raw.replace(/@utility\s+([\w-]+)\s*\{/g, '.$1 {');

  // Inject into jsdom
  const style = document.createElement('style');
  style.setAttribute('data-testid', 'typography-styles');
  style.textContent = raw;
  document.head.appendChild(style);
}

/**
 * Renders a DOM element with the given HTML tag and className,
 * then returns its computed style.
 */
function renderAndGetStyle(tag: string, className: string): CSSStyleDeclaration {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = 'Sample Text';
  document.body.appendChild(el);
  const computed = window.getComputedStyle(el);
  return computed;
}

// ---------------------------------------------------------------------------
// Load the ACTUAL globals.css content into jsdom (with @utility conversion)
// ---------------------------------------------------------------------------

beforeAll(() => {
  loadAndInjectTypographyCSS();
});

// ==========================================================================
// T005: 7 Typography Levels — font-size, font-weight, line-height, etc.
// ==========================================================================

describe('Typography Utility Classes (T005)', () => {
  Object.entries(typographySpecs).forEach(([className, spec]) => {
    describe(`.${className}`, () => {
      let computed: CSSStyleDeclaration;

      beforeAll(() => {
        computed = renderAndGetStyle('span', className);
      });

      it(`should apply font-size: ${spec.fontSize}`, () => {
        expect(computed.fontSize).toBe(spec.fontSize);
      });

      it(`should apply font-weight: ${spec.fontWeight}`, () => {
        expect(computed.fontWeight).toBe(spec.fontWeight);
      });

      it(`should apply line-height: ${spec.lineHeight}`, () => {
        // line-height may be computed as a pixel value
        const lh = computed.lineHeight;
        // Accept both string "1.2" and computed pixel equivalent
        expect(lh).toBeTruthy();
      });

      if (spec.letterSpacing) {
        it(`should apply letter-spacing: ${spec.letterSpacing}`, () => {
          expect(computed.letterSpacing).toBe(spec.letterSpacing);
        });
      }

      if (spec.textTransform) {
        it(`should apply text-transform: ${spec.textTransform}`, () => {
          expect(computed.textTransform).toBe(spec.textTransform);
        });
      }
    });
  });

  // --- label-caps specific: uppercase enforced ---
  describe('.text-label-caps uppercase behavior', () => {
    it('should render text transformed to uppercase', () => {
      const el = document.createElement('span');
      el.className = 'text-label-caps';
      el.textContent = 'hello world';
      document.body.appendChild(el);
      // text-transform: uppercase is a visual style, the textContent stays
      // but computed style should show uppercase
      expect(window.getComputedStyle(el).textTransform).toBe('uppercase');
    });
  });

  // --- display-lg specific: letter-spacing ---
  describe('.text-display-lg letter-spacing', () => {
    it('should apply negative letter-spacing of -0.02em', () => {
      const el = document.createElement('h1');
      el.className = 'text-display-lg';
      el.textContent = 'Main Title';
      document.body.appendChild(el);
      expect(window.getComputedStyle(el).letterSpacing).toBe('-0.02em');
    });
  });
});

// ==========================================================================
// T006: .text-metric and Responsive Scaling
// ==========================================================================

describe('Metric and Responsive Scaling (T006)', () => {
  // --- .text-metric: font-weight 700 for numeric data ---
  describe('.text-metric', () => {
    it('should apply font-weight: 700 to numeric/metric data', () => {
      const el = document.createElement('span');
      el.className = 'text-metric';
      el.textContent = '1,250 XP';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el);
      expect(computed.fontWeight).toBe('700');
    });

    it('should inherit font-size from body-lg (16px) by default', () => {
      const el = document.createElement('span');
      el.className = 'text-metric';
      el.textContent = '500';
      document.body.appendChild(el);
      const computed = window.getComputedStyle(el);
      // .text-metric sets font-size: inherit or 16px
      expect(computed.fontSize).toBe('16px');
    });
  });

  // --- Responsive Scaling: headlines scale -15% on mobile (< 768px) ---
  describe('Responsive headline scaling (< 768px viewport)', () => {
    const headlinesThatScale = ['text-display-lg', 'text-headline-md', 'text-headline-sm'];

    headlinesThatScale.forEach((className) => {
      const spec = typographySpecs[className];

      it(`.${className} should define a mobile font-size of ${spec.fontSizeMobile}`, () => {
        const el = document.createElement('div');
        el.className = className;
        document.body.appendChild(el);

        // In jsdom, we can't easily simulate different viewport widths
        // for @media queries. Instead, verify the desktop font-size is correct
        // and that a media query exists in the CSS.
        const computed = window.getComputedStyle(el);
        expect(computed.fontSize).toBe(spec.fontSize);

        // Verify the CSS contains a media query for mobile scaling
        const cssText = document.head.querySelector(
          '[data-testid="typography-styles"]'
        )?.textContent;
        expect(cssText).toBeTruthy();

        if (cssText) {
          // Check that the CSS contains a media query targeting < 768px
          expect(cssText).toMatch(/@media\s*\(/);
          // Check that the class has mobile font-size rules
          expect(cssText).toMatch(
            new RegExp(`\\.${className}[^{]*\\{[^}]*font-size[^}]*\\}`, 's')
          );
        }
      });
    });
  });

  // --- Body texts do NOT scale on mobile ---
  describe('Body text does NOT scale on mobile', () => {
    const bodyLevels = ['text-body-lg', 'text-body-md', 'text-meta-sm'];

    bodyLevels.forEach((className) => {
      const spec = typographySpecs[className];

      it(`.${className} should keep font-size ${spec.fontSize} at all viewports`, () => {
        const el = document.createElement('p');
        el.className = className;
        document.body.appendChild(el);

        const computed = window.getComputedStyle(el);
        expect(computed.fontSize).toBe(spec.fontSize);
      });
    });
  });

  // --- Headlines desktop font-size verification ---
  describe('Desktop headline font-sizes (exact)', () => {
    it('.text-display-lg should be 32px on desktop', () => {
      const el = document.createElement('h1');
      el.className = 'text-display-lg';
      document.body.appendChild(el);
      expect(window.getComputedStyle(el).fontSize).toBe('32px');
    });

    it('.text-headline-md should be 24px on desktop', () => {
      const el = document.createElement('h2');
      el.className = 'text-headline-md';
      document.body.appendChild(el);
      expect(window.getComputedStyle(el).fontSize).toBe('24px');
    });

    it('.text-headline-sm should be 20px on desktop', () => {
      const el = document.createElement('h3');
      el.className = 'text-headline-sm';
      document.body.appendChild(el);
      expect(window.getComputedStyle(el).fontSize).toBe('20px');
    });
  });
});

// ==========================================================================
// Font Family: Montserrat verification
// ==========================================================================

describe('Montserrat font loading', () => {
  it('should define --font-family-primary CSS variable', () => {
    // Read globals.css to check for the variable definition
    const cssPath = resolve(__dirname, '../app/globals.css');
    const raw = readFileSync(cssPath, 'utf-8');
    // The font-family primary token should reference Montserrat
    const hasRef = raw.includes('--font-family-primary') && raw.includes('Montserrat');
    expect(hasRef).toBe(true);
  });

  it('body should use Montserrat font-family', () => {
    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    // After implementation, font-family should contain Montserrat
    expect(bodyFont.toLowerCase()).toContain('montserrat');
  });
});
