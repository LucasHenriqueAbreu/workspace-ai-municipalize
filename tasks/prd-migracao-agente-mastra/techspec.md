# Especificação técnica

## Resumo

Esta especificação implementa o piloto descrito no
[PRD](prd.md) como uma capacidade local de desenvolvimento dentro do
`municipalize-admin-app`. A aplicação continuará sendo o monólito NestJS que é
dono de autenticação, clientes e ferramentas Municipalize. Um bootstrap Mastra
para desenvolvimento criará um `INestApplicationContext` do monólito e exporá
o agente ao Mastra Studio; ele não cria uma API de produto, não substitui os
endpoints atuais de Chat e não é um novo serviço implantado.

O agente usará `Memory` do Mastra com `MongoDBStore` em collections próprias.
O `resourceId` será derivado no servidor do usuário Keycloak autenticado, Câmara
e ambiente; o `threadId` será o identificador da conversa. O estado estruturado
das entidades municipais ficará em working memory com escopo de thread. As tools
Mastra serão adaptadores finos do catálogo interno existente, de modo que
autenticação, seleção de backend, políticas e confirmação continuem centralizadas
na Admin API.

## Arquitetura do sistema

### Visão dos componentes

| Componente | Tipo | Responsabilidade e relacionamento |
| --- | --- | --- |
| `MastraDevelopmentBootstrap` | novo, bootstrap de desenvolvimento | Inicia o contexto Nest sem abrir uma segunda porta HTTP, obtém as APIs públicas dos módulos proprietários e constrói a instância Mastra consumida por `mastra dev`/Studio. Só é acionado pelo script local `mastra:dev`. |
| `MastraStudioModule` | novo módulo Nest | Raiz de composição da capacidade Mastra. Expõe somente a factory do agente e a sessão local ao bootstrap; importa `MunicipalizeToolsModule`, `CustomersModule`, `UsersModule`, `AiModelsModule` e `DatabaseModule` pelas APIs públicas. |
| `StudioExecutionIdentityService` | novo provider de aplicação | Lê o bearer token efêmero da sessão local, delega sua validação a `RequestAuthenticationService`, resolve usuário, Câmara, ambiente e URL pelo fluxo já existente e entrega um contexto autenticado ao agente. |
| `MastraResourceIdFactory` | novo provider puro | Cria o `resourceId` determinístico a partir de `environment`, `customerId` e `keycloakSub`; nunca aceita identificadores enviados pelo Studio. |
| `MunicipalizeMastraAgentFactory` | novo provider | Constrói o agente único `municipalize-assistant`, suas instruções, modelo LiteLLM compatível, `Memory` thread-scoped e o catálogo adaptado de tools. |
| `MunicipalizeMastraToolFactory` | novo provider | Transforma cada definição habilitada de `MunicipalizeToolCatalogService.listEnabled()` em uma tool Mastra nativa, preservando nome, descrição, schema Zod e política. Não cria nem consome servidor, client ou transporte MCP. |
| `MastraThreadLifecycleService` | novo provider | Cria, lista, reabre, renomeia e remove threads pelo Memory API. Inicializa e atualiza o working memory estruturado da thread; gera um título determinístico a partir da primeira mensagem. |
| `MastraConversationContext` | novo contrato de working memory | Define o estado thread-scoped de entidades: seleção e resultados resumidos de projetos, emendas, instituições, orçamento e outras entidades retornadas por tools. |
| `MongoDBStore` do Mastra | nova infraestrutura | Persiste threads, mensagens, memória de trabalho e artefatos Mastra no Mongo já configurado, em collections geridas pelo adapter e segregadas das collections `chat_*`. |
| `MunicipalizeToolCatalogService` | novo/refatorado, API pública de `MunicipalizeToolsModule` | Centraliza as 91 definições e handlers transport-neutral, filtra as 89 habilitadas e executa-as com `AuthenticatedRequestContext`, resolução da URL da Câmara e `MunicipalizeToolPolicyService`. |
| `McpServerFactory` e `MunicipalizeToolExecutorService` | existentes, não dependidos pelo Mastra | Podem continuar servindo consumidores MCP já existentes, adaptando o mesmo catálogo direto. A remoção desse transporte não faz parte deste piloto. |
| `ChatModule` e `AgentRuntimeModule` | existentes, não alterados nesta fase | Mantêm os contratos HTTP/SSE e o runtime LiteLLM atual para o frontend. Não dependem do novo módulo Mastra. |

Fluxo de execução local:

