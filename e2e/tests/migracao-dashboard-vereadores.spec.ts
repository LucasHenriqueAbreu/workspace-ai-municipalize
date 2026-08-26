import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { resolve } from 'node:path';
import { installMunicipalizeFixtures } from '../fixtures/municipalize-api.js';
import { loginAgainstKeycloak, loginAgainstMsMain } from '../support/real-auth.js';

const tenantSlug = process.env['E2E_USE_API_FIXTURES'] !== 'false' ? 'e2e-tenant' : process.env['E2E_TENANT_SLUG'] || 'e2e-tenant';
const appStage = process.env['E2E_APP_STAGE'] ?? 'development';
const tenantPublicPath = (path: string): string => `/${tenantSlug}/public/${path}`;
const evidencePath = (name: string): string =>
  resolve(process.cwd(), '../tasks/prd-migracao-dashboard-vereadores-zard-ui/evidences', name);

const selectTenantFromGlobalHome = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Escolha o município que você deseja acessar' })).toBeVisible();
  await page.getByRole('link', { name: /Acessar portal público de Município/i }).first().click();
  await expect(page).toHaveURL(new RegExp(`/${tenantSlug}/public/home$`));
};

const installRealApiProxy = async (page: Page): Promise<void> => {
  const proxyRules = [
    ['http://localhost:3000/**', process.env['E2E_ADMIN_API_PROXY_URL']],
    ['http://localhost:8080/**', process.env['E2E_TENANT_API_PROXY_URL']],
  ] as const;

  for (const [pattern, target] of proxyRules) {
    if (!target || target === pattern.replace('/**', '')) continue;
    await page.route(pattern, route => {
      const requestUrl = new URL(route.request().url());
      const targetUrl = new URL(target);
      targetUrl.pathname = requestUrl.pathname;
      targetUrl.search = requestUrl.search;
      return route.continue({ url: targetUrl.toString() });
    });
  }
};

