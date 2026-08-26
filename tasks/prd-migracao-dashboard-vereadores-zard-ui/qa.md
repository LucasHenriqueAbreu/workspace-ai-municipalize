# Relatório de QA — Migração do dashboard de vereadores para Zard UI

## Resumo

- Data: 2026-08-26
- Status: **APROVADO**
- Critérios de aceitação: 16
- Critérios atendidos: 16
- Critérios bloqueados: nenhum
- Bugs corrigidos/revalidados: 5 (BUG-07 a BUG-11).

A suíte central validou a funcionalidade com fixtures HTTP em Chromium. O
navegador integrado da sessão continuou indisponível (`agent.browsers.list()`
retornou vazio), então a auditoria foi executada pelo Playwright central do
projeto, com `axe-core` integrado à suíte. O audit cobriu dashboard e listagem
nos temas claro e escuro. Não houve execução contra APIs reais nesta rodada;
os contratos não foram alterados.

## Critérios de aceitação

| ID | Status | Evidência |
|---|---|---|
| CA-01 | **PASSOU** | Inventário estático das duas telas e diff sem alterações em `src/app/shared/components` ou `src/styles.css`; composição usa primitives Zard no escopo. |
| CA-02 | **PASSOU** | Componentes Zard oficiais já presentes no projeto e `components.json`; nenhuma cópia manual foi adicionada. |
| CA-03 | PASSOU em fixtures | E2E-01/E2E-02 e builders/formatters preservam seções, datas, rótulos, valores e agrupamentos. |
| CA-04 | PASSOU em fixtures | E2E-02/E2E-03 validam Origem/Destino e ocultar/restaurar séries sem alterar os dados. |
| CA-05 | PASSOU em fixtures | E2E-01 e builders validam expansão e totais de subinstituições. |
| CA-06 | PASSOU em fixtures | E2E-01/E2E-03 e specs de dashboard validam resumos, gráficos e detalhamentos. |
| CA-07 | PASSOU em fixtures | E2E-10 valida impedimentos separados, totais e detalhamento contextual. |
| CA-08 | PASSOU em fixtures | E2E-04 valida snapshot para ADMIN, ausência para USER e feedback de processamento. |
| CA-09 | PASSOU em fixtures | E2E-05 valida identidade, subtítulo, indicadores, badges e detalhamento dos cards. |
| CA-10 | PASSOU em fixtures | E2E-05 valida ação acessível e identificador válido para abertura do perfil. |
| CA-11 | PASSOU em fixtures | E2E-05 e evidência visual validam fallback por iniciais sem quebra do card. |
| CA-12 | PASSOU em fixtures | E2E-06 cobre loading, vazio, erro, retry e `z-skeleton` contextual. |
| CA-13 | PASSOU em fixtures | E2E-07 valida viewport de 360 px sem rolagem horizontal global; [evidência](evidences/e2e-07-dashboard-360px.png). |
| CA-14 | **PASSOU** | E2E-08 e E2E-14/E2E-15 alternam os temas; axe valida `color-contrast` em dashboard e listagem claro/escuro, sem violações. |
| CA-15 | **PASSOU** | E2E-09 valida teclado, foco, nomes acessíveis e `alt`; E2E-14/E2E-15 executam axe WCAG 2A/2AA/2.1 AA sem violações. |
| CA-16 | PASSOU em fixtures | E2E-01/E2E-02/E2E-04/E2E-10 e typecheck preservam rotas, permissões, contratos simulados e resultados numéricos. |

## Testes executados

| Camada | Resultado | Comando/resultado |
|---|---|---|
| Typecheck E2E | **PASSOU** | `npm run typecheck` em `e2e/`. |
| Unidade focada | **PASSOU** | 6 arquivos, 13 testes; builders/formatters/helpers relevantes com 100% de statements/functions no recorte. |
| E2E central | **PASSOU** | `npm run typecheck && E2E_START_APP=true E2E_USE_API_FIXTURES=true E2E_FRONTEND_PORT=5100 npm test` em `e2e/`: 15/15. |
| Auditoria axe | **PASSOU** | E2E-14/E2E-15 em 4 estados (2 telas × 2 temas), tags `wcag2a`, `wcag2aa` e `wcag21aa`, 0 violações. |
| Lint | **PASSOU COM AVISOS** | `npm run lint`: 0 erros e 108 avisos. |
| Build | **PASSOU** | `npm run build`: bundle gerado; avisos CommonJS existentes. Foi adicionada a dependência direta `shiki` requerida por `rehype-pretty-code`. |
| Integridade | **PASSOU** | `git diff --check` sem erros. Nenhum processo ficou escutando na porta 5100. |
| Suíte Angular completa | **NÃO EXECUTADA** | A validação foi feita no recorte da funcionalidade; o runner global inclui specs legados fora do escopo. |

