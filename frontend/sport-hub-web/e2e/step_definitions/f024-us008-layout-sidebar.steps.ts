import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { ICustomWorld } from '../support/world';

// ═════════════════════════════════════════════════════════════════════
// Constants
// ═════════════════════════════════════════════════════════════════════

const DESKTOP_VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

// ═════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════

/**
 * Mockea todas las llamadas API del backend para que las pruebas BDD
 * no dependan de servicios externos (BD, Auth0, Redis, etc.).
 * Usa page.route() a nivel de red del navegador para interceptar.
 */
async function mockAllBackendApis(page: Page): Promise<void> {
  // Mock: GET /api/community/info (usado por la pagina principal)
  await page.route(
    (url) => url.pathname === '/api/community/info',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'SportHub Community',
          description: 'Comunidad deportiva de prueba para BDD',
          memberCount: 128,
          createdAt: new Date().toISOString(),
          status: 'healthy',
        }),
      });
    },
  );

  // Mock generico para cualquier otra llamada a /api/* que falle
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not mocked in BDD' }),
      });
    },
  );
}

/**
 * Inyecta contenido adicional en el area principal para forzar scroll.
 * Agrega varios modulos con altura suficiente para exceder el viewport.
 */
async function injectScrollContent(page: Page): Promise<void> {
  await page.evaluate(() => {
    const main = document.querySelector('main[role="main"]');
    if (!main) return;

    // Crear 5 modulos de contenido adicionales
    for (let i = 1; i <= 5; i++) {
      const module = document.createElement('div');
      module.className = 'scroll-test-module';
      module.setAttribute('data-testid', `scroll-module-${i}`);
      module.style.cssText = `
        min-height: 300px;
        background: #1e2023;
        border-radius: 12px;
        padding: 24px;
        margin: 0;
        border: 1px solid #333538;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e2e2e6;
        font-size: 18px;
        font-weight: 600;
        flex-shrink: 0;
      `;
      module.textContent = `Modulo de Contenido ${i}`;
      main.appendChild(module);
    }
  });
}

/**
 * Obtiene el estilo computado de una propiedad CSS para un elemento.
 */
async function getComputedStyleValue(
  page: Page,
  selector: string,
  property: string,
): Promise<string> {
  return page.evaluate(
    ({ sel, prop }) => {
      const el = document.querySelector(sel);
      if (!el) return '';
      return getComputedStyle(el).getPropertyValue(prop).trim();
    },
    { sel: selector, prop: property },
  );
}

/**
 * Obtiene la posicion (x, y) de un elemento relativa al viewport.
 */
async function getElementPosition(
  page: Page,
  selector: string,
): Promise<{ x: number; y: number; width: number; height: number }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { x: 0, y: 0, width: 0, height: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }, selector);
}

// ═════════════════════════════════════════════════════════════════════
// Given — Setup
// ═════════════════════════════════════════════════════════════════════
// Nota: "Given el frontend está iniciado" y "When el usuario navega a la página principal"
//       ya estan definidos en f024-us001-design-tokens.steps.ts y se reutilizan aqui.

Given('las APIs del backend están mockeadas', async function (this: ICustomWorld) {
  await mockAllBackendApis(this.page);
});

Given('el viewport es escritorio de {int}x{int}', async function (
  this: ICustomWorld,
  width: number,
  height: number,
) {
  await this.page.setViewportSize({ width, height });
});

Given('el viewport es mobile de {int}x{int}', async function (
  this: ICustomWorld,
  width: number,
  height: number,
) {
  await this.page.setViewportSize({ width, height });
});

Given('existen modulos de contenido en el area principal', async function (this: ICustomWorld) {
  // Asegurarse de que hay multiples elementos card/modulo en el main content
  // El home page ya tiene feature cards; verificamos que existan
  await this.page.waitForSelector('main[role="main"]', { timeout: 10000 });

  // Asegurar que exista al menos contenido con modulos visibles
  const mainContent = this.page.locator('main[role="main"]');
  await mainContent.waitFor({ state: 'visible', timeout: 10000 });
});

