# Tarefa 9.0: Gates operacionais e validação integrada

## Visão geral

Validar a solução integrada antes do marco irreversível. A tarefa deve fechar
observabilidade redigida, healthcheck, shutdown e documentação operacional,
executar testes de isolamento, Chat, streaming, confirmação, disponibilidade e
uso nos ambientes controlados e registrar evidências sanitizadas, critérios de
promoção, abortagem e rollback.

<skills>
### Conformidade com skills

- `nestjs-features-performance`: ownership principal de testes de transporte,
  segurança, reliability, observabilidade, healthcheck e rollout.
- `nestjs-architecture-principles`: validação do grafo e das fronteiras sem
  introduzir nova abstração durante os gates.
- `nestjs-oop-design-patterns`: verificação de contratos públicos e invariantes
  sem refatoração oportunista.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se testes
determinísticos e isolados, cobertura mínima de 80%, evidências sem tokens,
prompts ou PII, healthcheck sem chamar modelo/tool, shutdown gracioso,
isolamento entre tenants, execução pelos scripts reais e distinção de falhas
preexistentes. Não há desvios planejados.
</rules>

<requirements>

- RF1-RF30: validar contratos, autorização, isolamento, tools, guidance,
  governança, streams e fronteiras do grafo.
- RF31-RF33: validar prechecks de migração, ausência de dependências proibidas
  e prontidão para retirada.
- CA-01 a CA-07 e CA-12: comprovar o comportamento produtivo integrado antes
  do cutover.
</requirements>

## Subtarefas

- [x] 9.1 Implementar/validar logs, métricas e redaction com executionId,
  categoria, duração, modelo/provedor e policyVersion, sem dados sensíveis.
- [x] 9.2 Validar healthcheck de configuração, Mongo e composição sem chamar
  LiteLLM, tool municipal ou backend de cliente.
- [x] 9.3 Validar shutdown, cancelamento de streams, fechamento de Mongo,
  readers, listeners, timers e clients.
- [x] 9.4 Executar lint, typecheck, testes, cobertura V8, build e buscas
  estáticas de contratos, ciclos, segredos e referências proibidas.
- [ ] 9.5 Executar integração controlada com Mongo, Keycloak, LiteLLM e backend
  municipal, usando dados e credenciais fornecidos pelo ambiente, nunca pelo
  repositório.
- [ ] 9.6 Executar E2E de streaming, retomada isolada, confirmação, disponibilidade
  e uso, registrar evidências e aprovar ou bloquear a retirada.
- [x] 9.7 Registrar janela de observação, sinais de abortagem, owners, backup e
  procedimento de rollback pré-retirada.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Abordagem de testes`, `Monitoramento e
observabilidade`, `Considerações técnicas`, `Riscos conhecidos`,
`Sequenciamento > Gates e operação` e `Dependências técnicas`. Usar o projeto
central `e2e/` quando o caso exigir navegador; não criar configuração E2E nova
na Admin API.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-12

## Testes da tarefa

### Testes de unidade (se aplicável)

- [ ] Não há caso unitário formal adicional; os testes unitários são executados
  como gate das tarefas anteriores.

### Testes de integração (se aplicável)

- [x] TI-06 — bloqueia acesso cruzado

### Testes E2E (se aplicável)

- [ ] E2E-01 — conversa streaming pelo frontend atual
- [ ] E2E-02 — retoma conversa isolada
- [ ] E2E-03 — mutação exige confirmação
- [ ] E2E-04 — disponibilidade/uso por Câmara e usuário

## Arquivos relevantes

- `municipalize-admin-app/src/common/**`
- `municipalize-admin-app/src/modules/health/**`
- `municipalize-admin-app/src/modules/chat/**`
- `municipalize-admin-app/src/modules/agent-harness/**`
- `municipalize-admin-app/src/modules/ai-consumption/**`
- `municipalize-admin-app/src/modules/tools/**`
- `municipalize-admin-app/tests/**`
- `e2e/**`
- `e2e/README.md`

## Bloqueios de execução

As subtarefas 9.5 e 9.6 permanecem pendentes. Nesta execução, o Docker Desktop
foi iniciado, mas `e2e/.env` ainda não possui `E2E_REAL_USER_EMAIL` e
`E2E_REAL_USER_PASSWORD`; a validação antecipada interrompeu o processo antes
de criar containers. Além disso, a suíte E2E central ainda não possui os
cenários Chat E2E-01 a E2E-04. A suíte disponível executou 19 cenários do
dashboard, com 12 aprovados e 7 falhas fora do escopo do Chat. Não há evidência
suficiente para aprovar a integração controlada ou a retirada do legado.
