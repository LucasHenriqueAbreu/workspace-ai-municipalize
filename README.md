# Ecossistema Municipalize

Este é o ponto de entrada do workspace Municipalize. A plataforma apoia a
gestão pública municipal em fluxos de emendas, projetos, instituições,
orçamento, usuários, colaboração, acompanhamento e relatórios, com isolamento
multi-tenant para Câmaras e demais organizações atendidas.

A raiz reúne repositórios Git independentes, a documentação compartilhada e os
artefatos do processo de desenvolvimento. Ela não é um monorepo de produto.

## Comece por aqui

1. Leia o [guia da documentação](docs/README.md).
2. Conheça os projetos e suas responsabilidades em
   [Ecossistema e arquitetura](docs/ecossistema.md).
3. Siga [Como trabalhar no workspace](docs/como-trabalhar.md) para fazer sua
   primeira alteração com segurança.
4. Para uma funcionalidade relevante, use o
   [Spec Driven Development](docs/spec-driven-development.md).

## Projetos ativos

| Projeto | Responsabilidade | Stack |
|---|---|---|
| [`municipalize-app`](municipalize-app/) | Interface pública, autenticada e administrativa | Angular |
| [`ms-main`](ms-main/) | Regras e dados operacionais de cada tenant | Java, Quarkus e SQL Server |
| [`municipalize-admin-app`](municipalize-admin-app/) | Administração global, clientes, operadores, Chat, IA e ferramentas | NestJS e MongoDB |

`municipalize-chat-api` e `municipalize-mcp` são projetos legados, mantidos
somente para consulta histórica. Não os execute, publique ou altere.

## Atalhos

- [Índice da documentação](docs/README.md)
- [Como trabalhar no workspace](docs/como-trabalhar.md)
- [Spec Driven Development](docs/spec-driven-development.md)
- [Branches e trabalho paralelo](docs/parallel-work.md)
- [Instruções para agentes](AGENTS.md)

## Para agentes e automações

As regras e skills executáveis ficam em [`.agents/`](.agents/README.md). Elas
complementam o `AGENTS.md` da raiz e os `AGENTS.md` de cada projeto; não são o
ponto de entrada para quem está conhecendo o produto ou o processo.
