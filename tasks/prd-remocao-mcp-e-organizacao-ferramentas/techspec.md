# Especificação técnica

## Resumo

Esta especificação implementa o PRD de remoção de MCP por uma refatoração interna, limitada ao monólito NestJS em `municipalize-admin-app`. O catálogo de tools, a identidade autorizada, o gateway do backend municipal e a orientação do agente passam a ser capacidades com módulos Nest próprios, APIs públicas mínimas e dependências acíclicas, sem servidor, cliente, transporte, tipos, configuração ou dependência MCP.

A migração preservará a caracterização vigente: 91 definições, 89 tools habilitadas, 58 de leitura, 31 que exigem confirmação e 2 desabilitadas. Chat, `AgentRuntime` e Mastra consumirão a mesma API interna e manterão seus contratos HTTP/SSE. Não haverá endpoint novo, mudança em MongoDB ou alteração no `ms-main`; o destino municipal continuará sendo derivado exclusivamente do cadastro do cliente e do ambiente ativo.

## Arquitetura do sistema

### Visão dos componentes

| Componente | Alteração | Responsabilidade e relações |
| --- | --- | --- |
| `ToolsModule` | refatorado | Raiz da capacidade de catálogo e execução de tools. Exporta somente `ToolCatalogService`; importa identidade e gateway pelas APIs públicas. |
| Catálogo de tools | novo em `tools/application/` | Reúne definições por domínio, schemas Zod, metadados, handler e política. Substitui os registradores que recebiam um servidor MCP. |
| `ToolCatalogService` | refatorado | Lista as tools habilitadas e executa uma definição pelo nome; aplica política antes de resolver identidade e de chamar o handler. |
| `ToolPolicyService` | preservado/refatorado | Continua sendo a única dona da classificação leitura/confirmação/desabilitada e do risco. |
| `ExecutionIdentityModule` | novo | Capacidade de identidade autorizada. Exporta apenas `ExecutionIdentityService`, que valida bearer Keycloak, confirma usuário/vínculos e produz contexto imutável. Não interpreta JSON-RPC, `_meta`, URI nem URL do consumidor. |
| `BackendGatewayModule` | novo | Capacidade de integração municipal. Exporta somente o resolver/gateway que escolhe e chama o backend cadastrado, com timeout, abort e tradução segura de falhas. |
| `AgentGuidanceModule` | novo | Capacidade de orientação operacional. Exporta `ToolGuidanceService`, que cataloga os 36 documentos Markdown e 18 prompts por identificador, domínio e tools relacionadas. |
| Adaptadores por domínio | movidos de `mcp/tools/**` | Passam a produzir `ToolDefinition` e handlers nativos; preservam nomes, schemas, resultados e semântica municipal. As tools de conta/perfil permanecem no domínio próprio, separadas da identidade de execução. |
| `AgentRuntimeModule` | adaptado | Importa `ToolsModule` e `AgentGuidanceModule`, obtém as 89 definições habilitadas e invoca o catálogo diretamente no loop LiteLLM, mantendo confirmação, oito rodadas e eventos atuais. |
| `ChatModule` | adaptado | Renomeia serviços/tokens internos que ainda usam MCP e encaminha chamadas ao catálogo direto. Remove o cliente HTTP JSON-RPC e a URL de backend da entrada de tool, pois ela não é fonte autorizada. |
| `MastraStudioModule` | adaptado | Converte definições nativas em tools Mastra, sem capturar ou simular `McpServer`; usa o catálogo para executar após aprovação nativa do Mastra. |
| árvore `src/modules/mcp/` e SDK | removidos | São removidos controller, JSON-RPC, rate limiter, factory, resources/prompts MCP, tipos/adapters, testes exclusivos e `@modelcontextprotocol/sdk`. |

Fluxo alvo:

```text
Chat / AgentRuntime / Mastra
  -> ToolCatalogService.listEnabled() ou execute()
  -> ToolPolicyService (nega/solicita confirmação antes de I/O)
  -> ExecutionIdentityService.resolve(bearer, customerId)
  -> CustomerBackendResolver + SafeBackendUrlPolicy
  -> confirmação do usuário/vínculos no ms-main
  -> handler da tool por domínio
  -> BackendGateway (timeout, AbortSignal, headers e erros seguros)
  -> resultado interno compatível -> consumidor atual

AgentRuntime / Mastra -> ToolGuidanceService -> orientação Markdown nativa
```

