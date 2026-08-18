import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Lee una CSS custom property via getComputedStyle en el navegador.
 * Devuelve el valor (trimmed), o string vacio si no existe.
 */
async function getCssCustomProperty(page: ICustomWorld['page'], propertyName: string): Promise<string> {
  return page.evaluate((prop) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(prop);
    return value ? value.trim() : '';
  }, propertyName);
}

/**
 * Normaliza un valor CSS (expected o actual) para comparacion semantica.
 *
 * El navegador puede serializar custom properties de forma distinta al CSS fuente:
 *   - "0.6"    → ".6"     (leading zero stripped)
 *   - "0.25rem" → ".25rem"
 *   - "150ms"  → "0.15s" → ".15s"  (ms→s + stripped zero)
 *   - 'Montserrat' → "Montserrat"  (quote type changed)
 *
 * Esta funcion normaliza ambas direcciones para que la comparacion sea robusta:
 *   1. Convierte tiempos de ms a s (150ms → 0.15s)
 *   2. Elimina el leading zero de decimales (0.15 → .15)
 *   3. Normaliza comillas simples a dobles
 */
function normalizeCssValue(value: string): string {
  let normalized = value;

  // 1. Convierte <digits>ms a su equivalente en segundos: 150ms → 0.15s
  //    (el navegador siempre serializa tiempos en segundos)
  normalized = normalized.replace(/(\d+)ms\b/g, (_match, digits) => {
    const ms = parseInt(digits, 10);
    const s = ms / 1000;
    // Si es entero (1000, 2000, etc.) → "1s", "2s"
    // Si tiene decimales (150, 250) → "0.15s", "0.25s"
    return `${s}s`;
  });

  // 2. Elimina el leading zero de numeros decimales:
  //    "0.15s" → ".15s", "0.6" → ".6", "0.25rem" → ".25rem"
  //    Solo aplica a tokens que empiezan con "0." o tienen " 0." antes
  normalized = normalized.replace(/\b0\.(\d)/g, '.$1');

  // 3. Normaliza comillas simples → dobles (el navegador las serializa con dobles)
  normalized = normalized.replace(/'/g, '"');

  return normalized;
}

// ═════════════════════════════════════════════════════════════════════
// Given
// ═════════════════════════════════════════════════════════════════════

Given('el frontend está iniciado', async function (this: ICustomWorld) {
  // El frontend ya fue iniciado por el hook BeforeAll en support/hooks.ts
  const isReady = await this.page.evaluate(() => document.readyState);
  expect(isReady).toBeTruthy();
});

Given('el usuario navega a la página principal', async function (this: ICustomWorld) {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

// ═════════════════════════════════════════════════════════════════════
// When
// ═════════════════════════════════════════════════════════════════════

When('se cargan los estilos del documento', async function (this: ICustomWorld) {
  if (!this.page.url().includes(this.baseUrl) || this.page.url() === 'about:blank') {
    await this.page.goto(this.baseUrl);
  }
  await this.page.waitForLoadState('networkidle');

  // Esperar a que los estilos CSS esten aplicados en :root
  await this.page.waitForFunction(() => {
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-background');
    return bgColor.trim() !== '';
  }, { timeout: 10000 }).catch(() => {
    console.warn('Advertencia: --color-background no detectado en :root tras 10s');
  });
});

// ═════════════════════════════════════════════════════════════════════
// Then
// ═════════════════════════════════════════════════════════════════════

/**
 * Paso: "debe existir {token} con valor {expected}"
 * Compara el valor normalizado de la custom property contra el expected normalizado.
 */
Then(
  'debe existir {string} con valor {string}',
  async function (this: ICustomWorld, tokenName: string, expectedValue: string) {
    const rawActual = await getCssCustomProperty(this.page, tokenName);
    const normalizedActual = normalizeCssValue(rawActual);
    const normalizedExpected = normalizeCssValue(expectedValue);
    expect(normalizedActual).toBe(normalizedExpected);
  }
);

/**
 * Paso: "debe existir {token} cuyo valor contiene {substring}"
 * Verifica que el valor (real o normalizado) contenga el substring,
 * soportando que rgba() sea convertido a hex por el navegador.
 */
Then(
  'debe existir {string} cuyo valor contiene {string}',
  async function (this: ICustomWorld, tokenName: string, expectedSubstring: string) {
    const rawActual = await getCssCustomProperty(this.page, tokenName);

    // El navegador puede convertir rgba() → hex.
    // Para glow tokens: "rgba(0, 255, 157" → el hex equivalente es "#00ff9d"
    // Verificamos si el valor contiene el substring esperado O su equivalente hex.
    const hexEquivalent = convertRgbaSubstringToHex(expectedSubstring);

    const containsSubstring = rawActual.includes(expectedSubstring);
    const containsHex = hexEquivalent ? rawActual.includes(hexEquivalent) : false;

    expect(containsSubstring || containsHex).toBe(true);
  }
);

/**
 * Paso: "debe existir {token}"
 * Verifica que la custom property este definida (valor no vacio).
 */
Then(
  'debe existir {string}',
  async function (this: ICustomWorld, tokenName: string) {
    const actualValue = await getCssCustomProperty(this.page, tokenName);
    expect(actualValue).not.toBe('');
  }
);

// ═════════════════════════════════════════════════════════════════════
// Color conversion helper
// ═════════════════════════════════════════════════════════════════════

/**
 * Si el substring es una parte de rgba(r, g, b, ...), convierte r, g, b
 * a su equivalente hex (#RRGGBB) para comparacion contra la serializacion
 * del navegador.
 *
 * Ejemplo: "rgba(0, 255, 157" → "#00ff9d"
 */
function convertRgbaSubstringToHex(substring: string): string | null {
  const rgbaMatch = substring.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!rgbaMatch) return null;

  const r = parseInt(rgbaMatch[1], 10);
  const g = parseInt(rgbaMatch[2], 10);
  const b = parseInt(rgbaMatch[3], 10);

  const hex = [r, g, b]
    .map((c) => c.toString(16).padStart(2, '0'))
    .join('');

  return `#${hex}`;
}
