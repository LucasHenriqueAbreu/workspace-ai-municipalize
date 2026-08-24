# Regras do workspace

## Repositórios independentes

Cada pasta de projeto é um repositório Git independente. Execute comandos de
instalação, Git, testes, build e desenvolvimento dentro do subprojeto afetado.
Não presuma que um comando executado na raiz valide todo o ecossistema.

A raiz é responsável apenas pela documentação, pelas regras, pelas skills e
pelas futuras automações compartilhadas. Não transforme os projetos internos em
submódulos nem versione seus arquivos pelo repositório da raiz.

## Projetos ativos

- `municipalize-app`: aplicação web Angular.
- `ms-main`: API principal Java e Quarkus com SQL Server e Keycloak.
- `municipalize-admin-app`: API administrativa NestJS com MongoDB, Chat e
  integração com LiteLLM.

Antes de alterar um projeto, leia seu `AGENTS.md` e todas as rules locais
aplicáveis. Os comandos e requisitos declarados localmente são a fonte de
verdade para esse projeto.

## Projetos legados

`municipalize-chat-api` e `municipalize-mcp` existem somente para consulta de
regras, contratos e decisões antigas. Não execute, publique, corrija nem
adicione funcionalidades nesses projetos. Confirme qualquer comportamento nos
projetos ativos antes de reproduzi-lo.

## Responsabilidade das mudanças

- Interface, navegação e estado de tela pertencem a `municipalize-app`.
- Regras e dados operacionais de tenants pertencem normalmente a `ms-main`.
- Administração global, Chat, agentes, ferramentas e LiteLLM pertencem a
  `municipalize-admin-app`.

Não mova responsabilidades entre projetos sem uma decisão arquitetural
explícita. Quando uma alteração atravessar repositórios, identifique todos os
consumidores, preserve os contratos e valide cada projeto afetado.

## Alterações existentes

Considere mudanças não relacionadas como trabalho do usuário. Não as reverta,
formate ou inclua incidentalmente na tarefa. Se uma alteração existente impedir
o trabalho seguro, descreva o conflito e solicite uma decisão.