Estrutura proposta, organizada por capacidade e com cada `.module.ts` como composition root:

```text
src/modules/
  backend-gateway/
    backend-gateway.module.ts
    application/
    infrastructure/
  execution-identity/
    execution-identity.module.ts
    application/
    domain/
    infrastructure/
  tools/
    tools.module.ts
    application/
    domain/
    infrastructure/
  agent-guidance/
    agent-guidance.module.ts
    application/
    infrastructure/
    assets/
```

O grafo de módulos permanece acíclico: `BackendGatewayModule` importa `CustomersModule`; `ExecutionIdentityModule` importa o gateway; `ToolsModule` importa identidade e gateway; `AgentRuntimeModule` importa tools e guidance; `ChatModule` importa somente tools; `MastraStudioModule` importa tools e guidance se precisar consultar orientação. Cada consumidor usa somente o provider explicitamente exportado pelo módulo proprietário. Nenhum módulo acessará persistência de outro, fará HTTP à própria Admin API ou criará escopo de request. O contexto de usuário será passado explicitamente em cada execução.

## Design de implementação

### Principais interfaces

As interfaces abaixo são as APIs públicas mínimas entre módulos; os demais providers e adapters permanecem privados ao módulo proprietário.

```text
ToolCatalog
  listEnabled() -> ReadonlyArray<ToolDefinition>
  execute(ToolExecutionInput) -> Promise<ToolResult>

ToolPolicy
  resolve(name) -> ToolPolicy
  ensureExecutionAllowed(name, confirmed) -> void
```

```text
ExecutionIdentity
  resolve(ExecutionIdentityInput) -> Promise<AuthenticatedToolExecution>

BackendGateway
  request(BackendRequest, AuthenticatedToolExecution) -> Promise<JsonValue>
```

```text
ToolGuidance
  list(GuidanceQuery) -> ReadonlyArray<ToolGuidanceSummary>
  get(id) -> ToolGuidance
```

`ToolCatalogService.execute` seguirá esta ordem invariável: localizar definição, decidir a política, resolver identidade autorizada, validar os argumentos pelo schema da definição, invocar o handler com contexto/sinal explícitos e normalizar o resultado. Tool desconhecida, desabilitada ou não confirmada falha antes de autenticação ou chamada municipal. O handler não recebe `Request`, `Response`, `AuthInfo`, contexto AsyncLocalStorage, URL do consumidor ou tipo de SDK.

Os registradores de cada domínio serão convertidos em funções que retornam coleções de definições nativas. A abstração é justificada porque há 91 variações reais sob um único catálogo; não serão criadas portas artificiais para helpers locais. Dentro de `ToolsModule`, o catálogo/executor fica em `application`, as políticas e contratos em `domain`, e os adaptadores de definição/resultado/paginação em `infrastructure`. O gateway e a identidade seguem a mesma direção de dependência dentro de seus módulos, isolando HTTP, DNS e JWKS em `infrastructure`.

### Modelos de dados

#### `ToolDefinition` — contrato nativo de uma tool cadastrada

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | sim | Nome municipal existente, sem renomeação. |
| `description` | `string` | não | Descrição enviada aos runtimes. |
| `inputSchema` | `ZodRawShape` | sim | Schema Zod que valida os argumentos na fronteira interna. |
| `metadata` | `ToolMetadata` | sim | Domínio, operação, risco e semântica de efeito. |
| `policy` | `ToolPolicy` | sim | Política explícita calculada para a tool. |
| `execute` | `ToolHandler` | sim | Handler que recebe argumentos validados, contexto autorizado e sinal. |

```text
{
  "name": "search_projects",
  "description": "Pesquisa projetos municipais por filtros autorizados.",
  "policy": { "access": "read", "risk": "low" },
  "metadata": {
    "domain": "projects",
    "operation": "search",
    "readOnly": true,
    "requiresConfirmation": false
  }
}
```

#### `ToolExecutionInput` — solicitação interna de execução

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `name` | `string` | sim | Nome da tool solicitada. |
| `arguments` | `Record<string, unknown>` | sim | Entrada não confiável a ser validada pelo schema da tool. |
| `authorizationHeader` | `string` | sim | Bearer recebido no fluxo autenticado; nunca registrado ou retornado. |
| `customerId` | `string` | sim | Identificador do cliente requerido para resolver o destino autorizado. |
| `confirmed` | `boolean` | não | Sinal controlado pelo runtime após confirmação explícita. |
| `signal` | `AbortSignal` | não | Cancelamento propagado pelo consumidor. |

