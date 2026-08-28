# Documento de Requisitos do Produto (PRD)

## Visão geral

A Admin API Municipalize não precisa mais expor nem manter uma capacidade MCP.
As ferramentas municipais serão usadas internamente pelos runtimes de agente,
incluindo a futura harness baseada em Mastra, e não por clientes MCP externos.
Hoje a pasta `mcp` mistura transporte de protocolo, catálogo de tools, conteúdo
de orientação, autenticação, contexto de execução e acesso ao backend municipal.
Essa organização torna difícil identificar o dono de cada responsabilidade e
mantém dependências de protocolo em capacidades que precisam ser reutilizadas.

Esta iniciativa retira o MCP da Admin API e reorganiza as capacidades das
ferramentas por responsabilidade. O resultado é um catálogo interno de tools,
suas orientações, a identidade autorizada da execução e o acesso seguro ao
backend da Câmara, sem mudar as regras de negócio municipais nem os contratos
ativos do Chat. A harness Mastra continuará sendo uma evolução posterior e
consumirá esse núcleo sem precisar de um servidor MCP intermediário.

## Objetivos

- Remover 100% do código, das configurações, das dependências e dos testes
  exclusivos do protocolo MCP da Admin API, incluindo a pasta
  `src/modules/mcp`.
- Manter 100% das ferramentas internas habilitadas no catálogo atual
  descobertas e executáveis pelo runtime de agente, com o mesmo nome, schema,
  política de disponibilidade e exigência de confirmação.
- Preservar em 100% das execuções o isolamento por cliente/Câmara, ambiente e
  usuário autenticado; qualquer contexto ausente, inválido ou divergente deve
  continuar sendo recusado.
- Migrar 100% das orientações operacionais atualmente registradas como
  resources e prompts MCP para uma capacidade interna de orientação do agente,
  mantendo seu conteúdo e sua associação com as tools correspondentes.
- Concluir com `lint`, `typecheck`, testes aplicáveis, build e cobertura mínima
  de 80% aprovados, sem regressão nos contratos HTTP e SSE ativos do Chat.

## Histórias de usuário

- US1: Como desenvolvedor da Admin API, quero localizar definições, políticas e
  execução das tools em uma capacidade interna coesa para evoluí-las sem
  conhecer detalhes do protocolo MCP.
- US2: Como runtime de agente atual ou futuro, quero consumir um catálogo
  interno de tools e suas orientações para operar dados municipais sem depender
  de servidor, cliente ou transporte MCP.
- US3: Como usuário final autenticado de uma Câmara, quero que toda tool usada
  em meu nome continue respeitando minha identidade, permissões e Câmara para
  que dados e ações permaneçam isolados.
- US4: Como operador da plataforma, quero que o backend municipal de cada
  Câmara seja resolvido e chamado por uma fronteira explícita e segura para
  evitar URLs fornecidas pelo usuário, acessos indevidos ou falhas externas
  vazando para o agente.
- US5: Como responsável pela evolução do Mastra, quero que a futura harness
  receba ferramentas e orientação por uma API interna neutra de protocolo para
  poder integrá-las sem adaptação MCP.

## Principais funcionalidades

### Catálogo interno de ferramentas Municipalize

As tools municipais passam a ser uma capacidade interna, independente de MCP.
Cada domínio continua descrevendo suas ações, entradas, saídas e metadados de
risco, e o catálogo central passa a ser a fonte de verdade para Chat, runtime
de agente e futuras integrações de harness.

- RF1: O sistema deve disponibilizar uma API interna única para listar as tools
  habilitadas e executar uma tool pelo seu nome e argumentos validados.
- RF2: Os nomes, descrições, schemas de entrada, resultados e políticas das
  tools atualmente habilitadas devem ser preservados.
- RF3: Tools de leitura, de confirmação obrigatória e desabilitadas devem manter
  a política vigente antes de qualquer chamada ao backend municipal.
- RF4: As atuais tools de conta do usuário devem ser classificadas e organizadas
  como ferramentas de conta/perfil, sem confundir essas operações com a
  autenticação interna da execução.

### Orientação interna para uso das ferramentas

