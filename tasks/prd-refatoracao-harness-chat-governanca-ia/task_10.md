# Tarefa 10.0: Cutover e retirada definitiva do legado

## Visão geral

Executar o marco final somente após os gates da tarefa 9.0, equivalência do
backfill, backup recuperável e janela de rollback aprovados. Remover o
`agent-runtime`, o CRUD e a persistência legada de conversa, as collections
`chat_conversations` e `chat_messages`, configurações e testes exclusivos,
mantendo as rotas públicas atendidas exclusivamente pelo harness e pela
governança.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: confirmação do grafo final, ownership e
  remoção de dependências obsoletas sem reintroduzir serviços separados.
- `nestjs-features-performance`: migration destrutiva controlada, backup,
  smoke test, observabilidade, rollback e readiness operacional.
- `nestjs-oop-design-patterns`: remoção de wrappers/providers obsoletos e
  validação de que capacidades migradas continuam em seus donos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se prechecks de
consumidores, banco, índices, configuração e observabilidade; retirada somente
após rollback ensaiado; nenhuma restauração de CRUD legado após o drop;
preservação de contratos, segredos, cobertura, build e `git diff --check`. Não
há desvios planejados.
</rules>

<requirements>

- RF31-RF32: concluir a migração sem perda, duplicidade, dependência de HTTP
  interno, MCP ou repositório legado.
- RF33: retirar `agent-runtime`, adapters diretos, regras duplicadas, loop,
  configurações e testes exclusivos sem remover capacidades migradas.
- CA-10, CA-11, CA-13 e CA-14: provar o grafo final, a retirada, a continuidade
  dos dados e os gates de qualidade.
</requirements>

## Subtarefas

- [ ] 10.1 Executar busca de consumidores em código, frontend, jobs, CI,
  deploy, DNS, secrets, métricas, alertas e dashboards antes do drop.
- [ ] 10.2 Confirmar equivalência final de contagens, hashes, ownership,
  histórico, contexto e totais; gerar e preservar export/backup recuperável.
- [ ] 10.3 Executar a janela aprovada de cutover e o smoke test representativo
  com as rotas públicas, Chat, uso e isolamento.
- [ ] 10.4 Remover providers, adapters, entidades, repositories, documents,
  use cases, imports, configurações e testes exclusivos do CRUD antigo e do
  `agent-runtime`.
- [ ] 10.5 Remover `chat_conversations`, `chat_messages`, índices relacionados e
  `MASTRA_STORAGE_DATABASE_NAME` somente após todos os prechecks.
- [ ] 10.6 Reexecutar composição Nest, busca estática, testes, cobertura, lint,
  typecheck e build; confirmar que o artefato não contém referências proibidas.
- [ ] 10.7 Executar E2E de rollout/rollback de dados, registrar o marco
  irreversível e documentar que pós-drop o retorno depende apenas do backup.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Retirada do armazenamento e CRUD
legado de conversa`, `Sequenciamento > Retirada`, `Sequenciamento > Gates e
operação`, `Monitoramento e observabilidade`, `Riscos conhecidos`, `Abordagem de
testes` e `Arquivos relevantes e dependentes`. Não executar nem restaurar os
repositórios legados `municipalize-chat-api` ou `municipalize-mcp`.

## Critérios de aceitação relacionados

- CA-10
- CA-11
- CA-13
- CA-14

## Testes da tarefa

### Testes de unidade (se aplicável)

- [ ] TU-10 — caracteriza, converte e retira legado

### Testes de integração (se aplicável)

- [ ] TI-01 — compõe grafo sem agent-runtime
- [ ] TI-08 — retira collections e CRUD legados com segurança

### Testes E2E (se aplicável)

- [ ] E2E-06 — rollout, retirada e rollback de dados

## Arquivos relevantes

- `municipalize-admin-app/src/app.module.ts`
- `municipalize-admin-app/src/modules/agent-runtime/**`
- `municipalize-admin-app/src/modules/chat/core/**`
- `municipalize-admin-app/src/modules/chat/chat.providers.ts`
- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/config/**`
- `municipalize-admin-app/src/scripts/**`
- `municipalize-admin-app/tests/modules/agent-runtime/**`
- `municipalize-admin-app/tests/modules/chat/**`
- `municipalize-admin-app/tests/modules/agent-harness/**`
- `municipalize-admin-app/tests/modules/ai-consumption/**`
- `e2e/**`
