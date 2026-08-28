# Tarefa 8.0: Executar integração QA, E2E e o gate final

## Visão geral

Validar a execução nativa de tools no grafo real e no ambiente QA, incluindo
autenticação, isolamento, backend municipal, confirmação, cancelamento e
ausência de MCP no artefato. Ao final, executar o gate de qualidade e registrar
evidências, sinais de promoção e rollback.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: validar composição, exports e direção do
  grafo real de módulos.
- `nestjs-features-performance`: liderar testes de integração/E2E, segurança,
  cobertura, observabilidade, smoke, promoção e rollback.
- `nestjs-oop-design-patterns`: confirmar comportamento público dos objetos e
  adapters nas fronteiras exercitadas.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se fixtures determinísticas, nenhum segredo
em logs ou artefatos, bancos e serviços isolados, encerramento gracioso,
execução dos comandos obrigatórios, cobertura mínima de 80%, smoke representativo
e rollback por artefato anterior. Não há desvio planejado.
</rules>

<requirements>

- Validar CA-01 a CA-10 em conjunto, com foco nos cenários cobertos pela
  TechSpec.
- Criar runner Node/Vitest one-shot que obtenha `ToolCatalogService` por DI,
  sem endpoint de teste, navegador, frontend, LiteLLM ou Mastra.
- Usar Keycloak, Mongo administrativo e `ms-main` isolados somente nos testes
  que exigem ambiente real; manter bearer em memória e nunca exibi-lo.
- Registrar evidências de sucesso/falha, cobertura, build, smoke e rollback.
</requirements>

## Subtarefas

- [x] 8.1 Criar runner E2E e fixture determinística para cliente, usuário,
  vínculos e entidades municipais necessárias.
- [x] 8.2 Executar E2E-01 para leitura autenticada e verificar dados da Câmara
  seeded e backend autorizado.
- [x] 8.3 Executar E2E-02 para mutação sem confirmação, confirmação controlada,
  efeito único e estado final reconciliado.
- [x] 8.4 Executar E2E-03 para contexto de tenant inválido ou divergente e
  ausência de efeito no backend.
- [x] 8.5 Executar E2E-04 para startup com variáveis neutras, assets, catálogo e
  ausência de rota, SDK ou configuração MCP no artefato.
- [x] 8.6 Executar lint, typecheck, testes, cobertura e build; validar contratos
  Chat/SSE, smoke de homologação, observabilidade e plano de rollback.

## Detalhes de implementação

Consultar `techspec.md`, seções **Abordagem de testes**, **Sequenciamento do
desenvolvimento**, **Monitoramento e observabilidade**, **Considerações técnicas**
e **Riscos conhecidos**. O runner deve usar a composição QA existente e limpar
suas fixtures deterministicamente. LiteLLM, browser e os projetos legados não
são dependências desta validação.

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

### Testes de unidade

- [x] Execução da suíte unitária completa com cobertura V8 mínima de 80% em
  statements, branches, functions e lines.

### Testes de integração

- [x] TI-01 — executa tool de leitura no grafo real de módulos.
- [x] TI-02 — bloqueia mutação antes de chamar o backend.
- [x] TI-03 — propaga cancelamento e traduz falha da tool.
- [x] TI-04 — rejeita identidade ou cliente divergente durante execução.

### Testes E2E

- [x] E2E-01 — executa tool de leitura autenticada no ambiente QA.
- [x] E2E-02 — executa mutação confirmada no ambiente QA.
- [x] E2E-03 — recusa contexto de tenant inválido no ambiente QA.
- [x] E2E-04 — valida artefato sem MCP no ambiente QA.

## Arquivos relevantes

- `municipalize-admin-app/e2e/scripts/**`
- `municipalize-admin-app/e2e/docker-compose.ms-main.qa.yaml`
- `municipalize-admin-app/tests/modules/{tools,backend-gateway,execution-identity,agent-guidance}/**`
- `municipalize-admin-app/tests/modules/{agent-runtime,chat,mastra-studio}/**`
- `municipalize-admin-app/vitest.config.ts`
- `municipalize-admin-app/package.json`
- `municipalize-admin-app/nest-cli.json`
- `municipalize-admin-app/dist/**`
- `tasks/prd-remocao-mcp-e-organizacao-ferramentas/qa.md`