```text
{
  "name": "projects_list_all",
  "arguments": { "page": 0, "size": 20 },
  "customerId": "camara-demo",
  "confirmed": false
}
```

> **Dados secretos:** `authorizationHeader` só existe em memória durante a execução; exemplos, logs, resultados, SSE e telemetria o omitem deliberadamente.

#### `AuthenticatedToolExecution` — contexto autorizado para handlers e gateway

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `customerId` | `string` | sim | Cliente confirmado e usado para isolamento. |
| `environment` | `development \| homologation \| production` | sim | Ambiente que selecionou a configuração do cliente. |
| `backendBaseUrl` | `string` | sim | URL normalizada, cadastrada e aprovada pela política SSRF. |
| `accessToken` | `string` | sim | Token validado, para encaminhamento somente ao backend aprovado. |
| `tokenClaims` | `AuthenticatedTokenClaims` | sim | Claims Keycloak validados. |
| `authenticatedUser` | `AuthenticatedMunicipalUser` | sim | Usuário e vínculos funcionais confirmados pelo `ms-main`. |
| `frontendUrl` | `string` | não | Somente se já houver origem confiável necessária ao contrato municipal; não é aceita do consumidor de tool. |

```text
{
  "customerId": "camara-demo",
  "environment": "homologation",
  "backendBaseUrl": "https://hml.api.camara.example",
  "tokenClaims": { "subject": "keycloak-sub", "audience": ["municipalize-backend"] },
  "authenticatedUser": { "backendUserId": 42, "roles": ["VEREADOR"] }
}
```

#### `ToolResult` — resultado compatível de uma tool

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `content` | `ReadonlyArray<ToolResultContent>` | sim | Conteúdo textual/estruturado que os consumidores atuais exibem ou repassam ao modelo. |
| `structuredContent` | `JsonValue` | não | Dados municipais serializáveis para o runtime. |
| `isError` | `boolean` | não | Indica falha segura de execução. |
| `mutation` | `ToolMutation` | não | Metadado de alteração preservado para o evento SSE `mutation`. |

```text
{
  "content": [{ "type": "text", "text": "2 projetos encontrados." }],
  "structuredContent": { "data": [{ "id": 101, "name": "Praça central" }] }
}
```

> **Degradação:** falha de validação, identidade, política, timeout ou backend gera resultado/erro interno seguro, sem token, URL privada, corpo bruto ou dados pessoais não necessários. No Chat, o filtro existente continua mapeando a falha ao envelope público `{ "error": { "name", "message" } }` e, depois de iniciado o stream, ao evento SSE `error`.

#### `Guidance` — orientação operacional consultável sem protocolo

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `string` | sim | Identificador estável da orientação atual, sem URI MCP. |
| `kind` | `document \| prompt` | sim | Origem funcional do conteúdo. |
| `domain` | `string` | sim | Domínio municipal, plataforma ou conta/perfil. |
| `toolNames` | `ReadonlyArray<string>` | sim | Tools às quais a orientação se aplica; pode ser vazia para regra transversal. |
| `title` | `string` | sim | Título humano da orientação. |
| `description` | `string` | sim | Resumo para descoberta. |
| `content` | `string` | sim | Markdown preservado e carregado do asset empacotado. |

```text
{
  "id": "municipalize_projects_fluxo_cadastro",
  "kind": "document",
  "domain": "projects",
  "toolNames": ["projects_create", "projects_list_all"],
  "title": "Fluxo cadastro de projeto",
  "content": "# Cadastro de projeto\n..."
}
```

#### `ToolExecutionError` — categoria interna de falha

| Código | HTTP no Chat | Significado |
| --- | --- | --- |
| `tool_confirmation_required` | contrato atual de confirmação | Mutação pedida sem confirmação controlada pelo runtime. |
| `tool_disabled` / `tool_unknown` | erro seguro atual | Tool indisponível ou sem política explícita. |
| `execution_authentication_failed` | 401 | Bearer ausente, inválido, expirado ou usuário não confirmado. |
| `execution_access_denied` | 403 | Cliente, ambiente, vínculo ou destino não autorizado. |
| `municipal_backend_unavailable` | 502 | Timeout, cancelamento remoto, falha de rede ou resposta inválida. |

