# Especificação técnica

## Resumo

Esta TechSpec deriva do [PRD](prd.md) e altera exclusivamente o
`municipalize-admin-app`. A Admin API continua como monólito modular NestJS:
`ChatModule` preserva a borda HTTP/SSE atual, enquanto um
`AgentHarnessModule` baseado no Mastra passa a possuir conversa, memória,
execução do agente, adaptação de tools e composição de instruções.

O MongoDB e o `MongoClient` já usados pela Admin API também passam a hospedar
as collections exclusivas do Mastra. Um novo `AiConsumptionModule` é a única
fonte de verdade de autorização, reserva, liquidação idempotente e relatórios
de uso; `AiModelsModule` permanece apenas como catálogo/elegibilidade.
A migração é expandir → backfill idempotente → coexistência controlada →
retirada. Após a janela de rollback aprovada, a entrega remove as collections
legadas `chat_conversations` e `chat_messages` e o CRUD/repositories,
entidades, documentos, use cases e testes exclusivos que as acessam. As rotas
públicas de conversa permanecem: passam a operar exclusivamente sobre o CRUD
de ownership/thread do harness.

> **Premissa explícita para RF19:** modelo `paid` ou `unknown` sem custo de
> fonte comercial confiável não é elegível sob limite USD. Se uma execução já
> autorizada finalizar sem custo confiável, ela é registrada como
> `settlement_pending` e bloqueia novas execuções daquele usuário/Câmara até
> reconciliação; tokens nunca são convertidos silenciosamente em USD. Modelo
> `free` só usa USD zero quando essa classificação vem de fonte comercial
> autorizada.

## Arquitetura do sistema

### Visão dos componentes

Estado atual: `ChatModule` possui conversas, mensagens e consumo e delega a
execução ao `AgentRuntimeModule`; `MastraStudioModule` é um piloto com banco
separado. Estado alvo:

- **ChatModule (modificado):** valida DTO, recebe bearer, cria/propaga
  `AbortSignal`, chama APIs públicas do harness/governança e converte eventos
  internos para o contrato vigente. Não persiste conversas/mensagens/uso nem
  acessa LiteLLM, Mastra ou tools diretamente.
- **AgentHarnessModule (novo):** migra o código útil de `mastra-studio`;
  resolve identidade autorizada, cria/recupera threads, memória e contexto,
  monta policy/tools, executa Mastra e emite eventos normalizados. Possui as
  collections `mastra_*`.
- **AgentGuidanceModule (modificado):** oferece políticas versionadas de
  experiência, segurança e domínio/tool. Não autoriza nem executa tools.
- **AiModelsModule (modificado):** resolve modelos habilitados com
  streaming/tool calling, limites e classificação
  `free | paid | unknown`; não lê orçamento nem consumo.
- **AiConsumptionModule (novo):** autoriza/reserva antes do modelo, liquida
  depois da execução e expõe projeções compatíveis. Possui
  `ai_consumption_*`.
- **ToolsModule (modificado):** mantém schemas, catálogo, políticas,
  confirmação e execução contra `ms-main`; o adapter Mastra apenas converte
  as definições habilitadas para `createTool`.

```text
HTTP/SSE existente
       │ bearer + DTO + AbortSignal
       ▼
ChatModule ──► AgentHarnessModule ──► AiModelsModule ──► LiteLLM
                     │       │
                     │       ├────► ToolsModule ──► ms-main
                     │       └────► AgentGuidanceModule
                     └────────────► AiConsumptionModule ──► MongoDB Admin API
```

Fluxo: Chat solicita autorização de consumo; Harness cria/recupera thread
autorizada; Mastra executa com contexto e tools habilitadas; Chat transmite
eventos compatíveis; governança liquida uma vez ao final. Após headers, falhas
viram evento SSE `error`, nunca outra resposta HTTP.

### Organização por camadas

Pelo volume de workflows, persistência própria e integrações voláteis, o
`AgentHarnessModule` e o `AiConsumptionModule` usam a estrutura completa
prevista em `.agents/rules/module-structure.md`; não permanecem planos. O
`ChatModule` mantém sua camada de apresentação e seus adapters mínimos, pois
não é dono de workflow de conversa após a migração. Cada `*.module.ts` é
apenas raiz de composição NestJS: declara imports/providers/exports e escolhe
adapters, sem regra de negócio, query Mongo ou chamada HTTP.

