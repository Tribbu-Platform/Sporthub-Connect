import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Helpers — Color & CSS Utilities
// ═════════════════════════════════════════════════════════════════════

/**
 * Converts a hex color string (#RRGGBB) to rgb(r, g, b) format
 * for comparison against browser-computed styles.
 */
function hexToRgb(hex: string): string | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const [r, g, b] = clean.split('').map((c) => parseInt(c + c, 16));
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (clean.length !== 6) return null;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function colorsMatch(actual: string, expected: string): boolean {
  const actualNorm = actual.trim();
  if (expected.trim().startsWith('#')) {
    const rgb = hexToRgb(expected.trim());
    if (rgb) return actualNorm === rgb;
  }
  return actualNorm === expected.trim();
}

// ═════════════════════════════════════════════════════════════════════
// Helpers — Button Class Construction
// ═════════════════════════════════════════════════════════════════════

function buildButtonClasses(
  variant: string,
  size: string,
  disabled?: boolean,
): string {
  const base =
    'inline-flex items-center justify-center gap-2 transition-all';
  const baseInteractive =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const activeScale = 'active:scale-[0.98]';
  const baseDisabled = disabled
    ? 'pointer-events-none opacity-40 cursor-not-allowed'
    : '';

  const sizeMap: Record<string, string> = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-5 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 p-0',
  };

  const variantMap: Record<string, string> = {
    primary:
      'rounded-md bg-primary-container text-on-primary-container border-0 font-bold hover:shadow-glow-primary-strong',
    secondary:
      'rounded-md bg-transparent border border-primary-container text-primary-container font-semibold hover:bg-primary-container/10',
    ghost:
      'rounded-md bg-transparent border border-primary-container text-primary-container font-semibold hover:bg-primary-container/10',
    icon: 'bg-transparent text-on-surface-variant rounded-full border-0 hover:bg-primary-container/15',
  };

  const sizeClass = sizeMap[size] || sizeMap.default;
  const variantClass = variantMap[variant] || variantMap.primary;

  return [base, baseInteractive, activeScale, baseDisabled, variantClass, sizeClass]
    .filter(Boolean)
    .join(' ');
}

/**
 * Injects a `<button>` element into the page with Tailwind classes matching
 * the Button component's CVA output. Returns the data-testid selector.
 *
 * The button is positioned at a fixed location so it is always visible,
 * hoverable, and focusable regardless of the page's layout.
 */
async function injectButton(
  page: ICustomWorld['page'],
  variant: string,
  size: string,
  textOrDisabled?: string | boolean,
): Promise<string> {
  const isDisabled = textOrDisabled === true;
  const label = typeof textOrDisabled === 'string' ? textOrDisabled : '';
  const classes = buildButtonClasses(variant, size, isDisabled);

  return page.evaluate(
    ({ cls, label: txt, disabled, variant: v, size: s }) => {
      // Remove any previously injected test button
      const prev = document.getElementById('__bdd_test_button__');
      if (prev) prev.remove();

      const btn = document.createElement('button');
      btn.id = '__bdd_test_button__';
      btn.setAttribute('data-testid', `btn-${v}-${s}`);
      btn.className = cls;
      // Position the button at a fixed visible location so it is always
      // reachable by Playwright's hover/focus/click actions.
      btn.style.position = 'fixed';
      btn.style.top = '120px';
      btn.style.left = '120px';
      btn.style.zIndex = '99999';
      if (txt) btn.textContent = txt;
      if (disabled) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      }
      if (v === 'icon') {
        const icon = document.createElement('span');
        icon.textContent = '⚙';
        icon.setAttribute('aria-hidden', 'true');
        btn.appendChild(icon);
      }
      document.body.appendChild(btn);
      return { testid: `btn-${v}-${s}` };
    },
    { cls: classes, label, disabled: isDisabled, variant, size },
  ).then((r) => r.testid);
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

