# Linha de base das suítes completas

## Escopo e critério

Este inventário é a fotografia reproduzível antes das correções das tarefas 2
a 6. O PRD não fornece a lista nominal; por isso, os 53 itens de frontend são
os 53 arquivos reportados como `Test Files failed` pelo comando de baseline. Os
7 itens de backend são os sete casos registrados no relatório Failsafe da
execução anterior da suíte de integração, citada em
`tasks/prd-pesquisa-global/task_5.md` e preservada em
`ms-main/target/failsafe-reports/`.

Um item só pode ser considerado aprovado quando a execução posterior comprovar
`passed`. Nesta tarefa, falhas ainda não corrigidas ficam `blocked`; arquivos
sem suíte executável são `reclassified` somente porque o runner comprovou que
não possuem nenhum caso executável. A reclassificação não remove o item nem
transforma a suíte em verde.

As classificações usadas são as da TechSpec:

- `test-contract`: expectation, fixture, input, API de teste ou sincronização
  incompatível com o comportamento/configuração atualmente observado;
- `environment`: dependência externa ou runtime não disponível;
- `code`: resultado observável sugere defeito na implementação proprietária,
  ainda sujeito à confirmação nas tarefas de correção;
- `out-of-scope`: artefato nominal não executável, sem uma suíte de teste;
- `duplicate`: nenhum caso duplicado foi encontrado nesta coleta.

## Execuções

| ExecutedAt | Projeto | Comando | Ambiente | Resultado | Itens alcançados | Grupos/bloqueios | Evidência sanitizada |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| 2026-08-26T20:29:31-03:00 | municipalize-app | `npm test -- --watch=false` | `ready`, com avisos de Node ímpar e setup fora do type-check | `failed` | 53 | fixture/TestBed/inputs; Jasmine/Vitest; contratos; specs não executáveis; assincronia | [frontend-baseline.log](frontend-baseline.log) |
| 2026-08-26T20:29:14-03:00 a 20:29:27-03:00 | ms-main | `./mvnw test` | `blocked`: Testcontainers não acessou Docker; JDK 21 detectado | `blocked` | 0/7 | SQL Server Dev Services indisponível; 10 testes foram pulados | [backend-baseline.log](backend-baseline.log) |
| 2026-08-26T16:23:07-03:00 | ms-main | `./mvnw verify -DskipITs=false` (referência histórica no Failsafe) | execução anterior alcançou os 7 itens | `failed` | 7 | 7 falhas em Auth/Category/PublicCouncillorProfile | [backend-baseline.log](backend-baseline.log) |

O comando de reporter JSON não faz parte da coleta: o Angular CLI recusou os
argumentos `--reporter` e `--outputFile`. A listagem abaixo foi extraída da
saída normal do runner, cuja contagem final foi `53 failed | 125 passed (178)`
e `116 failed | 312 passed (428)`, com 54 erros.

## SuiteBaselineEntry — frontend

As colunas `Final result` abaixo preservam a fotografia inicial desta
evidência. A reconciliação posterior, que substitui esses estados para fins de
aprovação, está em [suite-final.md](suite-final.md).

Todos os itens abaixo têm evidência na saída do Vitest resumida em
[frontend-baseline.log](frontend-baseline.log). Os itens `FE-004`, `FE-008`,
`FE-010`, `FE-011`, `FE-014`, `FE-015`, `FE-016`, `FE-017`, `FE-018` e `FE-020`
foram marcados `reclassified` porque o runner informou `No test suite found`;
eles continuam contabilizados entre os 53 arquivos iniciais.