```text
src/modules/agent-harness/
  agent-harness.module.ts
  application/
    usecases/
      execute-agent-message.usecase.ts
      manage-owned-conversation.usecase.ts
    ports/
      conversation-store.port.ts
      model-execution.port.ts
    services/
      agent-harness.service.ts
  domain/
    entities/
      harness-conversation.entity.ts
    policies/
      conversation-ownership.policy.ts
      execution-serialization.policy.ts
    value-objects/
      authorized-conversation-context.value-object.ts
    errors/
  infrastructure/
    persistence/
      mongo-mastra-conversation-store.repository.ts
      mastra-storage.provider.ts
    integrations/
      mastra-agent.adapter.ts
      litellm-model-execution.adapter.ts
      mastra-tool.adapter.ts
    configuration/
      mastra-memory.config.ts
  presentation/
    internal/
      chat-harness-event.mapper.ts

src/modules/ai-consumption/
  ai-consumption.module.ts
  application/
    usecases/
      authorize-ai-consumption.usecase.ts
      settle-ai-consumption.usecase.ts
      query-ai-usage.usecase.ts
    ports/
      consumption-ledger.port.ts
      customer-ai-policy.port.ts
    services/
      ai-consumption.service.ts
  domain/
    entities/
      consumption-reservation.entity.ts
      consumption-event.entity.ts
    policies/
      consumption-authorization.policy.ts
      cost-settlement.policy.ts
    value-objects/
      consumption-period.value-object.ts
    errors/
  infrastructure/
    persistence/
      mongo-consumption-ledger.repository.ts
    integrations/
      customer-ai-policy.adapter.ts
```

O domínio não importa NestJS, MongoDB, HTTP, LiteLLM ou Mastra. Use cases
recebem comandos/queries de aplicação e dependem de ports pequenos definidos
perto do consumidor; adapters de infraestrutura os implementam. `ChatModule`
e o Studio são presentation/adapters: validam transporte e principal, chamam
serviços públicos e mapeiam resposta/evento. O módulo Nest conecta as
implementações concretas por DI. `AiModelsModule`, `ToolsModule`,
`AgentGuidanceModule` e `ExecutionIdentityModule` preservam seus próprios
ownerships e são consumidos somente por suas APIs exportadas, sem deep imports.

### Principais interfaces

```text
AgentHarnessService
  execute(HarnessExecutionInput) -> AsyncIterable<HarnessEvent>
  listConversations(OwnedConversationQuery) -> Page<ConversationView>
  renameConversation(RenameOwnedConversation) -> ConversationView
  archiveConversation(ArchiveOwnedConversation) -> void

AiConsumptionService
  authorize(ConsumptionAuthorizationInput) -> ConsumptionReservation
  settle(ConsumptionSettlementInput) -> ConsumptionSettlement
  getAvailability(ConsumptionAvailabilityQuery) -> AvailabilityView
  getUsage(ConsumptionUsageQuery) -> UsageSummary

AiModelCatalogService
  listEligible(ModelRequirements) -> ReadonlyArray<AiModel>
  resolveEligible(ModelSelection) -> AiModel

AgentGuidanceService
  compose(GuidanceContext) -> AppliedGuidance
```

O Chat importa e consome somente essas APIs públicas. O Harness importa APIs de
modelos, guidance, tools e governança. Providers, repositories, documentos
Mongo e tokens de infraestrutura permanecem privados. Nenhum módulo chama rota
HTTP da Admin API, e não haverá `forwardRef()`, microserviço, ORM ou módulo
compartilhado novo.

## Design de implementação

### Modelos de dados

Documentos Mongo são internos; DTOs e mappers continuam a definir o contrato
HTTP. IDs são opacos, datas são `Date` internamente e ISO 8601 na saída.

