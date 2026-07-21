import { test, expect } from '@playwright/test';

test.describe('Registro de usuario (E2E)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('navegar a /auth/register muestra el formulario de registro', async ({ page }) => {
    // Verificar que la pagina carga correctamente
    await expect(page).toHaveURL('/auth/register');
    await expect(page.locator('h1')).toContainText('Crear tu cuenta');

    // Verificar campos del formulario
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /términos y condiciones/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('completar formulario con datos válidos y submit', async ({ page }) => {
    // Interceptar la llamada a la API de registro
    await page.route('**/api/identity/register', async (route) => {
      const requestBody = route.request().postDataJSON();
      // Validar que se enviaron los datos correctos
      expect(requestBody.email).toBe('test-usuario@example.com');
      expect(requestBody.password).toBeTruthy();
      expect(requestBody.acceptTerms).toBe(true);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          email: 'test-usuario@example.com',
          message: 'Cuenta creada exitosamente',
        }),
      });
    });

    // Completar formulario
    await page.getByLabel('Correo electrónico').fill('test-usuario@example.com');
    await page.getByLabel('Contraseña').fill('TestUser2026!');
    await page.getByRole('checkbox', { name: /términos y condiciones/i }).check();

    // Enviar formulario
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Verificar redireccion a verify-email
    await page.waitForURL('**/auth/verify-email?email=*');
    expect(page.url()).toContain('/auth/verify-email');
    expect(page.url()).toContain('email=test-usuario%40example.com');
  });

  test('submit con campos vacíos muestra errores de validación', async ({ page }) => {
    // Enviar formulario vacío
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Verificar mensajes de error de validacion
    await expect(page.getByText('Ingresa un email válido')).toBeVisible();
    await expect(page.getByText('La contraseña debe tener al menos 8 caracteres')).toBeVisible();
    await expect(page.getByText('Debes aceptar los términos')).toBeVisible();
  });

  test('muestra error cuando el email ya está registrado (409)', async ({ page }) => {
    // Interceptar la llamada para simular error 409
    await page.route('**/api/identity/register', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          type: 'https://sports-hub-connect.com/errors/conflict',
          title: 'Conflicto',
          status: 409,
          detail: 'El email ya esta registrado',
          traceId: '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01',
        }),
      });
    });

    // Completar formulario
    await page.getByLabel('Correo electrónico').fill('existente@example.com');
    await page.getByLabel('Contraseña').fill('TestUser2026!');
    await page.getByRole('checkbox', { name: /términos y condiciones/i }).check();

    // Enviar formulario
    await page.getByRole('button', { name: /crear cuenta/i }).click();

    // Verificar mensaje de error
    await expect(page.getByText(/email ya está registrado|ya esta registrado/i)).toBeVisible();
  });
});