| ID | Projeto | Test file | Test case | Initial result | Classification | Cause evidence | Final result | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FE-001 | municipalize-app | `src/app/aplication/amendment/CanProtocolAmendmentUsecase.spec.ts` | — | failed | test-contract | Vitest: expectation divergente de permissão | blocked | CA-03, CA-04, CA-05, CA-06 |
| FE-002 | municipalize-app | `src/app/aplication/amendment/ResolveAmendmentActionAccessUsecase.spec.ts` | — | failed | test-contract | Vitest: expectation divergente de ação autorizada | blocked | CA-03, CA-04, CA-05, CA-06 |
| FE-003 | municipalize-app | `src/app/aplication/budget-summary/budget-summary.usecase.spec.ts` | — | failed | test-contract | Vitest: texto produzido difere da expectation | blocked | CA-03, CA-04, CA-06 |
| FE-004 | municipalize-app | `src/app/aplication/calculate-project-completation-percentage/CalculateProjectCompletionUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-005 | municipalize-app | `src/app/aplication/councillor-project/FindCouncillorProjectInvitationUsecase.spec.ts` | — | failed | test-contract | Vitest: busca paginada retornou `null` contra fixture esperada | blocked | CA-03, CA-04, CA-06 |
| FE-006 | municipalize-app | `src/app/aplication/get-address/GetAddressByCepUsecase.spec.ts` | — | failed | test-contract | Angular: `NG0203` ao instanciar usecase com `inject()` fora de contexto | blocked | CA-03, CA-04 |
| FE-007 | municipalize-app | `src/app/aplication/get-cities/GetCitiesUsecase.spec.ts` | — | failed | test-contract | Angular: `NG0203` ao instanciar usecase com `inject()` fora de contexto | blocked | CA-03, CA-04 |
| FE-008 | municipalize-app | `src/app/aplication/list-users/ListUsersUseCase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-009 | municipalize-app | `src/app/aplication/loa/ParseLoaEntriesCsvUsecase.spec.ts` | — | failed | test-contract | Vitest: teste excedeu timeout de 5000 ms | blocked | CA-03, CA-04 |
| FE-010 | municipalize-app | `src/app/aplication/login/LoginUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-011 | municipalize-app | `src/app/aplication/project/CreateProjectBudgetsUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-012 | municipalize-app | `src/app/aplication/project/CreateProjectUsecase.spec.ts` | — | failed | test-contract | Vitest: erro esperado não corresponde ao erro observado | blocked | CA-03, CA-04, CA-06 |
| FE-013 | municipalize-app | `src/app/aplication/project/DeleteProjectBudgetsUsecase.spec.ts` | — | failed | test-contract | Vitest: API Jasmine `.and` indisponível na fixture | blocked | CA-03, CA-04 |
| FE-014 | municipalize-app | `src/app/aplication/project/FindProjectBudgetsUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-015 | municipalize-app | `src/app/aplication/project/ListProjectsUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-016 | municipalize-app | `src/app/aplication/project/UpdateProjectUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-017 | municipalize-app | `src/app/aplication/send-invitation/SendInvitationUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-018 | municipalize-app | `src/app/aplication/signup/SignupUsecase.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-019 | municipalize-app | `src/app/infra/repositories/AssistantChatRepositoryHttp.spec.ts` | — | failed | test-contract | Vitest: response contém campos adicionais e normalização divergente | blocked | CA-03, CA-04, CA-06 |
| FE-020 | municipalize-app | `src/app/infra/repositories/project/ProjectRepositoryHttp.spec.ts` | — | failed | out-of-scope | Vitest: `No test suite found` | reclassified | CA-03, CA-04 |
| FE-021 | municipalize-app | `src/app/presenter/common/mz-components/amendment-details/amendment-details.component.spec.ts` | — | failed | test-contract | Angular: fixture/componente não estabiliza; inputs obrigatórios ausentes | blocked | CA-03, CA-04, CA-05, CA-06 |
| FE-022 | municipalize-app | `src/app/presenter/common/mz-components/breadcrumb/breadcrumb.service.spec.ts` | — | failed | test-contract | Vitest: expectation divergente ao montar ActivatedRoute | blocked | CA-03, CA-04 |
| FE-023 | municipalize-app | `src/app/presenter/common/mz-components/default-amendment-list/default-amendment-list.component.spec.ts` | — | failed | test-contract | Angular: fixture/providers e estado de autorização não preparados | blocked | CA-03, CA-04, CA-05, CA-06 |
| FE-024 | municipalize-app | `src/app/presenter/common/mz-components/default-institution-form/default-institution-form.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por configuração de componente | blocked | CA-03, CA-04 |
| FE-025 | municipalize-app | `src/app/presenter/common/mz-components/default-institution-list/create-institution-dialog/create-institution-dialog.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por provider/input | blocked | CA-03, CA-04 |
| FE-026 | municipalize-app | `src/app/presenter/common/mz-components/default-proposer-request-list/components/confirm-change-status/confirm-change-status.component.spec.ts` | — | failed | test-contract | Angular: fixture não cria com dependências atuais | blocked | CA-03, CA-04 |
| FE-027 | municipalize-app | `src/app/presenter/common/mz-components/default-proposer-request-list/components/proposer-request-details/proposer-request-details.component.spec.ts` | — | failed | test-contract | Angular: `NG0950`, input requerido ausente | blocked | CA-03, CA-04 |
| FE-028 | municipalize-app | `src/app/presenter/common/mz-components/default-sub-institution-form/default-sub-institution-form.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-029 | municipalize-app | `src/app/presenter/common/mz-components/default-sub-institution-list/default-sub-institution-list.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-030 | municipalize-app | `src/app/presenter/common/mz-components/enum-to-tag/enum-to-tag.component.spec.ts` | — | failed | test-contract | Vitest: assertions do componente falharam em todos os casos | blocked | CA-03, CA-04 |
| FE-031 | municipalize-app | `src/app/presenter/common/mz-components/institution-form/institution-form.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por configuração de teste | blocked | CA-03, CA-04 |
| FE-032 | municipalize-app | `src/app/presenter/features/tenant/private/amendment/amendment.component.spec.ts` | — | failed | test-contract | Vitest: expectation de ação por função divergente | blocked | CA-03, CA-04, CA-05, CA-06 |
| FE-033 | municipalize-app | `src/app/presenter/features/tenant/private/edit-amendment/components/amendment-budget/components/amendment-budget-item/amendment-budget-item.component.spec.ts` | — | failed | test-contract | Angular: input requerido ausente também no cleanup | blocked | CA-03, CA-04 |
| FE-034 | municipalize-app | `src/app/presenter/features/tenant/private/edit-amendment/components/amendment-budget/components/create-origin-dest/components/origin/select-loa-entry.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-035 | municipalize-app | `src/app/presenter/features/tenant/private/edit-amendment/components/amendment-budget/components/create-origin-dest/create-origin-dest.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-036 | municipalize-app | `src/app/presenter/features/tenant/private/edit-institution/components/general/general.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-037 | municipalize-app | `src/app/presenter/features/tenant/private/edit-institution/edit-institution.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-038 | municipalize-app | `src/app/presenter/features/tenant/private/edit-loa/components/qdd-loa/components/create-transfer/create-transfer.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-039 | municipalize-app | `src/app/presenter/features/tenant/private/edit-loa/edit-loa.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-040 | municipalize-app | `src/app/presenter/features/tenant/private/edit-project/components/budget/components/budge-item/budge-item.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-041 | municipalize-app | `src/app/presenter/features/tenant/private/edit-project/edit-project.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-042 | municipalize-app | `src/app/presenter/features/tenant/private/loa/components/functions/components/function-form/function-form.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-043 | municipalize-app | `src/app/presenter/features/tenant/private/loa/components/list/components/create-loa-dialog/create-loa-dialog.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-044 | municipalize-app | `src/app/presenter/features/tenant/private/loa/components/sub-functions/components/sub-function-form/sub-function-form.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-045 | municipalize-app | `src/app/presenter/features/tenant/private/maintenance-institutions/maintenance-institutions.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-046 | municipalize-app | `src/app/presenter/features/tenant/private/projects/components/received/components/confirm-status-change/confirm-status-change.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-047 | municipalize-app | `src/app/presenter/features/tenant/private/settings/proposer/components/search-institution-dialog/search-institution-dialog.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-048 | municipalize-app | `src/app/presenter/features/tenant/public/accept-invite/steps/address-step/address-step.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-049 | municipalize-app | `src/app/presenter/features/tenant/public/accept-invite/steps/personal-step/personal-step.component.spec.ts` | — | failed | test-contract | Vitest: expectation de interação falhou | blocked | CA-03, CA-04 |
| FE-050 | municipalize-app | `src/app/presenter/features/tenant/public/verify-email-pending/verify-email-pending.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-051 | municipalize-app | `src/app/presenter/features/tenant/public/verify-email/verify-email.component.spec.ts` | — | failed | test-contract | Angular: criação da fixture falhou por input/provider | blocked | CA-03, CA-04 |
| FE-052 | municipalize-app | `src/app/presenter/layouts/private-layout/private-layout.component.spec.ts` | — | failed | test-contract | Vitest: expectation de renderização após erro de negócio falhou | blocked | CA-03, CA-04, CA-06 |
| FE-053 | municipalize-app | `src/app/shared/core/directives/string-template-outlet/string-template-outlet.directive.spec.ts` | — | failed | test-contract | Vitest: 3 assertions de troca de template falharam | blocked | CA-03, CA-04 |

