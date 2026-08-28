# Tarefa 6.0: Chat como borda HTTP/SSE do harness

## Visão geral

Substituir a orquestração interna do Chat por adapters finos para o harness,
catálogo e governança, preservando integralmente as rotas, DTOs, guards,
headers, status, envelopes de erro e eventos SSE consumidos pelo frontend. O
Chat deve combinar autenticação, validação, deadline e desconexão, transmitir
eventos normalizados e não persistir conversa, mensagens ou consumo.

<skills>
### Conformidade com skills

- `nestjs-features-performance`: liderança sobre HTTP/SSE, filters, erros,
  deadlines, cancelamento, limpeza de recursos e contrato de transporte.
- `nestjs-architecture-principles`: Chat como adapter e dependências somente
  pelas APIs públicas dos módulos proprietários.
- `nestjs-oop-design-patterns`: mappers e adapters coesos, sem absorver regras
  de negócio ou persistência.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se preservação de
contratos HTTP/SSE, bearer obrigatório, envelope `{ error: { name, message } }`,
erro após headers como evento SSE, cancelamento upstream, ausência de acesso a
Mongo/provider e testes de stream, autorização e redaction. Não há desvios.
</rules>

<requirements>

- RF1-RF5: manter todos os contratos públicos e transmitir a resposta do
  harness sem expor detalhes internos.
- RF17.1: remover cálculos e gravações de consumo do Chat.
- RF28: depender apenas das APIs públicas mínimas de harness, modelos e
  governança.
</requirements>

## Subtarefas

- [x] 6.1 Adaptar controllers e services de mensagens para construir o
  `HarnessExecutionInput` com identidade, modelo elegível e `AbortSignal`.
- [x] 6.2 Implementar o mapper de `HarnessEvent` para os eventos SSE atuais,
  incluindo `conversation`, `delta`, `used_tools`, `mutation`, `token_usage`,
  `done` e `error`.
- [x] 6.3 Preservar métodos, rotas, DTOs, headers, status e `ChatExceptionFilter`,
  traduzindo erros de domínio para o envelope público vigente.
- [x] 6.4 Adaptar lifecycle de conversas e consultas de uso para os serviços
  públicos do harness e da governança, sem acessar collections legadas.
- [x] 6.5 Propagar desconexão e deadline, interromper escritas após abort e
  liberar readers, listeners e timers em `finally`.
- [x] 6.6 Remover do caminho produtivo as chamadas diretas a LiteLLM, Mastra,
  tools e persistência de Chat, mantendo compatibilidade durante coexistência.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Arquitetura do sistema`, `Principais
interfaces`, `HarnessEvent`, `ChatErrorEnvelope`, `Endpoints da API`, `Pontos de
integração` e `Abordagem de testes`. O adapter do Chat é a única camada que
converte eventos internos para SSE público.

## Critérios de aceitação relacionados

- CA-01
- CA-03

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-08 — normaliza eventos Mastra

### Testes de integração (se aplicável)

- [x] TI-03 — transmite stream pelo harness

### Testes E2E (se aplicável)

- [ ] Não aplicável nesta tarefa; os fluxos de browser/API completos ficam na
  tarefa 9.0.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/chat/chat.module.ts`
- `municipalize-admin-app/src/modules/chat/chat.providers.ts`
- `municipalize-admin-app/src/modules/chat/messages/**`
- `municipalize-admin-app/src/modules/chat/conversations/**`
- `municipalize-admin-app/src/modules/chat/usage/**`
- `municipalize-admin-app/src/modules/chat/chat-exception.filter.ts`
- `municipalize-admin-app/src/modules/agent-harness/presentation/internal/**`
- `municipalize-admin-app/tests/modules/chat/**`