```text
{
  "error": {
    "name": "execution_access_denied",
    "message": "A execução da ferramenta não foi autorizada."
  }
}
```

### Endpoints da API (se aplicável)

Não haverá endpoint novo nem alteração de endpoint público nesta iniciativa. A API interna descrita acima é composta por providers Nest e não é exposta por HTTP. Permanecem inalterados os métodos, URLs, payloads, status, headers e eventos SSE do Chat já consumidos pelo frontend; a rota JSON-RPC MCP e qualquer transporte associado deixam de existir no código e no artefato.

## Pontos de integração

- **Keycloak/JWKS:** a identidade de execução conserva algoritmo RS256, issuer, audience, expiração, `notBefore`, timeout de JWKS e mapeamento de claims. As variáveis serão renomeadas de `MCP_KEYCLOAK_*` para nomes neutros de identidade, em uma publicação coordenada de configuração; não haverá alias `MCP_*` no estado final.
- **`CustomersModule`:** o gateway consulta sua API pública para escolher a URL de backend por cliente e ambiente. URL recebida pelo consumidor não participa da seleção; qualquer vestígio de comparação de cabeçalho legado é removido junto com a entrada insegura.
- **`ms-main`:** o gateway aplica HTTPS e bloqueio de host/rede privada, revalida DNS, usa `redirect: "error"`, encaminha bearer somente ao destino aprovado, limita backend a 15 s e a tool a 60 s, e combina ambos com o `AbortSignal` recebido. Não haverá retry automático: uma escrita após timeout possui resultado desconhecido e deve ser reconciliada pela semântica municipal existente, não repetida cegamente.
- **LiteLLM/AgentRuntime e Mastra:** recebem definições e resultados internos nativos. Mastra traduz schema para `createTool` e usa `requireApproval`; o executor mantém a política como defesa em profundidade e só recebe `confirmed: true` do caminho de aprovação nativo, nunca do prompt/modelo.
- **Assets e entrega:** documentos e prompts serão movidos para o novo caminho de guidance e incluídos no `nest-cli.json`; CI, compose E2E, secrets/deploy e smoke test verificarão as novas variáveis e a presença dos assets em `dist`.

## Abordagem de testes

Todos os testes usam Vitest, fixtures determinísticas e módulos Nest mínimos quando o wiring for relevante. A cobertura mínima é 80% para statements, branches, functions e lines; a configuração de cobertura deverá existir e ser executada para tornar a meta verificável. Testes não usam rede pública, segredo real ou backend municipal compartilhado.

Os testes de integração e E2E desta iniciativa cobrem exclusivamente a execução de tools. Não iniciam navegador, frontend, fluxo HTTP/SSE do Chat, LiteLLM nem Mastra. Os contratos públicos do Chat continuam protegidos pela suíte própria desse módulo, sem duplicar essa cobertura nesta refatoração.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | caracteriza o catálogo nativo completo | CA-01, CA-08 | 91 definições e 89 habilitadas preservam nome, descrição, schema, annotations e política; nenhum tipo MCP é necessário. |
| TU-02 | aplica política antes de qualquer I/O | CA-02, CA-04 | tool desabilitada, desconhecida ou sem confirmação é recusada sem resolver identidade nem chamar backend. |
| TU-03 | executa tool de leitura com argumentos validados | CA-01, CA-02 | handler recebe somente argumentos conformes, contexto autorizado e sinal; resultado estruturado preserva forma observável. |
| TU-04 | mantém classificação de conta/perfil sem confundir identidade | CA-01, CA-02 | tools de usuário permanecem catalogadas e as operações de autenticação interna não aparecem como tools municipais. |
| TU-05 | rejeita bearer e contexto inválidos | CA-04 | bearer ausente/expirado, claims incompatíveis, usuário não confirmado e vínculo inválido falham sem segredos. |
| TU-06 | seleciona somente backend cadastrado e seguro | CA-05, CA-06 | cliente/ambiente divergente, HTTP não permitido, credencial na URL, DNS privado e URL do consumidor são recusados. |
| TU-07 | compõe timeout e cancelamento | CA-06 | sinal do consumidor cancela o fetch; timeout de tool/backend é limitado e classificado sem retry. |
| TU-08 | preserva orientação interna | CA-03 | catálogo encontra os 36 documentos e 18 prompts por id, domínio e tool, com conteúdo e associação preservados. |
| TU-09 | carrega assets de guidance empacotados | CA-03, CA-10 | cada um dos 36 documentos e 18 prompts registrados é lido por id, domínio e tool, sem URI ou tipo de protocolo. |
| TU-10 | verifica a ausência estática de MCP | CA-08 | a verificação de produção não encontra SDK, import, pasta, rota, JSON-RPC, configuração ou nomenclatura MCP. |