## SuiteBaselineEntry — backend

Estes sete itens são derivados de `target/failsafe-reports/` e do resumo
Failsafe. A execução corrente de `./mvnw test` não os alcançou porque falhou
antes no Dev Services; por isso o resultado da execução atual permanece
`blocked`. Nenhum status abaixo é aprovação.

| ID | Projeto | Test file | Test case | Initial result | Classification | Cause evidence | Final result | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BE-001 | ms-main | `src/test/java/br/com/municipalize/integration/AuthResourceIT.java` | `testRegisterUserSuccessfully` | failed | test-contract | Failsafe: esperava 200, recebeu 400; payload/contrato de registro precisa ser confirmado | blocked | CA-02, CA-03, CA-06 |
| BE-002 | ms-main | `src/test/java/br/com/municipalize/integration/AuthResourceIT.java` | `testLoginSuccessfully` | failed | test-contract | Failsafe: login esperava 200, recebeu 500; fixture depende de registro/identidade controlados | blocked | CA-02, CA-03, CA-06 |
| BE-003 | ms-main | `src/test/java/br/com/municipalize/integration/AuthResourceIT.java` | `testLoginInvalidCredentials` | failed | code | Failsafe: credencial inválida esperava 404, recebeu 500; erro de runtime precisa ser confirmado no serviço | blocked | CA-02, CA-03, CA-06 |
| BE-004 | ms-main | `src/test/java/br/com/municipalize/integration/CategoryResourceIT.java` | `setupToken` (`@BeforeAll`) | failed | environment | Failsafe: endpoint de token respondeu 401 durante a preparação compartilhada | blocked | CA-02, CA-03, CA-05, CA-06 |
| BE-005 | ms-main | `src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java` | `shouldBlockProfileWhenTokenMissing` | failed | test-contract | Failsafe: endpoint `public` respondeu 200 contra expectation 401/403; contrato precisa ser confirmado | blocked | CA-02, CA-03, CA-05 |
| BE-006 | ms-main | `src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java` | `shouldBlockAmendmentsWhenTokenMissing` | failed | test-contract | Failsafe: endpoint `public` respondeu 200 contra expectation 401/403; contrato precisa ser confirmado | blocked | CA-02, CA-03, CA-05 |
| BE-007 | ms-main | `src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java` | `shouldBlockProjectsWhenTokenMissing` | failed | test-contract | Failsafe: endpoint `public` respondeu 200 contra expectation 401/403; contrato precisa ser confirmado | blocked | CA-02, CA-03, CA-05 |