```text
operador local
  -> script mastra:dev com bearer efêmero no processo
  -> Mastra Studio (thread nova ou existente)
  -> MastraDevelopmentBootstrap + MastraStudioModule
  -> StudioExecutionIdentityService
  -> RequestAuthenticationService / CustomerBackendResolverService
  -> resourceId derivado + threadId validado
  -> Agent + Memory MongoDB
  -> MunicipalizeMastraToolFactory
  -> MunicipalizeToolCatalogService
  -> handler Municipalize direto / backend configurado da Câmara
```

O Studio nunca fornece `customerId`, `keycloakSub`, `backendBaseUrl` ou
`resourceId` como fonte de verdade. Ele fornece somente a nova mensagem e o
identificador de thread que deseja continuar. O servidor revalida a identidade
e a propriedade da thread antes de cada geração e antes de cada tool.

## Design de implementação

### Principais interfaces

Os contratos abaixo ficam próximos aos consumidores em `src/modules/mastra-studio/`.
Eles são portas de aplicação reais: separam o SDK Mastra das regras de
autenticação, ownership e execução de tools da Municipalize.

```text
StudioExecutionIdentityService
  resolve() -> AuthenticatedStudioExecution

MastraResourceIdFactory
  create(input: AuthenticatedStudioExecution) -> string

MastraThreadLifecycleService
  create(input) -> MunicipalizeMastraThread
  findOwned(input) -> MunicipalizeMastraThread
  listOwned(input) -> ReadonlyArray<MunicipalizeMastraThread>
  deleteOwned(input) -> void

MunicipalizeMastraToolFactory
  createAll() -> Record<string, MastraTool>

MunicipalizeToolCatalogService
  listEnabled() -> ReadonlyArray<MunicipalizeToolDefinition>
  execute(input) -> MunicipalizeToolResult
```

```typescript
export interface AuthenticatedStudioExecution {
  readonly authorizationHeader: string;
  readonly backendBaseUrl: string;
  readonly customerId: string;
  readonly environment: "development" | "homologation" | "production";
  readonly keycloakSub: string;
  readonly resourceId: string;
}

export interface MunicipalizeMastraThread {
  readonly id: string;
  readonly resourceId: string;
  readonly title: string;
  readonly updatedAt: Date;
}
```

```typescript
export interface MastraToolExecutionContext {
  readonly authorizationHeader: string;
  readonly customerId: string;
  readonly resourceId: string;
  readonly threadId: string;
}

export interface MunicipalizeMastraToolExecutor {
  execute(input: {
    readonly arguments: Record<string, unknown>;
    readonly context: MastraToolExecutionContext;
    readonly name: string;
    readonly confirmed: boolean;
  }): Promise<unknown>;
}
```

O `confirmed` não será recebido livremente do prompt. A tool Mastra nativa consulta
a política atual: tools de leitura executam normalmente; tools com risco médio ou
alto retornam uma solicitação de confirmação compatível com o fluxo Mastra. Uma
segunda execução explicitamente confirmada chama diretamente o handler do catálogo.
O catálogo aplica a mesma política como defesa em profundidade.

### Modelos de dados

#### `AuthenticatedStudioExecution` — identidade server-side da execução

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `authorizationHeader` | `string` | sim | Bearer Keycloak efêmero; vive apenas na memória do processo e na chamada ao backend. |
| `customerId` | `string` | sim | Cliente/Câmara resolvido pelo fluxo autenticado. |
| `keycloakSub` | `string` | sim | Identificador estável do usuário final autenticado. |
| `environment` | union | sim | Ambiente selecionado pela configuração tipada da aplicação. |
| `backendBaseUrl` | `string` | sim | URL do backend da Câmara, resolvida exclusivamente pelo cadastro do cliente. |
| `resourceId` | `string` | sim | Chave determinística de ownership do Mastra. |

```text
{
  "customerId": "camara-porto-alegre",
  "keycloakSub": "0f4e6bdc-0f18-4f58-9e02-7c7ebec0a4aa",
  "environment": "homologation",
  "backendBaseUrl": "https://qa-api.camara.exemplo.gov.br",
  "resourceId": "municipalize:homologation:camara-porto-alegre:0f4e6bdc-0f18-4f58-9e02-7c7ebec0a4aa"
}
```

> **Segredo efêmero:** `authorizationHeader` é necessário somente durante a
> execução. Ele não é serializado como metadata Mastra, working memory, mensagem,
> thread, trace, log ou output de tool. O exemplo o omite deliberadamente.

