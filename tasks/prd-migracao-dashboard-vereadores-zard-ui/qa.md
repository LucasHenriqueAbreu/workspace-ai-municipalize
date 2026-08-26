# Relatório de QA — Migração do dashboard de vereadores para Zard UI

As evidências visuais estão salvas em `evidences/` e foram geradas pela suíte
Playwright centralizada usando fixtures sintéticas.

## Resumo

- Data: 2026-08-26
- Status: **APROVADO**
- Total de critérios de aceitação: **16**
- Critérios de aceitação atendidos: **16**
- Bugs encontrados nesta rodada: **3**, todos corrigidos e revalidados
- Ambiente E2E: Chromium, frontend Angular na porta 5100, APIs interceptadas por fixtures

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|---|---|---|---|---|
| CA-01 | Elementos com equivalente oficial usam Zard e nenhum componente shared foi criado/alterado. | E2E-01, E2E-11 | PASSOU | [dashboard](evidences/e2e-01-dashboard-fixtures.png) |
| CA-02 | Componentes oficiais incorporados preservam a origem pelo CLI do Zard. | E2E-11 | PASSOU | [components.json](../../municipalize-app/components.json) |
| CA-03 | Seções, datas, rótulos, valores, quantidades, agrupamentos e detalhamentos são preservados. | TU-01, TU-02, TU-05, E2E-01 | PASSOU | [dashboard](evidences/e2e-01-dashboard-fixtures.png) |
| CA-04 | Flows, legendas e métricas alteram a apresentação sem misturar dados originais. | TU-03, TU-04, TI-02, TI-03, E2E-02, E2E-03 | PASSOU | [fluxo origem](evidences/browser-dashboard-flow-origin.md) |
| CA-05 | Subinstituições exibem nomes, totais e métricas preservados. | TU-05, TI-07, E2E-01 | PASSOU | [dashboard](evidences/e2e-01-dashboard-fixtures.png) |
| CA-06 | Resumos, gráficos e agrupamentos detalhados mantêm valores consistentes. | TU-02, TU-03, E2E-01, E2E-03 | PASSOU | [dashboard](evidences/e2e-01-dashboard-fixtures.png) |
| CA-07 | Impedimentos técnicos permanecem separados, com motivo e detalhe acessíveis. | TU-06, TI-12, TI-14, E2E-10 | PASSOU | [dashboard](evidences/e2e-01-dashboard-fixtures.png) |
| CA-08 | Snapshot fica restrito ao administrador, com processamento e feedback. | TU-07, TI-08, E2E-04 | PASSOU | Cenário E2E-04 aprovado |
| CA-09 | Cards públicos preservam identidade, partido, descrição, badges, counts, totais e funções. | TU-05, TU-09, TI-04, E2E-05 | PASSOU | [vereadores](evidences/e2e-05-vereadores-fixtures.png) |
| CA-10 | Perfil abre com ID válido e fica indisponível sem identificador. | TI-09, E2E-05 | PASSOU | [vereadores](evidences/e2e-05-vereadores-fixtures.png) |
| CA-11 | Fallback por iniciais ocupa o avatar sem quebrar o layout. | TU-08, TI-10, E2E-05 | PASSOU | [vereadores](evidences/e2e-05-vereadores-fixtures.png) |
| CA-12 | Loading, vazio, erro e retry apresentam estados contextuais. | TU-10, TI-06, E2E-06 | PASSOU | [loading](evidences/e2e-06-dashboard-loading-fixtures.png), [vazio](evidences/e2e-06-dashboard-empty-fixtures.png) |
| CA-13 | A partir de 360 px não há rolagem horizontal global nem controles inacessíveis. | TU-12, TI-15, E2E-07 | PASSOU | [360 px](evidences/e2e-07-dashboard-360px.png) |
| CA-14 | Claro e escuro mantêm contraste, distinção e legibilidade. | E2E-08, E2E-14, E2E-15 | PASSOU | [dashboard claro](evidences/e2e-14-dashboard-light-a11y.png), [dashboard escuro](evidences/e2e-14-dashboard-dark-a11y.png) |
| CA-15 | Controles e dados essenciais são identificáveis e operáveis por teclado/assistive tech. | TU-11, TI-05, TI-15, E2E-09, E2E-14, E2E-15 | PASSOU | Auditoria axe sem violações |
| CA-16 | Rotas, permissões, APIs e resultados numéricos permanecem compatíveis. | TU-01, TU-06, TU-07, TI-13, TI-14, E2E-01, E2E-04, E2E-10 | PASSOU | Fixtures preservaram os contratos; typecheck passou |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|---|---|---|---|
| E2E-01 | Estrutura principal do dashboard | PASSOU | Dados, charts, breakdown e impedimentos presentes. |
| E2E-02 | Alternância Destino/Origem no dashboard e listagem | PASSOU | Abas atualizam o estado visual. |
| E2E-03 | Métricas, legenda e alternativa textual | PASSOU | Quantidade, valor, ocultar/restaurar e tabela acessíveis. |
| E2E-04 | Snapshot administrativo e restrição por papel | PASSOU | Admin vê a ação; USER não vê. |
| E2E-05 | Listagem pública, ações e fallback | PASSOU | Card público preservado e acessível. |
| E2E-06 | Erro/retry, vazio e loading | PASSOU | 3 cenários passaram após correção dos resources e títulos contextuais. |
| E2E-07 | Viewport de 360 px | PASSOU | Sem overflow horizontal global. |
| E2E-08 | Temas claro e escuro | PASSOU | Dashboard permanece legível. |
| E2E-09 | Navegação por teclado | PASSOU | Foco, Enter, nomes e `alt` verificados. |
| E2E-10 | Impedimentos técnicos isolados | PASSOU | Total e motivo não contaminam os indicadores gerais. |
| E2E-11 | Inventário de uso de Zard | PASSOU | Nenhum shared foi alterado nesta correção. |
| E2E-14 | Axe no dashboard claro/escuro | PASSOU | 0 violações nos dois temas. |
| E2E-15 | Axe na listagem claro/escuro | PASSOU | 0 violações nos dois temas após ajuste de contraste. |

