# Documentação do workspace Municipalize

Esta pasta é a fonte de navegação para quem trabalha no Municipalize. Comece
pelo caminho que corresponde ao que você precisa fazer; os documentos indicam
quando é necessário consultar as instruções operacionais em `AGENTS.md` e
`.agents/`.

## Escolha seu caminho

| Se você quer... | Leia... |
|---|---|
| Entender a plataforma, os repositórios e seus limites | [Ecossistema e arquitetura](ecossistema.md) |
| Fazer uma alteração, corrigir um bug ou iniciar o ambiente | [Como trabalhar no workspace](como-trabalhar.md) |
| Desenvolver uma funcionalidade do início ao fim | [Spec Driven Development](spec-driven-development.md) |
| Trabalhar em paralelo com branches e worktrees | [Branches e trabalho paralelo](parallel-work.md) |

## Leitura recomendada para quem está chegando

1. [Ecossistema e arquitetura](ecossistema.md)
2. [Como trabalhar no workspace](como-trabalhar.md)
3. [Spec Driven Development](spec-driven-development.md)

Depois, abra o `AGENTS.md` do projeto que receberá a mudança. Ele é a fonte de
verdade para comandos, dependências, testes e convenções daquele repositório.

## Como a documentação está organizada

- `README.md` na raiz: porta de entrada curta para o workspace.
- `docs/`: guias para pessoas, conceitos e processos compartilhados.
- `AGENTS.md`: instruções que agentes devem seguir no workspace ou em um
  projeto específico.
- `.agents/`: rules, skills, templates e automações usados pelos agentes.
- `tasks/prd-[slug]/`: artefatos de uma funcionalidade em andamento ou já
  entregue.

As rules e skills não foram removidas de `.agents`: elas continuam sendo a
configuração operacional dos agentes. Esta pasta evita que seja preciso
descobri-las para entender como o time trabalha.

Volte ao [README da raiz](../README.md) quando precisar recomeçar a navegação.
