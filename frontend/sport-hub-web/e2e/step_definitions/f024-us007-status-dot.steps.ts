import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═══════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════

const BDD_STATUS_DOT_PAGE = '/bdd-status-dot';

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

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
 * Gets the computed style property of an element identified by a selector.
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

// ═══════════════════════════════════════════════════════════════════════
// Given
// ═══════════════════════════════════════════════════════════════════════

Given(
  'el usuario navega a la pagina de status dot',
  async function (this: ICustomWorld) {
    await this.page.goto(`${this.baseUrl}${BDD_STATUS_DOT_PAGE}`);
    await this.page.waitForLoadState('networkidle');

    // Ensure the BDD test page content is rendered
    await this.page.waitForSelector('[data-testid="bdd-status-dot-page"]', {
      timeout: 10000,
    });
  },
);

// ═══════════════════════════════════════════════════════════════════════
// When
// ═══════════════════════════════════════════════════════════════════════

When(
  'se inspecciona el status dot {string}',
  async function (this: ICustomWorld, selector: string) {
    // Ensure we're on the BDD page
    if (!this.page.url().includes(BDD_STATUS_DOT_PAGE)) {
      await this.page.goto(`${this.baseUrl}${BDD_STATUS_DOT_PAGE}`);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForSelector('[data-testid="bdd-status-dot-page"]', {
        timeout: 10000,
      });
    }

    // Wait for the specific element to be visible
    await this.page.waitForSelector(selector, { timeout: 5000 });

    // Store the selector for Then steps
    this.currentSelector = selector;
  },
);

When(
  'el cursor se posiciona sobre el StatusDot',
  async function (this: ICustomWorld) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    // Hover over the element
    await this.page.hover(selector);

    // Small wait for any hover effects to apply
    await this.page.waitForTimeout(300);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Background color assertions
// ═══════════════════════════════════════════════════════════════════════

Then(
  'el background-color debe ser el color esmeralda {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      selector,
      'background-color',
    );
    const expectedRgb = hexToRgb(expectedHex);
    expect(bgColor).toBe(expectedRgb);
  },
);

Then(
  'el background-color debe ser el color amarillo {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      selector,
      'background-color',
    );
    const expectedRgb = hexToRgb(expectedHex);
    expect(bgColor).toBe(expectedRgb);
  },
);

Then(
  'el background-color debe ser el color rojo {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      selector,
      'background-color',
    );
    const expectedRgb = hexToRgb(expectedHex);
    expect(bgColor).toBe(expectedRgb);
  },
);

Then(
  'el background-color debe ser el color gris {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      selector,
      'background-color',
    );
    const expectedRgb = hexToRgb(expectedHex);
    expect(bgColor).toBe(expectedRgb);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Box-shadow assertions
// ═══════════════════════════════════════════════════════════════════════

Then(
  'el box-shadow debe contener el color esmeralda {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const boxShadow = await getComputedStyleProperty(
      this.page,
      selector,
      'box-shadow',
    );

    // The box-shadow should contain the color with alpha
    // e.g., rgb(0, 255, 157) or rgba(0, 255, 157, ...)
    const cleanHex = expectedHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const containsColor =
      boxShadow.includes(`rgb(${r}, ${g}, ${b}`) ||
      boxShadow.includes(`rgba(${r}, ${g}, ${b}`) ||
      boxShadow.includes(expectedHex);

    expect(containsColor).toBe(true);

    // Also verify it's not "none"
    expect(boxShadow).not.toBe('none');
  },
);

Then(
  'el box-shadow debe contener el color amarillo {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const boxShadow = await getComputedStyleProperty(
      this.page,
      selector,
      'box-shadow',
    );

    const cleanHex = expectedHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const containsColor =
      boxShadow.includes(`rgb(${r}, ${g}, ${b}`) ||
      boxShadow.includes(`rgba(${r}, ${g}, ${b}`) ||
      boxShadow.includes(expectedHex);

    expect(containsColor).toBe(true);
    expect(boxShadow).not.toBe('none');
  },
);

