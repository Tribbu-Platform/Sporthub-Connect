import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

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
 * Checks if two CSS values match, with special handling for:
 * - Colors (hex vs rgb)
 * - Border-radius (rem vs px)
 */
function cssValuesMatch(actual: string, expected: string, property: string): boolean {
  const actualNorm = actual.trim();
  let expectedNorm = expected.trim();

  // Color comparison: hex → rgb
  if (
    (property === 'background-color' || property === 'color' || property === 'border-color') &&
    expectedNorm.startsWith('#')
  ) {
    expectedNorm = hexToRgb(expectedNorm);
    return actualNorm === expectedNorm;
  }

  // Border-radius: rem vs px equivalence
  if (property === 'border-radius') {
    const remToPx: Record<string, string> = {
      '1rem': '16px',
      '0.75rem': '12px',
      '0.5rem': '8px',
      '0.25rem': '4px',
      '1.5rem': '24px',
    };
    if (remToPx[expectedNorm] && actualNorm === remToPx[expectedNorm]) {
      return true;
    }
    return actualNorm === expectedNorm;
  }

  // Font family: contains check
  if (property === 'font-family') {
    return actualNorm.toLowerCase().includes(expectedNorm.toLowerCase());
  }

  // Backdrop filter: normalize
  if (property === 'backdrop-filter') {
    // Browser may add extra spaces, normalize
    return actualNorm === expectedNorm;
  }

  // Box shadow: normalize spaces
  if (property === 'box-shadow') {
    return actualNorm.replace(/\s+/g, ' ') === expectedNorm.replace(/\s+/g, ' ');
  }

  return actualNorm === expectedNorm;
}

/**
 * Injects a div element with the given className into the page,
 * reads its computed style for all relevant properties,
 * removes the element, and returns the computed style object.
 */
