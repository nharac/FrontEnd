import { expect, test } from '@playwright/test';
import { iniciarSesion } from './sesion';

/**
 * HU_MF02_001 / HU_MF02_002 · CU-004 y CU-005
 * Flujo: iniciar sesión → Práctica → Límites → responder → ver el resultado validado por el backend.
 */
test('el estudiante practica una pregunta de Límites y recibe el resultado', async ({ page }) => {
  await iniciarSesion(page);

  await page.goto('/practica');
  await page.locator('.pr-tema--limites').click();
  await page.locator('.pr-empezar').click();

  // Llega una pregunta con sus cuatro opciones (viene de GET /api/practica/preguntas)
  const opciones = page.locator('.pc-opcion');
  await expect(opciones).toHaveCount(4);

  // Responde la opción A (POST /api/practica/preguntas/{id}/responder)
  const respuesta = page.waitForResponse(r => r.url().includes('/responder') && r.request().method() === 'POST');
  await opciones.first().click();
  await page.getByRole('button', { name: /Responder/i }).click();
  expect((await respuesta).status()).toBe(200);

  // El frontend muestra el resultado (correcto o incorrecto) que decidió el servidor
  const resultado = page.locator('.pc-resultado');
  await expect(resultado).toBeVisible();
  await expect(resultado).toHaveClass(/pc-resultado--(ok|error)/);
  // Una opción queda marcada como correcta o incorrecta
  await expect(page.locator('.pc-opcion--correcta, .pc-opcion--incorrecta').first()).toBeVisible();
});