#### `MunicipalizeMastraThread` — conversa persistida pelo adapter Mastra

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | `string` | sim | `threadId` gerado pelo Mastra. |
| `resourceId` | `string` | sim | Proprietário imutável da thread; deve coincidir com o derivado da execução. |
| `title` | `string` | sim | Título criado uma única vez da primeira mensagem do usuário. |
| `metadata.workingMemory` | `MastraConversationContext` | sim | Estado estruturado, com escopo da thread. |
| `createdAt` | `Date` | sim | Data de criação. |
| `updatedAt` | `Date` | sim | Última alteração ou mensagem. |

```text
{
  "id": "01JQH08MRR98TTA1P75V4B2K54",
  "resourceId": "municipalize:homologation:camara-porto-alegre:0f4e6bdc-0f18-4f58-9e02-7c7ebec0a4aa",
  "title": "Liste os projetos de educação em execução",
  "metadata": {
    "workingMemory": {
      "currentIntent": "list_projects",
      "projects": [{ "id": "prj-301", "name": "Escola Integral Norte" }],
      "amendments": [],
      "institutions": [],
      "budget": [],
      "toolEvidence": [{ "tool": "projects_list_all", "at": "2026-08-26T14:00:00.000Z" }]
    }
  }
}
```

> **Propriedade imutável:** o Mastra não permite trocar o `resourceId` de uma
> thread depois da criação. `findOwned`, `listOwned` e `deleteOwned` sempre usam
> o `resourceId` derivado da execução; uma thread de outra Câmara, usuário ou
> ambiente deve ser tratada como não encontrada.

#### `MastraConversationContext` — estado estruturado por thread

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `currentIntent` | `string \| null` | sim | Intenção de trabalho atual, quando identificada. |
| `projects` | `EntityReference[]` | sim | Projetos selecionados ou resumidos na conversa. |
| `amendments` | `EntityReference[]` | sim | Emendas selecionadas ou resumidas na conversa. |
| `institutions` | `EntityReference[]` | sim | Instituições selecionadas ou resumidas na conversa. |
| `budget` | `EntityReference[]` | sim | Itens de orçamento selecionados ou resumidos na conversa. |
| `otherEntities` | `Record<string, EntityReference[]>` | sim | Entidades de outros domínios retornadas por tools. |
| `toolEvidence` | `ToolEvidence[]` | sim | Tool, instante e IDs de resultado que originaram o contexto. |

```text
{
  "currentIntent": "compare_amendments",
  "projects": [],
  "amendments": [{ "id": "emd-89", "label": "Emenda 89/2026" }],
  "institutions": [{ "id": "ins-22", "label": "Instituto Municipal de Cultura" }],
  "budget": [{ "id": "orc-118", "label": "Ação 118 - Cultura" }],
  "otherEntities": {},
  "toolEvidence": [{ "tool": "amendments_list_all", "at": "2026-08-26T14:02:00.000Z", "entityIds": ["emd-89"] }]
}
```

As referências persistem somente os dados necessários para retomada: identificador,
rótulo, tipo, versão/atualização quando oferecidos pela tool e um resumo limitado.
O resultado bruto da tool permanece no histórico/auditoria do Mastra, sujeito aos
limites de retenção configurados. O adaptador deve rejeitar campos que possam
conter token, header ou segredo antes de salvar contexto.

#### `StudioSessionConfiguration` — configuração local e não persistente

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `mastraStudioEnabled` | `boolean` | sim | Habilita o bootstrap exclusivamente no modo local. |
| `developerBearerToken` | `string` | sim em modo Studio | Bearer entregue ao processo por ambiente seguro/interativo; não é gravado no Mongo nem em arquivos versionados. |
| `mastraStorageDatabaseName` | `string` | sim | Banco Mongo do ambiente local/QA já configurado, com namespace próprio do adapter. |
| `modelId` | `string` | sim | Modelo habilitado no LiteLLM para a sessão. |

```text
{
  "mastraStudioEnabled": true,
  "mastraStorageDatabaseName": "municipalize_qa",
  "modelId": "gpt-4.1-mini"
}
```

> **Degradação de sessão:** bearer ausente, expirado ou inválido impede a criação
> da execução e de qualquer chamada de tool. A thread já persistida permanece
> intacta; o operador deve fornecer uma sessão local válida para retomá-la.

#### `StudioAuthenticationError` — envelope de erro local

