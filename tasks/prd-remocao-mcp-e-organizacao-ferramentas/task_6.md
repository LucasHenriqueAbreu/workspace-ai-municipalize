# Tarefa 6.0: Adaptar AgentRuntime, Chat e Mastra

## Visão geral

Migrar os consumidores internos para o catálogo e a orientação nativos,
preservando o comportamento do runtime, a confirmação de mutações e todos os
contratos HTTP/SSE ativos do Chat.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: conectar consumidores às APIs públicas de
  tools e guidance sem deep imports, ciclos ou duplicação de ownership.
- `nestjs-oop-design-patterns`: adaptar factories, contextos e serviços dos
  consumidores mantendo responsabilidades coesas.
- `nestjs-features-performance`: preservar contratos HTTP/SSE, confirmação,
  cancelamento, erros públicos, eventos e redaction.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se preservação de rotas, métodos, payloads,
status, headers e eventos SSE; confirmação controlada pelo runtime; bearer fora
de logs; cancelamento e limpeza de streams; providers injetados e exports
mínimos. Não há desvio planejado.
</rules>

<requirements>

- RF1, RF2, RF3, RF5, RF6, RF7, RF16 e RF17.
- AgentRuntime deve usar as 89 tools habilitadas, manter confirmação, oito
  rodadas e eventos atuais.
- Chat deve encaminhar tool calls ao catálogo sem cliente HTTP JSON-RPC nem
  URL de backend fornecida na entrada.
- Mastra deve converter definições nativas para `createTool`, usar
  `requireApproval` e executar somente após aprovação nativa com `confirmed: true`.
- Preservar contratos HTTP/SSE, incluindo envelopes de erro e eventos
  `conversation`, `delta`, `used_tools`, `mutation`, `done` e `error`.
</requirements>

## Subtarefas

- [x] 6.1 Atualizar `AgentRuntimeModule` para importar `ToolsModule` e
  `AgentGuidanceModule` e usar o catálogo direto.
- [x] 6.2 Adaptar `ChatModule`, providers, orquestração, confirmação e filtro
  para os resultados e erros internos nativos.
- [x] 6.3 Adaptar `MastraStudioModule`, factories, contexto e identidade para
  consumir tools sem `McpServer`, adapters ou tipos MCP.
- [x] 6.4 Remover tokens, nomes e imports MCP dos consumidores sem alterar o
  contrato público do Chat.
- [x] 6.5 Executar e atualizar as suítes existentes de AgentRuntime, Chat e
  Mastra para cobrir sucesso, confirmação, falha e cancelamento.

## Detalhes de implementação

Consultar `techspec.md`, seções **Visão dos componentes**, **Fluxo alvo**,
**Endpoints da API**, **Pontos de integração**, **Abordagem de testes** e
**Principais decisões**. A ausência de testes HTTP/SSE duplicados nesta
iniciativa não dispensa a execução dos testes de contrato já existentes quando
os consumidores forem alterados.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-04
- CA-07
- CA-09

## Testes da tarefa

### Testes de unidade

- [x] Regressão de confirmação e conversão de tool no AgentRuntime.
- [x] Regressão de confirmação nativa e execução no Mastra.
- [x] Regressão de envelopes de erro e mapeamento de resultados no Chat.

### Testes de integração

- [x] TI-01 — executa tool de leitura no grafo real de módulos.
- [x] TI-02 — bloqueia mutação antes de chamar o backend.
- [x] Regressão dos contratos HTTP e SSE existentes do Chat, incluindo eventos
  de sucesso, mutação, erro, conclusão e cancelamento.

### Testes E2E

- Não aplicável nesta tarefa; os cenários de ambiente QA serão executados na
  tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/agent-runtime/**`
- `municipalize-admin-app/src/modules/chat/chat.module.ts`
- `municipalize-admin-app/src/modules/chat/chat.providers.ts`
- `municipalize-admin-app/src/modules/chat/core/**/municipalize-*-tool-*.ts`
- `municipalize-admin-app/src/modules/chat/chat-exception.filter.ts`
- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/tests/modules/agent-runtime/**`
- `municipalize-admin-app/tests/modules/chat/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
