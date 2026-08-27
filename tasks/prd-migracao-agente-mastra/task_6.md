# Tarefa 6.0: Observabilidade, healthcheck e validação local/QA

## Visão geral

Completar os controles operacionais do piloto e validar o fluxo ponta a ponta no
Mastra Studio local e no ambiente de QA/homologação. A tarefa inclui eventos
estruturados não sensíveis, healthcheck de desenvolvimento, encerramento seguro,
regressão do Chat e evidências mascaradas para as conversas, isolamento e quatro
domínios prioritários.

<skills>
### Conformidade com skills

- `nestjs-features-performance`: observabilidade, healthcheck, shutdown,
  validação de runtime, segurança e testes E2E/integração.
- `nestjs-architecture-principles`: verificação dos limites do módulo Mastra e
  ausência de dependências ou contratos novos de produção.
- `nestjs-oop-design-patterns`: revisão dos contratos públicos e da composição
  final, sem introduzir abstrações durante a validação.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se evidências sem
tokens/cookies/prompts completos/dados pessoais, healthcheck sem chamada
municipal, encerramento gracioso de clients e streams, uso dos scripts reais de
cada projeto, isolamento de ambientes e distinção entre falhas preexistentes e
falhas da alteração. O Studio permanece somente local e não será publicado.
</rules>

<requirements>

- RF1-RF19: validar a funcionalidade completa contra os limites do PRD e da
  TechSpec.
- Registrar apenas os eventos estruturados permitidos: criação/remoção de
  thread, solicitação/confirmação/conclusão/negação de tool, timeout de
  dependência e rejeição de sessão.
- Permitir verificar bootstrap Mastra, conexão Mongo e configuração por
  healthcheck, sem chamar tool municipal nem expor segredo.
- Fechar clients/recursos Mastra e cancelar streams durante shutdown.
- Manter a suite atual do Chat HTTP/SSE verde, com rotas, envelopes e eventos
  inalterados.
- Validar URL de QA pelo cadastro da Câmara e nunca por host fixo no teste.
- Registrar evidências manuais com versão, ambiente, identidade não sensível,
  IDs mascarados e nomes de tools, sem dados pessoais ou bearer.
</requirements>

## Subtarefas

- [x] 6.1 Implementar logs/telemetria dos eventos Mastra e métricas permitidas
  de duração, rounds, tool, status e categoria de falha, com redaction.
- [x] 6.2 Adicionar healthcheck de desenvolvimento para bootstrap, Mongo e
  configuração, sem dependência de consultas municipais.
- [x] 6.3 Integrar shutdown gracioso, cancelamento de execuções e fechamento de
  clients, adapters, readers, timers e streams.
- [x] 6.4 Executar lint, typecheck, build, cobertura mínima de 80% e toda a suite
  de testes da Admin API, diferenciando falhas preexistentes.
- [x] 6.5 Executar o teste de regressão do Chat HTTP/SSE e confirmar que não há
  rota, envelope ou evento alterado.
- [x] 6.6 Validar no Mastra Studio a criação, retomada, listagem, título,
  remoção, isolamento e consultas autorizadas dos quatro domínios no ambiente
  configurado de QA/homologação.
- [x] 6.7 Registrar evidências mascaradas e preparar a entrega para o fluxo
  formal de `executar-qa`, sem marcar o QA final antes da aprovação desse fluxo.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Monitoramento e observabilidade`,
`Abordagem de testes`, `Pontos de integração > QA`, `Endpoints da API`, os
critérios de evidência manual e as considerações de shutdown/cancelamento. Usar
as regras de `e2e/README.md` quando houver automação de navegador; para o
Mastra Studio da Admin API, preferir a API/runtime local ou validação manual
assistida suportada pela versão escolhida.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10

## Testes da tarefa

### Testes de integração (se aplicável)

- [x] TI-10 — preserva Chat HTTP/SSE existente

### Testes E2E (se aplicável)

- [x] E2E-01 — conversa autenticada no Mastra Studio local
- [x] E2E-02 — retoma conversa com entidades municipais
- [x] E2E-03 — lista, reabre e remove thread no Studio
- [x] E2E-04 — isolamento entre usuário/Câmara
- [x] E2E-05 — valida catálogo e consultas dos quatro domínios

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mastra-studio/**`
- `municipalize-admin-app/src/modules/health/**`
- `municipalize-admin-app/src/common/logging/**`
- `municipalize-admin-app/src/modules/chat/**`
- `municipalize-admin-app/tests/modules/chat/**`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
- `municipalize-admin-app/tests/modules/mcp/mcp-catalog-compatibility.spec.ts`
- `e2e/README.md`
