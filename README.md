# Ecossistema Municipalize

Este workspace reúne os repositórios que formam a plataforma Municipalize. O
produto apoia a gestão pública municipal em fluxos como emendas, projetos,
instituições, orçamento, usuários, colaboração, acompanhamento e relatórios,
com isolamento multi-tenant para Câmaras e demais organizações atendidas.

O workspace é composto por repositórios Git independentes. A raiz coordena a
documentação, as regras, as skills e os artefatos do desenvolvimento; ela não é
um monorepo de código de produto.

## Projetos

| Projeto | Responsabilidade | Stack |
|---|---|---|
| [`municipalize-app`](municipalize-app/) | Interface pública, autenticada e administrativa | Angular |
| [`ms-main`](ms-main/) | Regras e dados operacionais de cada tenant | Java, Quarkus e SQL Server |
| [`municipalize-admin-app`](municipalize-admin-app/) | Administração global, clientes, operadores, Chat, IA e ferramentas | NestJS e MongoDB |

### Projetos legados

`municipalize-chat-api` e `municipalize-mcp` são somente referências históricas.
Quando presentes no workspace, não devem ser executados, publicados, corrigidos
ou usados como dependências. O Chat e as ferramentas atuais pertencem à
`municipalize-admin-app`.

## Como começar

1. Leia [`AGENTS.md`](AGENTS.md), que define o contexto e os limites do
   workspace.
2. Leia o `AGENTS.md` do projeto que receberá a alteração e as rules globais em
   [`.agents/rules/`](.agents/rules/).
3. Escolha o repositório dono da responsabilidade. Interface e integração do
   navegador ficam em `municipalize-app`; regras e dados de tenant, em
   `ms-main`; administração global, Chat, IA e ferramentas, em
   `municipalize-admin-app`.
4. Para uma funcionalidade relevante, siga o
   [guia do Spec Driven Development](docs/spec-driven-development.md).
5. Antes de editar código, prepare a branch da tarefa:

   ```bash
   # Executar na raiz do workspace
   python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
     start --slug minha-tarefa --mode workspace
   ```

   Esse modo mantém os diretórios atuais e cria/ativa `agent/minha-tarefa` na
   raiz e em cada projeto ativo. Para trabalhar em uma sessão isolada, omita
   `--mode workspace`; o modo padrão cria `workspace-minha-tarefa/` ao lado do
   workspace com worktrees coordenados.

6. Execute comandos de instalação, desenvolvimento, testes e build dentro do
   projeto correspondente. Os comandos locais e suas dependências estão no
   `AGENTS.md` de cada projeto.

## Workflow de desenvolvimento

O fluxo formal é:

```text
PRD → TechSpec → Tasks → Implementação → QA → Review → Commit/Push
```

Cada etapa tem uma skill e artefatos rastreáveis. O QA precisa ser aprovado
antes do review, e o review é a última validação técnica antes da publicação.

| Etapa | Skill | Resultado principal |
|---|---|---|
| Requisitos | [`criar-prd`](.agents/skills/criar-prd/SKILL.md) | `tasks/prd-[slug]/prd.md` |
| Especificação | [`criar-techspec`](.agents/skills/criar-techspec/SKILL.md) | `tasks/prd-[slug]/techspec.md` |
| Planejamento | [`criar-tasks`](.agents/skills/criar-tasks/SKILL.md) | `tasks/prd-[slug]/tasks.md` e `task_[num].md` |
| Implementação | [`executar-task`](.agents/skills/executar-task/SKILL.md) | Código, testes e tarefas marcadas |
| Qualidade | [`executar-qa`](.agents/skills/executar-qa/SKILL.md) | `qa.md` e evidências |
| Revisão | [`executar-review`](.agents/skills/executar-review/SKILL.md) | `codereview.md` e veredito |
| Publicação | [`encerrar-tarefa`](.agents/skills/encerrar-tarefa/SKILL.md) | Commit, push e eventual remoção da worktree |

Para o passo a passo, critérios de conclusão, exemplos e tratamento de
bloqueios, consulte [`docs/spec-driven-development.md`](docs/spec-driven-development.md).

## Artefatos de uma funcionalidade

Os documentos ficam na raiz do workspace, em uma pasta por funcionalidade:

```text
tasks/prd-[slug]/
├── prd.md
├── techspec.md
├── tasks.md
├── task_1.md
├── task_2.md
├── qa.md
├── codereview.md
└── evidences/
```

O PRD é a fonte de verdade dos requisitos e critérios de aceitação (`CA-*`).
A TechSpec define arquitetura, contratos e casos de teste (`TU-*`, `TI-*` e
`E2E-*`). As tarefas conectam os critérios aos arquivos e à implementação. O
QA registra evidências; o review verifica o resultado final depois das
correções do QA.

## Regras essenciais

- Cada projeto interno possui histórico Git, branch e estado independentes.
- Não transforme projetos internos em submódulos, subtrees ou dependências da
  raiz.
- Preserve alterações existentes e não use `stash`, `reset`, `clean` ou remoção
  forçada como mecanismo automático.
- Não inclua segredos, arquivos `.env`, tokens ou dados municipais reais em
  commits, documentação ou evidências.
- Valide cada projeto afetado com os comandos definidos no seu `AGENTS.md`.
- Não marque tarefas, QA ou review como concluídos sem as evidências e testes
  aplicáveis.

## Referências

- [`AGENTS.md`](AGENTS.md) — contexto, arquitetura e precedência das regras.
- [`.agents/README.md`](.agents/README.md) — catálogo de rules e skills.
- [`docs/spec-driven-development.md`](docs/spec-driven-development.md) — guia
  completo para trabalhar com o processo.
- [`docs/parallel-work.md`](docs/parallel-work.md) — branches, worktrees,
  manifestos, commit, push e encerramento.
