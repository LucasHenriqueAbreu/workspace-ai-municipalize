import type { Page } from '@playwright/test';

const snapshotDate = '2026-08-20';

const aggregation = {
  id: 42,
  label: 'Maria de Teste',
  code: 'MT',
  extra: 'Partido Exemplo',
  total: 1_250_000,
  individualCount: 14,
  individualTotal: 1_250_000,
  benchCount: 0,
  benchTotal: 0,
  snapshotDate,
  subInstitutions: [
    {
      id: 7,
      label: 'Instituição Sintética',
      total: 1_250_000,
      individualCount: 14,
      individualTotal: 1_250_000,
      benchCount: 0,
      benchTotal: 0,
    },
  ],
};

const statusAggregations = [
  { ...aggregation, id: null, label: 'Aprovadas em plenário', code: 'APPROVED_IN_PLENARY', total: 500_000 },
  { ...aggregation, id: null, label: 'Protocoladas', code: 'PROTOCOLLED', total: 350_000 },
  { ...aggregation, id: null, label: 'Em revisão contábil', code: 'UNDER_ACCOUNTING_REVIEW', total: 400_000 },
];

const profile = {
  councillor: {
    id: 42,
    user: { id: 420, fullName: 'Maria de Teste', profilePictureUrl: null },
    politicalParty: { id: 1, nome: 'Partido Exemplo', numero: 99, sigla: 'PEX' },
    termStartDate: '2025-01-01',
    termEndDate: null,
    currentTerm: true,
    chamberPresident: false,
    cofPresident: true,
    cofReporter: false,
  },
  summary: {
    amendments: { totalCount: 14, totalAmount: 1_250_000, statuses: [] },
    projects: { totalCount: 2, totalAmount: 100_000, statuses: [] },
  },
};

const dashboardSnapshot = {
  snapshotDate,
  responsibleType: 'VEREADOR',
  responsibleId: 42,
  responsibleName: 'Maria de Teste',
  responsiblePartyAcronym: 'PEX',
  amendmentId: 9001,
  saplCode: 'E2E-9001',
  amendmentStatus: 'TECHNICAL_IMPEDIMENT',
  amendmentType: 'INDIVIDUAL',
  amendmentTotalAmount: 75_000,
  budgetTotalAmount: 75_000,
  institutionId: 7,
  institutionName: 'Instituição Sintética',
  technicalImpedimentReason: '<p>Motivo sintético do impedimento técnico.</p>',
};

const councillorBreakdown = {
  snapshotDate,
  councillorId: 42,
  userId: 420,
  userName: 'Maria de Teste',
  userEmail: 'teste@example.invalid',
  userProfilePictureUrl: null,
  partyId: 1,
  partyAbbreviation: 'PEX',
  benchCount: 0,
  createdAmendmentsCount: 14,
  createdAmendmentsTotal: 1_250_000,
  benchAmendmentsCount: 0,
  benchAmendmentsTotal: 0,
  trackedProjectsCount: 2,
  trackedProjectsTotal: 100_000,
  createdAt: '2026-08-20T12:00:00Z',
  functions: [{ id: 1, code: '10', description: 'Saúde', total: 1_250_000 }],
  subfunctions: [],
};

const benchBreakdown = {
  snapshotDate,
  benchId: 12,
  benchName: 'Bancada Sintética',
  benchParticipants: ['Maria de Teste'],
  amendmentsCount: 3,
  amendmentsTotal: 300_000,
  functions: [{ id: 1, code: '10', description: 'Saúde', total: 300_000 }],
  subfunctions: [],
};

const globalSearchProject = {
  id: 100,
  name: 'Projeto Saúde Básica',
  description: 'Ampliação da unidade de saúde do município com atendimento acessível.',
  status: 'APPROVED',
  requestedAmount: 250_000,
  createdAt: '2026-02-10T12:00:00Z',
  creator: {
    id: 420,
    firstName: 'Administrador',
    lastName: 'Sintético',
    fullName: 'Administrador Sintético',
    email: 'admin@example.invalid',
    createdAt: '2026-01-01T00:00:00Z',
    roles: ['ADMIN'],
  },
  hasAmendment: false,
};

const globalSearchResponse = {
  normalizedTerm: 'projeto',
  results: [
    {
      resourceId: globalSearchProject.id,
      origin: 'DATA',
      type: 'PROJECT',
      group: 'Projetos',
      title: globalSearchProject.name,
      secondaryText: 'Instituição Sintética',
      description: globalSearchProject.description,
      icon: 'PROJECT',
      score: 1,
      match: { kind: 'DIRECT', field: 'PROJECT_NAME', displayText: globalSearchProject.name },
      metadata: { kind: 'PROJECT', status: globalSearchProject.status, institutionName: 'Instituição Sintética' },
    },
  ],
  total: 1,
  countsByType: [{ type: 'PROJECT', count: 1 }],
  page: 0,
  pageSize: 20,
  totalPages: 1,
  hasMore: false,
};