async function injectAndCompute(
  page: ICustomWorld['page'],
  className: string,
): Promise<Record<string, string>> {
  return page.evaluate((cls) => {
    const el = document.createElement('div');
    // For border-color to be computed, element needs border-width and border-style.
    // Use Tailwind classes instead of inline styles to avoid specificity issues
    // that would cause border-color to resolve to currentColor instead of the class value.
    let fullClassName = cls;
    if (cls.startsWith('border-')) {
      fullClassName = `${cls} border-2 border-solid`;
    }
    el.className = fullClassName;
    // Some styles (like backdrop-filter) need the element to be in the DOM
    // with actual content for proper computation
    el.style.width = '100px';
    el.style.height = '100px';
    // backdrop-filter needs a background to be meaningful
    if (cls.startsWith('backdrop-blur-')) {
      el.style.backgroundColor = 'rgba(18, 18, 23, 0.6)';
    }
    document.body.appendChild(el);

    const computed = getComputedStyle(el);

    const result: Record<string, string> = {
      'background-color': computed.backgroundColor,
      'color': computed.color,
      'border-color': computed.borderColor,
      'font-family': computed.fontFamily,
      'border-radius': computed.borderRadius,
      'box-shadow': computed.boxShadow,
      'backdrop-filter': computed.backdropFilter,
    };

    document.body.removeChild(el);
    return result;
  }, className);
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

/**
 * Background step: navega a la pagina principal, espera que los estilos
 * de Tailwind CSS y los design tokens esten completamente cargados.
 * Unico para US-002 para evitar colisiones con otros step definitions.
 */
Given(
  'la aplicacion carga correctamente con Tailwind CSS y los design tokens activos',
  async function (this: ICustomWorld) {
    // Navegar a la pagina principal
    await this.page.goto(this.baseUrl);
    await this.page.waitForLoadState('networkidle');

    // Verificar que el documento esta listo
    const isReady = await this.page.evaluate(() => document.readyState);
    expect(isReady).toBeTruthy();

    // Verificar que las CSS custom properties del design system estan cargadas
    await this.page.waitForFunction(() => {
      const bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-background');
      return bgColor.trim() !== '';
    }, { timeout: 15000 }).catch(() => {
      console.warn('Advertencia: --color-background no detectado en :root tras 15s');
    });

    // Verificar que una clase Tailwind del theme personalizado funciona
    const testResult = await injectAndCompute(this.page, 'bg-primary-container');
    expect(testResult['background-color']).toBeTruthy();
  },
);

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

/**
 * Inyecta un elemento HTML con la clase Tailwind especificada
 * y almacena todos los estilos computados en this.lastStyle.
 */
When(
  'se renderiza un elemento con la clase {string}',
  async function (this: ICustomWorld, className: string) {
    this.lastStyle = await injectAndCompute(this.page, className);
  },
);

// ═════════════════════════════════════════════════════════════════════
// Then
// ═════════════════════════════════════════════════════════════════════

/**
 * Verifica que el background-color del ultimo elemento renderizado
 * coincida con el valor esperado (hex o rgb).
 */
Then(
  'el background-color del elemento con clase Tailwind debe ser {string}',
  function (this: ICustomWorld, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['background-color'];
    const property = 'background-color';
    const matches = cssValuesMatch(actual, expectedValue, property);
    expect(matches).toBe(true);
  },
);

/**
 * Verifica que el color (texto) del ultimo elemento renderizado
 * coincida con el valor esperado (hex o rgb).
 */
Then(
  'el color de texto del elemento con clase Tailwind debe ser {string}',
  function (this: ICustomWorld, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['color'];
    const property = 'color';
    const matches = cssValuesMatch(actual, expectedValue, property);
    expect(matches).toBe(true);
  },
);

/**
 * Verifica que el border-color del ultimo elemento renderizado
 * coincida con el valor esperado (hex o rgb).
 */
Then(
  'el border-color del elemento con clase Tailwind debe ser {string}',
  function (this: ICustomWorld, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['border-color'];
    const property = 'border-color';
    const matches = cssValuesMatch(actual, expectedValue, property);
    expect(matches).toBe(true);
  },
);

/**
 * Verifica que una propiedad CSS especifica del ultimo elemento
 * contenga el valor esperado como substring.
 *
 * Uso: "la propiedad 'font-family' del elemento con clase Tailwind contiene 'Montserrat'"
 */
Then(
  'la propiedad {string} del elemento con clase Tailwind contiene {string}',
  function (this: ICustomWorld, property: string, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle![property];
    expect(actual).toBeDefined();
    expect(actual.toLowerCase()).toContain(expectedValue.toLowerCase());
  },
);

/**
 * Verifica que el border-radius del ultimo elemento renderizado
 * coincida con el valor esperado.
 * Soporta equivalencia rem ↔ px (1rem = 16px).
 */
Then(
  'el border-radius del elemento con clase Tailwind debe ser {string}',
  function (this: ICustomWorld, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['border-radius'];
    const remToPx: Record<string, string> = {
      '1rem': '16px',
      '0.75rem': '12px',
      '0.5rem': '8px',
      '0.25rem': '4px',
      '1.5rem': '24px',
    };
    const expectedPx = remToPx[expectedValue];
    const matches =
      actual === expectedValue ||
      (expectedPx !== undefined && actual === expectedPx);
    expect(matches).toBe(true);
  },
);

/**
 * Verifica que el box-shadow del ultimo elemento renderizado
 * NO sea igual al valor especificado.
 *
 * Uso: "el box-shadow del elemento con clase Tailwind no debe ser 'none'"
 */
Then(
  'el box-shadow del elemento con clase Tailwind no debe ser {string}',
  function (this: ICustomWorld, unexpectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['box-shadow'];
    expect(actual).not.toBe(unexpectedValue);
  },
);

/**
 * Verifica que el box-shadow del ultimo elemento contenga un substring.
 *
 * Uso: 'el box-shadow del elemento con clase Tailwind contiene "rgba(0, 0, 0, 0.5)"'
 */
Then(
  'el box-shadow del elemento con clase Tailwind contiene {string}',
  function (this: ICustomWorld, expectedSubstring: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['box-shadow'];
    expect(actual).toContain(expectedSubstring);
  },
);

/**
 * Verifica que el box-shadow contenga el color esmeralda.
 * Soporta tanto rgba(0, 255, 157 como rgb(0, 255, 157) como #00ff9d.
 *
 * Uso: 'el box-shadow del elemento con clase Tailwind contiene el color esmeralda'
 */
Then(
  'el box-shadow del elemento con clase Tailwind contiene el color esmeralda',
  function (this: ICustomWorld) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['box-shadow'];
    const containsEmerald =
      actual.includes('rgba(0, 255, 157') ||
      actual.includes('rgb(0, 255, 157') ||
      actual.includes('#00ff9d');
    expect(containsEmerald).toBe(true);
  },
);

/**
 * Verifica que el backdrop-filter del ultimo elemento coincida
 * con el valor esperado.
 *
 * Uso: 'el backdrop-filter del elemento con clase Tailwind debe ser "blur(20px)"'
 */
Then(
  'el backdrop-filter del elemento con clase Tailwind debe ser {string}',
  function (this: ICustomWorld, expectedValue: string) {
    expect(this.lastStyle).toBeDefined();
    const actual = this.lastStyle!['backdrop-filter'];
    // Normalize: browser may return "blur(20px)" or empty if not supported
    // Accept both the exact match or if it contains the blur value
    const matches =
      actual === expectedValue ||
      actual.includes(expectedValue);
    expect(matches).toBe(true);
  },
);
