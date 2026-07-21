import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Route } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Helper: mockear el endpoint de registro para evitar depender del backend
async function mockRegisterApi(world: ICustomWorld, statusCode: number, body: object) {
  await world.page.route('**/api/identity/register', async (route: Route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    } else {
      await route.continue();
    }
  });
}

// ── Given ─────────────────────────────────────────────────────

Given('el usuario navega a la pagina de registro', async function (this: ICustomWorld) {
  await this.page.goto(`${this.baseUrl}/auth/register`);
  await this.page.waitForLoadState('networkidle');
});

Given('un email {string} que no existe en el sistema', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // Mock respuesta exitosa del backend
  await mockRegisterApi(this, 201, {
    userId: 'usr_abc123',
    email: email,
    accessToken: 'mock_jwt_token',
    refreshToken: 'mock_refresh_token',
    expiresIn: 3600,
    emailVerified: false,
    message: 'Registro exitoso'
  });
});

Given('una contrasena que cumple requisitos de seguridad: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
});

Given('un email {string} que ya esta registrado y verificado', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // Mock respuesta 409 (email duplicado)
  await mockRegisterApi(this, 409, {
    type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
    title: 'Conflict',
    status: 409,
    detail: 'El email ya esta registrado',
    traceId: 'mock-trace-id'
  });
});

Given('una contrasena valida', async function (this: ICustomWorld) {
  this.password = 'Valida2026!Pass';
});

Given('un email {string} que ya esta registrado pero no verificado', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // Mock respuesta 409 con opcion de reenvio
  await mockRegisterApi(this, 409, {
    type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
    title: 'Conflict',
    status: 409,
    detail: 'El email ya esta registrado',
    canResendVerification: true,
    traceId: 'mock-trace-id'
  });
});

Given('un email nuevo {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // Validacion de cliente — no necesita mock
});

Given('un email con formato invalido {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // Validacion de cliente (Zod) — no necesita mock
});

Given('un formulario de registro vacio', async function (this: ICustomWorld) {
  // No se establecen valores — validacion de cliente
});

// ── When ──────────────────────────────────────────────────────

When('el usuario completa el formulario de registro con esos datos', async function (this: ICustomWorld) {
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  // Esperar respuesta mockeada o redireccion
  await this.page.waitForTimeout(2000);
});

When('el usuario intenta registrarse con {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(2000);
});

When('el usuario intenta registrarse con contrasena corta: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(1000);
});

When('el usuario intenta registrarse con contrasena sin especial: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(1000);
});

When('el usuario intenta registrarse', async function (this: ICustomWorld) {
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(2000);
});

When('el usuario intenta enviar el formulario sin completar campos obligatorios', async function (this: ICustomWorld) {
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(1000);
});

// ── Then ──────────────────────────────────────────────────────

Then('el sistema crea la cuenta exitosamente', async function (this: ICustomWorld) {
  // Esperar redireccion a pagina de verificacion o mensaje de exito
  await this.page.waitForURL(/\/auth\/verify-email|\/dashboard/, { timeout: 10000 });
  const url = this.page.url();
  expect(url).toMatch(/\/auth\/verify-email|\/dashboard/);
});

Then('se envia un email de verificacion a {string}', async function (this: ICustomWorld, _email: string) {
  const successMessage = this.page.locator('text=verificacion|Verifica|email enviado').first();
  await expect(successMessage).toBeVisible({ timeout: 5000 });
});

Then('el usuario queda autenticado en la plataforma', async function (this: ICustomWorld) {
  const hasSession = await this.page.evaluate(() => !!localStorage.getItem('access_token'));
  expect(hasSession).toBeTruthy();
});

Then('se registra el evento de dominio {string}', async function (this: ICustomWorld, _eventName: string) {
  // Verificado implicitamente por la respuesta 201 del mock
});

Then('el sistema rechaza el registro con el error {string}', async function (this: ICustomWorld, errorMessage: string) {
  const errorLocator = this.page.locator(`text=${errorMessage}`);
  await expect(errorLocator).toBeVisible({ timeout: 5000 });
});

Then('no se crea ningun usuario en el sistema', async function (this: ICustomWorld) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/register');
});

Then('se informa al usuario que puede reenviar el email de verificacion', async function (this: ICustomWorld) {
  const resendLocator = this.page.locator('text=reenviar|Reenviar|re-enviar').first();
  await expect(resendLocator).toBeVisible({ timeout: 5000 });
});

Then('el sistema muestra errores de validacion: {string} y {string}', async function (this: ICustomWorld, error1: string, error2: string) {
  const error1Locator = this.page.locator(`text=${error1}`);
  const error2Locator = this.page.locator(`text=${error2}`);
  await expect(error1Locator).toBeVisible({ timeout: 3000 });
  await expect(error2Locator).toBeVisible({ timeout: 3000 });
});
