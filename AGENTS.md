# Ecossistema Municipalize — instruções para agentes

## Propósito do workspace

Este workspace reúne os projetos que formam a plataforma Municipalize. O
produto apoia a gestão pública municipal em fluxos como emendas, projetos,
instituições, orçamento, usuários, colaboração, acompanhamento e relatórios,
com uma experiência multi-tenant para Câmaras e demais organizações atendidas.

Os projetos ativos se dividem entre a aplicação web usada pelos clientes, o
backend que concentra as regras de negócio municipais e a API administrativa,
que também hospeda as capacidades atuais de Chat e IA.

## Mapa dos subprojetos

### Projetos ativos

- [`municipalize-app`](municipalize-app/): aplicação web Angular. Contém as
  experiências públicas, autenticadas e administrativas, consome as APIs do
  ecossistema e apresenta os fluxos de negócio aos usuários. Antes de trabalhar
  nesse projeto, leia seu
  [`AGENTS.md`](municipalize-app/AGENTS.md).
- [`ms-main`](ms-main/): backend principal em Java e Quarkus, com persistência
  em SQL Server. É responsável pelas regras e pelos dados operacionais de cada
  tenant, incluindo usuários, instituições, emendas, projetos, orçamento,
  colaboração e demais módulos municipais. Antes de trabalhar nesse projeto,
  leia seu [`AGENTS.md`](ms-main/AGENTS.md).
- [`municipalize-admin-app`](municipalize-admin-app/): API administrativa em
  NestJS e MongoDB. Centraliza clientes, administradores, configuração e
  operação da plataforma. Também contém a implementação vigente do Chat, a
  integração com LiteLLM e a execução das ferramentas Municipalize em processo.
  Antes de trabalhar nesse projeto, leia seu
  [`AGENTS.md`](municipalize-admin-app/AGENTS.md).

### Projetos legados — somente consulta

- `municipalize-chat-api` é legado. Sua função foi
  absorvida por `municipalize-admin-app`, especialmente por `src/modules/chat`
  e pelos módulos relacionados ao runtime de agentes e às ferramentas.
- `municipalize-mcp` é legado. A execução das ferramentas
  foi incorporada à Admin API e não depende mais de um servidor MCP separado.

Esses dois repositórios não fazem parte da arquitetura em uso e não devem ser
executados, publicados, receber novas funcionalidades nem voltar a ser
dependências dos projetos ativos. Eles existem apenas para consultar regras de
negócio, contratos e decisões antigas durante manutenção ou migração. Código
legado deve ser tratado como referência histórica, não como fonte de verdade:
confirme qualquer comportamento nos projetos ativos antes de reproduzi-lo.

## Como escolher onde alterar

- Interface, navegação, estado de tela e integração HTTP do navegador pertencem
  a `municipalize-app`.
- Regras e dados operacionais de um tenant pertencem, em geral, a `ms-main`.
- Administração global de clientes e operadores, Chat, modelos de IA, LiteLLM e
  ferramentas do agente pertencem a `municipalize-admin-app`.
- Não implemente correções em `municipalize-chat-api` ou `municipalize-mcp`.
  Localize o equivalente ativo e faça a alteração nele.

Quando uma mudança atravessar projetos, preserve os contratos entre eles e
valide todos os consumidores afetados. Não mova responsabilidades entre
subprojetos nem reintroduza serviços separados sem uma decisão arquitetural
explícita.

## Hierarquia das instruções

Este arquivo fornece o contexto comum do workspace. Dentro de um subprojeto, o
`AGENTS.md` local e as regras ou skills às quais ele aponta complementam estas
orientações e prevalecem quando forem mais específicas. Sempre leia o arquivo
local antes de alterar código no respectivo projeto.

As regras e skills pessoais compartilhadas estão catalogadas em
[`.agents/README.md`](.agents/README.md). A documentação para pessoas começa
no [`README.md`](README.md) e no [índice em `docs/`](docs/README.md); `.agents`
é a configuração operacional dos agentes. Aplique as
[`rules globais`](.agents/rules/) ao trabalho em qualquer projeto, respeitando a
precedência documentada nesse catálogo. O fluxo padrão é criar PRD, criar
TechSpec, criar e executar tasks, executar QA e, por último, executar o review
final.

Cada pasta de primeiro nível é um repositório independente. Execute comandos,
testes e inspeções Git a partir do subprojeto afetado, preserve alterações não
relacionadas e não pressuponha que um comando executado na raiz valide todo o
ecossistema.

## Princípios para mudanças

- Consulte o projeto legado somente quando a implementação ativa não explicar
  uma regra antiga ou um contrato que precise ser preservado.
- Trate os contratos dos projetos ativos, seus testes e seu comportamento em
  produção como fontes de verdade.
- Preserve isolamento por tenant, autenticação, autorização e compatibilidade
  de dados em toda mudança entre frontend e APIs.
- Faça alterações pequenas e focadas no projeto que é dono da responsabilidade.
- Use os scripts declarados pelo próprio subprojeto para lint, testes, build e
  demais verificações aplicáveis antes de concluir a tarefa.
