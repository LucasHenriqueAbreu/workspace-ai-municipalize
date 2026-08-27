import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { installMunicipalizeFixtures, type MunicipalizeFixtureOptions } from '../fixtures/municipalize-api.js';

const tenantSlug = 'e2e-tenant';
const appStage = process.env['E2E_APP_STAGE'] ?? 'development';

const prepareAuthenticatedTenant = async (page: Page, options: MunicipalizeFixtureOptions = {}): Promise<void> => {
  await installMunicipalizeFixtures(page, { authenticatedRoles: ['ADMIN'], globalSearch: true, ...options });
  await page.goto('/');
  await page.getByRole('link', { name: /Acessar portal público de Município/i }).first().click();
  await expect(page).toHaveURL(new RegExp(`/${tenantSlug}/public/home$`));
  await page.evaluate(({ slug, stage }) => localStorage.setItem(`access_token:${stage}:${slug}`, 'synthetic-token'), { slug: tenantSlug, stage: appStage });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir pesquisa global' })).toBeVisible();
};

const openSearch = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Abrir pesquisa global' }).click();
  await expect(page.getByRole('combobox', { name: 'Pesquisar telas e dados' })).toBeVisible();
};

test.describe('Pesquisa global', () => {
  test('E2E-07 mantém foco, navegação por teclado e responsividade em desktop e mobile', async ({ page }) => {
    await prepareAuthenticatedTenant(page);
    await openSearch(page);

    const input = page.getByRole('combobox', { name: 'Pesquisar telas e dados' });
    await expect(input).toBeFocused();
    await input.fill('projeto');
    await expect(page.getByRole('option', { name: 'Projeto Saúde Básica' })).toBeVisible();
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(page.getByRole('heading', { name: 'Projeto Saúde Básica' })).toBeVisible();
    await expect(page.getByText('Ampliação da unidade de saúde do município com atendimento acessível.')).toBeVisible();

    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 360, height: 800 });
    await openSearch(page);
    const dialog = page.locator('[role="dialog"]').last();
    await expect(dialog).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox?.width).toBeLessThanOrEqual(360);

    await page.keyboard.press('Escape');
    await expect(page.getByRole('combobox', { name: 'Pesquisar telas e dados' })).toBeHidden();
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('combobox', { name: 'Pesquisar telas e dados' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Pesquisar telas e dados' }).press('Control+k');
    await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  });

  test('E2E-08 oferece nomes acessíveis e não introduz violações críticas no diálogo e drawer', async ({ page }) => {
    await prepareAuthenticatedTenant(page);
    await openSearch(page);

    await page.getByRole('combobox', { name: 'Pesquisar telas e dados' }).fill('projeto');
    await expect(page.getByRole('option', { name: 'Projeto Saúde Básica' })).toBeVisible();
    const dialogViolations = await new AxeBuilder({ page }).include('mzp-global-search-command').analyze();
    expect(dialogViolations.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious')).toEqual([]);

    await page.getByRole('option', { name: 'Projeto Saúde Básica' }).click();
    await expect(page.getByRole('heading', { name: 'Projeto Saúde Básica' })).toBeVisible();
    const drawerViolations = await new AxeBuilder({ page }).include('z-drawer-panel').analyze();
    expect(drawerViolations.violations.filter(({ impact }) => impact === 'critical' || impact === 'serious')).toEqual([]);
  });

  test('E2E-09 pesquisa, agrupa, reutiliza cache, abre detalhes e recupera erros remotos', async ({ page }) => {
    await prepareAuthenticatedTenant(page);
    let searchRequests = 0;
    page.on('request', request => {
      if (new URL(request.url()).pathname.endsWith('/global-search')) searchRequests += 1;
    });

    await openSearch(page);
    await page.getByRole('combobox', { name: 'Pesquisar telas e dados' }).fill('projeto');
    await expect(page.getByLabel('Resultados da pesquisa').getByText('Projetos', { exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Projeto Saúde Básica' })).toBeVisible();
    await expect.poll(() => searchRequests).toBe(1);

    await page.keyboard.press('Escape');
    await openSearch(page);
    await page.getByRole('option', { name: 'projeto' }).click();
    await expect(page.getByRole('option', { name: 'Projeto Saúde Básica' })).toBeVisible();
    await expect.poll(() => searchRequests).toBe(1);

    await page.getByRole('option', { name: 'Projeto Saúde Básica' }).click();
    await expect(page.getByRole('heading', { name: 'Projeto Saúde Básica' })).toBeVisible();
    await expect(page.getByText('Status', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    await openSearch(page);
    await page.getByRole('option', { name: 'projeto' }).click();
    await page.getByRole('option', { name: 'Projeto Saúde Básica' }).click();
    await expect(page.getByRole('heading', { name: 'Projeto Saúde Básica' })).toBeVisible();

    await page.keyboard.press('Escape');
    await prepareAuthenticatedTenant(page, { failGlobalSearchOnce: true });
    await openSearch(page);
    await page.getByRole('combobox', { name: 'Pesquisar telas e dados' }).fill('projeto');
    await expect(page.locator('[role="alert"]').filter({ hasText: 'Não foi possível consultar os dados.' })).toBeVisible();
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('option', { name: 'Projeto Saúde Básica' })).toBeVisible();
  });

  test('E2E-09 comunica indisponibilidade temporária do detalhe e permite retry', async ({ page }) => {
    await prepareAuthenticatedTenant(page, { globalSearchDetailStatus: 503, recoverGlobalSearchDetailOnce: true });
    await openSearch(page);
    await page.getByRole('combobox', { name: 'Pesquisar telas e dados' }).fill('projeto');
    await page.getByRole('option', { name: 'Projeto Saúde Básica' }).click();
    await expect(page.locator('[role="alert"]').filter({ hasText: 'Não foi possível carregar os detalhes.' })).toBeVisible();
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('heading', { name: 'Projeto Saúde Básica' })).toBeVisible();
  });
});