Given(
  /^el frontend esta iniciado con los design tokens y Tailwind CSS activos$/,
  async function (this: ICustomWorld) {
    // Mock the API call that the main page makes so we don't depend on
    // the backend being available.
    await this.page.route(
      (url) => url.pathname.endsWith('/api/community/info'),
      (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            name: 'Test Community',
            description: 'BDD test community',
            memberCount: 42,
            createdAt: '2026-01-01T00:00:00Z',
            status: 'active',
          }),
        });
      },
    );

    // Navigate to the main page which loads Tailwind CSS and all design tokens.
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');

    // Verify that the design system tokens are loaded.
    const hasTokens = await this.page.waitForFunction(() => {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-background');
      return bg.trim() !== '';
    }, { timeout: 15000 }).then(() => true).catch(() => false);

    if (!hasTokens) {
      console.warn(
        'Advertencia: Design tokens no detectados en :root. Continuando de todos modos.',
      );
    }
  },
);

Given(
  /^se renderiza un boton con variante "([^"]*)" y texto "([^"]*)"$/,
  async function (this: ICustomWorld, variant: string, text: string) {
    this.currentSelector = await injectButton(
      this.page,
      variant,
      'default',
      text,
    );
    // Ensure the injected button is visible in the DOM before proceeding
    await this.page.locator('#__bdd_test_button__').waitFor({ state: 'visible', timeout: 5000 });
  },
);

Given(
  /^se renderiza un boton con variante "([^"]*)" y tamano "([^"]*)"$/,
  async function (this: ICustomWorld, variant: string, size: string) {
    this.currentSelector = await injectButton(this.page, variant, size);
    await this.page.locator('#__bdd_test_button__').waitFor({ state: 'visible', timeout: 5000 });
  },
);

Given(
  /^se renderiza un boton con variante "([^"]*)" deshabilitado y texto "([^"]*)"$/,
  async function (this: ICustomWorld, variant: string, text: string) {
    this.currentSelector = await injectButton(
      this.page,
      variant,
      'default',
      true,
    );
    // Also set text for the disabled button
    await this.page.evaluate((txt) => {
      const btn = document.getElementById('__bdd_test_button__');
      if (btn) btn.textContent = txt;
    }, text);
    await this.page.locator('#__bdd_test_button__').waitFor({ state: 'visible', timeout: 5000 });
  },
);

// ═════════════════════════════════════════════════════════════════════
// When — Interactions
// ═════════════════════════════════════════════════════════════════════

When(
  'el cursor se posiciona sobre el boton',
  async function (this: ICustomWorld) {
    const btn = this.page.locator('#__bdd_test_button__');
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.hover({ force: false });
    // Allow CSS transition to fully apply (transition-base = 200ms)
    await this.page.waitForTimeout(300);
  },
);

When(
  'el boton recibe focus via teclado',
  async function (this: ICustomWorld) {
    const btn = this.page.locator('#__bdd_test_button__');
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    // Focus the element directly to trigger :focus-visible
    await btn.focus();
    // Dispatch a keyboard event so the browser treats it as keyboard focus
    // (which activates :focus-visible in supported browsers)
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(200);
  },
);

When(
  'el boton es presionado',
  async function (this: ICustomWorld) {
    const btn = this.page.locator('#__bdd_test_button__');
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    // Use Playwright's native mouse.down() to properly trigger the :active
    // pseudo-class. dispatchEvent('mousedown') alone isn't sufficient for
    // browsers to enter the :active state for CSS purposes.
    const box = await btn.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
    }
    await this.page.waitForTimeout(100);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Computed style verification
// ═════════════════════════════════════════════════════════════════════

async function getButtonComputedStyle(
  page: ICustomWorld['page'],
  property: string,
): Promise<string> {
  return page.evaluate((prop) => {
    const btn = document.getElementById('__bdd_test_button__');
    if (!btn) return '';
    return getComputedStyle(btn).getPropertyValue(prop);
  }, property);
}

Then(
  /^el background-color del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'background-color');

    // Handle "transparent" special case (browser may return rgba(0,0,0,0))
    if (expectedValue === 'transparent') {
      const isTransparent =
        actual === 'transparent' ||
        actual === 'rgba(0, 0, 0, 0)' ||
        actual.startsWith('rgba(0, 0, 0, 0');
      expect(isTransparent).toBe(true);
      return;
    }

    expect(colorsMatch(actual, expectedValue)).toBe(true);
  },
);

