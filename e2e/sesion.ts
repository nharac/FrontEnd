import { expect, Page } from '@playwright/test';

export const CORREO = process.env.E2E_CORREO ?? '';
export const PASSWORD = process.env.E2E_PASSWORD ?? '';

/** Inicia sesión como el estudiante de prueba y espera llegar al panel. */
export async function iniciarSesion(page: Page): Promise<void> {
  if (!CORREO || !PASSWORD) {
    throw new Error('Define E2E_CORREO y E2E_PASSWORD con la cuenta de estudiante de prueba.');
  }
  await page.goto('/');
  await page.locator('#login-correo').fill(CORREO);
  await page.locator('#login-password').fill(PASSWORD);
  await page.getByRole('button', { name: /^Ingresar/ }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
