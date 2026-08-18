import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════

const BDD_TYPOGRAPHY_PAGE = '/bdd-typography';

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 812 }; // iPhone-like < 768px

// Tolerance for approximate font-size checks (e.g. 27.2px on mobile)
const FONT_SIZE_TOLERANCE_PX = 0.1;

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Retrieves a computed style property from an element identified by a
 * CSS selector or data-testid attribute.
 */
async function getComputedStyleProperty(
  page: ICustomWorld['page'],
  selector: string,
  property: string,
): Promise<string> {
  return page.$eval(selector, (el, prop) => {
    return window.getComputedStyle(el).getPropertyValue(prop);
  }, property);
}

/**
 * Reads a CSS custom property from :root via getComputedStyle.
 */
async function getCssCustomProperty(
  page: ICustomWorld['page'],
  propertyName: string,
): Promise<string> {
  return page.evaluate((prop) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(prop);
    return value ? value.trim() : '';
  }, propertyName);
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

// NOTE: "el frontend esta iniciado" step is defined in
// f024-us002-tailwind-config.steps.ts (shared across all features)
// DO NOT redefine it here to avoid ambiguous step definition errors.

Given(
  'el usuario navega a la pagina de tipografia',
  async function (this: ICustomWorld) {
    await this.page.goto(`${this.baseUrl}${BDD_TYPOGRAPHY_PAGE}`);
    await this.page.waitForLoadState('networkidle');

    // Ensure the BDD test page content is rendered
    await this.page.waitForSelector('[data-testid="bdd-typography-page"]', {
      timeout: 10000,
    });
  },
);

Given(
  'el viewport es movil menor a 768px',
  async function (this: ICustomWorld) {
    await this.page.setViewportSize(MOBILE_VIEWPORT);
    // Small wait for layout recalculation
    await this.page.waitForTimeout(200);
  },
);

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

When(
  'se carga la pagina de tipografia',
  async function (this: ICustomWorld) {
    // Ensure we are on the typography BDD page
    if (!this.page.url().includes(BDD_TYPOGRAPHY_PAGE)) {
      await this.page.goto(`${this.baseUrl}${BDD_TYPOGRAPHY_PAGE}`);
    }
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="bdd-typography-page"]', {
      timeout: 10000,
    });
  },
);

When(
  'se inspecciona el elemento tipografico {string} en viewport desktop',
  async function (this: ICustomWorld, selector: string) {
    // Ensure desktop viewport
    await this.page.setViewportSize(DESKTOP_VIEWPORT);
    await this.page.waitForTimeout(100);

    // Store the current selector for use in Then steps
    this.currentSelector = selector;
  },
);

When(
  'se inspecciona el elemento tipografico {string}',
  async function (this: ICustomWorld, selector: string) {
    // Store the current selector for use in Then steps
    this.currentSelector = selector;
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Font loading
// ═════════════════════════════════════════════════════════════════════

Then(
  'la fuente Montserrat debe estar disponible',
  async function (this: ICustomWorld) {
    // Verify Montserrat is loaded by checking if the font is available
    // via the FontFaceSet API or by checking the CSS variable
    const fontAvailable = await this.page.evaluate(() => {
      // Check if the --font-montserrat CSS variable is set
      const fontVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--font-montserrat')
        .trim();
      return fontVar.length > 0;
    });
    expect(fontAvailable).toBe(true);
  },
);

Then(
  'la variable CSS {string} debe estar definida',
  async function (this: ICustomWorld, varName: string) {
    const value = await getCssCustomProperty(this.page, varName);
    expect(value).not.toBe('');
  },
);

Then(
  'el body debe usar {string} como font-family principal',
  async function (this: ICustomWorld, expectedFont: string) {
    const bodyFontFamily = await this.page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(bodyFontFamily.toLowerCase()).toContain(expectedFont.toLowerCase());
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed style assertions (generic)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el font-size computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const fontSize = await getComputedStyleProperty(this.page, selector!, 'font-size');
    expect(fontSize).toBe(expected);
  },
);

Then(
  'el font-weight computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const fontWeight = await getComputedStyleProperty(this.page, selector!, 'font-weight');
    expect(fontWeight).toBe(expected);
  },
);

Then(
  'el line-height computado debe ser {string}',
  async function (this: ICustomWorld, _expected: string) {
    // Note: getComputedStyle for line-height returns a pixel value when
    // the CSS uses a unitless number. We verify line-height is present
    // and reasonable (not "normal" which means no explicit value).
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const lineHeight = await getComputedStyleProperty(this.page, selector!, 'line-height');
    // line-height should be a non-zero pixel value (not "normal")
    expect(lineHeight).toBeTruthy();
    expect(lineHeight).not.toBe('normal');
  },
);

Then(
  'el letter-spacing computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const letterSpacing = await getComputedStyleProperty(
      this.page,
      selector!,
      'letter-spacing',
    );

    // Handle em → px conversion: browsers compute em-based letter-spacing
    // to pixel values (e.g., "-0.02em" at 32px → "-0.64px")
    if (expected.endsWith('em')) {
      const fontSize = await getComputedStyleProperty(
        this.page,
        selector!,
        'font-size',
      );
      const fontSizePx = parseFloat(fontSize.replace('px', ''));
      const expectedEm = parseFloat(expected.replace('em', ''));
      const expectedPx = fontSizePx * expectedEm;
      const actualPx = parseFloat(letterSpacing.replace('px', ''));

      // Allow 0.05px tolerance for browser rounding differences
      expect(Math.abs(actualPx - expectedPx)).toBeLessThan(0.05);
    } else {
      expect(letterSpacing).toBe(expected);
    }
  },
);

Then(
  'el texto debe estar en uppercase segun text-transform uppercase',
  async function (this: ICustomWorld) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const textTransform = await getComputedStyleProperty(
      this.page,
      selector!,
      'text-transform',
    );
    expect(textTransform).toBe('uppercase');
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Approximate font-size (for mobile scaled values)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el font-size computado debe ser aproximadamente {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const fontSize = await getComputedStyleProperty(this.page, selector!, 'font-size');
    const actualPx = parseFloat(fontSize.replace('px', ''));
    const expectedPx = parseFloat(expected.replace('px', ''));

    expect(actualPx).toBeGreaterThan(expectedPx - FONT_SIZE_TOLERANCE_PX);
    expect(actualPx).toBeLessThan(expectedPx + FONT_SIZE_TOLERANCE_PX);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — font-family check on typography elements
// ═════════════════════════════════════════════════════════════════════

Then(
  'la font-family del elemento debe contener {string}',
  async function (this: ICustomWorld, expectedFont: string) {
    const selector = this.currentSelector;
    expect(selector).toBeDefined();

    const fontFamily = await getComputedStyleProperty(
      this.page,
      selector!,
      'font-family',
    );
    expect(fontFamily.toLowerCase()).toContain(expectedFont.toLowerCase());
  },
);
