# Tarefa 1.0: Inventariar a linha de base e o critério de reclassificação

## Visão geral

Produzir o inventário verificável que reconcilia os 53 arquivos de frontend e os 7 testes de backend indicados no PRD com o resultado observável das suítes. A tarefa estabelece a referência para todas as correções posteriores e não altera regras de produção.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação incremental e à marcação desta tarefa após suas verificações.
- As skills Angular, Zard e de QA não são aplicáveis nesta tarefa documental e de levantamento; serão usadas nas tarefas de implementação e validação correspondentes.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos os `AGENTS.md` da raiz e dos projetos afetados, além das rules globais e locais aplicáveis. Executar os comandos em cada repositório proprietário, preservar alterações existentes, não expor segredos nos logs e nunca declarar uma suíte aprovada quando um pré-requisito estiver bloqueado. Os artefatos ficam somente em `tasks/prd-estabilizacao-suites-completas/evidences/`.
</rules>

<requirements>

- RF1, RF2 e RF3: registrar e classificar cada item inicialmente apontado.
- RF10 e RF11: disponibilizar comando, data, projeto, resultado e bloqueios verificáveis.
</requirements>

## Subtarefas

- [x] 1.1 Confirmar os comandos e o estado inicial de `municipalize-app` e `ms-main` sem alterar os projetos.
- [x] 1.2 Executar as suítes completas aplicáveis e salvar referências a logs sanitizados.
- [x] 1.3 Criar `evidences/suite-baseline.md` com um `SuiteBaselineEntry` por arquivo/caso e a classificação de causa.
- [x] 1.4 Reconciliar os quantitativos 53/7; documentar cada duplicidade, item não executável ou bloqueio sem removê-lo da rastreabilidade.
- [x] 1.5 Validar que o inventário possui critério, evidência e resultado inicial para todos os itens.

## Detalhes de implementação

Seguir “Visão dos componentes”, “Modelos de dados” (`SuiteBaselineEntry` e `SuiteExecutionEvidence`) e “Monitoramento e observabilidade” da [TechSpec](techspec.md). O relatório deve distinguir falha de código, contrato de teste, ambiente e classificação incorreta; não deve conter tokens, headers, cookies, credenciais ou dados municipais.

## Critérios de aceitação relacionados

- CA-03
- CA-07

## Testes da tarefa

### Testes de unidade

- [x] TU-05 — Classificador de inventário não aceita item sem evidência

### Testes de integração

Não aplicável nesta entrega. TI-07 será executado na tarefa 6, após todas as correções.

### Testes E2E

Não aplicável.

## Arquivos relevantes

- `tasks/prd-estabilizacao-suites-completas/prd.md`
- `tasks/prd-estabilizacao-suites-completas/techspec.md`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md` (novo)
- `municipalize-app/angular.json`
- `ms-main/pom.xml`
- `ms-main/target/surefire-reports/` (artefato local, não versionar logs sensíveis)
