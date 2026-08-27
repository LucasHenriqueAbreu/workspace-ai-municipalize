# Relatório de QA — Migração do agente para Mastra

As evidências desta rodada estão em `tasks/prd-migracao-agente-mastra/evidences/`.

## Escopo desta rodada

Por decisão de escopo da tarefa, esta rodada valida somente os testes unitários
da `municipalize-admin-app`. Os testes de integração, E2E, browser,
acessibilidade e responsividade ficam fora desta tarefa e devem ser executados
posteriormente em uma validação própria.

O threshold de cobertura foi temporariamente definido em 50%, pois a cobertura
global inclui código preexistente de outras tarefas. Esta redução não representa
a meta definitiva da Admin API.

## Resumo

- Data: 2026-08-27
- Status: APROVADO — escopo unitário da tarefa
- Total de critérios de aceitação do produto: 10
- Critérios verificados por testes unitários: 5 (CA-01, CA-02, CA-05, CA-07 e CA-08)
- Critérios fora do escopo desta tarefa: 5 (CA-03, CA-04, CA-06, CA-09 e CA-10)
- Bugs registrados no ciclo de QA: 4, todos corrigidos

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Usuário autenticado inicia conversa com o agente | TU-09; suíte unitária Mastra | PASSOU no escopo unitário | [testes automatizados](evidences/automated-tests.md) |
| CA-02 | Execução usa usuário/Câmara e rejeita contexto inválido | TU-01/TU-02/TU-08 | PASSOU no escopo unitário | [testes automatizados](evidences/automated-tests.md) |
| CA-03 | Histórico e contexto persistem e podem ser retomados | TI-01/E2E-02 | FORA DO ESCOPO | [escopo da tarefa](evidences/browser-unavailable.md) |
| CA-04 | Listagem mostra somente conversas do contexto atual | TI-02/E2E-03/E2E-04 | FORA DO ESCOPO | [escopo da tarefa](evidences/browser-unavailable.md) |
| CA-05 | Título deriva da primeira mensagem e é persistido | TU-05 | PASSOU | [testes automatizados](evidences/automated-tests.md) |
| CA-06 | Proprietário remove somente a própria conversa | TI-03/E2E-03 | FORA DO ESCOPO | [escopo da tarefa](evidences/browser-unavailable.md) |
| CA-07 | Tools habilitadas e políticas de confirmação são respeitadas | TU-06/TU-07 | PASSOU no escopo unitário | [testes automatizados](evidences/automated-tests.md) |
| CA-08 | URL do backend vem do cadastro do cliente autenticado | TU adicional: `studio-execution-identity.service.spec.ts` | PASSOU no escopo unitário | [testes automatizados](evidences/automated-tests.md) |
| CA-09 | Consultas funcionam nos quatro domínios prioritários | E2E-05 | FORA DO ESCOPO | [escopo da tarefa](evidences/browser-unavailable.md) |
| CA-10 | Persistência local e integração usam ambiente/base de QA | TI-10/E2E-01 | FORA DO ESCOPO | [escopo da tarefa](evidences/browser-unavailable.md) |

## Testes E2E

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 a E2E-05 | Fluxos do Mastra Studio | FORA DO ESCOPO | Removidos desta tarefa por decisão de escopo. |

## Testes de integração

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| TI-01 a TI-10 | Persistência, tools, cancelamento e Chat HTTP/SSE | FORA DO ESCOPO | Serão validados em tarefa/QA posterior. |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade Mastra | TU-01–TU-09 aplicáveis | PASSOU | `npm test -- tests/modules/mastra-studio` | 10 arquivos e 21 testes passaram. |
| Suíte automatizada completa | — | PASSOU | `npm test` | 89 arquivos e 283 testes passaram. |
| Lint/tipos/build | — | PASSOU | `npm run lint`, `npm run typecheck`, `npm run build` | Sem erros. |
| Integridade | — | PASSOU | `git diff --check` | Sem whitespace inválido. |
| Cobertura | — | PASSOU | `npm test -- --coverage` | Threshold temporário de 50% atendido: 59,83% statements/lines, 72,02% branches e 70,41% functions. |

## Acessibilidade, browser e responsividade

FORA DO ESCOPO desta tarefa. Não houve alteração no frontend e os fluxos do
Mastra Studio foram deliberadamente removidos desta rodada. Ver
[browser-unavailable.md](evidences/browser-unavailable.md).

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|-----------|--------|----------|--------------------|-----------|
| BUG-01 | `MastraStudioModule` não exportava a fronteira necessária da política de tools. | Alta | Corrigido | Provider exportado pelo módulo proprietário. | `mastra-studio.module.spec.ts` | [testes automatizados](evidences/automated-tests.md) |
| BUG-02 | `mastra:dev` construía `Mastra`, mas não iniciava listener HTTP. | Alta | Corrigido | Bootstrap passou a usar `createNodeServer` com lifecycle controlado. | Smoke HTTP anterior e build | [bootstrap HTTP](evidences/bootstrap-http-smoke.md) |
| BUG-03 | Middleware protegia HTML/assets do Studio antes da sessão. | Alta | Corrigido | Autenticação limitada às rotas `/api/*`, com envelope seguro. | Smoke HTTP anterior e suíte completa | [bootstrap HTTP](evidences/bootstrap-http-smoke.md) |
| BUG-04 | Lint acusava import duplicado, import de tipo inconsistente e método não vinculado na alteração LiteLLM. | Média | Corrigido | Imports consolidados, `import type` aplicado e spy extraído para variável local. | `npm run lint`; suíte unitária Mastra | [testes automatizados](evidences/automated-tests.md) |

## Conclusão

O QA unitário foi concluído com sucesso. Os 21 testes unitários Mastra, a suíte
automatizada completa, lint, typecheck, build e cobertura com threshold temporário
de 50% passaram. A aprovação é restrita ao escopo unitário desta tarefa; TI/E2E
e a validação visual do Studio permanecem explicitamente para uma etapa futura.