Resultado da execução completa: **15 passed (50,3s)**.

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|---|---|---|---|---|
| Unidade/integração | TU-01 a TU-12 / TI-01 a TI-15 | PASSOU no escopo da feature | `npm test -- --include 'src/app/presenter/features/tenant/public/dashboard/**/*.spec.ts' --include 'src/app/presenter/features/tenant/public/councillors/**/*.spec.ts' --watch=false --coverage=false` | 12 arquivos, 24 testes passando. |
| Typecheck da aplicação | — | PASSOU | `npx tsc --noEmit --project tsconfig.app.json` | Sem erros. |
| Typecheck E2E | — | PASSOU | `npm run typecheck` em `e2e/` | Sem erros. |
| E2E | E2E-01 a E2E-15 | PASSOU | `E2E_START_APP=true E2E_USE_API_FIXTURES=true E2E_FRONTEND_PORT=5100 npm test` em `e2e/` | 15/15. |
| Build | — | PASSOU | `npm run build` | Avisos CommonJS preexistentes. |
| Lint direcionado | — | PASSOU | ESLint dos arquivos da feature alterados | Sem erros. |
| Lint global | — | FALHOU fora do escopo | `npm run lint` | 104 erros e 12 avisos em módulos preexistentes/shared. |
| Suíte Angular global | — | FALHOU fora do escopo | `npm test -- --watch=false` | 450 testes: 336 passando, 114 falhando e 54 erros. |
| Integridade | — | PASSOU | `git diff --check` | Sem erros. |

- Cobertura: a configuração exige 80% em statements, branches, functions e
  lines. A execução global falha antes de permitir uma medição/aprovação
  confiável; não houve redução de threshold nem ampliação de exclusões.

## Acessibilidade

- [x] Navegação por teclado com Tab e Enter.
- [x] Elementos interativos com nomes descritivos.
- [x] Imagens e fallback de avatar com texto alternativo/identificação.
- [x] Contraste claro e escuro auditado pelo axe, sem violações.
- [x] Mensagens de erro e estados vazios contextuais.
- [x] Regiões de rolagem interna focáveis e identificadas.
- [x] Dados essenciais dos gráficos disponíveis em tabela.
- [x] Viewport mínimo de 360 px sem overflow global.

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|---|---|---|---|---|---|---|
| BUG-12 | Em erro de agregação, chamadas a `resource.value()` lançavam exceção e impediam a renderização do estado contextual. | Alta | Corrigido | Adicionado acesso seguro aos resources no `DashboardDataStore` e componentes dependentes. | E2E-06 erro/retry | [estado de erro](evidences/e2e-06-dashboard-error-fixtures.png) |
| BUG-13 | Mensagens de erro/vazio da seção de fluxo perderam os textos contextuais esperados após a extração. | Média | Corrigido | Estado compartilhado passou a receber `errorTitle` e `emptyTitle` por seção. | E2E-06 erro e vazio | [loading/vazio](evidences/e2e-06-dashboard-empty-fixtures.png) |
| BUG-14 | Fallback de avatar e ação de perfil tinham contraste insuficiente no tema claro/escuro. | Alta | Corrigido | Aplicados tokens semânticos `text-foreground` no fallback e no link Zard. | E2E-15 axe claro/escuro | [listagem clara](evidences/e2e-15-vereadores-light-a11y.png), [listagem escura](evidences/e2e-15-vereadores-dark-a11y.png) |

Permanecem avisos não bloqueantes durante os E2E: ECharts informa dimensões
nulas/instância já inicializada e Angular informa `NG0953` ao destruir um
`OutputRef`. Não causaram falhas nos asserts.

## Conclusão

Os 16 critérios de aceitação foram verificados e passaram. Os bugs encontrados
durante esta rodada foram corrigidos e revalidados; a suíte E2E terminou em
15/15 e a auditoria axe terminou sem violações nos quatro estados de tema.

O QA fica **APROVADO para a funcionalidade**, com ressalva operacional de que
a suíte Angular e o lint globais permanecem quebrados por falhas preexistentes
fora do escopo. A porta 5100 e os processos iniciados pelo QA foram liberados.
