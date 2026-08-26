# Tarefa 4.0: Migrar instituições, resumos, gráficos e detalhamentos

## Visão geral

Migrar as demais consultas gerais do dashboard para composições Zard, preservando instituições e subinstituições, indicadores resumidos, gráficos por dimensão e o detalhamento com alternância de agrupamento. A entrega deve manter todos os dados e significados existentes, inclusive em loading, vazio, erro, temas e viewport móvel.

**Dependências:** tarefas 1, 2 e 3.

<skills>
### Conformidade com skills

- `angular-developer`: decompor seções em componentes standalone de apresentação, usar inputs imutáveis e testar interações pelo DOM.
- `zard`: usar Card, Chart, Table, Accordion, Tabs/Toggle Group, Skeleton, Empty, Alert e Tooltip conforme as APIs instaladas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: componentes pequenos e co-localizados; sem lógica de negócio em templates; layout responsivo sem overflow global; scroll somente no contêiner da tabela; tokens semânticos; sem edição de `src/styles.css` ou `src/app/shared/`; equivalência numérica comprovada pelas fixtures. Não há desvio previsto.
</rules>

<requirements>

- RF7: preservar total, métricas individuais/de bancada e subinstituições expansíveis.
- RF8–RF9: preservar resumos e todas as visualizações por dimensão.
- RF10: preservar agrupamentos por responsável, criador, vereador e bancada.
- RF19–RF21: adicionar estados contextuais e retry.
- RF22–RF24: manter alternativa tabular, foco, semântica e texto completo.
- Manter impedimentos técnicos excluídos dos indicadores gerais.

</requirements>

## Subtarefas

- [x] 4.1 Criar a seção de instituições com métricas e subinstituições em Accordion/Table.
- [x] 4.2 Migrar `SummaryCardsComponent` para a composição oficial de Card.
- [x] 4.3 Substituir os charts gerais em escopo por `DashboardChartCardComponent`.
- [x] 4.4 Migrar o detalhamento por agrupamento para `z-table` com controle Zard.
- [x] 4.5 Implementar loading, vazio, erro e retry específicos para cada conjunto.
- [x] 4.6 Validar formatação, ordem, agrupamentos, alternativas textuais e overflow interno.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Visão dos componentes”, “DashboardAggregationCardViewModel”, “Zard Chart e ECharts” e o passo 5 de “Ordem de construção”. Esta tarefa não remove as dependências globais de Chart.js e não redesenha o dashboard de LOA.

## Critérios de aceitação relacionados

- CA-01
- CA-03
- CA-05
- CA-06
- CA-12
- CA-13
- CA-14
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-05 — Mapear vereador, bancada e instituição
- [x] TU-12 — Formatar moeda, número, data e texto completo

### Testes de integração (se aplicável)

- [x] TI-06 — Exibir estados por resource e retry
- [x] TI-07 — Renderizar subinstituições em accordion
- [x] TI-15 — Preservar semântica e nomes acessíveis

### Testes E2E (se aplicável)

Não se aplica isoladamente; equivalência, responsividade e temas serão validados na tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/summary/`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/charts/`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/table/`
- `municipalize-app/src/app/aplication/dashboard/AggregateDashboardUsecase.ts`
- `municipalize-app/src/app/domain/entities/DashboardAggregation.ts`