Os resources e prompts existentes deixam de ser artefatos de protocolo MCP e
passam a compor a orientação interna do agente. Esse conteúdo continua ligado
às capacidades reais disponíveis, para que um runtime possa descobrir como usar
as tools corretamente sem inventar operações ou endpoints.

- RF5: O sistema deve manter uma fonte interna consultável para as orientações
  operacionais, regras de negócio, fluxos e prompts atualmente usados pelas
  tools.
- RF6: Cada orientação deve continuar identificável e associável ao domínio ou
  à tool que descreve.
- RF7: A remoção do MCP não pode eliminar nem degradar o conteúdo de orientação
  que será necessário à futura harness de agente.

### Identidade e contexto autorizado de execução

A autenticação atual não é uma feature MCP descartável: ela valida o token
Keycloak, confirma o usuário no backend da Câmara e constrói o contexto usado
por todas as tools. Essa capacidade deve receber nome e fronteira que expressem
seu papel de identidade e autorização da execução.

- RF8: O sistema deve validar o bearer token e seus claims antes de permitir a
  execução de uma tool.
- RF9: O sistema deve confirmar o usuário autenticado e seus vínculos funcionais
  relevantes no backend da Câmara antes de disponibilizar o contexto à tool.
- RF10: O contexto de execução deve conter obrigatoriamente cliente/Câmara,
  ambiente, usuário autenticado e backend autorizado, sem aceitar URL de
  backend como fonte de verdade do consumidor.
- RF11: Tokens, cabeçalhos de autorização, credenciais e dados pessoais
  desnecessários não devem ser persistidos, expostos em resultados ou gravados
  em logs.

### Gateway do backend Municipalize

O acesso remoto ao `ms-main` será uma fronteira explícita do núcleo de tools.
Esse gateway concentra a escolha segura do backend da Câmara, headers de
identidade, timeouts, cancelamento e conversão de falhas externas, sem transferir
regras de negócio municipais para a Admin API.

- RF12: O sistema deve resolver o backend pela configuração cadastrada do
  cliente e pelo ambiente ativo, mantendo as proteções contra URLs inseguras ou
  divergentes.
- RF13: Toda chamada ao backend deve manter timeout limitado, propagação de
  cancelamento quando suportada e mapeamento seguro de falhas externas.
- RF14: As tools devem acessar o backend apenas pelo gateway interno, sem
  duplicar clientes HTTP ou criar chamadas HTTP à própria Admin API.

### Retirada do MCP e compatibilidade ativa

O protocolo MCP, seu transporte e seus adaptadores serão removidos. A retirada
não pode interromper os fluxos internos ativos do Chat ou do runtime de agente.

- RF15: O sistema não deve expor servidor, rota, transporte JSON-RPC, client,
  SDK, configuração ou nomenclatura MCP após a conclusão da iniciativa.
- RF16: O Chat e o runtime de agente devem consumir somente a API interna de
  tools, preservando os contratos HTTP e SSE já consumidos pelo frontend.
- RF17: O código Mastra existente deve deixar de depender de tipos ou adapters
  MCP para compilar e acessar o catálogo interno, sem ampliar nesta iniciativa
  o produto ou a interface do Mastra.

## Critérios de aceitação

- CA-01 (US1, RF1-RF3): Dado o catálogo interno, quando um runtime lista as
  ferramentas, então recebe exatamente as tools habilitadas no catálogo vigente,
  com os mesmos nomes, schemas e políticas observáveis antes da refatoração.
- CA-02 (US1, RF3): Dada uma tool de leitura, confirmação obrigatória ou
  desabilitada, quando a execução é solicitada, então a decisão observável de
  permitir, solicitar confirmação ou negar permanece compatível com a política
  vigente.
- CA-03 (US2, RF5-RF7): Dado o conteúdo de orientação migrado, quando um runtime
  interno consulta as orientações de um domínio, então encontra o conteúdo
  operacional correspondente sem usar URI, registro ou SDK MCP.
- CA-04 (US3, RF8-RF11): Dado token ausente, inválido, expirado, usuário não
  confirmado ou cliente divergente, quando uma tool é solicitada, então ela é
  recusada antes de operar o backend e sem expor segredos.
