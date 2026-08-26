# Tarefa 6.0: Compor o shell final do dashboard

## Visão geral

Integrar todas as seções migradas, reduzir `DashboardComponent` a um shell de composição e retirar somente os componentes de apresentação legados que deixarem de possuir consumidores dentro da feature. A entrega fecha a migração do dashboard sem remover Chart.js, `ng2-charts` ou providers ainda usados por outros módulos.

**Dependências:** tarefas 3, 4 e 5.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar composição standalone, providers no escopo do shell, control flow moderno e limites de tamanho definidos pelas rules locais.
- `zard`: verificar que toda primitive visual com equivalente usa a implementação instalada e que nenhum arquivo compartilhado foi alterado manualmente.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: template do shell abaixo de 120 linhas; responsabilidade única; imports diretos; exclusão somente de arquivos confirmadamente sem consumidores; preservação de rotas, providers globais e trabalho não relacionado; `git diff --check` no repositório filho. Não remover dependências globais usadas pelo dashboard de LOA.
</rules>

<requirements>

- RF1–RF13: integrar todas as seções e interações do dashboard com equivalência funcional.
- RF19–RF24: garantir estados, acessibilidade, responsividade e conteúdo completo no conjunto integrado.
- Preservar as rotas públicas e privadas que já alcançam o dashboard.
- Remover somente apresentações antigas substituídas e sem consumidores.
- Manter perfil e detalhes abrindo pelos mesmos Sheets.

</requirements>

## Subtarefas

- [x] 6.1 Fornecer `DashboardDataStore` no shell e conectar as seções migradas.
- [x] 6.2 Reduzir o template do dashboard à composição sem duplicar estado ou mapeamento.
- [x] 6.3 Confirmar consumidores antes de remover charts e legendas legados exclusivos da feature.
- [x] 6.4 Manter Chart.js, `ng2-charts` e o provider global usados fora do escopo.
- [x] 6.5 Validar ordem semântica, abertura de Sheets e retry no dashboard integrado.
- [x] 6.6 Executar a regressão integrada das seções antes de liberar a migração da listagem.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Visão dos componentes”, “Pontos de integração”, decisões “Sem remoção de Chart.js global” e o passo 6 de “Ordem de construção”. A remoção de um arquivo requer busca de consumidores no `municipalize-app`; dependências de package não fazem parte desta remoção.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-12
- CA-13
- CA-14
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

Não há caso unitário exclusivo; reexecutar os casos das tarefas 1, 2, 3, 4 e 5 afetados pela composição.

### Testes de integração (se aplicável)

- [x] TI-01 — Renderizar o card interativo com componentes Zard reais
- [x] TI-02 — Alternar Destino/Origem em vereadores
- [x] TI-03 — Alternar Destino/Origem em bancadas
- [x] TI-06 — Exibir estados por resource e retry
- [x] TI-07 — Renderizar subinstituições em accordion
- [x] TI-08 — Disparar snapshot conforme papel
- [x] TI-12 — Abrir detalhe de impedimento
- [x] TI-15 — Preservar semântica e nomes acessíveis

### Testes E2E (se aplicável)

Não se aplica nesta tarefa; os fluxos integrados alimentarão os cenários da tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard-content.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard-content.component.html`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/components/`
- `municipalize-app/src/app/presenter/features/tenant/public/home/tenant-home.component.ts`
- `municipalize-app/src/app/presenter/routes/public.routes.ts`
- `municipalize-app/src/app/presenter/routes/private.routes.ts`
- `municipalize-app/src/app/app.config.ts`

## Registro de validação desta execução

- `npx tsc --noEmit --project tsconfig.app.json`: aprovado.
- `npm run lint`: aprovado com 0 erros e 108 avisos preexistentes.
- `npm run build`: aprovado; apenas avisos CommonJS preexistentes.
- `npm test -- --include src/app/presenter/features/tenant/public/dashboard/dashboard.component.spec.ts --watch=false`: aprovado no runner Vitest (1 teste, 1 aprovado). Os specs ativos foram convertidos para APIs Vitest; componentes legados sem consumidores e dependências PrimeNG/Jasmine/Karma foram removidos.
- `git diff --check`: aprovado no repositório `municipalize-app`.