#### `HarnessExecutionInput` — comando interno autenticado

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `executionId` | string | sim | UUID da borda; chave de idempotência da liquidação. |
| `identity` | AuthorizedExecution | sim | Cliente, ambiente, usuário Keycloak, função e bearer validados. |
| `conversationId` | string | null | sim | Conversa solicitada; null cria conversa. |
| `message` | string | sim | Mensagem validada pelo DTO atual. |
| `model` | AiModel | sim | Modelo elegível já resolvido. |
| `signal` | AbortSignal | sim | Desconexão e deadline combinados. |

```text
{
  "executionId": "7f4a46fb-3c2f-49d3-a1e9-2b8e9b7ec902",
  "conversationId": null,
  "message": "Liste os projetos em elaboração.",
  "model": { "id": "municipalize-default-model", "provider": "litellm" }
}
```

#### `HarnessEvent` — evento interno normalizado

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `type` | union | sim | conversation, delta, used_tools, mutation, usage, done ou failure. |
| `executionId` | string | sim | Correlaciona stream, reserva e liquidação. |
| `payload` | object | sim | Forma segura sem prompt, bearer ou corpo do provider. |

```text
{ "type": "delta", "executionId": "7f4a46fb-3c2f-49d3-a1e9-2b8e9b7ec902", "payload": { "text": "Encontrei " } }
```

> O adapter Chat é o único que mapeia esses eventos para os SSE existentes:
> `conversation`, `delta`, `used_tools`, `mutation`, `token_usage`,
> `done` e `error`. `runId`, `threadId` interno, prompt e detalhes do
> Mastra nunca são públicos.

#### `MastraConversationOwnership` — ownership e ciclo de vida

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `conversationId` | string | sim | ID público mantido pelo frontend. |
| `customerId` | string | sim | Cliente/Câmara proprietário. |
| `environment` | string | sim | Ambiente da execução. |
| `userKeycloakSub` | string | sim | Proprietário autenticado. |
| `resourceId` | string | sim | Derivado de identidade autorizada, nunca do body. |
| `threadId` | string | sim | Thread Mastra associada. |
| `status` | active | archived | sim | Estado da conversa. |
| `title` | string | sim | Título público. |
| `policyVersion` | string | sim | Policy aplicada na última execução. |
| `createdAt`, `updatedAt` | Date | sim | Auditoria/ordenação. |

```text
{
  "conversationId": "conv_01JQ3S9W4S",
  "customerId": "camara-santos",
  "environment": "production",
  "userKeycloakSub": "keycloak-sub-opaco",
  "resourceId": "r_6e0b...",
  "threadId": "thread_01JQ3S9W4S",
  "status": "active",
  "title": "Projetos em elaboração",
  "policyVersion": "gracy-2026-08-01"
}
```

O Harness cria índices únicos por `conversationId` e por
`customerId, environment, userKeycloakSub, threadId`; a listagem usa
`customerId, environment, userKeycloakSub, status, updatedAt`. O
`MongoDBStore` recebe o `MONGO_CLIENT` existente e
`MONGO_DATABASE_NAME`, com prefixo `mastra_`; não usa
`MASTRA_STORAGE_DATABASE_NAME` nem outra credencial/conexão.

#### Retirada do armazenamento e CRUD legado de conversa

As collections Mongo `chat_conversations` e `chat_messages` são fontes
transitórias somente até o backfill e a paridade estarem aprovados. A fase de
retirada remove, em uma mudança incompatível planejada:

- as collections e os índices `customer_conversations` e relacionados;
- `MongoConversationRepository`, `MongoChatMessageRepository`, seus
  documents e tokens de DI;
- as entidades, repositories e use cases de conversa/mensagem que representam
  a persistência antiga, incluindo criação, listagem, leitura, rename, archive
  e listagem de mensagens;
- providers em `chat.providers.ts`, adapters e testes exclusivos desse CRUD.

Antes do `drop`, a migration registra conclusão do backfill, valida a
equivalência por conversa (ID, owner, status, título, ordem/histórico de
mensagens e contexto), preserva export/backup recuperável e espera a janela de
rollback. O rollback só é permitido até o marco de exclusão; depois dele,
restaura-se apenas de backup aprovado, nunca por recriar o CRUD legado.

