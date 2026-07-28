import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════

const BDD_BADGES_PAGE = '/bdd-badges';

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Retrieves a computed style property from an element identified by
 * data-testid. Uses Playwright's `$eval` for in-browser computation.
 */
async function getComputedStyleProperty(
  page: ICustomWorld['page'],
  testId: string,
  property: string,
): Promise<string> {
  return page.$eval(
    `[data-testid="${testId}"]`,
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property,
  );
}

/**
 * Retrieves the textContent of an element identified by data-testid.
 */
async function getTextContent(
  page: ICustomWorld['page'],
  testId: string,
): Promise<string> {
  return page.$eval(
    `[data-testid="${testId}"]`,
    (el) => el.textContent ?? '',
  );
}

/**
 * Retrieves an attribute value from an element identified by data-testid.
 */
async function getAttribute(
  page: ICustomWorld['page'],
  testId: string,
  attribute: string,
): Promise<string | null> {
  return page.$eval(
    `[data-testid="${testId}"]`,
    (el, attr) => el.getAttribute(attr),
    attribute,
  );
}

/**
 * Checks whether a CSS color string contains an alpha channel
 * (i.e., uses rgba or hsla with alpha < 1, indicating transparency).
 */
function hasAlphaChannel(color: string): boolean {
  const trimmed = color.trim();
  // rgba(r, g, b, a) or hsla(h, s, l, a)
  if (trimmed.startsWith('rgba(') || trimmed.startsWith('hsla(')) {
    return true;
  }
  // rgb(r, g, b) and hsl have no alpha — not semi-transparent
  return false;
}

/**
 * Extracts the numeric pixel value from a CSS dimension string like "4px", "12px".
 */
function pxValue(cssValue: string): number {
  return parseFloat(cssValue.replace('px', ''));
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

// NOTE: "el frontend está iniciado" is a shared step defined in
// f024-us001-design-tokens.steps.ts — do NOT redefine it here.

Given(
  'el usuario navega a la página de badges',
  async function (this: ICustomWorld) {
    await this.page.goto(`${this.baseUrl}${BDD_BADGES_PAGE}`);
    await this.page.waitForLoadState('networkidle');

    // Ensure the BDD test page content is rendered
    await this.page.waitForSelector('[data-testid="bdd-badges-page"]', {
      timeout: 10000,
    });
  },
);

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

When(
  'se inspecciona el badge con data-testid {string}',
  async function (this: ICustomWorld, testId: string) {
    // Verify element exists in DOM
    await this.page.waitForSelector(`[data-testid="${testId}"]`, {
      timeout: 5000,
    });

    // Store the testId for subsequent Then steps
    this.currentSelector = testId;
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Text content
// ═════════════════════════════════════════════════════════════════════

Then(
  'el texto del badge debe ser {string}',
  async function (this: ICustomWorld, expectedText: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const text = await getTextContent(this.page, testId!);
    expect(text).toBe(expectedText);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Border-radius (pill shape)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el border-radius del badge debe ser {string}',
  async function (this: ICustomWorld, expectedRadius: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const borderRadius = await getComputedStyleProperty(
      this.page,
      testId!,
      'border-radius',
    );
    expect(borderRadius).toBe(expectedRadius);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Background semi-transparency (glass-tag)
// ═════════════════════════════════════════════════════════════════════

Then(
  /^el fondo del badge debe ser semitransparente \(con alpha\)$/,
  async function (this: ICustomWorld) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      testId!,
      'background-color',
    );

    expect(hasAlphaChannel(bgColor)).toBe(true);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Text color different from background (readability)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el color de texto del badge debe ser diferente del fondo',
  async function (this: ICustomWorld) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const bgColor = await getComputedStyleProperty(
      this.page,
      testId!,
      'background-color',
    );
    const textColor = await getComputedStyleProperty(
      this.page,
      testId!,
      'color',
    );

    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe(bgColor);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Padding horizontal >= 12px
// ═════════════════════════════════════════════════════════════════════

Then(
  'el padding horizontal del badge debe ser al menos {int}px',
  async function (this: ICustomWorld, minPx: number) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const paddingLeft = await getComputedStyleProperty(
      this.page,
      testId!,
      'padding-left',
    );
    const paddingRight = await getComputedStyleProperty(
      this.page,
      testId!,
      'padding-right',
    );

    expect(pxValue(paddingLeft)).toBeGreaterThanOrEqual(minPx);
    expect(pxValue(paddingRight)).toBeGreaterThanOrEqual(minPx);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — ARIA role
// ═════════════════════════════════════════════════════════════════════

Then(
  'el rol ARIA del badge debe ser {string}',
  async function (this: ICustomWorld, expectedRole: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const role = await getAttribute(this.page, testId!, 'role');
    expect(role).toBe(expectedRole);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Size comparisons (font-size: sm < default < lg)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el font-size del badge debe ser menor que el badge {string}',
  async function (this: ICustomWorld, otherTestId: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const myFontSize = await getComputedStyleProperty(
      this.page,
      testId!,
      'font-size',
    );
    const otherFontSize = await getComputedStyleProperty(
      this.page,
      otherTestId,
      'font-size',
    );

    expect(pxValue(myFontSize)).toBeLessThan(pxValue(otherFontSize));
  },
);

Then(
  'el padding del badge debe ser menor que el badge {string}',
  async function (this: ICustomWorld, otherTestId: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const myPadding = await getComputedStyleProperty(
      this.page,
      testId!,
      'padding-left',
    );
    const otherPadding = await getComputedStyleProperty(
      this.page,
      otherTestId,
      'padding-left',
    );

    expect(pxValue(myPadding)).toBeLessThan(pxValue(otherPadding));
  },
);

Then(
  'el font-size del badge debe ser mayor que el badge {string}',
  async function (this: ICustomWorld, otherTestId: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const myFontSize = await getComputedStyleProperty(
      this.page,
      testId!,
      'font-size',
    );
    const otherFontSize = await getComputedStyleProperty(
      this.page,
      otherTestId,
      'font-size',
    );

    expect(pxValue(myFontSize)).toBeGreaterThan(pxValue(otherFontSize));
  },
);

Then(
  'el padding del badge debe ser mayor que el badge {string}',
  async function (this: ICustomWorld, otherTestId: string) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const myPadding = await getComputedStyleProperty(
      this.page,
      testId!,
      'padding-left',
    );
    const otherPadding = await getComputedStyleProperty(
      this.page,
      otherTestId,
      'padding-left',
    );

    expect(pxValue(myPadding)).toBeGreaterThan(pxValue(otherPadding));
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Accessibility: semantic role present
// ═════════════════════════════════════════════════════════════════════

Then(
  'el badge debe tener un rol ARIA semántico',
  async function (this: ICustomWorld) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const role = await getAttribute(this.page, testId!, 'role');
    // Accept 'status' or any non-empty role attribute
    expect(role).toBeTruthy();
    expect(role).not.toBe('');
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Badge visible to screen readers (not hidden, not aria-hidden)
// ═════════════════════════════════════════════════════════════════════

Then(
  'el badge debe ser visible para lectores de pantalla',
  async function (this: ICustomWorld) {
    const testId = this.currentSelector;
    expect(testId).toBeDefined();

    const isVisible = await this.page.$eval(
      `[data-testid="${testId}"]`,
      (el) => {
        const ariaHidden = el.getAttribute('aria-hidden');
        if (ariaHidden === 'true') return false;

        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        return true;
      },
    );

    expect(isVisible).toBe(true);
  },
);
