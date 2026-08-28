# Tarefa 5.0: Agent Harness Mastra e ownership de conversas

## Visão geral

Criar o `AgentHarnessModule` como dono da conversa, memória, contexto de
entidades e execução do agente. Migrar o código útil do piloto Mastra para o
MongoDB já usado pela Admin API, derivar ownership a partir da identidade
autorizada, coordenar modelo/guidance/tools/governança e emitir eventos internos
normalizados com cancelamento e serialização por conversa.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: novo módulo, ownership de collections,
  ports, exports e grafo acíclico.
- `nestjs-oop-design-patterns`: entidades, policies de ownership, use cases,
  adapters Mastra/LiteLLM e seams de teste.
- `nestjs-features-performance`: Mongo, memória limitada, deadlines,
  cancelamento, falhas externas e lifecycle de recursos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se monólito
modular, DI por construtor, domínio sem framework/fornecedor, Mongo oficial,
collections próprias, isolamento por cliente/ambiente/usuário/conversa,
timeouts, redaction, shutdown e cobertura direta. Não há desvios planejados.
</rules>

<requirements>

- RF6-RF8: executar pelo fluxo único, criar/recuperar/listar/renomear/arquivar
  conversas e manter histórico/contexto mínimo.
- RF9-RF11: usar tools autorizadas, confirmação e cancelamento/deadline.
- RF25: fornecer contexto dinâmico autorizado, sem aceitar conteúdo do cliente
  como prova de autorização.
- RF28-RF29 e RF32.1: consumir APIs públicas, usar o Mongo/database existente e
  collections `mastra_*`, sem banco ou credencial Mastra separados.
</requirements>

## Subtarefas

- [x] 5.1 Criar a estrutura de módulo, contratos, entidades, value objects,
  policies, erros e use cases previstos na TechSpec.
- [x] 5.2 Implementar store de ownership/thread com índices, paginação,
  lifecycle e mapeamento explícito entre domínio e documentos Mongo.
- [x] 5.3 Derivar `resourceId` e contexto autorizado de cliente, ambiente,
  usuário, função e bearer já validado; rejeitar divergências do body.
- [x] 5.4 Migrar memória, thread, histórico e contexto de entidades do Studio
  para o harness, com limites e serialização por `conversationId`.
- [x] 5.5 Adaptar Mastra, LiteLLM e tools para a execução com `AbortSignal`,
  deadlines, eventos seguros e resultado final de uso.
- [x] 5.6 Integrar reserva/liquidação e guidance pelas APIs públicas, sem
  persistir token, prompt, corpo de fornecedor ou dado municipal desnecessário.
- [x] 5.7 Implementar lifecycle Nest para liberar readers, listeners, timers,
  clients e streams durante cancelamento e shutdown.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Visão dos componentes`, `Organização
por camadas`, `Principais interfaces`, `HarnessExecutionInput`, `HarnessEvent`,
`MastraConversationOwnership`, `Pontos de integração`, `Riscos conhecidos` e
`Sequenciamento do desenvolvimento`. Não remover ainda o CRUD legado; a
coexistência e a retirada ficam nas tarefas 7.0 e 10.0.

## Critérios de aceitação relacionados

- CA-02
- CA-03
- CA-12

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-06 — deriva ownership da identidade
- [x] TU-09 — propaga cancelamento/deadline

### Testes de integração (se aplicável)

- [x] TI-02 — persiste thread no Mongo Admin API

### Testes E2E (se aplicável)

- [ ] Não aplicável nesta tarefa; a retomada integrada é validada por E2E-02 na
  tarefa 9.0.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/agent-harness/**`
- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/execution-identity/**`
- `municipalize-admin-app/src/database/**`
- `municipalize-admin-app/tests/modules/agent-harness/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
- `municipalize-admin-app/tests/modules/execution-identity/**`
