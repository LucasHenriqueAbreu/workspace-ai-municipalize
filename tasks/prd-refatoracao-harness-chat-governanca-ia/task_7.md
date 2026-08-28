# Tarefa 7.0: Backfill, coexistência e migração idempotente de dados

## Visão geral

Migrar conversas, mensagens e registros de uso existentes para as capacidades
proprietárias sem perda de ownership, histórico, contexto ou totais. A
migração deve ser repetível, executada em lotes, comparável por conversa e
capaz de sustentar leitura controlada e rollback até o marco de retirada.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership de dados, ordem expandir →
  migrar → coexistir e fronteira de migration/backfill.
- `nestjs-oop-design-patterns`: mappers de documentos, invariantes de
  idempotência e ledger de migração.
- `nestjs-features-performance`: operações em lote, limites, atomicidade,
  observabilidade, backup e rollback seguro.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se preservação de
collections até a equivalência, driver Mongo oficial, backfill idempotente,
isolamento, dados sintéticos, limites de lote, não exposição de dados sensíveis,
backup recuperável, rollback explícito e nenhuma execução de repositório legado.
Não há desvios planejados.
</rules>

<requirements>

- RF31: preservar/migrar conversas e uso sem perda de propriedade, isolamento,
  histórico ou totais.
- RF32.1: gravar threads/memória no Mongo e database existentes, em collections
  `mastra_*` próprias.
- CA-11: repetir a migração sem duplicar dados ou alterar ownership.
</requirements>

## Subtarefas

- [x] 7.1 Implementar a leitura controlada das collections antigas e o mapeamento
  para documentos do harness e do ledger de consumo.
- [x] 7.2 Criar chave estável, ledger de migração, lotes limitados e comportamento
  seguro para reexecução parcial ou completa.
- [x] 7.3 Preservar ID, owner, cliente, ambiente, status, título, ordem,
  histórico, contexto e totais conforme a validação de equivalência.
- [x] 7.4 Executar contagem, hash, validação de ownership e comparação de
  agregados antes de habilitar leitura Mastra controlada.
- [x] 7.5 Criar export/backup recuperável, registrar a janela de rollback e
  documentar prechecks, sinais de falha e procedimento de retorno.
- [x] 7.6 Adicionar métricas e logs redigidos de progresso, falha, reexecução e
  atraso de reconciliação.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Retirada do armazenamento e CRUD
legado de conversa`, `Sequenciamento do desenvolvimento > Dados`, `Abordagem de
testes`, `Riscos conhecidos`, `Monitoramento e observabilidade` e as regras de
continuidade de dados. As collections antigas permanecem read-only até a
aprovação da retirada.

## Critérios de aceitação relacionados

- CA-11

## Testes da tarefa

### Testes de unidade (se aplicável)

- [ ] Não há caso unitário formal exclusivo nesta etapa; os invariantes de
  conversão são cobertos por TU-10 na tarefa 10.0.

### Testes de integração (se aplicável)

- [x] TI-07 — executa backfill repetível

### Testes E2E (se aplicável)

- [ ] Não aplicável; rollout, rollback e retirada são validados por E2E-06 na
  tarefa 10.0.

## Arquivos relevantes

- `municipalize-admin-app/src/scripts/**`
- `municipalize-admin-app/src/modules/agent-harness/infrastructure/persistence/**`
- `municipalize-admin-app/src/modules/ai-consumption/infrastructure/persistence/**`
- `municipalize-admin-app/src/database/**`
- `municipalize-admin-app/docs/**`
- `municipalize-admin-app/tests/migrations/**`
- `municipalize-admin-app/tests/modules/agent-harness/**`
- `municipalize-admin-app/tests/modules/ai-consumption/**`
