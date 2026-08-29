# Evidências da tarefa 9.0

Data da execução: 2026-08-28.

## Resultado local

No `municipalize-admin-app`, os comandos abaixo passaram:

| Gate | Resultado |
| --- | --- |
| `npm run lint` | aprovado |
| `npm run typecheck` | aprovado |
| `npm test` | 102 arquivos, 306 testes aprovados |
| `npm run test:coverage` | 87,10% statements/lines, 83,75% branches, 89,12% functions |
| `npm run build` | aprovado |
| `git diff --check` | aprovado |
| TI-06 — isolamento de conversa | aprovado |
| shutdown idempotente do Mongo | aprovado |

Foi adicionado readiness separado de liveness. `GET /health/ready` valida
configuração, Mongo e composição local sem iniciar chamadas para modelo, tool ou
backend de cliente. A telemetria usa allowlist, mascara `customerId`, limita
cardinalidade de métricas a 100 combinações e registra execução do harness com
executionId, modelo, provedor, policyVersion, duração e resultado.

## Busca estática

Passaram as verificações de controllers do Chat sem `fetch`/`HttpService` e de
ausência de `forwardRef`/`ModuleRef`. O teste de tools nativas passou.

As referências a `agent-runtime`, collections `chat_*` e configuração legada
continuam presentes para coexistência, backfill e testes históricos. Elas são
escopo explícito da tarefa 10 e impedem declarar retirada definitiva nesta
etapa. O lockfile também contém dependência transitiva de transporte legado;
isso deve ser reavaliado no cutover antes da publicação final.

## Integração e E2E

Os testes E2E existentes do projeto central foram executados com fixtures: 12
passaram e 7 falharam em cenários do dashboard migrado e auditoria visual. Não
são cenários Chat E2E-01 a E2E-04 e não foram usados como aprovação do harness.

Os cenários integrados Chat E2E-01 a E2E-04 e a integração TI-06 contra Mongo,
Keycloak, LiteLLM e `ms-main` não foram executados nesta máquina: Docker está
indisponível e não existe `e2e/.env` com um tenant de QA. Não há credenciais no
repositório para substituir essa dependência. Os cenários permanecem pendentes
até execução em ambiente controlado.

O fluxo preparado para essa execução sobe frontend, Admin API, Mongo, `ms-main`,
SQL Server, Keycloak, LiteLLM e PostgreSQL do LiteLLM no mesmo projeto Docker.
O bootstrap cria o tenant e o usuário QA antes dos testes, e o runtime gerado
define `E2E_START_APP=false`, pois o frontend também é um container. Como o
login do produto usa reCAPTCHA, a autenticação técnica usa o grant de senha do
Keycloak para a conta QA; não se tenta automatizar um CAPTCHA real.

## Promoção e rollback

O runbook operacional foi registrado em
[`municipalize-admin-app/docs/operational-gates.md`](../../municipalize-admin-app/docs/operational-gates.md).
Ele define owners por função, janela recomendada de 24 horas por ambiente,
sinais de sucesso e abortagem, backup/export, ensaio de restore e rollback sem
drop de collections. Nenhuma collection legada foi removida e nenhum serviço
foi iniciado por esta execução permanece ativo.