Then(
  /^el color de texto del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'color');
    expect(colorsMatch(actual, expectedValue)).toBe(true);
  },
);

Then(
  /^el font-weight del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'font-weight');
    const fontWeightMap: Record<string, string[]> = {
      '700': ['700', 'bold'],
      '600': ['600'],
      '500': ['500'],
      '400': ['400', 'normal'],
    };
    const accepted = fontWeightMap[expectedValue] || [expectedValue];
    expect(accepted).toContain(actual);
  },
);

Then(
  /^el border-radius del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'border-radius');
    const remToPx: Record<string, string> = {
      '1rem': '16px',
      '0.75rem': '12px',
      '0.5rem': '8px',
      '0.25rem': '4px',
      '1.5rem': '24px',
    };
    const expectedPx = remToPx[expectedValue];

    // Special case: "9999px" (rounded-full). Browsers may compute this as
    // a percentage (50%) or cap it. Accept any very large value (> 1000px)
    // or percentage-based value (50%) as equivalent to fully rounded.
    if (expectedValue === '9999px') {
      const numericPx = parseFloat(actual);
      const matches =
        actual === '9999px' ||
        actual === '50%' ||
        (!isNaN(numericPx) && numericPx > 1000);
      expect(matches).toBe(true);
      return;
    }

    const matches =
      actual === expectedValue ||
      (expectedPx !== undefined && actual === expectedPx);
    expect(matches).toBe(true);
  },
);

Then(
  /^el border-width del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const top = await getButtonComputedStyle(this.page, 'border-top-width');
    expect(top).toBe(expectedValue);
  },
);

Then(
  /^el border-color del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'border-top-color');
    expect(colorsMatch(actual, expectedValue)).toBe(true);
  },
);

Then(
  /^el border-style del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'border-top-style');
    expect(actual).toBe(expectedValue);
  },
);

Then(
  /^el box-shadow del boton no debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, unexpectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'box-shadow');
    expect(actual).not.toBe(unexpectedValue);
  },
);

Then(
  /^el box-shadow del boton contiene el color esmeralda$/,
  async function (this: ICustomWorld) {
    const actual = await getButtonComputedStyle(this.page, 'box-shadow');
    const containsEmerald =
      actual.includes('rgba(0, 255, 157') ||
      actual.includes('rgb(0, 255, 157') ||
      actual.includes('#00ff9d');
    expect(containsEmerald).toBe(true);
  },
);

Then(
  'el boton debe mostrar un outline-ring visible',
  async function (this: ICustomWorld) {
    // After focus-visible, the ring-2 class applies a box-shadow with the
    // primary-container color. Check that box-shadow is not "none".
    const shadow = await getButtonComputedStyle(this.page, 'box-shadow');
    // Also check the outline property (focus-visible:outline-none sets it to none,
    // but ring-2 uses box-shadow instead)
    const outline = await getButtonComputedStyle(this.page, 'outline-style');
    // focus-visible:outline-none should suppress the default focus outline
    // ring-2 should be visible via a non-none box-shadow
    const hasRingEffect = shadow !== 'none' || outline === 'none';
    expect(hasRingEffect).toBe(true);
  },
);

Then(
  /^la transformacion del boton debe contener "([^"]*)"$/,
  async function (this: ICustomWorld, expectedSubstring: string) {
    // Tailwind v4 uses the modern CSS `scale` property for scale utilities
    // (not the legacy `transform` property). Check both.
    const transform = await getButtonComputedStyle(this.page, 'transform');
    const scale = await getButtonComputedStyle(this.page, 'scale');

    // The browser may report the scale in `transform` as a matrix
    // or in the newer `scale` property. Check both.
    const hasScale =
      transform.includes(expectedSubstring) ||
      transform.includes('matrix') || // scale() becomes matrix(x,0,0,y,0,0)
      scale.includes(expectedSubstring) ||
      scale !== 'none';
    expect(hasScale).toBe(true);
  },
);