Then(
  'el box-shadow debe contener el color rojo {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const boxShadow = await getComputedStyleProperty(
      this.page,
      selector,
      'box-shadow',
    );

    const cleanHex = expectedHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const containsColor =
      boxShadow.includes(`rgb(${r}, ${g}, ${b}`) ||
      boxShadow.includes(`rgba(${r}, ${g}, ${b}`) ||
      boxShadow.includes(expectedHex);

    expect(containsColor).toBe(true);
    expect(boxShadow).not.toBe('none');
  },
);

Then(
  'el box-shadow debe contener el color gris {string}',
  async function (this: ICustomWorld, expectedHex: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const boxShadow = await getComputedStyleProperty(
      this.page,
      selector,
      'box-shadow',
    );

    const cleanHex = expectedHex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const containsColor =
      boxShadow.includes(`rgb(${r}, ${g}, ${b}`) ||
      boxShadow.includes(`rgba(${r}, ${g}, ${b}`) ||
      boxShadow.includes(expectedHex);

    expect(containsColor).toBe(true);
    expect(boxShadow).not.toBe('none');
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Border-radius assertion (RegExp for parentheses in step text)
// ═══════════════════════════════════════════════════════════════════════

Then(
  /^el border-radius debe ser "([^"]*)" \(circulo perfecto\)$/,
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const borderRadius = await getComputedStyleProperty(
      this.page,
      selector,
      'border-radius',
    );

    // Border-radius might be "9999px" (browser might compute the exact value)
    expect(borderRadius).toBe(expected);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Diameter (width/height) assertions
// ═══════════════════════════════════════════════════════════════════════

Then(
  'el diametro debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const width = await getComputedStyleProperty(
      this.page,
      selector,
      'width',
    );
    const height = await getComputedStyleProperty(
      this.page,
      selector,
      'height',
    );

    expect(width).toBe(expected);
    expect(height).toBe(expected);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Tooltip / Title attribute assertion (unique to US-007)
// ═══════════════════════════════════════════════════════════════════════

Then(
  'el title del status dot debe ser {string}',
  async function (this: ICustomWorld, expectedValue: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const actualTitle = await this.page.$eval(
      selector,
      (el) => el.getAttribute('title'),
    );

    expect(actualTitle).toBe(expectedValue);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Animation assertions
// ═══════════════════════════════════════════════════════════════════════

Then(
  'debe tener una animacion CSS aplicada',
  async function (this: ICustomWorld) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const animationName = await getComputedStyleProperty(
      this.page,
      selector,
      'animation-name',
    );

    // The animation-name should not be "none"
    expect(animationName).not.toBe('none');
    expect(animationName.length).toBeGreaterThan(0);
  },
);

Then(
  'la animacion debe ser {string}',
  async function (this: ICustomWorld, expectedAnimation: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const animationName = await getComputedStyleProperty(
      this.page,
      selector,
      'animation-name',
    );

    expect(animationName).toBe(expectedAnimation);
  },
);

// ═══════════════════════════════════════════════════════════════════════
// Then — Accessibility assertions
// ═══════════════════════════════════════════════════════════════════════

Then(
  'debe tener role {string}',
  async function (this: ICustomWorld, expectedRole: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const role = await this.page.$eval(
      selector,
      (el) => el.getAttribute('role'),
    );

    expect(role).toBe(expectedRole);
  },
);

Then(
  'debe tener un atributo {string} definido',
  async function (this: ICustomWorld, attribute: string) {
    const selector = this.currentSelector!;
    expect(selector).toBeDefined();

    const value = await this.page.$eval(
      selector,
      (el, attr) => el.getAttribute(attr),
      attribute,
    );

    expect(value).toBeDefined();
    expect(value).not.toBeNull();
    expect(value!.trim().length).toBeGreaterThan(0);
  },
);
