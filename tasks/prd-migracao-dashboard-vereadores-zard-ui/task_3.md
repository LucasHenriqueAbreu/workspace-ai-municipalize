# Tarefa 3.0: Implementar estado e fluxos de vereadores e bancadas no dashboard

## Visão geral

Criar o estado reativo do dashboard e migrar as seções de vereadores e bancadas para o padrão aprovado. Cada seção terá seleção independente de Destino/Origem, e a seleção atualizará conjuntamente totalizadores, quantidade, pizza, cards, legenda e breakdown sem conservar dados do flow anterior.

**Dependências:** tarefas 1 e 2.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar store fornecido no escopo do shell, signals readonly, `computed`, `resource` somente para leitura e testes determinísticos com fakes.
- `zard`: compor Tabs, Card, Chart, Skeleton, Empty e Alert pelas APIs locais, com controles acessíveis e tokens semânticos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: HTTP permanece nos repositories; orquestração no store/use case; componentes não conhecem `HttpClient`; estado de tenant não pode sobreviver à rota; inputs e outputs são tipados; funções e arquivos respeitam os limites locais; leituras falhas não usam retry automático. Não há desvio previsto.
</rules>

<requirements>

- RF5–RF6: preservar agregações, data, partido/subtítulo, total, quantidade, breakdown e abertura de perfil.
- RF13: ocultar, reexibir e restaurar categorias sem mutar valores.
- RF19–RF21: fornecer loading, vazio, erro e retry por resource.
- RF22–RF24: manter charts e controles acessíveis.
- Usar o mesmo flow e snapshot na agregação e no breakdown.
- Após snapshot bem-sucedido, a revisão compartilhada deverá recarregar também os breakdowns.

</requirements>

## Subtarefas

- [x] 3.1 Criar `DashboardDataStore` no escopo do shell com flows independentes e revisão de refresh.
- [x] 3.2 Implementar resources parametrizados para agregações e breakdowns de vereadores.
- [x] 3.3 Implementar resources parametrizados para agregações e breakdowns de bancadas.
- [x] 3.4 Criar `DashboardCouncillorSectionComponent` com tabs, totalizadores, chart, cards e detalhe por função.
- [x] 3.5 Criar `DashboardBenchSectionComponent` com o mesmo contrato de interação.
- [x] 3.6 Implementar retry por resource e impedir resposta obsoleta após troca rápida de flow.
- [x] 3.7 Caracterizar os parâmetros HTTP existentes sem modificar repository ou endpoint.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Visão dos componentes”, “Fluxo de dados das seções com Origem/Destino”, “Principais interfaces”, os endpoints de agregação/breakdown e o passo 4 de “Ordem de construção”. Durante uma troca de flow, a seção retorna a loading e não mantém números resolvidos da seleção anterior.

## Critérios de aceitação relacionados

- CA-03
- CA-04
- CA-06
- CA-12
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-01 — Construir parâmetros por flow sem misturar dados
- [x] TU-10 — Derivar estados loading, empty, resolved e error

### Testes de integração (se aplicável)

- [x] TI-02 — Alternar Destino/Origem em vereadores
- [x] TI-03 — Alternar Destino/Origem em bancadas
- [x] TI-06 — Exibir estados por resource e retry
- [x] TI-13 — Consumir agregação com parâmetros preservados
- [x] TI-14 — Consumir breakdowns e snapshot raw

### Testes E2E (se aplicável)

Não se aplica isoladamente; a operação dos três seletores será validada por E2E-02 na tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard.component.html`
- `municipalize-app/src/app/aplication/dashboard/AggregateDashboardUsecase.ts`
- `municipalize-app/src/app/aplication/dashboard/GetDashboardCouncillorSnapshotBreakdownUsecase.ts`
- `municipalize-app/src/app/aplication/dashboard/GetDashboardBenchSnapshotBreakdownUsecase.ts`
- `municipalize-app/src/app/infra/repositories/DashboardApiService.ts`