A cobertura global impressa pelo runner Angular ficou abaixo de 80% por incluir
todo o grafo transiente da aplicação. Isso não invalida o recorte focado, mas
impede declarar a meta de 80% para a suíte global.

## Cenários E2E

- E2E-01: estrutura do dashboard, gráfico e impedimentos.
- E2E-02: fluxo Origem na home pública e em Vereadores.
- E2E-03: métricas, ocultar/restaurar categoria e tabela equivalente.
- E2E-04: snapshot restrito a administrador e feedback.
- E2E-05: listagem pública, fallback e ação de perfil.
- E2E-06: erro/retry, vazio e loading com `z-skeleton`.
- E2E-07: viewport de 360 px sem overflow global.
- E2E-08: temas claro/escuro.
- E2E-09: foco por teclado, nomes acessíveis e `alt`.
- E2E-10: impedimentos técnicos separados.
- E2E-11: inventário estático de primitives Zard no escopo.
- E2E-14: auditoria axe WCAG AA do dashboard em claro/escuro.
- E2E-15: auditoria axe WCAG AA da listagem em claro/escuro.

Evidências visuais: [dashboard](evidences/e2e-01-dashboard-fixtures.png),
[vereadores](evidences/e2e-05-vereadores-fixtures.png),
[vazio](evidences/e2e-06-dashboard-empty-fixtures.png),
[loading](evidences/e2e-06-dashboard-loading-fixtures.png),
[360 px](evidences/e2e-07-dashboard-360px.png), [tema claro](evidences/browser-dashboard-360px.png) e [tema escuro](evidences/browser-dashboard-dark-360px.png).

Evidências específicas da auditoria axe: [dashboard claro](evidences/e2e-14-dashboard-light-a11y.png), [dashboard escuro](evidences/e2e-14-dashboard-dark-a11y.png), [vereadores claro](evidences/e2e-15-vereadores-light-a11y.png) e [vereadores escuro](evidences/e2e-15-vereadores-dark-a11y.png).

## Acessibilidade e responsividade

| Verificação | Resultado |
|---|---|
| Operação por Tab/Enter | PASSOU em E2E-09 |
| Nomes acessíveis de controles e imagens | PASSOU em E2E-09 |
| `alt`/fallback de imagens | PASSOU em E2E-05/E2E-09 |
| Erros, vazios e retry identificáveis | PASSOU em E2E-06 |
| Contraste mensurado em claro/escuro | PASSOU — axe sem violações nas duas telas e nos dois temas |
| Viewport mínimo de 360 px | PASSOU em E2E-07 |

## Bugs corrigidos e riscos residuais

| ID | Descrição | Correção/regressão |
|---|---|---|
| BUG-07 | Skeletons do dashboard não usavam o componente Zard. | Substituídos por `z-skeleton`; revalidado em E2E-06. |
| BUG-08 | `Mostrar todos` não restaurava série ocultada quando o toggle era controlado. | Legenda passou a sincronizar um `FormControl` local com as categorias ativas, sem alterar o shared; revalidado em E2E-03 e spec de regressão. |
| BUG-09 | Build não resolvia `shiki`, peer usado por `rehype-pretty-code`. | Adicionada dependência direta `shiki` em `package.json`/lockfile; `npm run build` passou. |
| BUG-10 | Contraste abaixo de 4,5:1 em texto, abas, badges e botões nos temas. | Aplicados tokens semânticos com contraste suficiente nas telas/componentes em escopo e variante `line` para abas; axe passou nos quatro estados. |
| BUG-11 | Regiões de tabelas com rolagem interna não eram focáveis. | Adicionados `tabindex="0"` e nomes acessíveis nos wrappers de rolagem; axe passou `scrollable-region-focusable`. |

Permanecem avisos não bloqueantes durante E2E/testes: ECharts reporta
dimensões nulas e instância já inicializada no DOM, e Angular reporta
`NG0953` ao destruir um `OutputRef`. Não causaram falhas nos asserts, mas devem
ser investigados antes da liberação do módulo.

## Conclusão

A implementação está funcionalmente validada em fixtures: os 15 cenários E2E,
incluindo a auditoria axe nos quatro estados, typecheck, testes focados, lint e
build passaram. Os 16 critérios de aceitação estão atendidos e o QA fica
**APROVADO**.

Os avisos residuais de ECharts (`DOM width/height` e instância já inicializada)
e Angular (`NG0953` em `OutputRef`) não causaram falhas e permanecem como
melhoria técnica não bloqueante.
