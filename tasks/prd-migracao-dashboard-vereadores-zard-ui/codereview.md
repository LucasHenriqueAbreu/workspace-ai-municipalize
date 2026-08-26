# Relatório de revisão de código — Migração do dashboard de vereadores para Zard UI

## Resumo

- Data: 2026-08-26
- Branch: `agent/melhoria-dashboard`
- Status: **REPROVADO**
- QA anterior: **APROVADO**

O QA funcional anterior aprovou os 16 critérios, incluindo 15 cenários E2E,
axe nos temas claro e escuro e as correções BUG-07 a BUG-11. A revisão final,
porém, encontrou desvios relevantes da arquitetura da TechSpec, cobertura
direta insuficiente e a suíte Angular completa falhando.

## Verificação do QA

| Defeito ou correção | Implementado | Teste de regressão | Observações |
|---|---|---|---|
| BUG-07 — skeletons do dashboard | SIM | SIM | O QA confirmou `z-skeleton`; o build e os testes focados continuam passando. |
| BUG-08 — sincronização de “Mostrar todos” | SIM | SIM | A legenda sincroniza o `FormControl`; a spec focada de regressão passou. |
| BUG-09 — resolução de `shiki` | SIM | SIM | A dependência direta permanece e o `npm run build` final passou. |
| BUG-10 — contraste nos temas | SIM | SIM no QA | O QA registrou axe sem violações nos quatro estados; não foi repetido E2E nesta revisão. |
| BUG-11 — regiões roláveis focáveis | SIM | SIM no QA | O QA confirmou `tabindex` e nomes acessíveis; não foi repetido E2E nesta revisão. |

## Conformidade com regras

| Regra | Status | Observações |
|---|---|---|
| Escopo, contratos e isolamento por tenant | OK | A funcionalidade permanece no `municipalize-app`; não foram alterados endpoints, rotas ou permissões do escopo. |
| Angular e arquitetura de frontend | NOK | O `DashboardComponent` virou shell, mas delega todo o conteúdo a `DashboardContentComponent`, que concentra estado, resources, mapeamentos, ações e apresentação. |
| Componentização e limites locais | NOK | `dashboard-content.component.ts` tem 808 linhas e seu template externo tem 379 linhas; a regra local limita TypeScript a 100 linhas e métodos a 30. |
| Zard UI e tokens semânticos | PARCIAL | Cards, charts, tooltips, tabela, tabs, toggle group e skeletons Zard estão presentes, mas a composição ainda está concentrada e não corresponde às seções previstas na TechSpec. |
| Clean Code e TypeScript | NOK | A concentração de responsabilidades impede manutenção/testabilidade adequada; a legenda também precisou de remoção de infraestrutura de picker sem consumidor. |
| Testes e cobertura | NOK | A suíte completa falha e a execução focada imprime 38,27% de statements, 18,93% de branches, 23,14% de functions e 37,68% de lines no grafo instrumentado. |
| Segurança e dados sensíveis | OK | Não foram identificados segredos ou dados pessoais adicionados pela funcionalidade; fixtures são sintéticas. |
| Rastreabilidade das tarefas | NOK | Os oito itens estão marcados como completos, embora a implementação ainda não cumpra a decomposição arquitetural e a cobertura exigidas nas próprias tarefas/TechSpec. |

## Aderência à TechSpec

| Decisão Técnica | Implementado | Observações |
|---|---|---|
| Preservar APIs, rotas, permissões e modelos | SIM | Não foram identificadas mudanças nas fronteiras de backend ou nos contratos HTTP. |
| `DashboardComponent` como shell e provider | PARCIAL | O shell tem 19 linhas e fornece `DashboardDataStore`, mas o conteúdo foi deslocado para outro componente monolítico. |
| `DashboardDataStore` coordenando resources, flows e refresh | NÃO | O store contém apenas signals de flow/grupo e revisão; os resources e a orquestração permanecem no componente de conteúdo. |
| Seções dedicadas de vereadores, bancadas, instituições, métricas e detalhes | NÃO | Os componentes previstos (`DashboardCouncillorSectionComponent`, `DashboardBenchSectionComponent`, `DashboardInstitutionsSectionComponent`, `DashboardMetricsSectionComponent` e `DashboardDetailsSectionComponent`) não existem. |
| Card interativo com pizza Zard | SIM | `DashboardInteractivePieCardComponent` agora é consumido pelas seções renderizadas no template e possui tooltip/tabela alternativa. |
| Flow único alimentando dados relacionados | PARCIAL | Os resources recebem o flow ativo, mas não há a composição por seção prevista para garantir o contrato de forma isolada e testável. |
| Charts Zard com tooltip, padrões e alternativa tabular | SIM | Os charts em escopo usam `z-chart`, tooltip formatado e alternativa tabular quando aplicável. |
| Estados explícitos, retry e impedimentos separados | SIM | O QA confirmou loading, vazio, erro, retry e impedimentos dedicados; a implementação usa resources e componente específico. |
| Card público de vereador e store público | PARCIAL | `CouncillorPublicCardComponent` e `CouncillorsPublicStore` existem, mas não possuem cobertura direta suficiente. |
| Cobertura mínima de 80% e specs próximas aos arquivos novos | NÃO | Não há cobertura direta para vários componentes/stores novos e a meta de 80% não é atingida no recorte executado. |

## Tarefas verificadas

