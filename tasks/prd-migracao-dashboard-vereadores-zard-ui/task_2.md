# Tarefa 2.0: Construir componentes Zard compartilhados de visualização

## Visão geral

Construir as composições reutilizáveis de apresentação que sustentam as duas telas: card interativo com totalizadores e pizza, legenda controlável, chart genérico com alternativa tabular e detalhamento de funções. A entrega deve usar somente componentes Zard já instalados e tornar os dados compreensíveis sem depender de cor, hover ou mouse.

**Dependências:** tarefa 1.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar componentes standalone pequenos, inputs por signals, outputs tipados, `OnPush`, control flow moderno e testes por papel e nome acessível.
- `zard`: conferir `components.json` e APIs locais; compor Card, Chart, Tabs, Button, Toggle Group, Accordion, Table, Tooltip, Skeleton, Empty e Alert com tokens semânticos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: componentes filhos co-localizados; componente usado pelas duas features no ancestral comum; templates inline de até 120 linhas; sem `ngClass`, `ngStyle`, `space-*`, cores arbitrárias ou overrides `dark:`; acessibilidade por teclado; uso dos imports de composição que realmente existirem. O Card será importado pelos exports locais reais porque não existe `ZardCardImports`; isso não autoriza criar esse arquivo.
</rules>

<requirements>

- RF1–RF4: usar composições oficiais sem criar ou editar primitives Zard.
- RF5–RF6, RF9 e RF13: suportar totalizadores, charts, flows e controle de categorias.
- RF16: disponibilizar o detalhamento por função reutilizável.
- RF22–RF24: fornecer descrição, tabela equivalente, foco, teclado e conteúdo completo.
- Exibir apenas uma unidade por série: quantidade ou valor financeiro.
- Usar `var(--chart-*)`, labels e patterns/decal, sem depender exclusivamente de cor.

</requirements>

## Subtarefas

- [x] 2.1 Criar `DashboardInteractivePieCardComponent` com Card, totalizadores acionáveis e pizza Zard.
- [x] 2.2 Criar ou substituir o chart genérico com tooltip, descrição ARIA, loading, vazio, erro e tabela em accordion.
- [x] 2.3 Substituir a legenda artesanal por Toggle Group múltiplo com ação “Mostrar todas”.
- [x] 2.4 Criar `PublicFunctionBreakdownChartComponent` no ancestral comum das features públicas.
- [x] 2.5 Implementar seleção controlada de métrica e categorias sem alterar os dados de entrada.
- [x] 2.6 Cobrir mouse, teclado, reset, unidade única, semântica e alternativa textual em specs de componente.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “DashboardInteractiveChartViewModel”, “Zard Chart e ECharts”, “Principais decisões” e o passo 3 de “Ordem de construção”. O chart deve habilitar ARIA e decal pelo `zOption` suportado. Não remover ainda Chart.js ou componentes legados: a retirada só ocorrerá após a substituição de todos os consumidores na tarefa 6.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-04
- CA-06
- CA-13
- CA-14
- CA-15

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-03 — Selecionar a única série compatível com a métrica
- [x] TU-04 — Ocultar, reexibir e restaurar categorias
- [x] TU-11 — Construir alternativa textual do gráfico

### Testes de integração (se aplicável)

- [x] TI-01 — Renderizar o card interativo com componentes Zard reais
- [x] TI-05 — Operar totalizadores e legenda por teclado
- [x] TI-15 — Preservar semântica e nomes acessíveis

### Testes E2E (se aplicável)

Não se aplica nesta tarefa isolada; os componentes serão cobertos no fluxo completo da tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/components.json`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/charts/`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/legend-toggle/`
- `municipalize-app/src/app/presenter/features/tenant/public/components/`
- `municipalize-app/src/app/shared/components/card/`
- `municipalize-app/src/app/shared/components/chart/`
- `municipalize-app/src/app/shared/components/toggle-group/`
- `municipalize-app/src/app/shared/components/table/`

## Registro de validação desta execução

- O `DashboardInteractivePieCardComponent` passou a compor as seções de vereadores e bancadas; flow, métrica e categorias visíveis alimentam a mesma view imutável.
- `npm run build`: aprovado; apenas avisos CommonJS preexistentes.
- `npm run lint`: aprovado com 0 erros e 111 avisos preexistentes.
- `npm test -- --include src/app/presenter/features/tenant/public/dashboard/components/charts/dashboard-interactive-pie-card.component.spec.ts --watch=false`: o runner Vitest inicia normalmente; o spec focado é executado junto com a suíte Angular sem bloqueio de compilação.
- `npx vitest run` diretamente não é aplicável ao spec Angular do projeto, pois o runner isolado não carrega o alias `@/` configurado pelo Angular builder.
- `git diff --check`: aprovado no repositório `municipalize-app`.