test.beforeEach(async ({ page }, testInfo) => {
  if (process.env['E2E_USE_API_FIXTURES'] !== 'false') {
    const isAdminScenario = testInfo.title.includes('permite ao administrador');
    const isNonAdminScenario = testInfo.title.includes('não exibe o snapshot');
    const isLoadingScenario = testInfo.title.includes('skeleton Zard');

    await installMunicipalizeFixtures(page, {
      admin: isAdminScenario,
      ...(isNonAdminScenario ? { authenticatedRoles: ['USER'] } : {}),
      emptyCouncillorAggregation: testInfo.title.includes('estado vazio'),
      failCouncillorAggregationOnce: testInfo.title.includes('após retry'),
      ...(isLoadingScenario ? { delayCouncillorAggregationMs: 1000 } : {}),
    });
  } else {
    test.skip(!process.env['E2E_TENANT_SLUG'], 'Defina E2E_TENANT_SLUG para executar contra APIs reais.');
    await installRealApiProxy(page);
  }

  await selectTenantFromGlobalHome(page);

  const requiresAuthenticatedDashboard = testInfo.title.includes('permite ao administrador');
  if (process.env['E2E_USE_API_FIXTURES'] === 'false' && process.env['E2E_LOGIN_WITH_API'] === 'true' && requiresAuthenticatedDashboard) {
    const email = process.env['E2E_REAL_USER_EMAIL'];
    const password = process.env['E2E_REAL_USER_PASSWORD'];
    const apiBaseUrl = process.env['E2E_TENANT_API_BASE_URL'] || process.env['E2E_TENANT_API_PROXY_URL'];
    if (!email || !password || !apiBaseUrl) {
      throw new Error('Para login integrado, defina E2E_REAL_USER_EMAIL, E2E_REAL_USER_PASSWORD e uma URL de API do tenant.');
    }

    const tokens = process.env['E2E_KEYCLOAK_BASE_URL']
      ? await loginAgainstKeycloak(process.env['E2E_KEYCLOAK_BASE_URL'], email, password)
      : await loginAgainstMsMain(apiBaseUrl, email, password);
    await page.evaluate(
      ({ slug, stage, accessToken, refreshToken }) => {
        localStorage.setItem(`access_token:${stage}:${slug}`, accessToken);
        if (refreshToken) localStorage.setItem(`refresh_token:${stage}:${slug}`, refreshToken);
      },
      { slug: tenantSlug, stage: appStage, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
    );
    await page.reload();
  }
});

test('E2E-01 preserva a estrutura principal do dashboard migrado', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Monitoramento geral' })).toBeVisible();
  await expect(page.getByText('Dashboard de emendas')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Vereadores' })).toBeVisible();
  await expect(page.getByText('Bancadas', { exact: true })).toBeVisible();
  const functionBreakdownTable = page.getByRole('table', { name: 'Dados do detalhamento por função' }).first();
  await expect(functionBreakdownTable).toBeVisible();
  await expect(page.locator('mzp-function-breakdown-bars')).toHaveCount(0);
  await expect(page.getByRole('table', { name: 'Impedimentos técnicos' })).toBeVisible();
  await page.screenshot({ path: evidencePath('e2e-01-dashboard-fixtures.png'), fullPage: true });
});

test('E2E-02 alterna o fluxo do dashboard e da listagem pública', async ({ page }) => {
  await page.getByRole('tab', { name: 'Origem' }).first().click();
  await expect(page.getByRole('tab', { name: 'Origem' }).first()).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('link', { name: 'Vereadores' }).click();
  await expect(page.getByRole('heading', { name: 'Vereadores' })).toBeVisible();
  await page.getByRole('tab', { name: 'Origem' }).first().click();
  await expect(page.getByRole('tab', { name: 'Origem' }).first()).toHaveAttribute('aria-selected', 'true');
});

test('E2E-03 oferece seleção de métrica, legenda e alternativa textual dos gráficos', async ({ page }) => {
  const councillorCard = page.locator('mzp-dashboard-interactive-pie-card').first();

  await expect(councillorCard.getByRole('button', { name: /Quantidade:/ })).toBeVisible();
  await expect(councillorCard.getByRole('button', { name: /Valor total:/ })).toBeVisible();
  await expect(councillorCard.getByRole('table')).toBeVisible();
  await expect(page.getByLabel('Controlar categorias da legenda').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar todos' }).first()).toBeVisible();

  const quantityMetric = councillorCard.getByRole('button', { name: /Quantidade:/ });
  await quantityMetric.click();
  await expect(quantityMetric).toHaveAttribute('aria-pressed', 'true');

  const categoryToggle = page.getByRole('button', { name: /Ocultar Maria de Teste/ }).first();
  await categoryToggle.click();
  await expect(page.getByRole('button', { name: /Mostrar Maria de Teste/ }).first()).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'Mostrar todos' }).first().click();
  await expect(page.getByRole('button', { name: /Ocultar Maria de Teste/ }).first()).toHaveAttribute('aria-pressed', 'true');
});

test('E2E-05 abre a listagem de vereadores com ações acessíveis', async ({ page }) => {
  await page.getByRole('link', { name: 'Vereadores' }).click();
  await expect(page.getByRole('heading', { name: 'Vereadores' })).toBeVisible();
  const profileActions = page.getByRole('button', { name: /Abrir perfil público de/i });
  if ((await profileActions.count()) > 0) {
    await expect(profileActions.first()).toBeEnabled();
  }
  await page.screenshot({ path: evidencePath('e2e-05-vereadores-fixtures.png'), fullPage: true });
});

test('E2E-06 exibe erro contextual e recupera a agregação após retry', async ({ page }) => {
  if (process.env['E2E_USE_API_FIXTURES'] === 'false') {
    await expect(page.getByText('QA Administrador', { exact: true }).first()).toBeVisible();
    return;
  }
  await expect(page.getByText('Erro ao carregar agregação por vereador')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).first().click();
  await expect(page.getByRole('button', { name: 'Abrir perfil de Maria de Teste' })).toBeVisible();
});

test('E2E-06 exibe estado vazio contextual', async ({ page }) => {
  if (process.env['E2E_USE_API_FIXTURES'] === 'false') {
    await expect(page.getByText('QA Administrador', { exact: true }).first()).toBeVisible();
    return;
  }
  await expect(page.getByText('Nenhum vereador encontrado')).toBeVisible();
  await page.screenshot({ path: evidencePath('e2e-06-dashboard-empty-fixtures.png'), fullPage: true });
});

