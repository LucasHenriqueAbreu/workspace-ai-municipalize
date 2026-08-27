# Relatório de QA — Migração do agente para Mastra

As evidências de navegador estão em `tasks/prd-migracao-agente-mastra/evidences/`.

## Resumo

- Data: 2026-08-26
- Status: BLOQUEADO
- Total de critérios de aceitação: 10
- Critérios de aceitação atendidos: 2 em validação automatizada isolada; 0 validados end-to-end
- Bugs encontrados: 3, todos corrigidos

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Usuário autenticado da Câmara abre o Studio e inicia conversa | E2E-01, smoke HTTP | BLOQUEADO | [bootstrap HTTP](evidences/bootstrap-http-smoke.md), [navegador indisponível](evidences/browser-unavailable.md) |
| CA-02 | Execução vinculada a usuário/Câmara e rejeita contexto ausente ou divergente | TU-02, E2E-04 | BLOQUEADO | [testes automatizados](evidences/automated-tests.md) |
| CA-03 | Histórico e contexto de entidades persistem e podem ser retomados | TU-03/TU-04, TI-01, E2E-02 | BLOQUEADO | [testes automatizados](evidences/automated-tests.md) |
| CA-04 | Listagem mostra somente conversas do contexto atual | TI-02, E2E-03/E2E-04 | BLOQUEADO | [navegador indisponível](evidences/browser-unavailable.md) |
| CA-05 | Título deriva da primeira mensagem e é persistido | TU-05 | PASSOU (unitário) | [testes automatizados](evidences/automated-tests.md) |
| CA-06 | Usuário pode remover somente a própria conversa | TI-03, E2E-03 | BLOQUEADO | [navegador indisponível](evidences/browser-unavailable.md) |
| CA-07 | Tools habilitadas e políticas de confirmação são respeitadas | TU-06/TU-07, TI-05/TI-07, E2E-05 | BLOQUEADO | [testes automatizados](evidences/automated-tests.md) |
| CA-08 | URL do backend vem do cadastro do cliente autenticado | TU-08, TI-08 | PASSOU (unitário) | [testes automatizados](evidences/automated-tests.md) |
| CA-09 | Consultas funcionam nos quatro domínios prioritários | E2E-05 | BLOQUEADO | [bootstrap HTTP](evidences/bootstrap-http-smoke.md) |
| CA-10 | Persistência local e integração usam ambiente/base de QA existente | TU/TI, E2E-01 | BLOQUEADO | [cobertura](evidences/coverage.md), [navegador indisponível](evidences/browser-unavailable.md) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Abrir Studio autenticado e iniciar chat | BLOQUEADO | Runtime do navegador indisponível; identidade, backend e modelo de QA não estavam disponíveis. |
| E2E-02 | Retomar conversa e contexto | BLOQUEADO | Sem navegador e sem execução autenticada. |
| E2E-03 | Listar, reabrir e remover conversa | BLOQUEADO | Sem navegador e sem execução autenticada. |
| E2E-04 | Isolamento entre usuários/Câmaras | BLOQUEADO | Sem navegador e sem duas identidades de QA. |
| E2E-05 | Tools e domínios prioritários | BLOQUEADO | Sem navegador, backend de Câmara e LiteLLM válidos. |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade/regressão | TU-01–TU-09 | PASSOU | `npm test` e suite Mastra focada | Os testes disponíveis cobrem identidade, ownership, contexto, título, catálogo, política e erros. |
| Integração | TI-01–TI-10 | PARCIAL | `npm test` | TI-10/contratos existentes passam; não há suite de integração real para todos os fluxos Mastra listados na TechSpec. |
| Build/lint/tipos | — | PASSOU | `npm run build`, `npm run lint`, `npm run typecheck` | Sem erros. |
| Cobertura | — | NÃO ATINGIU META | `npm test -- --coverage` | 59,8% statements/lines, 72,0% branches, 70,4% functions; gate global de 80% falhou. |

- Cobertura: abaixo da meta global; falha preexistente observada antes das correções de QA.

## Acessibilidade

Não validada. O navegador in-app não estava disponível, portanto não foi
possível inspecionar foco, teclado, semântica, contraste, leitor de tela ou
capturar evidências visuais. Ver [browser-unavailable.md](evidences/browser-unavailable.md).

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|-----------|--------|----------|--------------------|-----------|
| BUG-01 | `MastraStudioModule` não conseguia resolver `MunicipalizeToolPolicyService` porque o módulo de ferramentas não exportava o provider. | Alta | Corrigido | Exportação do provider pela fronteira pública do módulo. | `mastra-studio.module.spec.ts`; suite Mastra focada. | [testes automatizados](evidences/automated-tests.md) |
| BUG-02 | `mastra:dev` emitia “ready”, mas apenas construía `Mastra` e não iniciava listener HTTP. | Alta | Corrigido | Uso explícito de `createNodeServer`, com lifecycle de fechamento controlado pelo bootstrap. | Smoke HTTP em `/`, `/health` e asset estático. | [bootstrap HTTP](evidences/bootstrap-http-smoke.md) |
| BUG-03 | Middleware de autenticação protegia o HTML/assets do Studio e transformava a página inicial em erro antes da sessão. | Alta | Corrigido | Autenticação limitada às rotas `/api/*`; erros de identidade retornam envelope HTTP seguro. | Smoke HTTP; suite de build/tipos/lint. | [bootstrap HTTP](evidences/bootstrap-http-smoke.md) |

## Conclusão

O bootstrap local foi estabilizado e os testes automatizados disponíveis estão
verdes. O QA formal não pode ser aprovado porque os fluxos autenticados,
persistência end-to-end, quatro domínios, acessibilidade e responsividade
dependem de navegador, identidade Keycloak, backend de Câmara e LiteLLM que não
estavam disponíveis neste ambiente. É necessário repetir E2E com a configuração
de QA cadastrada e navegador funcional; a cobertura global também precisa ser
tratada separadamente para atingir 80%.
