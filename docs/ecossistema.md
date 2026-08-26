# Ecossistema e arquitetura

O Municipalize é uma plataforma para a gestão pública municipal. Ela atende
fluxos como emendas, projetos, instituições, orçamento, usuários, colaboração,
acompanhamento e relatórios. Os dados e as permissões precisam respeitar o
isolamento entre tenants — por exemplo, uma Câmara não pode acessar dados de
outra organização.

## Como o workspace é composto

Cada pasta de projeto é um repositório Git independente. Isso significa que
branches, commits, testes e dependências pertencem ao projeto afetado, não à
raiz do workspace.

| Projeto | O que é | Alterações que pertencem a ele |
|---|---|---|
| `municipalize-app` | Aplicação web usada por clientes e administradores | Telas, navegação, estado de interface e chamadas HTTP do navegador |
| `ms-main` | Backend principal | Regras de negócio e dados operacionais de cada tenant, como usuários, instituições, emendas, projetos e orçamento |
| `municipalize-admin-app` | API administrativa da plataforma | Clientes, operadores, configuração global, Chat, IA, LiteLLM e ferramentas de agentes |

## Como decidir onde mudar

Comece pela responsabilidade, não pela tecnologia mais conveniente.

```text
Uma tela, navegação ou estado no navegador? → municipalize-app
Regra ou dado operacional de um tenant?     → ms-main
Administração global, Chat ou IA?           → municipalize-admin-app
```

Uma funcionalidade pode afetar mais de um projeto. Nesse caso, mantenha cada
responsabilidade onde ela já pertence, documente os contratos entre eles e
valide todos os consumidores alterados. Não introduza dependências entre os
projetos sem uma decisão arquitetural explícita.

## Projetos legados

`municipalize-chat-api` e `municipalize-mcp` são referências históricas. As
capacidades que eles ofereciam foram incorporadas a `municipalize-admin-app`.
Use-os apenas quando precisar entender um contrato ou uma regra antiga que não
esteja clara nos projetos ativos; confirme o comportamento final no código e
nos testes atuais. Não execute, publique ou implemente mudanças nesses
repositórios.

## Fontes de verdade

Para uma alteração concreta, siga esta ordem prática:

1. pedido atual e contexto da tarefa;
2. `AGENTS.md` do projeto afetado;
3. código, contratos, configuração e testes atuais do projeto;
4. `AGENTS.md` da raiz e rules globais, quando aplicáveis;
5. documentação deste diretório, como orientação de navegação e processo.

Leia [Como trabalhar no workspace](como-trabalhar.md) para o fluxo diário ou
volte ao [índice da documentação](README.md).
