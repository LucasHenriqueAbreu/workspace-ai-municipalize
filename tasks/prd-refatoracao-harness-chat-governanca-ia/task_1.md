# Tarefa 1.0: Caracterização de contratos, grafo e fundação da migração

## Visão geral

Congelar o comportamento público e o estado arquitetural necessários para a
refatoração. A tarefa deve inventariar consumidores, rotas, eventos SSE,
collections, índices, configuração, providers e dependências do Chat,
Mastra Studio e `agent-runtime`, além de preparar a cobertura e os fixtures que
permitirão executar a migração em passos reversíveis.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: baseline do grafo, ownership e APIs públicas
  do monólito modular.
- `nestjs-features-performance`: contratos HTTP/SSE, configuração, cobertura e
  gates operacionais.
- `nestjs-oop-design-patterns`: testes de caracterização e identificação de
  seams reais sem criar abstrações cerimoniais.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se especialmente
a preservação dos contratos públicos, ownership por módulo, ausência de HTTP
interno, configuração tipada, TypeScript estrito, cobertura de 80%, testes
determinísticos, segurança de segredos, documentação e `git diff --check`. Não
há desvios planejados.
</rules>

<requirements>

- RF1-RF5: caracterizar rotas, envelopes, eventos SSE, autenticação e dados que
  não podem vazar.
- RF28-RF33: registrar o grafo atual, consumidores, collections e o estado
  necessário para a migração e retirada segura.
- CA-14: preparar o gate de cobertura mínima e os comandos de validação final.
</requirements>

## Subtarefas

- [x] 1.1 Inventariar controllers, DTOs, guards, filters, providers, consumers,
  configurações, collections, índices e dependências do Chat, Studio e
  `agent-runtime`.
- [x] 1.2 Criar ou consolidar testes de caracterização dos contratos HTTP/SSE,
  incluindo status, headers, payloads, envelopes, sequência de eventos e
  falhas antes/depois dos headers.
- [x] 1.3 Registrar as fronteiras de ownership e criar verificações de grafo,
  imports e exports que impeçam HTTP próprio, deep imports e acesso direto a
  persistência de outra feature.
- [x] 1.4 Configurar a cobertura V8 do Vitest com thresholds de 80% para
  statements, branches, functions e lines, sem excluir código de negócio.
- [x] 1.5 Preparar fixtures sintéticos, identificadores determinísticos e o
  registro de estado necessário para backfill, rollback e comparação de dados.
- [x] 1.6 Documentar comandos, dependências, ambientes, sinais de sucesso e
  critérios de parada para as tarefas subsequentes.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Arquitetura do sistema`, `Endpoints da
API`, `Abordagem de testes`, `Sequenciamento do desenvolvimento`,
`Monitoramento e observabilidade` e `Arquivos relevantes e dependentes`. A
caracterização não deve alterar o contrato público nem iniciar os repositórios
legados.

## Critérios de aceitação relacionados

- CA-01
- CA-10
- CA-14

## Testes da tarefa

Testes de caracterização abaixo são preparatórios e não substituem os casos
formais da TechSpec.

### Testes de unidade (se aplicável)

- [x] Caracterização de DTOs, mapeamento de erros e normalização de eventos
  vigentes.
- [x] Configuração do threshold V8 para as quatro métricas obrigatórias.

### Testes de integração (se aplicável)

- [x] Caracterização HTTP/SSE da aplicação Nest inicializada, incluindo erro
  após headers e limpeza de stream.

### Testes E2E (se aplicável)

- [ ] Não aplicável nesta tarefa; os fluxos E2E ficam nas tarefas 9.0 e 10.0.

## Arquivos relevantes

- `municipalize-admin-app/package.json`
- `municipalize-admin-app/vitest.config.ts`
- `municipalize-admin-app/src/app.module.ts`
- `municipalize-admin-app/src/modules/chat/**`
- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/agent-runtime/**`
- `municipalize-admin-app/src/config/**`
- `municipalize-admin-app/tests/modules/chat/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
- `municipalize-admin-app/tests/modules/agent-runtime/**`