| Código | HTTP | Significado |
| --- | --- | --- |
| `studio_authentication_required` | `401` | Não há bearer efêmero configurado para a sessão local. |
| `studio_access_denied` | `403` | O bearer não autoriza usuário, Câmara, ambiente, thread ou tool. |
| `studio_thread_not_found` | `404` | A thread não existe ou não pertence ao `resourceId` derivado. |
| `studio_dependency_unavailable` | `502` | LiteLLM ou backend da Câmara não respondeu validamente. |

```text
{
  "error": {
    "name": "studio_access_denied",
    "message": "The authenticated user cannot access this Mastra thread"
  }
}
```

O formato local segue o envelope vigente do Chat (`error.name` e `error.message`)
para evitar um padrão paralelo. Nenhum valor de bearer, URL interna, payload bruto
ou detalhe de fornecedor é retornado.

#### Mapeamento catálogo Municipalize → tool Mastra

| Origem | Destino |
| --- | --- |
| `MunicipalizeToolDefinition.name` | chave/`id` da tool Mastra, sem renomear |
| `description` | descrição enviada ao agente |
| `inputSchema` JSON Schema | schema Zod equivalente validado na fronteira Mastra |
| `policy.access` | inclusão: somente tools não desabilitadas |
| `policy.risk` e confirmação | fluxo de confirmação antes de `execute` |
| handler do `MunicipalizeToolCatalogService` | executor final da tool Mastra nativa |
| contexto autenticado | `authorizationHeader` e `customerId` na execução interna |

#### Parâmetros fixos na origem

| API | Parâmetros principais |
| --- | --- |
| **Mastra Memory** | `resourceId` derivado, `threadId` gerado/persistido, working memory com `scope=thread` |
| **Municipalize tools** | `authorizationHeader` efêmero, `customerId` derivado, argumentos validados pelo schema da tool |
| **Resolução do backend** | cliente/Câmara e ambiente; nenhuma URL recebida do Studio |

### Endpoints da API (se aplicável)

Não haverá endpoint novo da Admin API nesta fase. Os endpoints existentes
`/api/chat/**` e seus eventos SSE não são alterados nem são usados pelo Studio.
O Mastra Studio consome exclusivamente a API de desenvolvimento fornecida pelo
runtime Mastra, iniciada pelo script local. Esse runtime não deve ser publicado,
registrado em gateway, DNS, CI de deploy ou configuração de produção.

> O bearer da sessão local é configurado no processo que executa o Studio e não
> como mensagem, `threadId`, `resourceId` ou request context persistível do
> Studio. A integração deve usar a extensão de autenticação/transporte suportada
> pela versão fixada do Mastra; se ela não permitir manter o segredo fora do
> armazenamento Mastra, a implementação deve parar antes de habilitar o Studio.

## Pontos de integração

- **Mastra Framework e Studio:** instalar versões compatíveis e pinadas de
  `mastra`, `@mastra/core`, `@mastra/memory` e `@mastra/mongodb`. A documentação
  oficial confirma que o Studio executa contra uma instância Mastra local e que
  tools, request context e memory são visíveis no ambiente visual. Não há guia
  oficial específico para NestJS; portanto o bootstrap usará um Nest application
  context apenas como composição local, sem acoplar domínio ao SDK.
- **MongoDB:** `@mastra/mongodb` usa a conexão configurada da Admin API. O
  adapter é dono de suas collections; `ChatModule` continua dono das collections
  `chat_conversations`, `chat_messages` e de seus documentos. A inicialização
  garante índices pelo mecanismo do adapter e não acessa collections de outro
  módulo.
- **LiteLLM:** o modelo Mastra deve usar o endpoint compatível com AI SDK/OpenAI
  exposto pelo LiteLLM atual. A factory encaminha somente metadados permitidos de
  cliente, ambiente e usuário. A compatibilidade entre a versão escolhida do
  Mastra, o provider AI SDK e o LiteLLM deve ser provada pelo teste de integração
  antes da conversão do runtime atual.
- **Autenticação e backend da Câmara:** `RequestAuthenticationService` e
  `CustomerBackendResolverService` permanecem os únicos responsáveis por validar
  o bearer, resolver usuário e escolher URL. A execução da tool chama o handler
  direto do `MunicipalizeToolCatalogService`; não usa HTTP interno, MCP client,
  MCP server ou transporte MCP.
- **Configuração:** `loadMastraStudioEnvironment` será um loader tipado em
  `src/config/`, validado antes do bootstrap local. A alteração correspondente
  atualiza `.env.example`, README, testes do loader e configuração local/QA. O
  bearer nunca recebe default e não aparece nesses arquivos.