| Tarefa | Status | Observações |
|---|---|---|
| 1.0 Criar baseline, view models e builders | INCOMPLETA | Builders e formatadores têm specs, mas a cobertura e os componentes consumidores não estão suficientemente cobertos. |
| 2.0 Construir componentes Zard compartilhados | INCOMPLETA | O card interativo foi integrado e a legenda foi simplificada, mas faltam specs diretas completas e a decomposição final. |
| 3.0 Implementar estado e fluxos de vereadores e bancadas | INCOMPLETA | Flows e resources funcionam, porém as duas seções dedicadas previstas não foram criadas e o store não coordena os resources. |
| 4.0 Migrar instituições, resumos, gráficos e detalhamentos | INCOMPLETA | Há componentes Zard, mas os blocos seguem montados no template monolítico. |
| 5.0 Migrar impedimentos técnicos e snapshot administrativo | COMPLETA | Componente dedicado, permissão, feedback e reload estão presentes e foram validados no QA. |
| 6.0 Compor o shell final do dashboard | INCOMPLETA | O shell foi reduzido, mas a implementação foi apenas deslocada para `DashboardContentComponent`. |
| 7.0 Migrar a listagem pública de vereadores | INCOMPLETA | Store, card e fallback existem; faltam specs diretas para o store e o card público. |
| 8.0 Consolidar cobertura e preparar a entrega para QA | INCOMPLETA | QA funcional passou, mas `npm test -- --watch=false` falha e a meta de cobertura não é atendida. |

## Testes

- Suíte Angular completa: **414 testes**, 300 passando, 114 falhando e 54 erros; 41 arquivos falharam e 122 passaram.
- Testes focados finais: **13 testes em 6 arquivos**, todos passando.
- Typecheck final: `npx tsc --noEmit --project tsconfig.app.json` passou.
- Lint final: passou com 0 erros e 108 avisos preexistentes fora do escopo principal.
- Build final: passou, com avisos CommonJS existentes.
- Integridade: `git diff --check` passou.
- Cobertura focada impressa pelo runner: 38,27% statements, 18,93% branches, 23,14% functions e 37,68% lines; meta da TechSpec: 80% em todas as dimensões.
- QA anterior: 15/15 E2E e axe sem violações, conforme `qa.md`; esses E2E não foram repetidos nesta revisão.

## Problemas encontrados

| Severidade | Arquivo | Linha | Descrição | Sugestão |
|---|---|---:|---|---|
| Alta | `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard-content.component.ts` | 87 | O conteúdo ainda concentra 808 linhas, resources, estado, regras de apresentação, sheets, snapshot e handlers, contrariando a arquitetura e os limites locais. | Extrair as seções previstas e mover a coordenação de resources/refresh para `DashboardDataStore`; manter o container como composição. |
| Alta | `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard-content.component.html` | 1 | O template possui 379 linhas e monta diretamente todas as seções, dificultando isolamento, testes e evolução. | Dividir o template entre `DashboardHeaderComponent` e componentes dedicados de vereadores, bancadas, instituições, métricas e detalhes. |
| Alta | `municipalize-app` | — | `npm test -- --watch=false` falha com 114 testes, 54 erros e 41 arquivos; há falhas amplas em specs legados e alterações fora do escopo, mas o comando obrigatório não está verde. | Isolar/corrigir a regressão da suíte completa e repetir a revisão com o comando passando. |
| Média | `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard-data.store.ts` | 5 | O store não coordena os resources, estados ou recargas das seções como definido na TechSpec; é somente um agrupador de signals. | Encapsular no store os parâmetros, resources, revisão de refresh e contratos de loading/erro/retry. |
| Média | `municipalize-app/src/app/presenter/features/tenant/public/dashboard` | — | Não há specs diretas para `DashboardContentComponent`, `DashboardDataStore`, `CouncillorsPublicStore`, card público, impedimentos e vários charts; a cobertura de branches do recorte fica em 18,93%. | Criar specs próximas aos arquivos novos/alterados, cobrindo flow, loading, vazio, erro, retry, teclado, fallback e snapshot; tornar a meta verificável. |

## Pontos positivos

- O QA funcional está aprovado, com 16 critérios atendidos, 15 E2E e axe nos temas claro/escuro.
- As fronteiras de API, rotas, permissões e componentes shared foram preservadas no escopo da funcionalidade.
- O card interativo passou a ser consumido; charts receberam tooltip e as correções de skeleton, contraste e foco permanecem presentes.
- Typecheck, lint sem erros, build e `git diff --check` passaram no estado final.

## Recomendações

- Reabrir as tarefas 3, 4, 6, 7 e 8 para concluir a decomposição prescrita e atualizar o rastreamento das tarefas.
- Adicionar cobertura direta dos componentes/stores e estabelecer a meta de 80% sem reduzir o requisito da TechSpec.
- Corrigir ou formalizar a separação das falhas preexistentes da suíte Angular completa antes de solicitar nova revisão.
- Executar novamente o QA E2E após a refatoração arquitetural, pois esta revisão alterou componentes além do estado originalmente avaliado.

## Conclusão

**REPROVADO.** A funcionalidade está funcionalmente bem exercitada pelo QA e as verificações de compilação focadas passaram, mas a entrega não atende à arquitetura definida: o conteúdo do dashboard continua monolítico, o store não exerce a responsabilidade especificada, a cobertura direta é insuficiente e a suíte Angular completa falha. O código deve retornar à implementação para concluir a decomposição e estabilizar os testes antes de nova aprovação.