`Guidance` não exige E2E: é conteúdo estático versionado. Sua paridade será provada por teste unitário do registry (contagem, ids, associação e conteúdo) e pelo teste de build que confirma os assets em `dist`; não há ganho em envolver Keycloak ou `ms-main` nesse caso.

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | executa tool de leitura no grafo real de módulos | CA-01, CA-04, CA-05 | `ToolsModule`, identidade e gateway são compostos por `NestFactory`; backend controlado confirma identidade e recebe somente a chamada autorizada. |
| TI-02 | bloqueia mutação antes de chamar o backend | CA-02, CA-04 | tool de escrita sem `confirmed` falha sem autenticação, gateway ou efeito externo; com confirmação controlada, é executada uma vez. |
| TI-03 | propaga cancelamento e traduz falha da tool | CA-06 | cancelamento, timeout e resposta inválida do backend controlado liberam recursos e não vazam corpo, URL ou bearer. |
| TI-04 | rejeita identidade ou cliente divergente durante execução | CA-04, CA-05 | JWT inválido, usuário não confirmado e cliente inexistente/divergente impedem a execução antes do handler. |

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | executa tool de leitura autenticada no ambiente QA | CA-01, CA-04, CA-05, CA-06 | runner chama `ToolCatalogService` diretamente contra Keycloak, Mongo administrativo e `ms-main` reais; a tool retorna dados da Câmara seeded. |
| E2E-02 | executa mutação confirmada no ambiente QA | CA-02, CA-05, CA-06 | a tentativa sem confirmação não produz efeito; após confirmação, uma tool de escrita existente altera uma entidade elegível seeded e o estado é verificado no `ms-main`. |
| E2E-03 | recusa contexto de tenant inválido no ambiente QA | CA-04, CA-05 | bearer real com cliente inexistente ou divergente é negado antes de operar o backend municipal. |
| E2E-04 | valida artefato sem MCP no ambiente QA | CA-08, CA-10 | runner inicia com variáveis neutras, carrega tools/guidance do artefato e não encontra rota, SDK ou configuração MCP. |

O runner E2E será um comando Node/Vitest do `municipalize-admin-app`, executado como serviço one-shot da composição `e2e/docker-compose.ms-main.qa.yaml`. Ele cria um application context Nest e obtém `ToolCatalogService` por DI; não cria endpoint de teste e não abre navegador. O script central `docker:ms-main:up` continuará criando idempotentemente cliente, usuário no Keycloak, vínculo em `usuario`/`usuario_papeis` e base SQL. O runner obtém bearer temporário pelo fluxo de autenticação já usado no E2E, mantém-no apenas em memória e nunca o grava ou exibe. A fixture desta iniciativa acrescentará somente as entidades municipais necessárias à tool de leitura e à mutação escolhida, com limpeza determinística.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Caracterização e configuração neutra:** registrar contagens, schemas, políticas, resultados e guidance atuais; criar loaders/tokens nos módulos proprietários e migrar variáveis, CI, compose e asset copy. Isso protege paridade antes de excluir o SDK.
2. **Gateway municipal:** criar `BackendGatewayModule`, mover a resolução segura do cliente, DNS, HTTP, timeout e tipos externos para sua estrutura `application`/`infrastructure`, e expor somente seu gateway.
3. **Identidade autorizada:** criar `ExecutionIdentityModule`, importar o gateway pela API pública e mover validação Keycloak, confirmação de usuário/vínculos, contexto e auditoria para suas camadas. Remover parser JSON-RPC, `x-backend-base-url`, contexto transportado e nomes MCP.
4. **Catálogo e execução:** adaptar `ToolsModule` para importar os dois módulos anteriores; extrair tipos nativos, catálogo e executor direto em suas camadas, converter helpers/definições por domínio e preservar resultado e política.
5. **Orientação interna:** criar `AgentGuidanceModule`, migrar documentos/prompts para seus assets e expor consulta por id/domínio/tool; conectar somente os consumidores que precisam de orientação, sem alterar contrato do Chat.
6. **Consumidores, E2E e retirada:** migrar `AgentRuntime`, Chat e Mastra para as APIs públicas nativas; criar o runner E2E direto de tools e sua fixture autenticada no compose QA; excluir árvore MCP, testes/transportes exclusivos, dependência e referências operacionais; executar busca de ausência, suíte, cobertura, build e smoke de homologação.