- **QA:** os testes de integração continuam consumindo a URL definida no cadastro
  da Câmara para o ambiente de QA/homologação. A TechSpec não autoriza URL fixa;
  antes da implementação deve ser verificada a matriz existente de
  `APPLICATION_ENV`/`MCP_APPLICATION_ENV` para que a fixture de QA selecione o
  cadastro correto.

Falhas externas seguem o padrão Nest existente: timeout limitado e propagação de
`AbortSignal` para LiteLLM e backend da Câmara; erro de autenticação/autorização
não recebe retry; timeout e indisponibilidade podem receber no máximo a política
de retry idempotente já aprovada, respeitando cancelamento. Cada adaptação deve
traduzir erro do SDK/HTTP para erro de aplicação antes de chegar ao Studio.

## Abordagem de testes

A cobertura mínima obrigatória permanece **80%**. Os testes não verificam métodos
privados; comprovam contratos, isolamento e efeitos públicos. Fakes/mocks são
permitidos apenas nas fronteiras LiteLLM e Mastra quando o caso não é de
integração. Casos que dependem de Mongo, do catálogo direto de tools, autorização ou do
resolver da Câmara usam os módulos reais apropriados.

### Testes de unidade (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | gera `resourceId` determinístico por ambiente, Câmara e usuário | CA-02 | Mesma identidade gera a mesma chave; troca de qualquer componente gera outra. |
| TU-02 | rejeita contexto Studio sem bearer/identidade autorizada | CA-02 | Erro tipado sem criar thread nem chamar tool. |
| TU-03 | inicializa working memory thread-scoped vazia | CA-03 | Coleções de projetos, emendas, instituições e orçamento são arrays vazios e não são compartilhadas entre threads. |
| TU-04 | atualiza contexto apenas com referências permitidas de tool | CA-03, CA-09 | IDs/rótulos e evidência são mantidos; segredos e payloads proibidos são removidos/rejeitados. |
| TU-05 | gera título estável a partir da primeira mensagem | CA-05 | Título normalizado, limitado e não alterado por mensagens posteriores. |
| TU-06 | mapeia somente tools habilitadas e conserva schema/nome | CA-07 | 89 tools habilitadas entram no mapa; as 2 desabilitadas não entram. |
| TU-07 | exige confirmação para tool de risco antes da execução | CA-07 | Primeira chamada retorna pendência; handler direto é chamado somente após confirmação válida. |
| TU-08 | nega thread cujo `resourceId` não coincide com a execução | CA-02, CA-04, CA-06 | Thread é tratada como não encontrada e não há escrita. |
| TU-09 | classifica timeout, cancelamento e erro de fornecedor | CA-01, CA-10 | Cada condição resulta no erro de aplicação correto e não expõe detalhes sensíveis. |

### Testes de integração (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | persiste e recupera thread e mensagens no `MongoDBStore` | CA-01, CA-03 | Após recriar o contexto Mastra, a thread do mesmo recurso mantém histórico e memória. |
| TI-02 | lista threads somente pelo recurso derivado | CA-04 | Usuário ou Câmara diferentes não recebem threads de outro recurso. |
| TI-03 | remove thread e sua memória associada | CA-06 | A thread deixa de ser listável/recuperável e o adapter limpa artefatos dependentes conforme sua API. |
| TI-04 | passa título da primeira mensagem à thread Mastra | CA-05 | Listagem retorna o título persistido, sem chamada adicional de modelo. |
| TI-05 | registra diretamente o catálogo Municipalize no Mastra | CA-07 | A quantidade e os nomes das tools Mastra são iguais às 89 definições habilitadas, sem iniciar MCP server/client/transporte. |
| TI-06 | executa tool de leitura com contexto autenticado | CA-02, CA-08, CA-09 | `RequestAuthenticationService` recebe bearer; a URL vem do cliente cadastrado; handler direto atualiza working memory. |
| TI-07 | bloqueia tool de escrita sem confirmação e autoriza após confirmação | CA-07 | Política Mastra e a política do catálogo concordam; não há efeito antes da confirmação. |
| TI-08 | resolve URL de QA pelo cadastro da Câmara | CA-08, CA-10 | Fixture de homologação/QA seleciona URL cadastrada, sem host fixo no teste. |
| TI-09 | propaga cancelamento ao modelo e à tool | CA-01, CA-10 | `AbortSignal` interrompe upstream e não persiste estado incompleto como sucesso. |
| TI-10 | preserva Chat HTTP/SSE existente | CA-10 | Suite atual de Chat continua verde sem mudança de rota, envelope ou evento. |

