import { test, expect } from '@playwright/test';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const pdfSource = path.resolve('apps/api/uploads/demo_sap_semana.pdf');

async function loginAs(page, email, password, urlRe) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(urlRe, { timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
  if (!existsSync(pdfSource)) {
    throw new Error(`Falta PDF demo: ${pdfSource}. Corre pnpm seed.`);
  }
});

test('inicio muestra panel y API', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await expect(page.getByText('nomina_jarudo')).toBeVisible({ timeout: 20_000 });
});

test('login jefe y navega a cargas', async ({ page }) => {
  await loginAs(page, 'jefe@jarudo.local', 'jefe123', /\/cargas/);
  await expect(page.getByRole('heading', { name: 'Cargas PDF SAP' })).toBeVisible();
  await expect(page.getByText('Jefe de planta')).toBeVisible();
});

test('carga PDF demo y aparece en la tabla', async ({ page }) => {
  const uniqueName = `e2e_sap_${Date.now()}.pdf`;
  const uniquePath = path.resolve(`apps/api/uploads/${uniqueName}`);
  copyFileSync(pdfSource, uniquePath);

  await loginAs(page, 'jefe@jarudo.local', 'jefe123', /\/cargas/);

  await page.locator('input[type="date"]').fill('2026-10-27');
  await page.locator('input[type="file"]').setInputFiles({
    name: uniqueName,
    mimeType: 'application/pdf',
    buffer: readFileSync(uniquePath)
  });
  await page.getByRole('button', { name: 'Cargar y procesar' }).click();

  await expect(page.getByText(/Cargados:\s*[1-9]/)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(uniqueName).first()).toBeVisible();
});

test('matriz: calcular semana', async ({ page }) => {
  await loginAs(page, 'jefe@jarudo.local', 'jefe123', /\/cargas/);

  await page.goto('/matriz');
  await expect(page.getByRole('heading', { name: /Matriz semanal/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();

  const plantSelect = page.locator('main select').first();
  await expect(plantSelect.locator('option')).not.toHaveCount(0, { timeout: 15_000 });
  await expect
    .poll(async () => plantSelect.inputValue(), { timeout: 15_000 })
    .not.toBe('');

  await page.locator('main input[type="date"]').fill('2026-10-27');
  await page.getByRole('button', { name: 'Calcular' }).click();
  await expect(page.getByText(/Calculado/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Juan Pérez|María López|Carlos Ruiz/).first()).toBeVisible();
});

test('login operador ve solo su liquidación', async ({ page }) => {
  await loginAs(page, 'operador@jarudo.local', 'op123', /\/operador/);
  await expect(page.getByRole('heading', { name: 'Mi liquidación' })).toBeVisible();
  await expect(page.locator('main').getByText(/Juan Pérez/)).toBeVisible();
  await page.locator('main input[type="date"]').fill('2026-10-27');
  await page.getByRole('button', { name: 'Consultar' }).click();
  await expect(page.locator('main select')).toHaveCount(0);
  // tras calcular en test anterior, debe haber resumen o al menos no error de sesión
  await expect(page.locator('main')).not.toContainText('Sesión de operador incompleta');
});

test('admin abre configuración', async ({ page }) => {
  await loginAs(page, 'admin@jarudo.local', 'admin123', /\/config/);
  await expect(page.getByRole('heading', { name: 'Tarifas y reglas' })).toBeVisible();
  await expect(page.getByText('publicada').first()).toBeVisible();
});
