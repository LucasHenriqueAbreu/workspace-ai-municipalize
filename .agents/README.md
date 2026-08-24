# Configuração global dos agentes

Este diretório reúne regras e skills pessoais usadas no workspace Municipalize.
Ele pertence ao repositório de orquestração da raiz e não substitui as
instruções específicas de cada subprojeto.

## Ordem de precedência

Em caso de conflito, siga esta ordem:

1. solicitação atual do usuário;
2. `AGENTS.md` do subprojeto afetado;
3. rules específicas do subprojeto;
4. `AGENTS.md` da raiz do workspace;
5. rules globais deste diretório;
6. skills globais aplicáveis.

Uma instrução mais específica prevalece sobre uma genérica, desde que não
reduza segurança, isolamento entre tenants ou proteção de dados.

## Rules globais

- [`workspace.md`](rules/workspace.md): limites dos repositórios, projetos ativos,
  projetos legados e mudanças entre projetos.
- [`workflow.md`](rules/workflow.md): fluxo obrigatório de produto e entrega.
- [`development-environment.md`](rules/development-environment.md): dependências,
  portas, inicialização, health checks e encerramento do ambiente local.
- [`git.md`](rules/git.md): uso seguro do Git em um workspace com repositórios
  independentes.
- [`security.md`](rules/security.md): segredos, autenticação, autorização e dados
  sensíveis.
- [`definition-of-done.md`](rules/definition-of-done.md): condições para concluir
  tarefas e funcionalidades.
- [`documentation.md`](rules/documentation.md): qualidade e manutenção da
  documentação operacional.

## Skills globais

- [`criar-prd`](skills/criar-prd/SKILL.md): define problema, escopo e critérios de
  aceitação.
- [`criar-techspec`](skills/criar-techspec/SKILL.md): especifica arquitetura,
  contratos e abordagem de testes.
- [`criar-tasks`](skills/criar-tasks/SKILL.md): decompõe a TechSpec em entregas
  incrementais.
- [`executar-task`](skills/executar-task/SKILL.md): implementa uma tarefa e seus
  testes.
- [`executar-qa`](skills/executar-qa/SKILL.md): valida requisitos, corrige defeitos
  e produz evidências.
- [`executar-review`](skills/executar-review/SKILL.md): executa a revisão final do
  código já validado pelo QA.

## Fluxo padrão

```text
criar-prd
  → criar-techspec
  → criar-tasks
  → executar-task
  → executar-qa
  → executar-review
```

O review é a última etapa. Uma funcionalidade somente está concluída depois do
QA aprovado e do review final aprovado.

## Escopo dos artefatos

PRDs, TechSpecs, tarefas, relatórios e evidências devem ser salvos em
`tasks/prd-[slug]/` dentro do repositório responsável pela funcionalidade. Em
mudanças que atravessem projetos, escolha um repositório coordenador e registre
nos documentos todos os demais repositórios afetados.

O projeto centralizado de QA com Playwright será criado separadamente. Até lá,
não presuma a existência de configuração E2E na raiz.
