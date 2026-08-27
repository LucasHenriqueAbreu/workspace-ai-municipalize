# Tarefa 4.0: Agente Municipalize e integração com LiteLLM

## Visão geral

Construir o agente `municipalize-assistant` sobre a memória e o contexto
persistente preparados anteriormente, usando o prompt vigente e o provider
LiteLLM compatível com Mastra/AI SDK. A execução deve suportar continuidade de
mensagens, limites externos, cancelamento e tradução segura de falhas, sem
substituir o runtime atual do Chat.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: integração como borda do monólito e
  dependência das APIs de modelo/memória sem mover responsabilidades do Chat.
- `nestjs-oop-design-patterns`: factory do agente e contratos de execução coesos,
  com adaptação somente na fronteira do SDK.
- `nestjs-features-performance`: provider externo, timeout, `AbortSignal`,
  streaming, erros, métricas e encerramento de recursos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se timeout
explícito, cancelamento propagado, retry apenas quando idempotente e aprovado,
tradução de erros de fornecedor, logs sem prompt/token, providers por injeção e
preservação integral dos contratos HTTP/SSE do Chat. Não haverá alteração do
`AgentRuntimeModule` ou das rotas atuais além do wiring necessário e seguro.
</rules>

<requirements>

- RF2: responder considerando o histórico corrente e as tools autorizadas.
- RF7-RF9: usar a thread e a working memory persistentes durante a geração.
- RF16: manter evidências suficientes sem salvar segredos ou credenciais.
- O agente deve ser construído pela `MunicipalizeMastraAgentFactory` com nome,
  instruções, modelo LiteLLM compatível, `Memory` thread-scoped e catálogo de
  tools recebido por composição.
- A chamada ao LiteLLM deve encaminhar somente metadados permitidos e possuir
  timeout, cancelamento e tradução de respostas inválidas.
- Estado incompleto após timeout/cancelamento não deve ser persistido como
  sucesso.
- O processo normal da Admin API deve continuar inicializando o Chat existente
  sem depender do Studio.
</requirements>

## Subtarefas

- [x] 4.1 Implementar a factory do agente, suas instruções e a integração com o
  prompt vigente, mantendo o modelo como configuração tipada.
- [x] 4.2 Conectar o provider LiteLLM/AI SDK validado no spike à execução Mastra,
  com metadados permitidos de usuário, Câmara e ambiente.
- [x] 4.3 Integrar `Memory` ao `resourceId` e `threadId` validados, mantendo o
  histórico entre turnos e contextos Mastra recriados.
- [x] 4.4 Implementar timeout, `AbortSignal`, classificação de cancelamento,
  indisponibilidade e resposta inválida, com limites e retry somente seguro.
- [x] 4.5 Mapear falhas de SDK/HTTP para erros da aplicação sem expor detalhes do
  fornecedor e sem alterar o envelope ou os eventos do Chat.
- [x] 4.6 Testar a composição do agente e a interrupção de modelo/tool antes de
  persistir estado de sucesso.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Arquitetura do sistema`, `MunicipalizeMastraAgentFactory`,
`StudioSessionConfiguration`, `Pontos de integração > LiteLLM`, `Falhas
externas`, `Monitoramento e observabilidade` e os riscos de cancelamento e
estado inconsistente. Usar o `agent-runtime` atual como referência de prompt,
timeout e streaming, sem convertê-lo nem substituí-lo nesta tarefa.

## Critérios de aceitação relacionados

- CA-01
- CA-03
- CA-07
- CA-09
- CA-10

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-09 — classifica timeout, cancelamento e erro de fornecedor

### Testes de integração (se aplicável)

- [ ] TI-09 — propaga cancelamento ao modelo e à tool

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/agent-runtime/**`
- `municipalize-admin-app/src/modules/ai-models/**`
- `municipalize-admin-app/src/config/load-chat-environment.ts`
- `municipalize-admin-app/src/modules/chat/prompts/**`
- `municipalize-admin-app/tests/modules/agent-runtime/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
