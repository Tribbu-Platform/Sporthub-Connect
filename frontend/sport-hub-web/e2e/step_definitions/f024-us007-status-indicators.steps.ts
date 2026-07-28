/**
 * BDD Step Definitions: Status Indicators (US-007 / F024)
 *
 * Playwright-based step definitions that verify computed styles,
 * attributes, and CSS classes of the StatusDot component rendered
 * on the /__bdd__/status-indicators test page.
 *
 * Scenarios:
 *  1. Should_RenderActiveStatusDot_When_VariantIsActive
 *  2. Should_RenderPendingStatusDot_When_VariantIsPending
 *  3. Should_RenderErrorStatusDot_When_VariantIsError
 *  4. Should_RenderInactiveStatusDot_When_VariantIsInactive
 *  5. Should_RenderSmallStatusDot_When_SizeIsSm
 *  6. Should_RenderLargeStatusDot_When_SizeIsLg
 *  7. Should_ShowTooltip_When_TooltipTextIsProvided
 *  8. Should_AnimatePulse_When_PulsingPropIsEnabled
 *  9. Should_BeAccessible_When_RenderedWithoutTooltip
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════

const BDD_STATUS_PAGE = '/__bdd__/status-indicators';

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Retrieves a single computed style property from an element identified
 * by a CSS selector.
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
 * Checks whether the element has a specific CSS class.
 */
async function hasClass(
  page: ICustomWorld['page'],
  selector: string,
  className: string,
): Promise<boolean> {
  return page.$eval(
    selector,
    (el, cls) => el.classList.contains(cls),
    className,
  );
}

/**
 * Gets an attribute value from an element.
 */
async function getAttribute(
  page: ICustomWorld['page'],
  selector: string,
  attribute: string,
): Promise<string | null> {
  return page.$eval(
    selector,
    (el, attr) => el.getAttribute(attr),
    attribute,
  );
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

Given('el frontend esta iniciado', async function (this: ICustomWorld) {
  const isReady = await this.page.evaluate(() => document.readyState);
  expect(isReady).toBeTruthy();
});

Given(
  'el usuario navega a la pagina de status indicators',
  async function (this: ICustomWorld) {
    const url = `${this.baseUrl}${BDD_STATUS_PAGE}`;
    await this.page.goto(url, { waitUntil: 'networkidle' });
    // Verify the page loaded by checking a key element
    await this.page.waitForSelector('[data-testid="bdd-status-indicators-page"]', {
      state: 'visible',
      timeout: 10000,
    });
  },
);

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

When(
  'se inspecciona el elemento {string}',
  async function (this: ICustomWorld, selector: string) {
    // Wait for the element to exist in the DOM
    await this.page.waitForSelector(selector, {
      state: 'attached',
      timeout: 5000,
    });
    // Store the selector for use in Then steps
    this.currentSelector = selector;
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed styles
// ═════════════════════════════════════════════════════════════════════

Then(
  'el background-color computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    const bgColor = await getComputedStyleProperty(
      this.page,
      selector,
      'background-color',
    );
    expect(bgColor).toBe(expected);
  },
);

Then(
  'el box-shadow computado debe contener {string}',
  async function (this: ICustomWorld, substring: string) {
    const selector = this.currentSelector!;
    const boxShadow = await getComputedStyleProperty(
      this.page,
      selector,
      'box-shadow',
    );
    expect(boxShadow).toContain(substring);
  },
);

Then(
  'el border-radius computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    const borderRadius = await getComputedStyleProperty(
      this.page,
      selector,
      'border-radius',
    );
    expect(borderRadius).toBe(expected);
  },
);

Then(
  'el width computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    const width = await getComputedStyleProperty(
      this.page,
      selector,
      'width',
    );
    expect(width).toBe(expected);
  },
);

Then(
  'el height computado debe ser {string}',
  async function (this: ICustomWorld, expected: string) {
    const selector = this.currentSelector!;
    const height = await getComputedStyleProperty(
      this.page,
      selector,
      'height',
    );
    expect(height).toBe(expected);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Attributes
// ═════════════════════════════════════════════════════════════════════

Then(
  'el atributo {string} debe ser {string}',
  async function (
    this: ICustomWorld,
    attribute: string,
    expected: string,
  ) {
    const selector = this.currentSelector!;
    const value = await getAttribute(this.page, selector, attribute);
    expect(value).toBe(expected);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — CSS classes
// ═════════════════════════════════════════════════════════════════════

Then(
  'la clase CSS {string} debe estar presente',
  async function (this: ICustomWorld, className: string) {
    const selector = this.currentSelector!;
    const present = await hasClass(this.page, selector, className);
    expect(present).toBe(true);
  },
);