### Dependências técnicas

- Keycloak/JWKS configurado para os três ambientes com os novos nomes neutros.
- Cadastro de cliente no Mongo administrativo, Keycloak e backend `ms-main` isolado para a validação E2E de identidade/gateway; o bootstrap central já cria o usuário autenticável e seu vínculo municipal.
- LiteLLM, Chat, Mastra, frontend e browser não são dependências do runner E2E de tools. MongoDB é necessário somente para o cadastro administrativo real; policies, schemas e guidance continuam executáveis isoladamente.
- Atualização coordenada de CI/deploy/E2E antes de qualquer ambiente perder `MCP_KEYCLOAK_*`; rollback é por artefato anterior completo, nunca por reativação parcial de transporte MCP em uma versão nova.

## Monitoramento e observabilidade

Os logs atuais de autenticação e invocação serão renomeados para eventos de execução de tools e centralizados no logger Nest/adaptador existente. Campos permitidos: nome da tool, categoria de resultado, cliente mascarado quando necessário, ambiente, duração e categorias de erro. Não serão registrados bearer, headers, URL privada, argumentos completos, prompts, resposta bruta ou dados pessoais desnecessários.

Durante rollout, observar: inicialização com configuração validada, presença dos assets de guidance, falhas de identidade, bloqueios de política, recusas SSRF, timeout/cancelamento do backend, duração de tool e erros dos fluxos Chat/SSE. Healthcheck não chamará tools nem `ms-main`; smoke representativo é a evidência de integração. Sinais de abortar promoção: falha de startup por configuração, regressão de contrato Chat/SSE, rota MCP acessível, ausência de guidance no artefato ou erro de autorização/isolamento acima do baseline.

## Considerações técnicas

### Principais decisões

- **Catálogo nativo direto no módulo proprietário:** elimina servidor/cliente em memória e o cast de `McpServer`, reduzindo acoplamento e mantendo uma única definição para AgentRuntime, Chat e Mastra.
- **Quatro capacidades, quatro módulos Nest:** catálogo/política, identidade autorizada, gateway municipal e orientação possuem razões de mudança, fronteiras e consumidores próprios. Cada módulo tem composition root, mantém providers privados e exporta apenas a API usada pelo próximo módulo; não será criado `SharedModule`, `forwardRef()` ou microserviço.
- **Contexto explícito em vez de metadado de transporte:** evita que URL ou identidade controlada pelo consumidor entre na cadeia de autorização. `AsyncLocalStorage` exclusivo do transporte é removido.
- **Paridade por caracterização:** contagens, schemas, metadados, políticas e conteúdo de orientação são tratados como contrato interno antes da migração, prevenindo remoção acidental de capacidade.
- **Mudança atômica de variáveis:** aliases `MCP_*` foram descartados, pois violariam CA-08. O risco de rollout é mitigado promovendo código, secrets, CI e compose na mesma janela e possibilitando rollback por artefato anterior.
- **Sem retry automático:** leituras e mutações municipais preservam efeitos existentes; timeout/cancelamento não autoriza repetição de escrita cujo resultado seja desconhecido.

### Riscos conhecidos