- CA-05 (US3, RF9-RF10): Dado um usuário autenticado de uma Câmara, quando uma
  tool é executada, então a operação usa somente o backend resolvido para aquela
  Câmara e o contexto daquele usuário.
- CA-06 (US4, RF12-RF14): Dado um cliente com backend cadastrado, quando uma
  tool chama o `ms-main`, então a chamada usa o gateway interno, aplica timeout
  e não aceita URL informada pelo consumidor como destino efetivo.
- CA-07 (US5, RF16-RF17): Dado o Chat, o runtime de agente ou o código Mastra
  existente, quando usam uma tool, então a execução ocorre pelo catálogo interno
  sem servidor, client, transporte ou tipos MCP.
- CA-08 (RF15): Dada a busca no repositório de produção, quando a iniciativa é
  concluída, então não existem a pasta `src/modules/mcp`, dependência do SDK
  MCP, configurações `MCP_*`, rota MCP ou imports MCP ativos.
- CA-09 (RF16): Dado o frontend atual, quando utiliza os fluxos de Chat HTTP e
  SSE, então seus métodos, URLs, payloads, status, headers e eventos permanecem
  compatíveis.
- CA-10 (objetivos): Dada a alteração concluída, quando são executados lint,
  typecheck, testes aplicáveis, verificação de cobertura e build, então todos
  passam com a cobertura mínima obrigatória de 80%.

## Experiência do usuário

Não haverá nova interface, tela, navegação ou interação direta de usuário nesta
iniciativa. Usuários finais continuam acessando o Chat atual e devem perceber o
mesmo comportamento autorizado ao consultar ou acionar ações municipais.

Os consumidores internos — Chat, runtime de agente e futura harness Mastra —
passam a receber um catálogo de tools e orientações de forma direta. A mudança
deve reduzir ambiguidade para desenvolvedores e operadores, sem expor detalhes
de infraestrutura, tokens ou seleção de backend a usuários finais.

## Restrições técnicas de alto nível

- O escopo pertence ao `municipalize-admin-app`, preservando o monólito modular
  NestJS; não deve criar um novo microserviço, servidor interno ou dependência
  do repositório legado `municipalize-mcp`.
- A organização deve respeitar ownership por capacidade: tools e suas políticas,
  orientação do agente, identidade autorizada da execução e gateway do backend
  devem ter responsabilidades explícitas e APIs internas mínimas.
- O gateway do backend deve continuar integrando o `ms-main` com bearer do
  usuário, resolução por cliente/ambiente, HTTPS e proteções contra destinos
  privados ou divergentes, timeout e cancelamento.
- A validação Keycloak, a autorização concreta no backend da Câmara e o
  isolamento por cliente, ambiente e usuário são requisitos não negociáveis.
- O acesso a dados externos deve usar tipos estritos, validação nas fronteiras e
  erros seguros; logs não podem conter tokens, prompts, corpos sensíveis ou
  dados pessoais desnecessários.
- A futura capacidade Mastra descrita em
  `tasks/prd-migracao-agente-mastra/` deve poder consumir o catálogo nativo, mas
  suas funcionalidades de produto, armazenamento e interface não são alteradas
  por este PRD.
- A TechSpec definirá os caminhos finais, interfaces, sequência de migração,
  compatibilidade de configuração e estratégia detalhada de testes.

## Fora do escopo

- Criar, publicar ou alterar a experiência de produto da harness Mastra ou do
  Mastra Studio.
- Alterar telas, fluxos ou contratos do `municipalize-app`.
- Criar novas tools municipais, alterar regras de negócio, permissões ou
  semântica funcional no `ms-main`.
- Reativar, executar, publicar ou tornar dependentes os projetos legados
  `municipalize-mcp` e `municipalize-chat-api`.
- Disponibilizar compatibilidade com clientes MCP externos, transporte JSON-RPC
  ou endpoint MCP após a retirada aprovada.
- Alterar coleções Mongo, dados de conversas ou políticas de retenção do Mastra,
  salvo adaptações estritamente necessárias para manter a compilação e o consumo
  do catálogo interno.
- Definir detalhes de implementação como nomes finais de arquivos, classes,
  tokens, adapters, ordem de commits ou estratégia de migração; esses itens
  pertencem à TechSpec.