#### `AiModel` — projeção de elegibilidade

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id`, `displayName`, `provider` | string | sim | Identificação segura do modelo. |
| `supportsStreaming`, `supportsTools` | boolean | sim | Capacidades necessárias ao harness. |
| `contextWindow` | number | null | sim | Limite conhecido. |
| `commercialClass` | free | paid | unknown | sim | Classificação comercial, não consumo. |
| `costReliability` | verified | unavailable | sim | Fonte adequada à política USD. |

```text
{
  "id": "municipalize-default-model",
  "displayName": "Modelo Municipalize",
  "provider": "litellm",
  "supportsStreaming": true,
  "supportsTools": true,
  "contextWindow": 128000,
  "commercialClass": "paid",
  "costReliability": "verified"
}
```

#### `ConsumptionReservation` — autorização anterior ao modelo

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `executionId` | string | sim | Chave ponta a ponta e idempotente. |
| `status` | authorized | denied | sim | Resultado da política. |
| `denialCode` | string | null | sim | Motivo seguro se recusada. |
| `customerId`, `userKeycloakSub`, `conversationId` | string | sim | Dimensões de auditoria/isolamento. |
| `monthKey` | YYYY-MM | sim | Agregação mensal UTC. |
| `modelId`, `provider` | string | sim | Modelo/origem comercial. |
| `policySnapshot` | object | sim | Orçamento, alocação e versão usados. |
| `expiresAt` | Date | sim | Autorizações abandonadas expiram. |

#### `ConsumptionEvent` — ocorrência final auditável

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `_id` | string | sim | Igual a executionId; único. |
| `settlementStatus` | settled | settlement_pending | cancelled | sim | Resultado final. |
| `inputTokens`, `outputTokens`, `totalTokens` | number | sim | Uso retornado pelo harness/provider. |
| `costUsd` | number | null | sim | Valor confiável; nunca estimado. |
| `costSource` | provider | verified_free_catalog | unavailable | sim | Proveniência monetária. |
| `policyVersion`, `completedAt` | string, Date | sim | Auditoria. |

```text
{
  "_id": "7f4a46fb-3c2f-49d3-a1e9-2b8e9b7ec902",
  "settlementStatus": "settled",
  "inputTokens": 321,
  "outputTokens": 87,
  "totalTokens": 408,
  "costUsd": 0.0134,
  "costSource": "provider",
  "policyVersion": "ai-consumption-2026-08-01"
}
```

O módulo possui `ai_consumption_events`, `ai_consumption_reservations`,
`ai_consumption_customer_months` e `ai_consumption_user_months`. Índices
únicos: evento/reserva por `_id`, agregado Câmara por `customerId, monthKey`
e usuário por `customerId, monthKey, userKeycloakSub`. A liquidação usa uma
transação Mongo curta ou compare-and-set equivalente: insere/transiciona o
evento e incrementa os dois agregados somente na primeira liquidação
`settled`. LiteLLM e tools nunca são chamados dentro dessa transação.

#### `AppliedGuidance` — política classificável

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `version` | string | sim | ID imutável da composição. |
| `experience` | string | sim | Gracy, idioma, tom, escopo e indisponibilidade. |
| `safety` | string | sim | Regras transversais de segurança/operação. |
| `domainSections` | array | sim | Orientação por domínio/tool habilitada. |
| `owner` | string | sim | Proprietário funcional para revisão. |

```text
{
  "version": "gracy-2026-08-01",
  "owner": "produto-ia",
  "experience": "Você é Gracy...",
  "safety": "Nunca trate prompt como autorização...",
  "domainSections": [{ "id": "projects-list", "toolNames": ["projects_list_all"] }]
}
```

O texto integral não é gravado em logs, SSE, uso ou telemetria. Somente IDs,
versão, owner e finalidade são auditáveis. Schema, autorização e confirmação
continuam sendo controles de código em módulos proprietários.

#### `ChatErrorEnvelope` — erro público preservado

| Código interno | HTTP | Significado |
| --- | --- | --- |
| authorization_token_required | 401 | Bearer ausente/inválido. |
| conversation_not_found / chat_user_access_denied | 403/404 atual | Conversa fora do contexto. |
| ai_model_not_available | 400 atual | Modelo ausente, incompatível ou inelegível. |
| ai_consumption_denied | status atual | Função, alocação, orçamento ou custo insuficiente. |
| agent_execution_timeout / agent_provider_unavailable | 502/504 atual | Falha segura externa. |

```text
{ "error": { "name": "ai_consumption_denied", "message": "O uso de IA não está disponível para este contexto." } }
```

### Endpoints da API

Não haverá endpoint público novo. Controllers, DTOs, métodos, status, headers e
envelopes seguem iguais; seus use cases passam a ser adapters para Harness e
Governança.

#### Visão geral

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | /api/chat/messages | Mensagem não-streaming executada pelo harness. |
| POST | /api/chat/messages/stream | SSE compatível do harness. |
| GET | /api/chat/models | Modelos elegíveis. |
| POST/GET/DELETE | /api/chat/conversations/** | Ciclo de vida Mastra. |
| GET | /api/chat/customers/:customerId/{availability,token-usage,my-token-usage} | Projeções de consumo. |
| GET | /api/customers/:customerId/token-usage | Consulta administrativa compatível. |

---

#### `POST /api/chat/messages/stream`

O endpoint conserva corpo, bearer, headers e `ChatExceptionFilter`. O
controller não expõe `runId`, thread interna, prompt ou detalhes LiteLLM.

| Campo de corpo | Tipo | Padrão | Regras |
| --- | --- | --- | --- |
| customerId | string | — | Deve coincidir com identidade/contexto autorizado. |
| conversationId | string | — | Ausente cria conversa; presente deve ser do proprietário. |
| message | string | — | DTO atual. |
| model | string | modelo padrão | Exige streaming e tools. |
| context, action | objetos atuais | — | Compatibilidade; não são prova de autorização. |

| Status | Corpo | Quando |
| --- | --- | --- |
| 200 | SSE atual | Execução autorizada. |
| status atual | ChatErrorEnvelope | Falha antes dos headers. |
| 200 iniciado | evento error | Falha depois dos headers. |

```http
POST /api/chat/messages/stream
```

```text
event: conversation
data: {"conversationId":"conv_01JQ3S9W4S"}