| Risco | Mitigação |
| --- | --- |
| Uma tool perde schema, metadado ou política durante a conversão | Caracterização de 91/89/58/31/2 e comparação de definições antes/depois. |
| Guidance Markdown não entra no artefato | Teste de `nest-cli.json`/`dist` e smoke do artefato em homologação. |
| Alteração de segredo/configuração impede startup | Loader tipado, testes de loader, atualização coordenada de CI/deploy e rollback por artefato. |
| Regressão de confirmação Mastra ou AgentRuntime | Testes de pendência/aprovação e política no executor como defesa em profundidade. |
| SSRF, perda de isolamento ou vazamento de bearer | Gateway único, resolução pelo cadastro, DNS/HTTPS/redirect, testes negativos por cliente e redaction de logs. |
| Timeout após mutação municipal deixa resultado incerto | Propagação de `AbortSignal`, nenhuma repetição automática e reconciliação pelo fluxo municipal existente. |
| Restos MCP em código morto, testes ou pipeline | Varredura explícita de produção/configuração/artefato e remoção de dependência no lockfile. |

### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `AGENTS.md` de `municipalize-admin-app`, todas as rules globais em `.agents/rules/` e as rules locais da Admin API. A especificação respeita o monólito modular NestJS, ownership explícito, providers privados, injeção por construtor, TypeScript estrito, ausência de `any`, validação nas fronteiras, Mongo encapsulado e nenhum HTTP interno.

Ela preserva autenticação/autorizações Keycloak, isolamento por cliente/ambiente/usuário, contratos HTTP/SSE e redaction de segredos. Também incorpora timeout, cancelamento, erros seguros, cobertura mínima de 80%, assets no build, verificações `lint`, `typecheck`, testes, cobertura, build e `git diff --check`. Não cria endpoint, microserviço, dependência de legado nem mudança nos repositórios `municipalize-app`, `ms-main`, `municipalize-chat-api` ou `municipalize-mcp`.

### Conformidade com skills

- `nestjs-architecture-principles`: aplicado para preservar o monólito modular, definir a API pública mínima de `ToolsModule`, ownership e grafo sem ciclos.
- `nestjs-oop-design-patterns`: aplicado para separar catálogo, policy, identidade, gateway e guidance por responsabilidade, usando contratos pequenos apenas nas fronteiras reais.
- `nestjs-features-performance`: aplicado para identidade, redaction, timeout, cancelamento, classificação de falhas, testes de contrato e rollout/rollback.

Não há desvio de skill aplicável. `nestjs-code-audit` não se aplica, pois esta atividade é especificação arquitetural, não auditoria somente de leitura.

### Arquivos relevantes e dependentes

| Grupo | Arquivos relevantes |
| --- | --- |
| Composição e consumidores | origem `src/modules/municipalize-tools/municipalize-tools.module.ts`; novos `src/modules/{tools,backend-gateway,execution-identity,agent-guidance}/*.module.ts`; `src/modules/agent-runtime/**`, `src/modules/chat/chat.module.ts`, `src/modules/chat/chat.providers.ts`, `src/modules/chat/core/**/municipalize-*-tool-*.ts`, `src/modules/mastra-studio/municipalize-*.ts` |
| Catálogo e domínios | `src/modules/mcp/tools/**` (origem a migrar para as camadas de `src/modules/tools/**`), `src/modules/municipalize-tools/policy/**`, `src/modules/municipalize-tools/municipalize-tool*.ts` |
| Identidade e gateway | `src/modules/mcp/auth/**`, `src/modules/mcp/context/**`, `src/modules/mcp/integrations/**` (origens dos módulos `execution-identity` e `backend-gateway`), `src/config/load-mcp-environment.ts`, `src/config/mcp-environment-readers.ts` |
| Orientação e assets | `src/modules/mcp/resources/docs/**`, `src/modules/mcp/resources/register-resources.ts`, `src/modules/mcp/prompts/**` (origens de `agent-guidance/assets/**`), `nest-cli.json` |
| Exclusões | `src/modules/mcp/**`, origem `src/modules/municipalize-tools/contextual-in-memory.transport.ts`, `@modelcontextprotocol/sdk` em `package.json` e `package-lock.json` |
| Configuração e operação | `.env.example`, `README.md`, `docs/mcp-deployment.md`, `.github/workflows/main_municipalize-hml-srv-node.yml`, `e2e/docker-compose.ms-main.qa.yaml` |
| Testes | `tests/config/load-mcp-environment.spec.ts`, `tests/modules/mcp/**`, origem `tests/modules/municipalize-tools/**`, novos `tests/modules/{tools,backend-gateway,execution-identity,agent-guidance}/**`, runner/fixture em `e2e/scripts/**` e `e2e/docker-compose.ms-main.qa.yaml` |
