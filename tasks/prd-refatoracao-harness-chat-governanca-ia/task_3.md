# Tarefa 3.0: Governança de consumo, reserva e liquidação

## Visão geral

Criar o `AiConsumptionModule` como dono exclusivo da autorização, reserva,
liquidação idempotente, saldos e consultas de uso. A capacidade deve avaliar o
snapshot da Câmara e da função do usuário antes do modelo, registrar uma única
ocorrência após a execução e tratar custo ausente ou inválido como bloqueio
seguro conforme a política da TechSpec.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership de dados, ports, transação curta
  e API pública de governança.
- `nestjs-oop-design-patterns`: entidades, policies, value object de período e
  invariantes de idempotência.
- `nestjs-features-performance`: autorização, atomicidade, timeout, observabilidade,
  falhas parciais e consultas limitadas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se isolamento por
cliente/ambiente/usuário/função, driver Mongo oficial, índices reais,
transações curtas sem chamadas externas, `executionId` idempotente, custo sem
estimativa silenciosa, redaction, testes negativos e cobertura de 80%. Não há
desvios planejados.
</rules>

<requirements>

- RF16: autorizar por configuração da Câmara, função, alocação, orçamento e
  consumo mensal antes de chamar LiteLLM.
- RF17 e RF17.1: registrar tokens, modelo, provedor, conversa e custo confiável
  somente no módulo de consumo.
- RF18: manter agregados e consultas por Câmara, usuário, modelo, conversa e
  período mensal.
- RF19: bloquear custo `paid`/`unknown` sem fonte confiável e usar USD zero
  somente para `free` autorizado.
- RF20-RF21: impedir duplicidade e preservar consultas públicas existentes.
</requirements>

## Subtarefas

- [x] 3.1 Criar entidades, policies, value objects, erros e comandos de
  autorização/liquidação conforme os contratos internos da TechSpec.
- [x] 3.2 Implementar collections, índices, documentos e repository do ledger
  com o `MongoClient` existente e sem expor tipos Mongo ao domínio.
- [x] 3.3 Implementar reserva anterior à chamada externa, expiração de reservas
  abandonadas e negativa sem efeito em LiteLLM ou tools.
- [x] 3.4 Implementar liquidação atômica/compare-and-set por `executionId`, com
  agregados de Câmara e usuário atualizados somente uma vez.
- [x] 3.5 Implementar `getAvailability` e `getUsage` e adaptar as consultas
  existentes sem alterar seus contratos públicos.
- [x] 3.6 Implementar `settlement_pending`, origem do custo, observabilidade de
  falha e bloqueio até reconciliação sem converter tokens em USD.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `AiConsumptionModule`, `ConsumptionReservation`,
`ConsumptionEvent`, `Endpoints da API`, `Pontos de integração`, `Abordagem de
testes`, `Monitoramento e observabilidade` e `Principais decisões`. LiteLLM e
tools não podem ser chamados dentro da transação de liquidação.

## Critérios de aceitação relacionados

- CA-05
- CA-06
- CA-07

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-02 — autoriza pelo snapshot de Câmara e função
- [x] TU-03 — liquida execução uma vez
- [x] TU-04 — bloqueia custo não liquidável

### Testes de integração (se aplicável)

- [x] TI-05 — liquida e projeta consumo

### Testes E2E (se aplicável)

- [ ] Não aplicável nesta tarefa; o fluxo completo é validado por E2E-04 na
  tarefa 9.0.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/ai-consumption/**`
- `municipalize-admin-app/src/modules/chat/usage/**`
- `municipalize-admin-app/src/modules/chat/integrations/**`
- `municipalize-admin-app/src/database/**`
- `municipalize-admin-app/tests/modules/ai-consumption/**`
- `municipalize-admin-app/tests/modules/chat/get-chat-availability-use-case.spec.ts`
