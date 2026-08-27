# Tarefa 6.0: Executar as suítes completas e publicar as evidências finais

## Visão geral

Validar o resultado integrado da estabilização nos dois repositórios, aplicar todos os gates exigidos e publicar a evidência final que reconcilia cada item da linha de base. Esta tarefa só pode declarar aprovação quando as suítes completas aplicáveis terminarem sem falhas.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação desta entrega final de validação técnica.
- `executar-qa`: será a etapa seguinte do fluxo formal, após todas as tarefas; não substituir por esta tarefa o QA de critérios de aceitação.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Aplicar os `AGENTS.md` e as rules de ambos os projetos. Executar cada comando dentro do repositório proprietário, não ocultar falhas por exclusão de testes/cobertura e reportar comandos impossíveis com motivo, impacto e ação necessária. Não encerrar recursos de terceiros e não publicar evidências com dados sensíveis.
</rules>

<requirements>

- RF1 a RF11: consolidar o resultado final, incluindo a aprovação real ou bloqueio de cada item.
- A aprovação exige 0 falhas nas suítes completas aplicáveis e compatibilidade preservada entre consumidores.
</requirements>

## Subtarefas

- [ ] 6.1 Executar `npm test` no `municipalize-app` e confirmar cobertura sem reduzir thresholds ou exclusões.
- [ ] 6.2 Executar `npm run lint` e `npm run build` no `municipalize-app`.
- [ ] 6.3 Executar `./mvnw test`, `./mvnw verify` e `./mvnw package` no `ms-main` com a infraestrutura da tarefa 4 pronta.
- [x] 6.4 Conferir que todos os itens do inventário possuem resultado final `passed`, `reclassified` com prova, ou `blocked` com impacto e ação necessária.
- [x] 6.5 Criar `evidences/suite-final.md` com comandos, data, resultado por grupo e links sanitizados para relatórios nativos.
- [ ] 6.6 Atualizar `tasks.md` e cada tarefa concluída somente depois de suas verificações aplicáveis aprovarem.

## Detalhes de implementação

Seguir “Sequenciamento do desenvolvimento”, “Monitoramento e observabilidade” e TI-07 da [TechSpec](techspec.md). As validações de uma pasta não substituem as do outro repositório. Se a execução completa estiver bloqueada, não marcar CA-01 ou CA-02 como aprovada e registrar o bloqueio conforme o modelo `SuiteExecutionEvidence`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07

## Testes da tarefa

### Testes de unidade

Todos os casos TU-01 a TU-05 devem continuar aprovados na suíte completa dos projetos correspondentes.

### Testes de integração

- [ ] TI-07 — Execução completa registra os 60 itens e o resultado por grupo

TI-01 a TI-06 também devem estar aprovados como pré-requisito desta tarefa.

### Testes E2E

Não aplicável como novo escopo; seguir a decisão documentada na TechSpec caso uma correção anterior tenha exigido regressão E2E.

## Arquivos relevantes

- `tasks/prd-estabilizacao-suites-completas/tasks.md`
- `tasks/prd-estabilizacao-suites-completas/task_1.md` a `task_5.md`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-final.md` (novo)
- `municipalize-app/package.json`
- `municipalize-app/angular.json`
- `ms-main/pom.xml`
- relatórios locais de Vitest, Surefire, Failsafe e JaCoCo, quando gerados