event: delta
data: {"text":"Encontrei 2 projetos."}

event: done
data: {"conversationId":"conv_01JQ3S9W4S"}
```

> Os eventos `used_tools`, `mutation` e `token_usage` preservam a forma
> atual. Aprovação Mastra vira o fluxo de confirmação existente; reconectar o
> stream não reutiliza/aprova/liquida uma execução.

---

#### `GET /api/chat/models`

Mantém a resposta existente, mas chama
`listEligible({ streaming: true, tools: true })`. Classificação comercial é
interna; preço, orçamento e saldo não entram no contrato público.

#### Endpoints de conversa e uso existentes

`/api/chat/conversations`, `/me`, `:conversationId`, `messages`,
`rename`, `archive`, e as rotas de availability/uso mantêm contratos. Após
a migração, seus adapters usam `AgentHarnessService` e
`AiConsumptionService`; Chat não acessa `chat_conversations`,
`chat_messages` ou `chat_token_usage_*`. Concluída a janela de rollback, as
duas primeiras collections e todo CRUD de persistência antiga são removidos;
isso não remove os endpoints públicos, que passam a chamar somente o lifecycle
de conversa/thread do Harness.

## Pontos de integração

- **Mastra 1.63 / @mastra/mongodb 1.18:** `MongoDBStore` usa
  `connectorHandler` sobre o `MONGO_CLIENT` e database existentes. O
  harness passa resource/thread derivados da identidade autorizada. A
  documentação do Mastra confirma storage de threads/mensagens em Mongo e
  escopo de memória por resource/thread.
- **LiteLLM:** adapter OpenAI-compatible do piloto migra para o Harness. Cada
  chamada recebe modelo elegível, deadline, AbortSignal e metadados mínimos;
  vendor body/falha é normalizado antes de sair do módulo.
- **Tools e ms-main:** factory usa apenas `ToolCatalogService.listEnabled()`,
  schema Zod e `requireApproval`. O executor ainda exige policy, confirmação,
  identidade e contexto; cancelamento alcança gateway municipal e não há retry
  automático de escrita incerta.
- **Keycloak/backend municipal:** `ExecutionIdentityModule` conserva validação
  JWT, vínculo e role. `ChatBearerTokenGuard` exige header, mas nenhum valor
  vindo do cliente amplia acesso.
- **Mongo:** as novas collections e índices são criados idempotentemente.
  Prompts, bearer, corpo LiteLLM/ms-main e dados municipais não necessários não
  são persistidos.

## Abordagem de testes

Vitest continua sendo a suíte; `npm run test:coverage` deve provar no mínimo
80% de statements, branches, functions e lines. Mocks apenas para LiteLLM,
ms-main, clock e Mongo em unidade; Mongo, wiring Nest e SSE são integração.
Testes negativos usam customer, ambiente, usuário ou role divergente.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | resolve somente modelo compatível | CA-04 | Modelo sem tools/streaming ou custo confiável é recusado antes de reserva. |
| TU-02 | autoriza pelo snapshot de Câmara e função | CA-05 | Falta de função, alocação, orçamento ou saldo recusa sem LiteLLM. |
| TU-03 | liquida execução uma vez | CA-06, CA-07 | Mesmo executionId não duplica evento/agregado. |
| TU-04 | bloqueia custo não liquidável | CA-07 | settlement_pending mantém USD nulo e bloqueia autorização. |
| TU-05 | compõe guidance versionado | CA-08, CA-09 | Chat e Studio equivalente recebem mesma policy sem texto em log. |
| TU-06 | deriva ownership da identidade | CA-02, CA-12 | Body não altera customer, ambiente ou dono. |
| TU-07 | adapta só tools habilitadas | CA-03, CA-10 | Tool desabilitada não chega ao agente; mutação exige aprovação/policy. |
| TU-08 | normaliza eventos Mastra | CA-01 | Evento interno preserva payload SSE atual. |
| TU-09 | propaga cancelamento/deadline | CA-03 | Abort encerra modelo/tool e distingue cancelamento, timeout e provider. |
| TU-10 | caracteriza, converte e retira legado | CA-11, CA-13 | Conversa/mensagens/uso preservam dono, histórico e totais; após o marco de retirada não resta provider ou repository do CRUD antigo. |

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | compõe grafo sem agent-runtime | CA-10, CA-13 | NestFactory sobe módulos sem HTTP interno/ciclo/provider legado. |
| TI-02 | persiste thread no Mongo Admin API | CA-02, CA-12 | Mesmo database, collections mastra_* e filtro de ownership; sem banco separado. |
| TI-03 | transmite stream pelo harness | CA-01, CA-03 | Sequência conversation → delta → tools/mutation → usage → done é compatível. |
| TI-04 | consome confirmação uma vez | CA-03 | Aprovação vincula ação, conversa, owner e executionId; replay falha. |
| TI-05 | liquida e projeta consumo | CA-06, CA-07 | Evento/agregados/consultas concordam após repetição e falha controlada. |
| TI-06 | bloqueia acesso cruzado | CA-02, CA-05, CA-12 | Contexto divergente não lê, continua ou escreve conversa/uso. |
| TI-07 | executa backfill repetível | CA-11 | Segunda execução não duplica nem troca ownership. |
| TI-08 | retira collections e CRUD legados com segurança | CA-11, CA-13 | Após prechecks, backup e janela aprovada, o módulo sobe sem collections, índices, providers ou imports de chat_conversations/chat_messages. |

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | conversa streaming pelo frontend atual | CA-01, CA-14 | Browser usa rota atual e vê resposta do harness. |
| E2E-02 | retoma conversa isolada | CA-02, CA-12 | Dono recupera histórico; outro usuário/Câmara recebe erro compatível. |
| E2E-03 | mutação exige confirmação | CA-03 | Sem aprovação não chama ms-main; com aprovação opera uma vez. |
| E2E-04 | disponibilidade/uso por Câmara e usuário | CA-04, CA-05, CA-06, CA-07 | Evento único aparece em relatório e custo ausente bloqueia nova chamada. |
| E2E-05 | paridade Chat e Studio | CA-08, CA-09 | Mesmo usuário/modelo/tools recebe a mesma policy/proteção. |
| E2E-06 | rollout, retirada e rollback de dados | CA-11, CA-13 | Backfill e rollback pré-retirada preservam dados; após retirada, CRUD/collections legados e agent-runtime não existem. |

Os E2E de browser usam o projeto central `e2e/`; API/SSE usam Mongo,
Keycloak, LiteLLM e backend municipal controlados, jamais segredos ou dados
reais.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Caracterização:** congelar contratos HTTP/SSE, conversa, uso, modelo e
   tools; inventariar consumidores, collections, índices, config e artefatos.
2. **Capacidades proprietárias:** evoluir Models e criar Consumption, com
   documentos, índices, reserva/liquidação e testes antes do modelo.
3. **Harness único:** migrar storage, memória, lifecycle, LiteLLM e adapter de
   tools de Mastra Studio para AgentHarnessModule; Studio vira consumidor dessa
   mesma API.
4. **Chat como borda:** trocar providers/use cases por adapters, preservando
   controllers, DTOs, ChatExceptionFilter, SSE e cancelamento.
5. **Dados:** provisionar collections, executar backfill idempotente em lotes,
   validar contagens/hash/ownership/totais e habilitar leitura Mastra controlada.
6. **Retirada:** depois de paridade em development, homologation e production,
   remover AgentRuntime, adapters/loop/prompt/config/testes exclusivos e
   MASTRA_STORAGE_DATABASE_NAME. Ainda nesta fase, manter
   chat_conversations/chat_messages somente read-only até fim da janela de
   rollback.
7. **Gates e operação:** executar validações, smoke, E2E e ensaio de rollback
   antes do marco irreversível. Com evidências aprovadas, gerar backup/export
   recuperável, executar drop dos índices e collections chat_conversations e
   chat_messages, e remover o CRUD legado, seus providers/imports e testes. O
   artefato final deve subir e passar busca estática sem essas referências.

### Dependências técnicas

- MongoDB Admin API precisa suportar as collections/índices Mastra e transações
  curtas de governança.
- LiteLLM precisa informar catálogo, uso e custo/fonte comercial coerentes.
- Keycloak e ms-main seguem necessários nos E2E autenticados de conversa/tools.
- Owner de guidance e processo de reconciliação de settlement_pending precisam
  ser aprovados antes do rollout produtivo.

## Monitoramento e observabilidade

Logs estruturados/redigidos incluem executionId, categoria, duração, customer
mascarado, ambiente, modelo/provedor e versão de policy. Nunca incluem bearer,
header, prompt, argumento completo de tool, corpo LiteLLM/ms-main, mensagem
integral ou PII desnecessária.

Medir/alertar: autorizações/recusas por código, duração/timeout/cancelamento por
dependência, desconexão, tools por policy, aprovações/rejeições, liquidações
idempotentemente ignoradas, settlement_pending, falhas de backfill e atraso de
reconciliação. Healthcheck verifica config, Mongo e composição local, sem chamar
modelo/tool. Abortar promoção em regressão SSE, acesso cruzado, duplicidade de
uso, startup/configuração inválida ou qualquer dependência produtiva do
agent-runtime.

## Considerações técnicas

### Principais decisões

- **Mastra dentro do monólito:** preserva Nest, guards, configuração e
  MongoClient; Studio não é produto paralelo.
- **Ownership de dados explícito:** Harness possui conversa/memória;
  Consumption possui uso; Models possui elegibilidade; Tools possui operações.
- **Chat como adapter anti-corrupção:** um mapper fino protege o contrato SSE
  da evolução Mastra; o custo é justificável pela compatibilidade pública.
- **Reserva + liquidação idempotente:** executionId impede duplicação por
  reconexão, retry de persistência e eventos repetidos.
- **Custo desconhecido é bloqueio seguro:** não infere USD de tokens, embora
  possa suspender temporariamente o usuário/Câmara até reconciliação.
- **Confirmação em profundidade:** Mastra solicita aprovação e Tools valida
  confirmação, identidade e policy definitivamente.
- **Design direto:** não criar CQRS, event bus, SharedModule, ORM, microserviço
  ou porta genérica sem fronteira real.

### Riscos conhecidos

| Risco | Mitigação |
| --- | --- |
| Mudança de API Mastra | Fixar versões, caracterizar stream/memory/approval e validar docs oficiais antes de upgrade. |
| Collections auto-criadas incompatíveis | Prefixo, inspeção em ambiente isolado, ensureIndexes e smoke de artefato. |
| Backfill duplica/mistura ownership | Chave estável, ledger de migração, lotes reexecutáveis, contagem/hash e rollback por artefato. |
| Custo não retornado | settlement_pending, bloqueio seguro e reconciliação; sem estimativa. |
| Duas mensagens na mesma thread | Serializar por conversationId ou recusar conflito explícito; nunca duas runs gravando a mesma thread. |
| Reuso de aprovação | Vincular ação, conversa, owner, contexto e executionId; consumo único e policy no executor. |
| Vazamento em telemetry | Allowlist/mappers seguros e testes de redaction. |
| Retirada prematura do legado | Busca de consumidores, flag temporária, smoke nos três ambientes, backup recuperável e rollback ensaiado antes do drop. |

### Conformidade com o AGENTS.md e as rules

Foram lidos AGENTS.md da raiz e da Admin API, todas as rules globais e todas as
rules locais. A solução mantém o monólito Nest, ownership/exports explícitos,
DI por construtor, Mongo driver oficial, TypeScript estrito, ausência de HTTP
interno e de acesso cross-module a collections.

Ela preserva Keycloak, autorização concreta, isolamento por cliente/ambiente/
usuário/role/conversa, envelope `{ error: { name, message } }`, SSE,
timeout/cancelamento, redaction e chamadas externas fora de transação. A
implementação deverá rodar `npm run lint`, `npm run typecheck`,
`npm test`, `npm run test:coverage`, `npm run build` e
`git diff --check`; também build do frontend, smoke e rollback, pois contratos
compartilhados são afetados.

### Conformidade com skills

- `criar-techspec`: arquitetura, contratos, sequência e testes rastreáveis
  derivados do PRD, sem implementação.
- `nestjs-architecture-principles`: ownership, módulos, exports, grafo e
  migração incremental no monólito.
- `nestjs-oop-design-patterns`: invariantes e adapters atribuídos a
  capacidades proprietárias sem padrões cerimoniais.
- `nestjs-features-performance`: HTTP/SSE, auth, deadlines, cancelamento,
  idempotência, falhas, telemetria e rollout.

Não há desvio. Skills de auditoria, execução de task, QA, review e publicação
não são aplicáveis nesta etapa de especificação.

### Arquivos relevantes e dependentes

| Grupo | Arquivos relevantes |
| --- | --- |
| Composição | src/app.module.ts, src/modules/chat/chat.module.ts, src/modules/chat/chat.providers.ts, src/database/database.module.ts |
| Chat/contratos | src/modules/chat/{auth,conversations,messages,models,usage}/**, chat-exception.filter.ts, dto/chat.dto.ts |
| Legado | src/modules/agent-runtime/**, chat/core/infrastructure/ai/agent-runtime-*, chat/core/infrastructure/database/mongo/chat/**; entidades, repositories e use cases de conversa/mensagem antiga em src/modules/chat/core/** |
| Harness | src/modules/mastra-studio/**, src/config/load-mastra-studio-environment.ts, src/scripts/mastra-development.ts |
| Proprietários | src/modules/{ai-models,tools,agent-guidance,execution-identity}/**, src/config/load-chat-environment.ts |
| Novos | src/modules/agent-harness/**, src/modules/ai-consumption/** e testes espelhados em tests/modules/** |
| Operação | .env.example, README.md, docs/agent-harness.md, docs/mastra-studio-validation.md, nest-cli.json, package.json, CI/deploy/compose |
| Consumidores | municipalize-app; Keycloak, LiteLLM, MongoDB e ms-main nas fronteiras existentes |