Given('existe contenido que excede la altura del viewport', async function (this: ICustomWorld) {
  // Inyectar modulos de contenido adicionales para forzar scroll
  await this.page.waitForSelector('main[role="main"]', { timeout: 10000 });
  await injectScrollContent(this.page);

  // Verificar que el contenido efectivamente excede el viewport
  await this.page.waitForTimeout(500); // esperar render
  const bodyHeight = await this.page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = this.page.viewportSize()?.height ?? 720;
  expect(bodyHeight).toBeGreaterThan(viewportHeight);
});

// ═════════════════════════════════════════════════════════════════════
// When — Actions
// ═════════════════════════════════════════════════════════════════════

When('se inspecciona el contenedor principal de contenido', async function (this: ICustomWorld) {
  // Verificar que el main content existe y tiene el gap correcto
  const mainEl = this.page.locator('main[role="main"]');
  await mainEl.waitFor({ state: 'visible', timeout: 10000 });
});

When('el usuario hace scroll hacia abajo', async function (this: ICustomWorld) {
  // Hacer scroll en la ventana
  await this.page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  // Esperar que el scroll se complete
  await this.page.waitForTimeout(500);
});

// ═════════════════════════════════════════════════════════════════════
// Then — Assertions: Sidebar en Desktop
// ═════════════════════════════════════════════════════════════════════

Then('el sidebar debe ser visible', async function (this: ICustomWorld) {
  const sidebar = this.page.locator('aside[role="navigation"][aria-label="Sidebar"]');
  await sidebar.waitFor({ state: 'visible', timeout: 10000 });

  // Verificar que no esta traducido fuera de pantalla
  const transform = await sidebar.evaluate((el) =>
    getComputedStyle(el).transform,
  );
  // En desktop, translateX debe ser 0 (o no tener transform de translate)
  const bbox = await sidebar.boundingBox();
  expect(bbox).not.toBeNull();
  if (bbox) {
    // El sidebar debe estar en x=0 (pegado al borde izquierdo)
    expect(bbox.x).toBeLessThan(10);
  }
});

Then('el ancho del sidebar debe ser {int}px', async function (this: ICustomWorld, expectedWidth: number) {
  const sidebar = this.page.locator('aside[role="navigation"][aria-label="Sidebar"]');
  const bbox = await sidebar.boundingBox();
  expect(bbox).not.toBeNull();
  if (bbox) {
    // Tolerancia de 2px por bordes/subpixel rendering
    expect(bbox.width).toBeGreaterThanOrEqual(expectedWidth - 2);
    expect(bbox.width).toBeLessThanOrEqual(expectedWidth + 2);
  }
});

Then('la altura del sidebar debe ser igual al viewport \\(100vh\\)', async function (this: ICustomWorld) {
  const viewportHeight = this.page.viewportSize()?.height ?? 720;
  const sidebar = this.page.locator('aside[role="navigation"][aria-label="Sidebar"]');
  const bbox = await sidebar.boundingBox();
  expect(bbox).not.toBeNull();
  if (bbox) {
    // La altura debe ser al menos el 95% del viewport (tolerancia por bordes)
    expect(bbox.height).toBeGreaterThanOrEqual(viewportHeight * 0.95);
    expect(bbox.height).toBeLessThanOrEqual(viewportHeight + 5);
  }
});

Then('el background-color del sidebar debe ser {string}', async function (
  this: ICustomWorld,
  expectedColor: string,
) {
  const bgColor = await getComputedStyleValue(
    this.page,
    'aside[role="navigation"][aria-label="Sidebar"]',
    'background-color',
  );
  // Normalizar: convertir rgb a hex o comparar directamente
  // El navegador devuelve rgb() — convertimos ambos a lowercase sin espacios
  const normalizeColor = (c: string) =>
    c.replace(/\s+/g, '').toLowerCase();

  // Si expected es "#111317", convertimos a rgb(17, 19, 23)
  if (expectedColor.startsWith('#')) {
    const r = parseInt(expectedColor.slice(1, 3), 16);
    const g = parseInt(expectedColor.slice(3, 5), 16);
    const b = parseInt(expectedColor.slice(5, 7), 16);
    const rgbEquivalent = `rgb(${r},${g},${b})`;
    expect(normalizeColor(bgColor)).toBe(rgbEquivalent);
  } else {
    expect(normalizeColor(bgColor)).toBe(normalizeColor(expectedColor));
  }
});