const json = (body: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

export interface MunicipalizeFixtureOptions {
  readonly admin?: boolean;
  readonly authenticatedRoles?: readonly string[];
  readonly emptyCouncillorAggregation?: boolean;
  readonly failCouncillorAggregationOnce?: boolean;
  readonly delayCouncillorAggregationMs?: number;
  readonly globalSearch?: boolean;
  readonly failGlobalSearchOnce?: boolean;
  readonly globalSearchDetailStatus?: 403 | 404 | 503;
  readonly recoverGlobalSearchDetailOnce?: boolean;
}

export async function installMunicipalizeFixtures(page: Page, options: MunicipalizeFixtureOptions = {}): Promise<void> {
  let councillorAggregationFailures = options.failCouncillorAggregationOnce ? 1 : 0;
  let globalSearchFailures = options.failGlobalSearchOnce ? 1 : 0;
  let globalSearchDetailFailures = options.recoverGlobalSearchDetailOnce ? 1 : 0;
  const authenticatedRoles = options.authenticatedRoles ?? (options.admin ? ['ADMIN'] : undefined);

  await page.route('**/api/public/customers', route =>
    route.fulfill(
      json({
        customers: [
          {
            id: 'customer-e2e',
            tenantId: 'tenant-e2e',
            slug: 'e2e-tenant',
            name: 'Município Sintético',
            shortDescription: 'Ambiente sintético de QA',
            stateName: 'Paraná',
            stateCode: 'PR',
            stateRegion: 'Sul',
            populationEstimate: 1000,
            populationReferenceLabel: 'Censo sintético',
            bannerUrl: null,
            logoUrl: null,
            apiBaseUrl: 'http://localhost:8080',
          },
        ],
      }),
    ),
  );

  await page.route('http://localhost:8080/**', async route => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/auth/me')) {
      if (authenticatedRoles) {
        await route.fulfill(
          json({
            firstName: 'Administrador',
            lastName: 'Sintético',
            fullName: 'Administrador Sintético',
            email: 'admin@example.invalid',
            createdAt: '2026-01-01T00:00:00Z',
            roles: authenticatedRoles,
          }),
        );
      } else {
        await route.fulfill(json({ error: 'Unauthorized' }, 401));
      }
      return;
    }

    if (url.pathname.includes('/proposer/me')) {
      if (authenticatedRoles) {
        await route.fulfill(json([]));
      } else {
        await route.fulfill(json({ error: 'Unauthorized' }, 401));
      }
      return;
    }

    if (url.pathname.includes('/notifications')) {
      await route.fulfill(
        json({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          number: 0,
        }),
      );
      return;
    }

    if (url.pathname.endsWith('/global-search') && options.globalSearch) {
      if (globalSearchFailures > 0) {
        globalSearchFailures -= 1;
        await route.fulfill(json({ error: 'Service unavailable' }, 503));
        return;
      }
      await route.fulfill(json(globalSearchResponse));
      return;
    }

    if (options.globalSearch && url.pathname.endsWith('/projects/100')) {
      if (options.globalSearchDetailStatus && (globalSearchDetailFailures > 0 || !options.recoverGlobalSearchDetailOnce)) {
        globalSearchDetailFailures -= 1;
        await route.fulfill(json({ error: 'Synthetic detail error' }, options.globalSearchDetailStatus));
        return;
      }
      await route.fulfill(json(globalSearchProject));
      return;
    }

    if (url.pathname.endsWith('/dashboard/aggregation') && url.searchParams.get('groupBy') === 'COUNCILLOR' && councillorAggregationFailures > 0) {
      councillorAggregationFailures -= 1;
      await route.fulfill(json({ error: 'Unauthorized' }, 401));
      return;
    }

    if (url.pathname.endsWith('/dashboard/aggregation') && url.searchParams.get('groupBy') === 'COUNCILLOR' && options.emptyCouncillorAggregation) {
      await route.fulfill(json([]));
      return;
    }

    if (url.pathname.endsWith('/dashboard/aggregation')) {
      const groupBy = url.searchParams.get('groupBy');
      if (groupBy === 'COUNCILLOR' && options.delayCouncillorAggregationMs) {
        await new Promise(resolve => setTimeout(resolve, options.delayCouncillorAggregationMs));
      }
      if (groupBy === 'STATUS') {
        await route.fulfill(json(statusAggregations));
        return;
      }
      if (groupBy === 'BENCH') {
        await route.fulfill(json([{ ...aggregation, id: 12, label: 'Bancada Sintética', extra: '3 participantes', benchCount: 3, benchTotal: 300_000, total: 300_000, individualCount: 0, individualTotal: 0 }]));
        return;
      }
      if (groupBy === 'INSTITUTION') {
        await route.fulfill(json([{ ...aggregation, id: 7, label: 'Instituição Sintética', extra: 'Beneficiária' }]));
        return;
      }
      await route.fulfill(json([aggregation]));
      return;
    }

    if (url.pathname.endsWith('/dashboard/councillor-snapshot-breakdown')) {
      await route.fulfill(json([councillorBreakdown]));
      return;
    }

    if (url.pathname.endsWith('/dashboard/bench-snapshot-breakdown')) {
      await route.fulfill(json([benchBreakdown]));
      return;
    }

    if (url.pathname.endsWith('/dashboard/snapshot')) {
      await route.fulfill(json([dashboardSnapshot]));
      return;
    }

    if (url.pathname.includes('/public/councillor/42/profile')) {
      await route.fulfill(json(profile));
      return;
    }

    await route.fulfill(json([]));
  });
}
