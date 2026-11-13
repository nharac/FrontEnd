import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas E2E de SAESU en local.
 * Requisitos: backend corriendo en http://localhost:8080 (mvn spring-boot:run)
 * y una cuenta de estudiante de prueba en las variables E2E_CORREO y E2E_PASSWORD.
 * El frontend lo levanta Playwright con `ng serve` si no está corriendo.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-reporte' }]],
  use: {
    baseURL: process.env.E2E_URL ?? 'http://localhost:4200',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_URL ? undefined : {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