Then('la posicion del sidebar debe ser {string}', async function (
  this: ICustomWorld,
  expectedPosition: string,
) {
  const position = await getComputedStyleValue(
    this.page,
    'aside[role="navigation"][aria-label="Sidebar"]',
    'position',
  );
  expect(position).toBe(expectedPosition);
});

// ═════════════════════════════════════════════════════════════════════
// Then — Assertions: Sidebar en Mobile
// ═════════════════════════════════════════════════════════════════════

Then('el sidebar no debe ser visible por defecto', async function (this: ICustomWorld) {
  // En mobile, el sidebar debe estar con translateX(-100%) o width 0
  const sidebar = this.page.locator('aside[role="navigation"][aria-label="Sidebar"]');

  // Verificar que esta fuera de pantalla o tiene clase que lo oculta
  const isHidden = await sidebar.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    // O bien el transform lo saco de pantalla, o el rect no interseca viewport
    const isTransformedOut = style.transform.includes('matrix') && rect.right <= 0;
    const isBeyondViewport = rect.right <= 0 || rect.width === 0;
    return isTransformedOut || isBeyondViewport;
  });

  expect(isHidden).toBe(true);
});

Then('el contenido principal debe ocupar el {int}% del ancho', async function (
  this: ICustomWorld,
  expectedPercent: number,
) {
  const viewportWidth = this.page.viewportSize()?.width ?? 375;
  const mainBbox = await this.page.locator('main[role="main"]').boundingBox();
  expect(mainBbox).not.toBeNull();
  if (mainBbox) {
    const actualPercent = Math.round((mainBbox.width / viewportWidth) * 100);
    // En mobile, el contenido debe ocupar ~100% (tolerancia de ±5% por padding)
    expect(actualPercent).toBeGreaterThanOrEqual(expectedPercent - 5);
    expect(actualPercent).toBeLessThanOrEqual(expectedPercent + 5);
  }
});

Then('el padding del contenido principal debe ser {int}px', async function (
  this: ICustomWorld,
  expectedPadding: number,
) {
  const padding = await getComputedStyleValue(
    this.page,
    'main[role="main"]',
    'padding',
  );

  // El padding puede ser compuesto "16px" o "16px 16px 16px 16px"
  const firstValue = padding.split(' ')[0];
  expect(firstValue).toBe(`${expectedPadding}px`);
});

// ═════════════════════════════════════════════════════════════════════
// Then — Assertions: Hamburger Menu
// ═════════════════════════════════════════════════════════════════════

Then('debe aparecer un icono de menu hamburguer', async function (this: ICustomWorld) {
  // El boton hamburguer principal tiene aria-label "Abrir menu" o "Cerrar menu"
  // NOTA: evitar "Cerrar sidebar" que es el boton dentro del drawer
  const hamburgerBtn = this.page.locator(
    'button[aria-label="Abrir menu"], button[aria-label="Cerrar menu"]',
  );
  await hamburgerBtn.waitFor({ state: 'visible', timeout: 10000 });
});

Then('el boton hamburguer debe tener el atributo aria-label {string}', async function (
  this: ICustomWorld,
  expectedLabel: string,
) {
  const hamburgerBtn = this.page.locator(
    `button[aria-label="${expectedLabel}"]`,
  );
  await hamburgerBtn.waitFor({ state: 'visible', timeout: 10000 });
});

Then('el boton hamburguer debe ser visible', async function (this: ICustomWorld) {
  // En mobile (<1024px), el boton hamburguer debe ser visible (clase lg:hidden)
  const hamburgerBtn = this.page.locator(
    'button[aria-label="Abrir menu"], button[aria-label="Cerrar menu"]',
  );
  await hamburgerBtn.waitFor({ state: 'visible', timeout: 10000 });

  const isVisible = await hamburgerBtn.isVisible();
  expect(isVisible).toBe(true);
});

