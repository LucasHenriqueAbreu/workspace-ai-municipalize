# Tarefa 8.0: Paridade do Mastra Studio e confirmação entre módulos

## Visão geral

Fazer do Mastra Studio um consumidor do mesmo harness e da mesma policy usados
no Chat produtivo. Completar a composição Nest entre Chat, harness, guidance,
tools, modelos e governança, validar o fluxo de confirmação uma única vez e
remover divergências do piloto sem transformar o Studio em interface de
produção.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: composição do grafo, exports mínimos e
  ausência de chamadas HTTP internas ou ciclos.
- `nestjs-oop-design-patterns`: adapter do Studio, contrato de confirmação e
  reuso explícito do caso de uso equivalente.
- `nestjs-features-performance`: segurança, confirmação, wiring Nest, erros e
  testes de integração/E2E.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se mesmo harness
para Chat/Studio, APIs públicas internas, ausência de HTTP próprio, confirmação
vinculada ao contexto, isolamento, configuração tipada, startup determinístico
e nenhum Studio produtivo. Não há desvios planejados.
</rules>

<requirements>

- RF6 e RF26: Chat e Studio devem executar o mesmo caso de uso e receber a
  mesma policy para contexto equivalente.
- RF10 e RF30: confirmação única e execução definitiva continuam no
  `ToolsModule` e nas regras proprietárias.
- RF28-RF29 e RF32: grafo acíclico, sem deep imports, HTTP interno, MCP ou
  repositórios legados como dependência.
</requirements>

## Subtarefas

- [x] 8.1 Substituir o caminho específico do Studio pelo serviço público do
  harness, preservando apenas a borda de validação controlada.
- [x] 8.2 Garantir que Chat e Studio forneçam o mesmo contexto autorizado,
  modelo, tools e versão de guidance em casos equivalentes.
- [x] 8.3 Integrar aprovação, replay e rejeição ao fluxo de confirmação com
  vínculo a ação, conversa, owner, contexto e `executionId`.
- [x] 8.4 Ajustar `AppModule` e módulos de feature para imports/exports mínimos,
  sem `forwardRef()`, `ModuleRef`, HTTP interno ou provider privado exposto.
- [x] 8.5 Remover duplicações de prompt, execução, catálogo e autenticação do
  Studio, mantendo o ambiente somente para validação.
- [x] 8.6 Documentar as divergências deliberadas de ambiente e os limites de
  acesso do Studio.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Visão dos componentes`, `Principais
interfaces`, `AppliedGuidance`, `Pontos de integração`, `Sequenciamento`,
`Monitoramento` e `Conformidade com skills`. A remoção de `agent-runtime` e do
CRUD legado só ocorre na tarefa 10.0 após os gates.

## Critérios de aceitação relacionados

- CA-08
- CA-09
- CA-10

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] Não há caso unitário formal adicional; TU-05 e TU-07 cobrem policy e
  tools nas tarefas 4.0.

### Testes de integração (se aplicável)

- [x] TI-04 — consome confirmação uma vez

### Testes E2E (se aplicável)

- [x] E2E-05 — paridade Chat e Studio, validada pela runtime controlada do harness

## Arquivos relevantes

- `municipalize-admin-app/src/app.module.ts`
- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/agent-harness/**`
- `municipalize-admin-app/src/modules/agent-guidance/**`
- `municipalize-admin-app/src/modules/tools/**`
- `municipalize-admin-app/src/modules/chat/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
- `municipalize-admin-app/tests/modules/agent-harness/**`
- `municipalize-admin-app/tests/architecture/**`
