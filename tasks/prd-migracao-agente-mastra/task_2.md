# Tarefa 2.0: Bootstrap Mastra e sessão local autenticada

## Visão geral

Criar a composição de desenvolvimento que expõe o agente ao Mastra Studio por
meio de um contexto Nest, sem abrir uma segunda porta HTTP nem alterar a API de
produção. A sessão deve resolver a identidade pelo bearer efêmero usando os
serviços existentes, derivar o contexto autorizado e recusar a execução quando a
identidade estiver ausente, inválida ou não autorizada.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: módulo de feature, composição root, APIs
  públicas e dependência dos módulos proprietários.
- `nestjs-oop-design-patterns`: responsabilidades de bootstrap, sessão,
  identidade e erros, com contratos pequenos e efeitos injetados.
- `nestjs-features-performance`: ciclo de vida Nest, transporte, autenticação,
  erros, cancelamento, segredos e encerramento seguro.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se os limites do
monólito modular, composição por Nest, injeção por construtor, validação do
principal e da autorização, isolamento por usuário/Câmara/ambiente, ausência de
segredos em logs e o envelope seguro `error.name`/`error.message`. Não haverá
alteração em `main.ts` para iniciar o Studio na API normal nem desvio das regras.
</rules>

<requirements>

- RF1: disponibilizar o agente no Mastra Studio local.
- RF4: vincular cada execução ao usuário Keycloak e à Câmara autenticados.
- RF5: recusar contexto ausente, divergente ou não autorizado antes de criar
  thread ou executar tool.
- RF6: obter a URL do backend exclusivamente pelo cliente/Câmara resolvido, sem
  aceitar URL do Studio como fonte de verdade.
- O bootstrap deve criar um `INestApplicationContext` e não um segundo listener
  HTTP.
- `MastraStudioModule` deve colaborar pelas APIs públicas de `CustomersModule`,
  `UsersModule`, `AiModelsModule`, `DatabaseModule` e
  `MunicipalizeToolsModule`, conforme aplicável.
- O bearer deve permanecer fora de mensagens, metadata persistível, working
  memory, traces, logs e outputs; a ausência dele deve gerar erro tipado seguro.
- A execução deve preservar `AuthenticatedRequestContext` e traduzir falhas de
  autenticação, autorização e fornecedor para os códigos locais especificados.
</requirements>

## Subtarefas

- [x] 2.1 Implementar `MastraDevelopmentBootstrap` como entrypoint exclusivo do
  script local, com criação e encerramento do contexto Nest.
- [x] 2.2 Criar `MastraStudioModule` e sua composição com os módulos proprietários
  sem importar repositories ou collections de outra feature.
- [x] 2.3 Implementar `StudioExecutionIdentityService` para validar o bearer por
  `RequestAuthenticationService`, resolver usuário, Câmara, ambiente e backend,
  e produzir o contexto autenticado server-side.
- [x] 2.4 Integrar a extensão de autenticação/transporte suportada pela versão
  fixada do Mastra, comprovando que o bearer é efêmero e não persistível.
- [x] 2.5 Mapear `StudioAuthenticationError` para os códigos e envelope locais,
  sem vazar URL interna, payload bruto, stack trace ou credencial.
- [x] 2.6 Cobrir as recusas de sessão e o wiring mínimo do bootstrap antes de
  permitir a criação de threads ou chamada de tools.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Arquitetura do sistema`, `Design de
implementação > Principais interfaces`, `Modelos de dados > AuthenticatedStudioExecution`,
`StudioAuthenticationError`, `Endpoints da API` e `Pontos de integração >
Autenticação e backend da Câmara`. O Studio deve consumir somente a API de
desenvolvimento do runtime Mastra; `/api/chat/**` e SSE permanecem intocados.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-08

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-02 — rejeita contexto Studio sem bearer/identidade autorizada
- [x] TU-09 — classifica timeout, cancelamento e erro de fornecedor

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/mcp/auth/request-authentication.service.ts`
- `municipalize-admin-app/src/modules/mcp/context/request-context.ts`
- `municipalize-admin-app/src/modules/mcp/integrations/customer-backend-resolver.service.ts`
- `municipalize-admin-app/src/modules/customers/customers.module.ts`
- `municipalize-admin-app/src/modules/users/users.module.ts`
- `municipalize-admin-app/src/modules/ai-models/ai-models.module.ts`
- `municipalize-admin-app/src/database/database.module.ts`
- `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tools.module.ts`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