// ═════════════════════════════════════════════════════════════════════
// Then — Assertions: Main Content Layout
// ═════════════════════════════════════════════════════════════════════

Then('el margin-left del contenido principal debe ser {int}px', async function (
  this: ICustomWorld,
  expectedMargin: number,
) {
  const marginLeft = await getComputedStyleValue(
    this.page,
    'main[role="main"]',
    'margin-left',
  );
  expect(marginLeft).toBe(`${expectedMargin}px`);
});

Then('el gap entre modulos debe ser {int}px', async function (
  this: ICustomWorld,
  expectedGap: number,
) {
  const gap = await getComputedStyleValue(
    this.page,
    'main[role="main"]',
    'gap',
  );
  // El gap puede ser "24px" o "24px 24px"
  const firstGapValue = gap.split(' ')[0];
  expect(firstGapValue).toBe(`${expectedGap}px`);
});

// ═════════════════════════════════════════════════════════════════════
// Then — Assertions: Scroll Behavior
// ═════════════════════════════════════════════════════════════════════

Then('el sidebar no debe cambiar su posicion', async function (this: ICustomWorld) {
  const sidebarLocator = this.page.locator(
    'aside[role="navigation"][aria-label="Sidebar"]',
  );

  // Capturar la posicion actual
  const initialBbox = await sidebarLocator.boundingBox();
  expect(initialBbox).not.toBeNull();

  // Verificar que la posicion del sidebar es fixed (no cambia con el scroll)
  const position = await getComputedStyleValue(
    this.page,
    'aside[role="navigation"][aria-label="Sidebar"]',
    'position',
  );
  expect(position).toBe('fixed');

  // Verificar que el sidebar sigue en la misma posicion (x=0) despues del scroll
  if (initialBbox) {
    const currentBbox = await sidebarLocator.boundingBox();
    expect(currentBbox).not.toBeNull();
    if (currentBbox) {
      // La posicion y debe ser 0 (pegado al top), porque es fixed
      expect(currentBbox.y).toBeLessThanOrEqual(5);
      expect(currentBbox.x).toBeLessThanOrEqual(5);
    }
  }
});

Then('el contenido principal debe desplazarse verticalmente', async function (this: ICustomWorld) {
  // Verificar que la pagina efectivamente hizo scroll
  const scrollY = await this.page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThan(0);
});

Then('el contenido principal debe permitir scroll', async function (this: ICustomWorld) {
  const scrollHeight = await this.page.evaluate(() => document.body.scrollHeight);
  const clientHeight = await this.page.evaluate(() => document.documentElement.clientHeight);

  // El contenido total debe ser mayor que el viewport (permite scroll)
  expect(scrollHeight).toBeGreaterThan(clientHeight);

  // Resetear scroll al inicio para verificar que se puede hacer scroll hacia abajo
  await this.page.evaluate(() => window.scrollTo(0, 0));
  await this.page.waitForTimeout(300);

  const scrollYBefore = await this.page.evaluate(() => window.scrollY);
  expect(scrollYBefore).toBe(0);

  // Hacer scroll hacia abajo
  await this.page.evaluate(() => window.scrollTo(0, 150));
  await this.page.waitForTimeout(300);

  const scrollYAfter = await this.page.evaluate(() => window.scrollY);
  expect(scrollYAfter).toBeGreaterThan(0);
});

Then('el scroll debe ser fluido', async function (this: ICustomWorld) {
  // Verificar que el scroll-behavior o overflow permiten scroll nativo
  const overflow = await getComputedStyleValue(
    this.page,
    'main[role="main"]',
    'overflow-y',
  );

  // El overflow debe ser "visible" o "auto" (permitiendo scroll nativo)
  const allowsScroll =
    overflow === 'visible' || overflow === 'auto' || overflow === 'scroll';
  expect(allowsScroll).toBe(true);
});
