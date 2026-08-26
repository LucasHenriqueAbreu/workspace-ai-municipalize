# Tarefa 7.0: Migrar a listagem pública de vereadores

## Visão geral

Migrar a listagem pública para cards e feedback Zard, com store próprio, seleção de Destino/Origem aplicada aos indicadores e breakdowns, enriquecimento parcial tolerante a falhas, avatar com iniciais e abertura inalterada do perfil público.

**Dependências:** tarefas 1 e 2.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar store no escopo da tela, carregamento concorrente controlado, inputs/outputs por signals e specs TestBed/Vitest.
- `zard`: compor Card, Avatar, Badge, Tabs, Alert, Skeleton, Empty, Button e Sheet pelas APIs locais.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: nenhum N+1 adicional; falha individual não apaga dados válidos; sem dados pessoais em logs ou fixtures; ação sem ID deve permanecer indisponível; conteúdo interno do perfil está fora do escopo; layout sem overflow global em 360 px. Não há desvio previsto.
</rules>

<requirements>

- RF14–RF16: preservar identidade, descrição, mandato, funções, quantidade, valor e breakdown no flow ativo.
- RF17: manter abertura do mesmo perfil pelo nome e ação, apenas para ID válido.
- RF18: usar iniciais quando a foto estiver ausente ou falhar.
- RF19–RF24: fornecer estados, retry, alternativa textual, teclado e conteúdo completo.
- Usar `Promise.allSettled` ou comportamento equivalente para comunicar degradação parcial sem derrubar a lista.
- Manter o componente legado de breakdown dentro do perfil detalhado, fora do escopo.

</requirements>

## Subtarefas

- [x] 7.1 Criar `CouncillorsPublicStore` com flow, resources, enriquecimento e retries separados.
- [x] 7.2 Aplicar `BuildPublicCouncillorCardsUsecase` e preservar dados agregados em falhas de perfil.
- [x] 7.3 Criar `CouncillorPublicCardComponent` com Card, Avatar fallback, Badge e indicadores.
- [x] 7.4 Integrar o breakdown compartilhado e manter indicadores e funções no mesmo flow.
- [x] 7.5 Preservar abertura por nome e ação através do `ZardSheetService`.
- [x] 7.6 Comunicar degradação parcial e implementar retry do enriquecimento.
- [x] 7.7 Reduzir `CouncillorsPublicComponent` ao shell responsivo da listagem.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “PublicCouncillorCardViewModel”, a premissa de degradação de perfil, `GET /public/councillor/{id}/profile`, “Sheets e feedback” e os passos 7 e 8 de “Ordem de construção”. Não reformular `CouncillorPublicProfileComponent` nem substituir o breakdown dentro dele.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13
- CA-14
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-08 — Gerar iniciais e fallback de identidade
- [x] TU-09 — Mapear enriquecimento parcial de perfil

### Testes de integração (se aplicável)

- [x] TI-04 — Alternar flow na listagem pública
- [x] TI-09 — Abrir perfil por nome e ação
- [x] TI-10 — Aplicar fallback de avatar
- [x] TI-11 — Comunicar degradação parcial de perfil

### Testes E2E (se aplicável)

Não se aplica isoladamente; o fluxo público será validado por E2E-02 e E2E-05 na tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/councillors/councillors-public.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/councillors/councillors-public.component.html`
- `municipalize-app/src/app/presenter/features/tenant/public/councillors/public-profile/councillor-public-profile.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/components/`
- `municipalize-app/src/app/presenter/common/mz-components/function-breakdown-bars/`
- `municipalize-app/src/app/aplication/councillor-public-profile/GetCouncillorPublicProfileUsecase.ts`