### Testes E2E (se aplicável)

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| E2E-01 | conversa autenticada no Mastra Studio local | CA-01, CA-02 | Com sessão local válida, Studio inicia uma thread e responde; sem sessão, a execução é negada. |
| E2E-02 | retoma conversa com entidades municipais | CA-03, CA-09 | Em turnos separados, o agente referencia projeto, emenda, instituição e orçamento previamente consultados. |
| E2E-03 | lista, reabre e remove thread no Studio | CA-04, CA-05, CA-06 | A thread aparece com título automático, só para seu recurso, e desaparece após remoção. |
| E2E-04 | isolamento entre usuário/Câmara | CA-02, CA-04, CA-08 | Bearer de segundo usuário ou Câmara não lê thread, contexto ou tool result do primeiro. |
| E2E-05 | valida catálogo e consultas dos quatro domínios | CA-07, CA-09 | Studio apresenta as tools habilitadas e executa pelo menos uma consulta autorizada de cada domínio no ambiente de QA. |

O E2E do Studio é manual assistido e automatizado quando a API local do Mastra
permitir isolamento confiável de sessões. A evidência manual deve registrar a
versão das dependências, ambiente, identidade de teste não sensível, IDs
mascarados de resource/thread, nomes das tools usadas e screenshots sem dados
pessoais ou tokens.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. **Spike de compatibilidade e configuração:** verificar versões de Node,
   TypeScript CommonJS, Mastra, MongoDBStore, AI SDK e LiteLLM; definir packages
   pinados, loader tipado e script `mastra:dev`. É o primeiro passo porque o
   projeto ainda não possui `@mastra/*` e a documentação não oferece integração
   NestJS específica.
2. **Bootstrap e sessão local segura:** criar `MastraDevelopmentBootstrap`,
   `MastraStudioModule` e `StudioExecutionIdentityService`; provar que bearer
   não é persistido e que a identidade vem de `RequestAuthenticationService`.
3. **Storage, resource e lifecycle:** configurar `MongoDBStore`, factory de
   `resourceId`, esquema de working memory e serviço de threads. Criar índices e
   testes de ownership antes do agente para bloquear vazamento entre tenants.
4. **Agente e modelo:** integrar o prompt vigente e o provider LiteLLM
   compatível, com timeout/cancelamento e mensagens persistentes pelo Memory API.
5. **Tools e contexto de entidades:** extrair um catálogo transport-neutral dos
   registradores MCP atuais, registrar suas 89 tools habilitadas diretamente no
   Mastra, preservar confirmação e atualizar `MastraConversationContext` com
   resultados normalizados/limitados.
6. **Validação Studio e QA:** executar testes unitários, integração e E2E,
   validar as quatro consultas prioritárias no Studio e confirmar que o Chat
   atual não sofreu alteração.

### Dependências técnicas

- Node.js e TypeScript do repositório devem ser suportados simultaneamente pelo
  CLI/SDK Mastra escolhido; incompatibilidade ESM/CommonJS bloqueia a implementação
  até que exista estratégia de build compatível validada.
- Uma versão de `@mastra/mongodb` compatível com MongoDB 7 e com o mecanismo de
  conexão da Admin API é obrigatória. Não introduzir Mongoose ou outro ORM.
- LiteLLM precisa expor um provider utilizável pelo AI SDK da versão Mastra
  escolhida, mantendo autenticação, timeout, modelo e metadados atuais.
- Deve existir uma Câmara de QA/homologação com usuário Keycloak de teste,
  allocation/função de IA permitida e dados representativos de projetos,
  emendas, instituições e orçamento.
- A extensão de autenticação/transporte do Studio deve manter o bearer fora de
  storage e de contexto persistível. Sem essa evidência, o piloto não avança.

## Monitoramento e observabilidade

- O Studio local será o ponto de observação de traces, tools e memória do piloto.
  Logs da Admin API continuam centralizados via `Logger`/adapter existente.
- Registrar em nível informativo somente eventos estruturados não sensíveis:
  `mastra_thread_created`, `mastra_thread_deleted`, `mastra_tool_requested`,
  `mastra_tool_confirmed`, `mastra_tool_completed`, `mastra_tool_denied`,
  `mastra_dependency_timeout` e `mastra_session_rejected`.
