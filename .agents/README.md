# Configuração operacional dos agentes

Este diretório reúne rules, skills, templates e automações usadas por agentes
no workspace Municipalize. Ele pertence ao repositório de orquestração da raiz
e não substitui as instruções específicas de cada subprojeto.

Para entender o workspace e o processo de desenvolvimento, comece pelo
[`README.md`](../README.md) e pelo [índice da documentação](../docs/README.md).
Os documentos em `docs/` são a referência para pessoas; este diretório contém
as instruções operacionais que agentes devem aplicar.

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
  e produz evidências. Os testes de navegador centralizados ficam em
  [`../e2e/`](../e2e/README.md).
- [`executar-review`](skills/executar-review/SKILL.md): executa a revisão final do
  código já validado pelo QA.
- [`iniciar-tarefa-paralela`](skills/iniciar-tarefa-paralela/SKILL.md): prepara
  uma sessão isolada com worktrees coordenados ou cria a branch da tarefa no
  workspace atual e nos projetos ativos.
- [`encerrar-tarefa`](skills/encerrar-tarefa/SKILL.md): revisa, faz commit e
  push de uma tarefa com confirmação explícita e encerra worktrees quando
  aplicável.

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

## Documentação para pessoas

- [`docs/README.md`](../docs/README.md): índice e caminhos de leitura.
- [`docs/ecossistema.md`](../docs/ecossistema.md): projetos, responsabilidades
  e limites arquiteturais.
- [`docs/como-trabalhar.md`](../docs/como-trabalhar.md): guia prático para
  alterações e validações.
- [`docs/spec-driven-development.md`](../docs/spec-driven-development.md):
  conceito e fluxo completo de Spec Driven Development.
- [`docs/parallel-work.md`](../docs/parallel-work.md): branches, worktrees,
  manifestos, publicação e encerramento.

## Escopo dos artefatos

PRDs, TechSpecs, tarefas, relatórios e evidências devem ser salvos em
`tasks/prd-[slug]/` na raiz coordenadora do workspace. Em mudanças que
atravessem projetos, registre nos documentos todos os repositórios, contratos e
consumidores afetados.

O projeto centralizado de QA com Playwright fica em `../e2e/`, fora dos projetos
filhos. Suas regras de instalação e execução estão em `../e2e/README.md`.
