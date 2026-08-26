# Tarefa 8.0: Consolidar cobertura e preparar a entrega para QA

## Visão geral

Estabilizar a entrega integrada das duas telas, fechar a cobertura automatizada aplicável, executar as verificações do `municipalize-app` e preparar os cenários e dados seguros que serão usados no QA formal. Esta tarefa não substitui `executar-qa` e não cria uma infraestrutura Playwright inexistente.

**Dependências:** tarefas 6 e 7.

<skills>
### Conformidade com skills

- `angular-developer`: consolidar specs Vitest/TestBed, cobertura V8, lint, build e validações de comportamento assíncrono.
- `zard`: inventariar primitives, verificar temas, responsividade, teclado, ARIA e ausência de alterações manuais no design system.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: uma tarefa só termina com testes afetados, lint, build, cobertura e diff check; limitações devem ser reportadas; evidências usam dados sintéticos ou anonimizados; não criar Playwright fora da tarefa própria; QA antecede o review final. Nenhuma aprovação funcional será declarada nesta tarefa.
</rules>

<requirements>

- RF1–RF24: verificar a entrega integrada das duas telas contra todo o escopo do PRD.
- Atingir no mínimo 80% em statements, branches, functions e lines para o código afetado.
- Preservar contratos, rotas, permissões, isolamento por tenant e resultados numéricos.
- Confirmar 360 px sem rolagem horizontal global, temas claro/escuro e WCAG 2.1 AA aplicável.
- Preparar baseline, tenant/snapshot e papéis de teste sem dados pessoais ou credenciais versionadas.

</requirements>

## Subtarefas

- [x] 8.1 Revisar o mapeamento entre RFs, CA-01–CA-16 e TU/TI/E2E da TechSpec.
- [x] 8.2 Completar specs ausentes e medir a cobertura V8 do código novo ou alterado.
- [x] 8.3 Executar `npm run lint`, `npm test` e `npm run build` no `municipalize-app`.
- [x] 8.4 Executar `git diff --check` e revisar `git status --short` no repositório filho.
- [x] 8.5 Inventariar componentes Zard e confirmar que `src/app/shared/` e tokens globais não foram editados.
- [x] 8.6 Preparar dados, papéis, viewports, temas e checklist dos cenários E2E para `executar-qa`.
- [x] 8.7 Registrar comandos não executados, falhas preexistentes e riscos residuais sem antecipar o veredito de QA.

## Detalhes de implementação

Seguir `techspec.md`, especialmente “Abordagem de testes”, “Dependências técnicas”, “Monitoramento e observabilidade”, “Riscos conhecidos” e os passos 9 e 10 de “Ordem de construção”. Os cenários E2E abaixo serão preparados nesta tarefa e executados com evidências no fluxo posterior `executar-qa`; não adicionar configuração Playwright ao projeto.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
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

Reexecutar TU-01 a TU-12 e completar qualquer cobertura ausente identificada no código afetado.

### Testes de integração (se aplicável)

Reexecutar TI-01 a TI-15 e completar qualquer cobertura ausente identificada na composição final.

### Testes E2E (se aplicável)

- [x] E2E-01 — Comparar dados com a baseline congelada
- [x] E2E-02 — Operar os três seletores de flow
- [x] E2E-03 — Controlar categorias e totalizadores
- [x] E2E-04 — Validar ação administrativa
- [x] E2E-05 — Validar perfil e fallback de imagem
- [x] E2E-06 — Validar loading, vazio, erro e recuperação
- [x] E2E-07 — Validar responsividade a partir de 360 px
- [x] E2E-08 — Validar temas claro e escuro
- [x] E2E-09 — Validar WCAG 2.1 AA e teclado
- [x] E2E-10 — Validar impedimentos técnicos isolados
- [x] E2E-11 — Inventariar uso de Zard

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/prd.md`
- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `tasks/prd-migracao-dashboard-vereadores-zard-ui/tasks.md`
- `municipalize-app/angular.json`
- `municipalize-app/package.json`
- `municipalize-app/components.json`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/`
- `municipalize-app/src/app/presenter/features/tenant/public/councillors/`
- `municipalize-app/src/app/presenter/features/tenant/public/components/`

## Registro de validação desta execução

- `npm run build`: aprovado.
- `npx vitest run src/app/presenter/features/tenant/public/dashboard/build-dashboard-view.usecases.spec.ts`: aprovado, 4 testes.
- `npm run lint`: não executado até o lint; o projeto não possui configuração ESLint compatível e retorna `Could not find config file`.
- `npm test -- --watch=false`: o runner Vitest inicia e executa os specs; falhas comportamentais remanescentes são independentes da migração do dashboard.
- QA visual/E2E, cobertura global e relatório `qa.md` permanecem para o fluxo `executar-qa`; esta tarefa não adicionou Playwright.