- Campos permitidos: nome da tool, ambiente, duração, categoria de erro e IDs
  pseudonimizados/mascarados. Campos proibidos: bearer, headers, prompt completo,
  resposta bruta de tool, dados pessoais não necessários e URL privada.
- Medir por execução: duração total, duração LiteLLM, duração da tool, contagem
  de rounds, status, tool usada e falha. O piloto não declara SLO de produção;
  os dados servem para estabelecer baseline antes de uma integração frontend.
- Adicionar um healthcheck de desenvolvimento que verifique bootstrap Mastra,
  conexão Mongo e disponibilidade de configuração, sem chamar tool municipal nem
  expor segredo. Encerramento Nest deve fechar clients/recursos Mastra e cancelar
  streams em andamento.

## Considerações técnicas

### Principais decisões

- **Mastra como ambiente local integrado ao monólito, não microserviço:** o
  bootstrap cria o contexto Nest para usar providers públicos e o Studio é
  iniciado apenas por comando de desenvolvimento. Isso respeita o limite do
  `municipalize-admin-app` e permite a experiência visual oficial sem novo
  endpoint de produto.
- **MongoDBStore separado do Chat:** o Mastra é dono de threads/mensagens desta
  fase; o Chat continua dono de seus documentos. Evita acesso indevido a
  repositório interno, divergência de schema e regressão do frontend. A futura
  integração deve definir migração ou uma camada de compatibilidade explicitamente.
- **`resourceId` composto por ambiente, Câmara e usuário; `threadId` por conversa:**
  corresponde à semântica oficial de resource como proprietário e thread como
  sessão. O ambiente evita colisão e o servidor impede spoofing de tenant.
- **Working memory estruturado com escopo `thread`:** projetos, emendas,
  instituições e orçamento pertencem à conversa, não a todas as conversas do
  usuário. O esquema Zod traz validação e merge previsível; arrays são substituídos
  integralmente, portanto cada atualização deve produzir a lista completa e
  limitada.
- **Catálogo de tools registrado diretamente no Mastra:** extrai handlers e
  schemas para um catálogo interno transport-neutral e usa `createTool` do
  Mastra. O agente não registra tools como MCP e não cria `McpServer`,
  `MCPClient` ou `InMemoryTransport`; criar novas funções por domínio duplicaria
  autenticação, autorização e manutenção.
- **Título determinístico da primeira mensagem:** atende ao PRD sem custo,
  latência ou falha adicional de geração de título. O comportamento é compatível
  com a convenção já existente de conversas do Chat.
- **Bearer local efêmero fora do storage Mastra:** permite testar usuário real
  sem armazenar credencial no Mongo, working memory, trace ou thread. A futura
  integração frontend trocará somente a origem dessa identidade por uma ponte
  autenticada, sem alterar o modelo de resource/thread.

### Riscos conhecidos

| Risco | Impacto | Mitigação e sinal de parada |
| --- | --- | --- |
| Mastra/CLI incompatível com CommonJS ou versões atuais | Bootstrap não inicia | Fazer spike antes de modificar runtime; fixar versões e usar entrypoint/build suportado. Sem compatibilidade comprovada, não instalar parcialmente. |
| Studio persistir bearer em request context, thread ou trace | Exposição de credencial | Usar transporte/autenticação de sessão efêmera; inspecionar armazenamento e traces. Se o segredo persistir, interromper o piloto. |
| Store Mastra e collections Chat divergem | Histórico duplicado/confuso | Manter ownership separado e não sincronizar nesta fase; documentar plano de migração para a tarefa de frontend. |
| `resourceId` aceito do cliente | Vazamento cross-tenant | Derivação server-side, verificação de ownership em toda operação e testes negativos entre usuário/Câmara. |
| Tool Mastra direta contornar policy ou confirmação | Escrita não autorizada | Executar somente via `MunicipalizeToolCatalogService`; provar policy duas vezes em TU/TI. |
| Ambiente development não resolver a URL de QA desejada | Consulta no ambiente errado | Testar a matriz de ambiente e usar cadastro da Câmara; sem fallback/hardcode de URL. |
| Working memory crescer com resultados extensos | Custo, latência e divulgação excessiva | Guardar referências/resumos limitados, usar processors/limites de mensagem e testar payloads grandes. |
| Falha/cancelamento após tool | Estado inconsistente | Propagar `AbortSignal`, persistir working memory somente após resultado normalizado e classificar timeout/cancelamento separadamente. |

### Conformidade com o AGENTS.md e as rules

