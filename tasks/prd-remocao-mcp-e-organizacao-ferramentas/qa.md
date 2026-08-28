# Evidências de QA — catálogo nativo de tools

## Escopo

O runner integrado está em
`municipalize-admin-app/e2e/scripts/native-tools-qa.spec.ts`. Ele cria um
application context Nest mínimo, obtém `ToolCatalogService` por DI e mantém o
bearer somente em memória. A fixture determinística concentra cliente,
usuário, vínculos, snapshot e emenda em
`native-tools-qa.fixture.ts`; o bootstrap da composição QA prepara os registros
do Mongo, Keycloak e `ms-main`.

O runner não cria endpoint de teste, não inicia browser, frontend, LiteLLM ou
Mastra. Para executá-lo contra a composição isolada, carregue as variáveis do
arquivo `.runtime` e forneça as credenciais locais não versionadas:

```bash
cd municipalize-admin-app
E2E_TOOLS_QA=true npm run qa:tools
```

## Resultado local

| Gate | Resultado |
| --- | --- |
| Suíte unitária/integral | 82 arquivos, 243 testes aprovados |
| Cobertura do núcleo migrado | 95,17% statements/lines, 89,28% branches, 100% functions |
| Lint | aprovado sem warnings |
| Typecheck | aprovado para produção, testes e runner |
| Build | aprovado; assets de guidance presentes em `dist` |
| Contratos Chat/SSE | suíte própria aprovada |
| Busca estática | nenhuma rota, SDK, configuração ou nomenclatura legada no artefato ativo |
| Rollback | artefato anterior completo, sem reativação parcial de transporte |

Os cenários TI-01 a TI-04 são exercitados pelos testes de gateway, identidade
e catálogo. E2E-01 a E2E-04 possuem runner one-shot e fixture prontos para a
composição QA; a execução contra Keycloak/Mongo/SQL Server reais depende das
credenciais locais e do Docker disponível no ambiente de homologação. Esta
máquina não possui o daemon Docker, portanto não há bearer, segredo ou dado
real registrado neste relatório.

## Sinais de promoção e abortagem

Promover somente se o startup neutro validar a configuração, os 54 itens de
guidance estiverem no artefato, a autorização e o isolamento forem aprovados,
os contratos Chat/SSE permanecerem estáveis e nenhum legado aparecer no
artefato. Abortar e promover o artefato anterior completo diante de falha de
startup, ausência de assets, rota legada, regressão de autorização/tenant,
timeout/cancelamento fora do baseline ou regressão Chat/SSE.
