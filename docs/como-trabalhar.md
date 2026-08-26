# Como trabalhar no workspace

Este guia descreve o caminho seguro para sair de uma demanda e chegar a uma
alteração validada. Ele serve tanto para uma correção pequena quanto para o
início de uma funcionalidade maior.

## Antes de editar

1. Entenda o pedido e escolha o projeto dono da mudança em
   [Ecossistema e arquitetura](ecossistema.md).
2. Leia o `AGENTS.md` da raiz e o `AGENTS.md` do projeto escolhido.
3. Consulte o código, os testes e a configuração existentes antes de assumir
   contratos, portas, comandos ou dependências.
4. Confira o estado Git no repositório afetado. Alterações não relacionadas
   pertencem a quem as fez: preserve-as.

O `AGENTS.md` local é a referência para instalar dependências, iniciar o
serviço, testar, fazer build e seguir convenções do projeto.

## Escolha o tamanho do processo

### Correção pequena

Uma correção pontual, com escopo conhecido e baixo risco, pode seguir um ciclo
direto: investigar, alterar, criar ou ajustar o teste de regressão e executar
as verificações do projeto. Ainda é preciso preservar segurança, autorização,
isolamento por tenant e contratos afetados.

### Funcionalidade ou mudança relevante

Quando a mudança tem comportamento novo, vários critérios de aceitação, risco
arquitetural ou impacto em mais de um projeto, use o
[Spec Driven Development](spec-driven-development.md). Ele registra as decisões
antes da implementação e mantém a entrega rastreável até o QA e o review.

## Ambiente local

Inicie somente o que a tarefa precisa e use os scripts do próprio projeto. Em
linhas gerais, o ambiente integrado possui:

| Componente | Papel no ambiente |
|---|---|
| Keycloak | Autenticação e OIDC |
| SQL Server | Dados do `ms-main` |
| MongoDB | Dados do `municipalize-admin-app` |
| LiteLLM | Gateway de modelos para os fluxos de Chat e IA |
| `ms-main` | API principal |
| `municipalize-admin-app` | API administrativa |
| `municipalize-app` | Aplicação web |

Para um fluxo integrado, a ordem usual é infraestrutura, LiteLLM quando
necessário, `ms-main`, API administrativa e aplicação web. Confirme os valores
de portas, health checks e comandos no projeto antes de automatizá-los: eles
podem variar conforme a configuração local.

Não use dados municipais reais em testes ou evidências. Não exponha tokens,
cookies, credenciais, strings de conexão ou cabeçalhos de autorização em
documentos, screenshots e logs.

## Validar antes de entregar

Execute as verificações previstas no `AGENTS.md` do projeto: testes, lint,
typecheck, build, cobertura e validações de contrato que se aplicarem. Uma
validação em um repositório não substitui as validações dos outros projetos
afetados.

Uma mudança está pronta quando o comportamento foi implementado, os testes
aplicáveis passam, os consumidores foram verificados, a documentação
operacional foi atualizada e qualquer limitação remanescente foi registrada de
forma explícita.

## Branches e trabalho paralelo

Para preparar uma tarefa em uma branch coordenada ou em worktrees isoladas,
consulte [Branches e trabalho paralelo](parallel-work.md). O guia explica quando
usar cada modo, como consultar o status e como encerrar uma sessão com
segurança.

Volte ao [índice da documentação](README.md) para os demais guias.