Foram lidos `municipalize-admin-app/AGENTS.md` e todas as rules em
`municipalize-admin-app/.agents/rules/`: `architecture-standards.md`,
`code-standards.md`, `nestjs.md`, `tests.md` e `typescript.md`.

- A especificação preserva o monólito modular, módulos proprietários e injeção
  por construtor; o domínio não importa Nest, Mongo ou Mastra.
- Não haverá acesso de `MastraStudioModule` aos repositórios/collections do
  `ChatModule`; a colaboração ocorre pelas APIs públicas dos módulos donos.
- Mongo continua com driver oficial; mudança de collection/índice é encapsulada
  no owner e compatível com rollout. Não há Mongoose nem ORM novo.
- A fronteira externa LiteLLM/backend municipal terá configuração tipada,
  timeout, cancelamento e tradução de erros. Tokens e dados sensíveis não são
  incluídos em logs, erros, persistência ou exemplos.
- O código futuro deve obedecer TypeScript estrito, `readonly`, ausência de
  `any`, validação de `unknown`, arquivos/classes até 100 linhas, funções até 30
  linhas e cobertura mínima de 80%.
- Contratos HTTP/SSE do Chat permanecem intocados; o teste de regressão será
  obrigatório antes de concluir a implementação.

### Conformidade com skills

- `nestjs-architecture-principles`: aplicável aos limites de módulo, composição,
  ownership de storage e colaboração pelas APIs públicas.
- `nestjs-oop-design-patterns`: aplicável aos contratos pequenos de sessão,
  resource, thread e adaptação de tools, sem abstrações cerimoniais.
- `nestjs-features-performance`: aplicável a configuração, segurança, timeout,
  cancelamento, erros, testes, logs e lifecycle do bootstrap local.

Não há desvio destas skills. A integração Mastra permanece uma borda de
infraestrutura; regras de autorização, ownership e execução Municipalize não são
movidas para o SDK.

### Arquivos relevantes e dependentes

| Arquivo/diretório | Papel na alteração |
| --- | --- |
| `tasks/prd-migracao-agente-mastra/prd.md` | Fonte de requisitos, critérios de aceitação e escopo. |
| `municipalize-admin-app/package.json` | Novas dependências Mastra pinadas e script local `mastra:dev`. |
| `municipalize-admin-app/src/main.ts` | Não modificar para o piloto; bootstrap Mastra fica separado do listener HTTP de produção. |
| `municipalize-admin-app/src/app.module.ts` | Pode importar `MastraStudioModule` somente se o módulo for inerte fora do script local; preferir composição no bootstrap para não carregar Studio em produção. |
| `municipalize-admin-app/src/config/load-*-environment.ts` | Novo loader Mastra Studio, validação e testes de configuração. |
| `municipalize-admin-app/src/modules/mastra-studio/**` | Novo módulo, bootstrap adapters, agente, lifecycle de threads, schema de contexto e sessão local. |
| `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tool-registrar.service.ts` e `src/modules/mcp/tools/**` | Fonte dos schemas e handlers atuais; serão extraídos para catálogo transport-neutral sem alterar semântica das tools. |
| `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tool-executor.service.ts` | Referência/consumidor MCP atual; o Mastra não deve importá-lo nem criar transporte MCP. |
| `municipalize-admin-app/src/modules/mcp/auth/request-authentication.service.ts` | Fonte de validação de bearer, usuário e contexto da Câmara. |
| `municipalize-admin-app/src/modules/mcp/context/request-context.ts` | Contexto AsyncLocalStorage que a execução interna de tools deve preservar. |
| `municipalize-admin-app/src/modules/chat/chat.module.ts` | Referência de módulos atuais; seus contratos não mudam. |
| `municipalize-admin-app/src/modules/chat/core/domain/chat/entities/conversation.ts` | Referência histórica de ownership e título; não será compartilhada nem alterada nesta fase. |
| `municipalize-admin-app/src/modules/agent-runtime/**` | Referência para prompt, LiteLLM, tool loop, timeout e streaming; não substituir no piloto. |
| `municipalize-admin-app/tests/modules/mcp/mcp-catalog-compatibility.spec.ts` | Fonte da contagem e compatibilidade do catálogo habilitado. |
| `municipalize-admin-app/tests/modules/chat/**` | Regressão obrigatória dos contratos atuais. |
| `municipalize-admin-app/tests/modules/mastra-studio/**` | Nova suite TU/TI/E2E especificada nesta TechSpec. |