## Reconciliação e bloqueios

- Frontend: `53 = 53` arquivos falhos no runner (`43` aguardam estabilização
  por contrato/fixture e `10` foram reclassificados como arquivos sem suíte).
  Não há duplicidade identificada.
- Backend: `7 = 3 AuthResourceIT + 1 setupToken de CategoryResourceIT + 3
  PublicCouncillorProfileResourceIT`. O método `setupToken` é mantido como item
  porque sua falha impede todos os casos de Category; não foi contabilizado como
  aprovação.
- Total inicial: `53 + 7 = 60` itens, todos com projeto, arquivo, resultado,
  classificação, evidência, resultado final e critérios de aceitação.
- Bloqueio operacional: Testcontainers não acessa Docker nesta execução,
  embora o CLI do Docker responda. Impacto: SQL Server Dev Services não sobe e
  os 7 itens backend não podem ser reexecutados isoladamente. Ação necessária:
  disponibilizar um daemon Docker acessível ao Testcontainers, usar JDK 17 e
  repetir `./mvnw test`/`./mvnw verify` conforme as tarefas 4 a 6.
- O frontend não tem relatório de cobertura gerado nesta execução falha; o
  threshold de 80% não foi reduzido e nenhuma exclusão foi alterada.

## Validação desta evidência (TU-05)

Após a criação deste arquivo, a validação deve confirmar 53 linhas `FE-*`, 7
linhas `BE-*`, todos os campos obrigatórios preenchidos e nenhum item
`blocked` contado como aprovado. O comando usado e seu resultado ficam no
relatório da tarefa; uma falha nesta validação impede marcar a tarefa como
concluída.
