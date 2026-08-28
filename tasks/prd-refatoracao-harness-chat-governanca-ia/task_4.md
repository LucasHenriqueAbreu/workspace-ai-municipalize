# Tarefa 4.0: Guidance versionado e adaptação segura de tools

## Visão geral

Separar as instruções da Gracy por experiência, segurança/operação e domínio,
com versão e proprietário funcional, e disponibilizar essa policy ao harness.
Adaptar somente tools habilitadas pelo catálogo vigente, preservando schemas,
autorização, confirmação e execução no `ToolsModule` e no `ms-main`.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership de guidance e tools, exports
  mínimos e dependência do harness por APIs públicas.
- `nestjs-oop-design-patterns`: composição de policy, adapters e invariantes de
  confirmação sem criar abstrações genéricas.
- `nestjs-features-performance`: autenticação/autorização, redaction, erros,
  cancelamento e contrato de tools externas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se validação em
código além de prompt, tools autorizadas, confirmação única, isolamento,
schemas tipados, ausência de segredos/prompts em logs, timeout e testes de
acesso cruzado. Não há desvios planejados.
</rules>

<requirements>

- RF9-RF10: adaptar tools habilitadas e exigir confirmação válida, única e
  vinculada à conversa, ação, owner e contexto.
- RF22-RF27: compor policy classificável, versionada, rastreável e comum ao
  Chat e ao Studio sem registrar o texto privado.
- RF30: manter schemas, disponibilidade, risco, confirmação e execução sob
  ownership do `ToolsModule`.
</requirements>

## Subtarefas

- [x] 4.1 Modelar `AppliedGuidance`, versões, owner, finalidade e seções de
  experiência, segurança e domínio/tool.
- [x] 4.2 Migrar o conteúdo vigente para a composição versionada sem duplicar
  regras de autorização ou validação de negócio.
- [x] 4.3 Expor `AgentGuidanceService.compose` e garantir que o texto integral
  não entre em logs, SSE, telemetria ou registros de consumo.
- [x] 4.4 Implementar o adapter Mastra para schemas e tools habilitadas por
  `ToolCatalogService.listEnabled()`.
- [x] 4.5 Integrar confirmação e execução ao `ToolsModule`, vinculando contexto,
  conversa, ação e `executionId`, com cancelamento propagado.
- [x] 4.6 Cobrir redaction, tool desabilitada, mutação sem confirmação e policy
  equivalente para consumidores diferentes.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `AppliedGuidance`, `Principais
interfaces`, `Pontos de integração > Tools e ms-main`, `Abordagem de testes`,
`Monitoramento e observabilidade` e `Considerações técnicas`. O harness apenas
coordena/adapta; a autorização definitiva permanece nas capacidades
proprietárias.

## Critérios de aceitação relacionados

- CA-03
- CA-08

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-05 — compõe guidance versionado
- [x] TU-07 — adapta só tools habilitadas

### Testes de integração (se aplicável)

- [ ] Não aplicável além da integração de confirmação da tarefa 8.0.

### Testes E2E (se aplicável)

- [ ] Não aplicável; a paridade completa é validada por E2E-05 na tarefa 8.0.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/agent-guidance/**`
- `municipalize-admin-app/src/modules/tools/**`
- `municipalize-admin-app/src/modules/chat/prompts/**`
- `municipalize-admin-app/tests/modules/agent-guidance/**`
- `municipalize-admin-app/tests/modules/tools/**`
- `municipalize-admin-app/tests/modules/chat/model-tool-confirmation.spec.ts`
