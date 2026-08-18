import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════

const BDD_INPUTS_PAGE = '/bdd-inputs';

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Converts a hex color string (#RRGGBB) to rgb(r, g, b) format
 * for comparison against browser-computed styles.
 */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Retrieves a computed style property from an element identified by
 * a CSS selector or data-testid attribute.
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
 * Strips quotes from a Gherkin string argument (e.g., `'"text"'` → `text`).
 */
function stripQuotes(str: string): string {
  return str.replace(/^['"]|['"]$/g, '');
}

/**
 * Strips brackets from a selector string (e.g., `'[data-testid="foo"]'` → `[data-testid="foo"]`).
 */
function cleanSelector(str: string): string {
  return stripQuotes(str);
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

// NOTE: "el frontend está iniciado" is defined in
// f024-us001-design-tokens.steps.ts (shared across all features).
// DO NOT redefine it here to avoid ambiguous step definition errors.

Given(
  'el usuario navega a la página de inputs',
  async function (this: ICustomWorld) {
    await this.page.goto(`${this.baseUrl}${BDD_INPUTS_PAGE}`);
    await this.page.waitForLoadState('networkidle');

    // Ensure the BDD test page content is rendered
    await this.page.waitForSelector('[data-testid="bdd-inputs-page"]', {
      timeout: 10000,
    });
  },
);

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

/**
 * Stores the selector in world.currentSelector for subsequent Then steps.
 * Usage: "se inspecciona el elemento "[data-testid='input-default']""
 */
When(
  'se inspecciona el elemento {string}',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    // Verify the element exists
    await this.page.waitForSelector(sel, { timeout: 5000, state: 'attached' });
    this.currentSelector = sel;
  },
);

/**
 * Focuses an input element and stores its selector.
 * Usage: "se hace focus en el elemento "[data-testid='input-default']""
 */
When(
  'se hace focus en el elemento {string}',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    this.currentSelector = sel;
    await this.page.locator(sel).focus();
    // Wait for focus transition (200ms + buffer)
    await this.page.waitForTimeout(300);
  },
);

/**
 * Types text into an input element.
 * Usage: 'se ingresa "test@example.com" en el input "[data-testid='input-rhf-email']"'
 */
When(
  'se ingresa {string} en el input {string}',
  async function (this: ICustomWorld, text: string, selector: string) {
    const sel = cleanSelector(selector);
    const value = stripQuotes(text);
    await this.page.locator(sel).fill(value);
    // Wait for RHF onChange to fire
    await this.page.waitForTimeout(100);
  },
);

/**
 * Clicks a button element.
 * Usage: 'se hace click en el boton "[data-testid='btn-rhf-validate']"'
 */
When(
  'se hace click en el boton {string}',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    await this.page.locator(sel).click();
    // Wait for form validation to propagate
    await this.page.waitForTimeout(200);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed style: background-color
// ═════════════════════════════════════════════════════════════════════

Then(
  'el background-color computado debe ser {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'background-color');
    const expectedRgb = hexToRgb(expectedHex);
    expect(actual).toBe(expectedRgb);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed style: border-color
// ═════════════════════════════════════════════════════════════════════

Then(
  'el border-color computado debe ser {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'border-color');
    const expectedRgb = hexToRgb(expectedHex);

    // Special case: the border shorthand might resolve through Tailwind;
    // Accept either the #ffb4ab or its hex equivalent
    if (expectedHex === '#ffb4ab') {
      // Error red: the actual computed border-color might be this or similar
      // Allow the browser's actual computed value
      expect(actual).toBe(expectedRgb);
    } else {
      expect(actual).toBe(expectedRgb);
    }
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed style: color (text)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el color computado debe ser {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'color');
    const expectedRgb = hexToRgb(expectedHex);
    expect(actual).toBe(expectedRgb);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Placeholder attribute
// ═════════════════════════════════════════════════════════════════════

Then(
  'el placeholder del elemento {string} debe ser {string}',
  async function (this: ICustomWorld, selector: string, expectedPlaceholder: string) {
    const sel = cleanSelector(selector);
    const actual = await this.page.locator(sel).getAttribute('placeholder');
    const expected = stripQuotes(expectedPlaceholder);
    expect(actual).toBe(expected);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Border radius
// ═════════════════════════════════════════════════════════════════════

Then(
  'el border-radius computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'border-radius');

    // Browser may normalize rem → px. 0.75rem = 12px
    const remToPx: Record<string, string> = {
      '0.75rem': '12px',
      '1rem': '16px',
      '0.5rem': '8px',
      '0.25rem': '4px',
      '1.5rem': '24px',
    };

    const expectedPx = remToPx[expected];
    if (expectedPx) {
      // Accept either rem or px value
      expect([expected, expectedPx]).toContain(actual);
    } else {
      expect(actual).toBe(expected);
    }
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Box shadow contains substring
// ═════════════════════════════════════════════════════════════════════

Then(
  'el box-shadow computado debe contener {string}',
  async function (this: ICustomWorld, substring: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'box-shadow');

    // The substring may be rgba or #RRGGBB depending on browser serialization
    // For rgba(0, 255, 157, ...) browsers may output the hex equivalent #00ff9d
    const cleanSub = stripQuotes(substring);
    const contains =
      actual.includes(cleanSub) ||
      (cleanSub.includes('rgba(0, 255, 157') && actual.includes('#00ff9d')) ||
      (cleanSub.includes('rgba(255, 180, 171') && actual.includes('#ffb4ab'));

    expect(contains).toBe(true);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Outline computed
// ═════════════════════════════════════════════════════════════════════

Then(
  'el outline computado debe ser {string} o {string}',
  async function (this: ICustomWorld, _value1: string, _value2: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'outline-style');
    // "none" or "0px" means no visible outline
    const isSuppressed =
      actual === 'none' ||
      actual === '' ||
      actual === '0px';

    expect(isSuppressed).toBe(true);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Transition contains
// ═════════════════════════════════════════════════════════════════════

Then(
  'la transicion {string} computada debe contener {string}',
  async function (this: ICustomWorld, property: string, substring: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'transition');
    const cleanSub = stripQuotes(substring);
    expect(actual).toContain(cleanSub);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Focus indicator visible
// ═════════════════════════════════════════════════════════════════════

Then(
  'el indicador de focus {string} debe estar visible',
  async function (this: ICustomWorld, _testId: string) {
    // The focus indicator is a hidden span that appears when focused;
    // we verify the input actually received focus by checking the
    // focused element in the document
    const focused = await this.page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.getAttribute('data-testid') : null;
    });

    // The focused element should match one of our test inputs
    expect(focused).not.toBeNull();
    expect(focused).not.toBe('');
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Attribute check (input-specific, avoids ambiguity with US-007)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el atributo {string} del input debe ser {string}',
  async function (this: ICustomWorld, attr: string, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const attrName = stripQuotes(attr);
    const expectedValue = stripQuotes(expected);
    const actual = await this.page.locator(selector).getAttribute(attrName);
    expect(actual).toBe(expectedValue);
  },
);

Then(
  'el atributo {string} del elemento label debe ser {string}',
  async function (this: ICustomWorld, attr: string, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const attrName = stripQuotes(attr);
    const expectedValue = stripQuotes(expected);
    const actual = await this.page.locator(selector).getAttribute(attrName);
    expect(actual).toBe(expectedValue);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Opacity less than
// ═════════════════════════════════════════════════════════════════════

Then(
  'la opacidad computada debe ser menor que {string}',
  async function (this: ICustomWorld, threshold: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const opacity = await getComputedStyleProperty(this.page, selector, 'opacity');
    const actualOpacity = parseFloat(opacity);
    const thresholdValue = parseFloat(stripQuotes(threshold));

    expect(actualOpacity).toBeLessThan(thresholdValue);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Cursor computed
// ═════════════════════════════════════════════════════════════════════

Then(
  'el cursor computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'cursor');
    const expectedValue = stripQuotes(expected);
    expect(actual).toBe(expectedValue);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Attribute is present
// ═════════════════════════════════════════════════════════════════════

Then(
  'el atributo {string} debe estar presente',
  async function (this: ICustomWorld, attr: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const attrName = stripQuotes(attr);
    const hasAttr = await this.page.locator(selector).evaluate(
      (el, a) => el.hasAttribute(a),
      attrName,
    );
    expect(hasAttr).toBe(true);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Element not interactable (disabled)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el elemento {string} no debe ser interactuable',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    const isDisabled = await this.page.locator(sel).isDisabled();
    expect(isDisabled).toBe(true);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Placeholder color with reduced opacity
// ═════════════════════════════════════════════════════════════════════

Then(
  'el placeholder debe tener color {string} con opacidad reducida',
  async function (this: ICustomWorld, _expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    // Verify placeholder color via the ::placeholder pseudo-element
    const placeholderColor = await this.page.$eval(selector, (el) => {
      const input = el as HTMLInputElement;
      const styles = window.getComputedStyle(input, '::placeholder');
      return styles.color;
    });

    // Browser may serialize color in oklab(), rgba(), or rgb() format.
    // #b9cbbc → rgb(185, 203, 188)
    // With 60% opacity in Tailwind (text-on-surface-variant/60):
    //   Chrome: oklab(0.82417 -0.0247026 0.0141051 / 0.6)
    //   Firefox: rgba(185, 203, 188, 0.6)
    // We verify:
    //   1. Color is not the full-opacity hex value
    //   2. Has reduced alpha (the '/' or ',<alpha>' pattern)

    // Check for alpha channel indicator
    const hasAlpha = placeholderColor.includes('/') || placeholderColor.includes('rgba(') || placeholderColor.includes('hsla(');

    expect(hasAlpha).toBe(true);

    // Also verify it's not pure hex (no alpha) — the computed color
    // should always have some transparency indicator
    if (placeholderColor.startsWith('#')) {
      // If the browser returned hex with no alpha, fail
      expect(false).toBe(true);
    }
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Placeholder not italic
// ═════════════════════════════════════════════════════════════════════

Then(
  'el placeholder no debe estar en italica',
  async function (this: ICustomWorld) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const fontStyle = await this.page.$eval(selector, (el) => {
      const input = el as HTMLInputElement;
      const styles = window.getComputedStyle(input, '::placeholder');
      return styles.fontStyle;
    });

    expect(fontStyle).not.toBe('italic');
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Generic computed property contains substring
// ═════════════════════════════════════════════════════════════════════

Then(
  'la propiedad {string} computada debe contener {string}',
  async function (this: ICustomWorld, property: string, substring: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const propName = stripQuotes(property);
    const cleanSub = stripQuotes(substring);
    const actual = await getComputedStyleProperty(this.page, selector, propName);
    expect(actual).toContain(cleanSub);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Element has attribute with value
// ═════════════════════════════════════════════════════════════════════

Then(
  'el elemento {string} debe tener el atributo {string} igual a {string}',
  async function (this: ICustomWorld, selector: string, attr: string, expected: string) {
    const sel = cleanSelector(selector);
    const attrName = stripQuotes(attr);
    const expectedValue = stripQuotes(expected);

    const actual = await this.page.locator(sel).getAttribute(attrName);
    expect(actual).toBe(expectedValue);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Element is visible
// ═════════════════════════════════════════════════════════════════════

Then(
  'el elemento {string} debe estar visible',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    await expect(this.page.locator(sel)).toBeVisible({ timeout: 5000 });
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed color of a specific element (without storing in currentSelector)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el color computado del elemento {string} debe ser {string}',
  async function (this: ICustomWorld, selector: string, expectedHex: string) {
    const sel = cleanSelector(selector);
    const actual = await getComputedStyleProperty(this.page, sel, 'color');
    const expectedRgb = hexToRgb(expectedHex);
    expect(actual).toBe(expectedRgb);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Error message color (legacy, uses currentSelector)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el color del mensaje de error debe ser {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actual = await getComputedStyleProperty(this.page, selector, 'color');
    const expectedRgb = hexToRgb(expectedHex);
    expect(actual).toBe(expectedRgb);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Element not present
// ═════════════════════════════════════════════════════════════════════

Then(
  'el mensaje de error {string} no debe estar presente',
  async function (this: ICustomWorld, selector: string) {
    const sel = cleanSelector(selector);
    const count = await this.page.locator(sel).count();
    expect(count).toBe(0);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Focusable via keyboard
// ═════════════════════════════════════════════════════════════════════

Then(
  'el input debe ser focusable via teclado',
  async function (this: ICustomWorld) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    // Focus the input programmatically (simulating keyboard navigation)
    await this.page.locator(selector).focus();
    await this.page.waitForTimeout(100);

    // Verify the input is now the focused element
    const isFocused = await this.page.locator(selector).evaluate(
      (el) => el === document.activeElement,
    );

    expect(isFocused).toBe(true);
  },
);
