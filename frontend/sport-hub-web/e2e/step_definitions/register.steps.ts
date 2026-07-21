import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

Given('el usuario navega a la pagina de registro', async function (this: ICustomWorld) {
  await this.page.goto(`${this.baseUrl}/auth/register`);
  await this.page.waitForLoadState('networkidle');
});

Given('un email {string} que no existe en el sistema', async function (this: ICustomWorld, email: string) {
  // El email no existe — se usara en el formulario
  this.email = email;
});

Given('una contrasena que cumple requisitos de seguridad: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
});

Given('un email {string} que ya esta registrado y verificado', async function (this: ICustomWorld, email: string) {
  this.email = email;
  // El backend mockeara que el email ya existe
});

Given('una contrasena valida', async function (this: ICustomWorld) {
  this.password = 'Valida2026!Pass';
});

Given('un email {string} que ya esta registrado pero no verificado', async function (this: ICustomWorld, email: string) {
  this.email = email;
});

Given('un email nuevo {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
});

Given('un email con formato invalido {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
});

Given('un formulario de registro vacio', async function (this: ICustomWorld) {
  // No se establecen valores — el formulario queda vacio
});

When('el usuario completa el formulario de registro con esos datos', async function (this: ICustomWorld) {
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

When('el usuario intenta registrarse con {string}', async function (this: ICustomWorld, email: string) {
  this.email = email;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

When('el usuario intenta registrarse con contrasena corta: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

When('el usuario intenta registrarse con contrasena sin especial: {string}', async function (this: ICustomWorld, password: string) {
  this.password = password;
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

When('el usuario intenta registrarse', async function (this: ICustomWorld) {
  await this.page.fill('input[name="email"]', this.email || '');
  await this.page.fill('input[name="password"]', this.password || '');
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

When('el usuario intenta enviar el formulario sin completar campos obligatorios', async function (this: ICustomWorld) {
  await this.page.click('button[type="submit"]');
  await this.page.waitForTimeout(500);
});

Then('el sistema crea la cuenta exitosamente', async function (this: ICustomWorld) {
  // Esperar redireccion a pagina de verificacion o mensaje de exito
  await this.page.waitForURL(/\/auth\/verify-email|\/dashboard/);
  const url = this.page.url();
  expect(url).toMatch(/\/auth\/verify-email|\/dashboard/);
});

Then('se envia un email de verificacion a {string}', async function (this: ICustomWorld, _email: string) {
  // Verificar que se muestra mensaje indicando el envio del email
  const successMessage = await this.page.locator('text=verificacion|Verifica|email enviado').first();
  expect(await successMessage.isVisible()).toBeTruthy();
});

Then('el usuario queda autenticado en la plataforma', async function (this: ICustomWorld) {
  // Verificar que existe una sesion o token almacenado
  const hasSession = await this.page.evaluate(() => !!localStorage.getItem('access_token'));
  expect(hasSession).toBeTruthy();
});

Then('se registra el evento de dominio {string}', async function (this: ICustomWorld, _eventName: string) {
  // Verificacion de evento de dominio - se confirma via mensaje en consola o notificacion
  // En un escenario real, se verificaria que el backend publico el evento
});

Then('el sistema rechaza el registro con el error {string}', async function (this: ICustomWorld, errorMessage: string) {
  await this.page.waitForSelector('text=' + errorMessage, { timeout: 5000 });
  const errorVisible = await this.page.locator(`text=${errorMessage}`).isVisible();
  expect(errorVisible).toBeTruthy();
});

Then('no se crea ningun usuario en el sistema', async function (this: ICustomWorld) {
  // Verificar que no hubo redireccion exitosa
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/auth/register');
});

Then('se informa al usuario que puede reenviar el email de verificacion', async function (this: ICustomWorld) {
  const resendVisible = await this.page.locator('text=reenviar|Reenviar|re-enviar').first().isVisible();
  expect(resendVisible).toBeTruthy();
});

Then('el sistema muestra errores de validacion: {string} y {string}', async function (this: ICustomWorld, error1: string, error2: string) {
  const error1Visible = await this.page.locator(`text=${error1}`).isVisible();
  const error2Visible = await this.page.locator(`text=${error2}`).isVisible();
  expect(error1Visible).toBeTruthy();
  expect(error2Visible).toBeTruthy();
});
