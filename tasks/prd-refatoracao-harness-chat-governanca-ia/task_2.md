# Tarefa 2.0: Catálogo e elegibilidade de modelos

## Visão geral

Consolidar o catálogo de modelos como a única capacidade responsável por
descrever e resolver modelos habilitados e compatíveis com o harness. A
seleção deve validar streaming, tools, janela de contexto e classificação
comercial antes de qualquer reserva ou chamada ao modelo, sem incorporar
orçamento, saldo ou consumo ao catálogo.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership do catálogo e API pública mínima
  para consumidores.
- `nestjs-oop-design-patterns`: projeção de elegibilidade, invariantes e
  adaptação de respostas externas.
- `nestjs-features-performance`: validação de dados externos, timeout, erros
  seguros e contrato HTTP existente.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se ownership
exclusivo do `AiModelsModule`, DI por construtor, `unknown` nas fronteiras
externas, unions explícitas, erros tipados, timeout, ausência de segredos em
logs e cobertura direta de sucesso e recusa. Não há desvios planejados.
</rules>

<requirements>

- RF12: listar somente modelos habilitados e compatíveis com streaming e tools.
- RF13: expor internamente identificador, provedor, limites, capacidades e
  classificação `free`, `paid` ou `unknown`.
- RF14: recusar modelo ausente, indisponível ou incompatível antes da execução
  e da reserva.
- RF15: impedir que catálogo leia ou decida orçamento, saldo e consumo.
</requirements>

## Subtarefas

- [x] 2.1 Definir ou ajustar os tipos de `AiModel`, requisitos de seleção e
  erros de elegibilidade conforme a TechSpec.
- [x] 2.2 Adaptar o gateway de catálogo para validar respostas externas e
  traduzir falhas sem vazar payloads do provedor.
- [x] 2.3 Implementar `listEligible` e `resolveEligible`, mantendo o catálogo
  independente da governança de consumo.
- [x] 2.4 Atualizar o adapter de `/api/chat/models` para preservar o contrato
  público sem expor preço, orçamento ou saldo.
- [x] 2.5 Cobrir modelos sem streaming/tools, custo não confiável, modelo
  inexistente e seleção válida.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Visão dos componentes`, `Principais
interfaces`, `AiModel`, `Endpoints da API > GET /api/chat/models`, `Pontos de
integração` e `Abordagem de testes`. O catálogo deve ser consumido pela API
pública do módulo; não criar imports profundos nem duplicar regras comerciais.

## Critérios de aceitação relacionados

- CA-04

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-01 — resolve somente modelo compatível

### Testes de integração (se aplicável)

- [ ] Não aplicável além dos testes de contrato já caracterizados na tarefa
  1.0.

### Testes E2E (se aplicável)

- [ ] Não aplicável; a disponibilidade integrada é validada por E2E-04 na
  tarefa 9.0.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/ai-models/**`
- `municipalize-admin-app/src/modules/chat/models/**`
- `municipalize-admin-app/tests/modules/ai-models/**`
- `municipalize-admin-app/tests/modules/chat/chat-models.http.spec.ts`