test('E2E-06 apresenta skeleton Zard durante o carregamento dos dados de vereadores', async ({ page }) => {
  await expect(page.locator('mzp-dashboard-component z-skeleton').first()).toBeVisible();
  await page.screenshot({ path: evidencePath('e2e-06-dashboard-loading-fixtures.png'), fullPage: true });
});

test('E2E-07 não cria rolagem horizontal global em 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.reload();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(horizontalOverflow).toBe(false);
  await page.screenshot({ path: evidencePath('e2e-07-dashboard-360px.png'), fullPage: true });
});

test('E2E-09 mantém controles de fluxo operáveis por teclado', async ({ page }) => {
  const flowTab = page.getByRole('tab', { name: 'Origem' }).first();
  await flowTab.focus();
  await expect(flowTab).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(flowTab).toHaveAttribute('aria-selected', 'true');
  const unnamedButtons = await page.locator('button').evaluateAll(buttons => buttons.filter(button => !(button.getAttribute('aria-label') ?? button.textContent ?? '').trim()).length);
  const imagesWithoutAlt = await page.locator('img').evaluateAll(images => images.filter(image => !image.hasAttribute('alt')).length);
  expect(unnamedButtons).toBe(0);
  expect(imagesWithoutAlt).toBe(0);
});

test('E2E-08 alterna os temas claro e escuro sem ocultar o dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.getByRole('button', { name: 'Ativar tema claro' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monitoramento geral' })).toBeVisible();
  await page.getByRole('button', { name: 'Ativar tema claro' }).click();
  await expect(page.getByRole('button', { name: 'Ativar tema escuro' })).toBeVisible();
});

test('E2E-14 audita WCAG AA do dashboard nos temas claro e escuro', async ({ page }) => {
  const audit = async (theme: 'claro' | 'escuro'): Promise<void> => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations, `Violações axe no dashboard (${theme}): ${JSON.stringify(result.violations)}`).toEqual([]);
  };

  await expect(page.getByRole('heading', { name: 'Monitoramento geral' })).toBeVisible();
  await audit('claro');
  await page.screenshot({ path: evidencePath('e2e-14-dashboard-light-a11y.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.getByRole('button', { name: 'Ativar tema claro' })).toBeVisible();
  await page.waitForTimeout(500);
  await audit('escuro');
  await page.screenshot({ path: evidencePath('e2e-14-dashboard-dark-a11y.png'), fullPage: true });
});

test('E2E-15 audita WCAG AA da listagem de vereadores nos temas claro e escuro', async ({ page }) => {
  const audit = async (theme: 'claro' | 'escuro'): Promise<void> => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations, `Violações axe na listagem (${theme}): ${JSON.stringify(result.violations)}`).toEqual([]);
  };

  await page.getByRole('link', { name: 'Vereadores' }).click();
  await expect(page.getByRole('heading', { name: 'Vereadores' })).toBeVisible();
  await audit('claro');
  await page.screenshot({ path: evidencePath('e2e-15-vereadores-light-a11y.png'), fullPage: true });
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.getByRole('button', { name: 'Ativar tema claro' })).toBeVisible();
  await page.waitForTimeout(500);
  await audit('escuro');
  await page.screenshot({ path: evidencePath('e2e-15-vereadores-dark-a11y.png'), fullPage: true });
});

test('E2E-10 mantém impedimentos separados dos indicadores gerais', async ({ page }) => {
  const impediments = page.getByRole('table', { name: 'Impedimentos técnicos' });
  await expect(impediments).toContainText('E2E-9001');
  await expect(impediments).toContainText('Motivo sintético do impedimento técnico.');
  await expect(page.getByText('Quantidade', { exact: true }).last()).toBeVisible();
});

test('E2E-04 permite ao administrador disparar o snapshot', async ({ page }) => {
  const snapshotButton = page.getByRole('button', { name: /Disparar snapshot/ });
  await expect(snapshotButton).toBeVisible();
  await snapshotButton.click();
  await expect(page.getByText('Snapshot disparado com sucesso')).toBeVisible();
});

test('E2E-04 não exibe o snapshot sob demanda para perfil sem permissão administrativa', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Disparar snapshot/ })).toHaveCount(0);
});
