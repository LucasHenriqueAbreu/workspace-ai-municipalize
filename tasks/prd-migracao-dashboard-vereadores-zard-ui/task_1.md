# Tarefa 1.0: Criar baseline, view models e builders de apresentação

## Visão geral

Criar a fundação testável da migração antes de alterar a interface: fixtures congeladas dos contratos atuais, contratos imutáveis de apresentação, builders puros e funções de formatação. A entrega deve caracterizar os resultados numéricos existentes e permitir que as tarefas seguintes componham o dashboard e a listagem sem mover regras para componentes.

**Dependências:** nenhuma.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar tipagem estrita, signals somente quando necessários ao estado, funções puras e testes Vitest próximos aos arquivos.
- `zard`: usar os tipos reais de Chart instalados ao definir os view models; não editar `src/app/shared/` nem reconstruir APIs por memória.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md`, todas as rules globais em `.agents/rules/` e todas as rules locais em `municipalize-app/.agents/rules/`.

Aplicam-se especialmente: artefatos na raiz e código no repositório filho; preservação de contratos e tenant; TypeScript estrito sem `any`; arquivos de até 100 linhas e funções de até 30 linhas; testes próximos ao código; cobertura mínima de 80%; nenhuma alteração em projetos legados, backend ou componentes compartilhados Zard. Não há desvio previsto.
</rules>

<requirements>

- RF3–RF4: preparar contratos compatíveis com temas, responsividade e APIs Zard existentes.
- RF5–RF18: preservar valores, agrupamentos, identidades, impedimentos, permissões e abertura de detalhes.
- RF19–RF24: modelar estados explícitos, fallback, conteúdo completo e alternativas acessíveis.
- Congelar fixtures sintéticas ou anonimizadas para agregações, breakdowns, perfil, impedimentos e permissões.
- Não alterar entidades, repositories, endpoints, cálculos ou filtros de domínio.

</requirements>

## Subtarefas

- [x] 1.1 Registrar fixtures de caracterização para respostas preenchidas, vazias, parciais e com erro.
- [x] 1.2 Criar os contratos de apresentação definidos em `techspec.md`, sem transportá-los para domínio ou infraestrutura.
- [x] 1.3 Implementar builders puros para cards, gráficos, impedimentos e vereadores públicos.
- [x] 1.4 Extrair formatadores puros de moeda, número, data, iniciais e texto acessível.
- [x] 1.5 Modelar estados discriminados de loading, empty, resolved e error com retry explícito.
- [x] 1.6 Cobrir os builders e formatadores com testes unitários baseados nas fixtures congeladas.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Modelos de dados”, “Principais decisões”, “Riscos conhecidos” e os passos 1 e 2 de “Ordem de construção”. Os tipos novos pertencem ao `presenter`; os casos de uso e repositories existentes continuam sendo a fronteira de dados. Os builders não devem importar componentes, abrir Sheets nem executar HTTP.

## Critérios de aceitação relacionados

- CA-03
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-11
- CA-12
- CA-13
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-02 — Calcular totalizadores do card interativo
- [x] TU-05 — Mapear vereador, bancada e instituição
- [x] TU-06 — Separar impedimentos e normalizar prévia
- [x] TU-07 — Resolver permissão visual de snapshot
- [x] TU-08 — Gerar iniciais e fallback de identidade
- [x] TU-09 — Mapear enriquecimento parcial de perfil
- [x] TU-10 — Derivar estados loading, empty, resolved e error
- [x] TU-12 — Formatar moeda, número, data e texto completo

### Testes de integração (se aplicável)

Não se aplica; esta tarefa cria contratos e transformações puras.

### Testes E2E (se aplicável)

Não se aplica nesta tarefa; a baseline será consumida nos cenários E2E da tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/`
- `municipalize-app/src/app/presenter/features/tenant/public/councillors/`
- `municipalize-app/src/app/domain/entities/DashboardAggregation.ts`
- `municipalize-app/src/app/domain/entities/DashboardCouncillorSnapshotBreakdown.ts`
- `municipalize-app/src/app/domain/entities/DashboardBenchSnapshotBreakdown.ts`
- `municipalize-app/src/app/aplication/councillor-public-profile/GetCouncillorPublicProfileUsecase.ts`

## Registro de validação desta execução

- `npx vitest run src/app/presenter/features/tenant/public/dashboard/build-dashboard-view.usecases.spec.ts src/app/presenter/features/tenant/public/dashboard/dashboard-formatters.spec.ts src/app/presenter/features/tenant/public/dashboard/dashboard-section-state.spec.ts --coverage`: aprovado, 9 testes; statements 100%, branches 91,95%, functions 100% e lines 100%.
- `npm run lint`: aprovado com 0 erros e 111 avisos preexistentes.
- `npm run build`: aprovado; apenas avisos CommonJS preexistentes.
- `npm test -- --watch=false`: o runner Vitest inicia normalmente após a migração dos specs; a suíte global ainda reporta falhas comportamentais preexistentes fora do escopo desta tarefa.
- `git diff --check`: aprovado no repositório `municipalize-app`.