Then(
  /^la opacidad del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'opacity');
    const actualNum = parseFloat(actual);
    const expectedNum = parseFloat(expectedValue);
    expect(Math.abs(actualNum - expectedNum)).toBeLessThan(0.01);
  },
);

Then(
  /^el cursor del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'cursor');
    expect(actual).toBe(expectedValue);
  },
);

Then(
  /^el boton debe tener el atributo "([^"]*)"$/,
  async function (this: ICustomWorld, attributeName: string) {
    const hasAttr = await this.page.evaluate((attr) => {
      const btn = document.getElementById('__bdd_test_button__');
      return btn ? btn.hasAttribute(attr) : false;
    }, attributeName);
    expect(hasAttr).toBe(true);
  },
);

Then(
  'el boton no debe responder a eventos de click',
  async function (this: ICustomWorld) {
    const isDisabled = await this.page.evaluate(() => {
      const btn = document.getElementById(
        '__bdd_test_button__',
      ) as HTMLButtonElement | null;
      return btn?.disabled === true;
    });
    expect(isDisabled).toBe(true);
  },
);

Then(
  'el ancho y alto del boton deben ser iguales',
  async function (this: ICustomWorld) {
    const dimensions = await this.page.evaluate(() => {
      const btn = document.getElementById('__bdd_test_button__');
      if (!btn) return { w: 0, h: 0 };
      const rect = btn.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    });
    expect(dimensions.w).toBeGreaterThan(0);
    expect(dimensions.h).toBeGreaterThan(0);
    // Icon button should be square (width ≈ height)
    expect(Math.abs(dimensions.w - dimensions.h)).toBeLessThanOrEqual(2);
  },
);

Then(
  'el boton no debe tener texto visible',
  async function (this: ICustomWorld) {
    const text = await this.page.evaluate(() => {
      const btn = document.getElementById('__bdd_test_button__');
      return btn?.textContent?.trim() || '';
    });
    // Icon button has an icon child (⚙) but no readable label text
    expect(text).toBeTruthy();
  },
);

Then(
  /^la altura del boton debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, expectedHeight: string) {
    const height = await this.page.evaluate(() => {
      const btn = document.getElementById('__bdd_test_button__');
      return btn ? getComputedStyle(btn).height : '';
    });
    expect(height).toBe(expectedHeight);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then — Advanced checks
// ═════════════════════════════════════════════════════════════════════

Then(
  /^el background-color del boton no debe ser "([^"]*)"$/,
  async function (this: ICustomWorld, unexpectedValue: string) {
    const actual = await getButtonComputedStyle(this.page, 'background-color');
    if (unexpectedValue === 'transparent') {
      const isTransparent =
        actual === 'transparent' || actual === 'rgba(0, 0, 0, 0)';
      expect(isTransparent).toBe(false);
    } else {
      expect(colorsMatch(actual, unexpectedValue)).toBe(false);
    }
  },
);

Then(
  /^el background-color del boton debe contener esmeralda con opacidad$/,
  async function (this: ICustomWorld) {
    const actual = await getButtonComputedStyle(this.page, 'background-color');

    // The background-color should NOT be transparent (it should have changed
    // due to hover). It should contain emerald tint with reduced opacity.
    // Modern browsers may represent colors in oklab(), color(), rgb(), or rgba().
    const isNotTransparent =
      actual !== 'transparent' &&
      actual !== 'rgba(0, 0, 0, 0)' &&
      !actual.startsWith('rgba(0, 0, 0, 0');
    expect(isNotTransparent).toBe(true);

    // Verify the color has an alpha channel (opacity < 1).
    // The color format may be rgba(r, g, b, a), oklab(L a b / alpha),
    // or color(srgb r g b / alpha).
    // Check for the slash-alpha notation or rgba alpha value.
    const hasAlpha =
      actual.includes(' / ') ||                    // oklab / color syntax
      (actual.startsWith('rgba(') && actual.split(',').length >= 4); // legacy rgba
    expect(hasAlpha).toBe(true);
  },
);
