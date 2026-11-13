import { expect, test } from '@playwright/test';
import { iniciarSesion } from './sesion';

/**
 * HU_MF03_002 · CU-008
 * Flujo: iniciar sesión → Foro → nueva publicación → se guarda en la base → aparece en el listado.
 */
test('el estudiante publica una duda y aparece en el foro', async ({ page }) => {
  const titulo = `Prueba E2E ${Date.now()}`;
  await iniciarSesion(page);

  await page.goto('/foro/nueva');
  await page.locator('#titulo').fill(titulo);
  await page.locator('.fo-tema-opcion--limites').click();
  await page.locator('#contenido').fill('¿Cómo resuelvo un límite indeterminado 0/0? Publicación creada por la prueba automática E2E.');

  const creada = page.waitForResponse(r => r.url().endsWith('/foro/publicaciones') && r.request().method() === 'POST');
  await page.locator('button[type="submit"]').click();
  expect([200, 201]).toContain((await creada).status());

  // Redirige al detalle de la publicación recién creada
  await expect(page).toHaveURL(/\/foro\/\d+$/);
  await expect(page.locator('h1')).toHaveText(titulo);

  // Y la publicación aparece en el listado (persistida en la base)
  await page.goto('/foro');
  await expect(page.getByText(titulo)).toBeVisible();
});
