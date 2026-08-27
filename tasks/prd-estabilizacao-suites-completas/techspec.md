# Especificação técnica

## Resumo

Esta especificação implementa o PRD de estabilização como uma linha de base de qualidade, não como uma alteração de produto. A solução terá três frentes coordenadas: inventário versionado das falhas e de sua classificação; atualização dos testes do `municipalize-app` para o contrato do runner Vitest/Angular 22; e execução hermética dos testes de autenticação e autorização do `ms-main`, com infraestrutura de teste isolada para SQL Server e Keycloak quando ela for necessária.

Não serão removidos, desativados, marcados como pendentes, excluídos de cobertura nem relaxados para obter aprovação. Cada correção preservará uma asserção de comportamento e será associada aos itens inicialmente mapeados. A lista nominal dos 53 arquivos do frontend e dos 7 testes de backend não consta no PRD; portanto, a primeira execução controlada é a fonte para o inventário. Qualquer diferença entre esses números e os resultados atuais será reclassificada com evidência, nunca contabilizada como sucesso implícito.

## Arquitetura do sistema

### Visão dos componentes

Não há novos serviços de produção, endpoints ou persistência. Os componentes modificados são os artefatos de teste e sua configuração.

- **Inventário e relatório de suítes** — arquivos Markdown em `tasks/prd-estabilizacao-suites-completas/evidences/` com a linha de base, a classificação por causa, o resultado final de cada item e os comandos executados. É a ponte auditável entre o levantamento do PRD e as execuções das suítes.
- **Configuração de testes do frontend** — `municipalize-app/angular.json`, `tsconfig.spec.json` e, se ainda necessário, `src/test-setup.ts`. Mantém Angular 22 + Vitest, inclui corretamente os arquivos de setup na compilação de testes e aplica os thresholds de cobertura existentes sem ampliar exclusões.
- **Specs e fixtures do frontend** — os 53 arquivos identificados pelo inventário, organizados por causa: compatibilidade Jasmine/Vitest, configuração do `TestBed`, inputs obrigatórios e estabilidade assíncrona, e contratos de usecases/adapters que tenham mudado. Cada spec passa a usar APIs nativas do Vitest e a preparar dependências, inputs e dados determinísticos antes da criação do componente.
- **Infraestrutura de integração do backend** — profile, fixtures e lifecycle de testes em `ms-main/src/test/resources/` e `src/test/java/.../integration/`. Substitui a dependência implícita de serviços em `localhost` por infraestrutura isolada e verificável ou declara o bloqueio quando Docker/serviços não estiverem disponíveis.
- **Testes de autenticação, autorização e tenant do backend** — principalmente `AuthResourceIT`, `CategoryResourceIT` e `PublicCouncillorProfileResourceIT`, além dos testes que o inventário classificar entre os sete itens. Esses testes deixam de depender de ordem, IDs fixos, credenciais locais ou estado compartilhado e comprovam acessos negados e permitidos com tenant explícito.

Fluxo de dados de validação:

```text
comando da suíte
  → relatório bruto do runner/Maven
  → inventário por arquivo/caso e causa
  → correção mínima no teste, fixture ou configuração
  → teste focado
  → suíte completa + cobertura
  → relatório final aprovado ou bloqueio explícito
```

## Design de implementação

### Principais interfaces

Não serão adicionadas interfaces de produção. As fronteiras de teste a preservar são:

```text
Angular TestBed
  configureTestingModule(providers, imports) -> ComponentFixture<T>
  componentRef.setInput(name, value) -> void
  fixture.whenStable() -> Promise<void>

Maven/Quarkus integration profile
  provisionTestDependencies() -> TestEnvironment
  executeAuthenticatedRequest(identity, tenant, request) -> HTTP response
  cleanupTestData() -> void
```

Os testes de componente devem atribuir todo `input.required()` antes do primeiro ciclo de estabilização e seguir Act, Wait, Assert. Mocks permanecem apenas nas fronteiras (HTTP, repositórios, relógio ou integração externa); regras de negócio e políticas de acesso reais não serão simuladas.

### Modelos de dados

#### `SuiteBaselineEntry` — registro auditável de um item inicialmente mapeado

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | sim | Identificador estável, por exemplo `FE-023` ou `BE-005`. |
| `project` | `municipalize-app` \| `ms-main` | sim | Repositório proprietário. |
| `testFile` | string | sim | Caminho relativo do spec ou classe de teste. |
| `testCase` | string \| `null` | não | Nome do caso quando o item for um teste, e não todo o arquivo. |
| `initialResult` | `failed` \| `error` \| `not-executed` | sim | Resultado observado na primeira execução reproduzível. |
| `classification` | enum | sim | `code`, `test-contract`, `environment`, `duplicate` ou `out-of-scope`. |
| `causeEvidence` | string | sim | Referência ao log, relatório ou comando que comprovou a classificação. |
| `finalResult` | `passed` \| `reclassified` \| `blocked` | sim | Resultado final do item. |
| `acceptanceCriteria` | string[] | sim | Critérios `CA-*` cobertos. |

```text
{
  "id": "BE-004",
  "project": "ms-main",
  "testFile": "src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java",
  "testCase": "shouldBlockProfileWhenTokenMissing",
  "initialResult": "not-executed",
  "classification": "environment",
  "causeEvidence": "./mvnw test — Testcontainers não encontrou Docker em 2026-08-26",
  "finalResult": "blocked",
  "acceptanceCriteria": ["CA-02", "CA-03", "CA-05", "CA-07"]
}
```

> **Reclassificação:** somente é válida quando identifica duplicidade, item não executável ou classificação inicial incorreta, preserva a referência do levantamento e aponta a execução que prova o motivo. Não é permitida para omitir um teste que ainda falha.

#### `SuiteExecutionEvidence` — metadados da execução completa

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `executedAt` | ISO 8601 | sim | Data e hora da execução. |
| `project` | string | sim | Projeto validado. |
| `command` | string | sim | Comando executado a partir do repositório correspondente. |
| `environmentStatus` | `ready` \| `blocked` | sim | Prontidão de Node, Docker, SQL Server e Keycloak conforme aplicável. |
| `result` | `passed` \| `failed` \| `blocked` | sim | Resultado agregado sem mascarar falhas. |
| `mappedItems` | number | sim | Quantidade de itens do inventário alcançados. |
| `failureGroups` | string[] | sim | Grupos ainda falhos ou vazios quando aprovado. |
| `sanitizedLogReference` | string | sim | Caminho para evidência sem tokens, cookies ou dados pessoais. |

```text
{
  "executedAt": "2026-08-26T20:45:00-03:00",
  "project": "municipalize-app",
  "command": "npm test -- --watch=false",
  "environmentStatus": "ready",
  "result": "failed",
  "mappedItems": 53,
  "failureGroups": ["Jasmine/Vitest", "inputs obrigatórios"],
  "sanitizedLogReference": "evidences/frontend-baseline.md"
}
```

### Endpoints da API

Não aplicável. A iniciativa não cria nem altera endpoints, payloads ou contratos HTTP de produção. Os endpoints já existentes são exercitados somente pelos testes de integração, preservando seus métodos, status, autenticação e regras de autorização vigentes.

## Pontos de integração

- **Angular CLI/Vitest/jsdom:** o frontend usa o target `test` de `angular.json`. A migração deve usar as APIs Vitest já fornecidas pelo builder; o setup global não pode manter uma camada ampla que oculte incompatibilidades de Jasmine.
- **Quarkus, SQL Server e Keycloak:** integrações que precisem de runtime iniciam somente a infraestrutura controlada do teste. O profile de teste deve apontar para endpoints e credenciais de fixtures, nunca para ambientes compartilhados, homologação ou produção.
- **Docker/Testcontainers:** quando for a forma adotada pelo projeto para SQL Server, a verificação de disponibilidade ocorre antes da suíte. A indisponibilidade de Docker é um bloqueio reportável, não uma aprovação parcial. Não registrar valores de `Authorization`, tokens, senhas ou connection strings nas evidências.
- **OIDC e autorização:** a identidade usada em cada cenário deve conter somente os papéis e claims necessários. Além de `@RolesAllowed`/OIDC, os testes devem passar o contexto de tenant exigido e confirmar o vínculo/propriedade no serviço responsável.

## Abordagem de testes

A meta de cobertura permanece em 80% para statements, branches, functions e lines no frontend, e 80% para linhas e branches no backend. A configuração atual dos repositórios prevalece quando divergir de texto histórico das rules: `angular.json` já declara thresholds, e `pom.xml` já configura o `jacoco-maven-plugin` para `verify`. Não reduzir limites, ampliar `coverageExclude` nem desabilitar o gate faz parte da solução.

### Testes de unidade

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TU-01 | Compatibilidade nativa de cada spec Angular migrado | CA-01, CA-04 | Specs usam `vi`, `expect` e APIs Angular suportadas; não dependem de API Jasmine global para passar. |
| TU-02 | Fixture de componente prepara providers e inputs requeridos | CA-01, CA-04 | O componente cria e renderiza somente após dados obrigatórios e doubles determinísticos serem fornecidos. |
| TU-03 | Usecases e adapters preservam resultado e erro do contrato vigente | CA-01, CA-04, CA-06 | Assertions verificam valores, erros tipados e chamadas de repositório reais, sem mudar regra de negócio para acomodar o teste. |
| TU-04 | Políticas de acesso de emenda/projeto mantêm negação e permissão | CA-01, CA-04, CA-05, CA-06 | Usuário sem papel, vínculo ou propriedade não recebe ação; usuário válido recebe apenas a ação permitida. |
| TU-05 | Classificador de inventário não aceita item sem evidência | CA-03, CA-07 | Todo item possui resultado e referência; itens bloqueados não entram como aprovados. |

Os testes do frontend serão agrupados pelo mecanismo de falha, mas os arquivos continuarão co-localizados com o código. Testes puramente de usecase, parser e mapper devem continuar sem `TestBed`; componentes, guards, HTTP adapters e rotas usam a infraestrutura Angular somente quando ela é parte do comportamento observado.

### Testes de integração

| ID | Nome do caso de teste | Critérios de aceitação | Resultado esperado |
| --- | --- | --- | --- |
| TI-01 | Ambiente de teste Quarkus é provisionado e limpo de forma isolada | CA-02, CA-03, CA-07 | SQL Server e Keycloak de teste ficam prontos antes dos testes, sem usar `localhost` ou estado persistente; indisponibilidade vira bloqueio explícito. |
| TI-02 | Registro e login seguem o contrato de autenticação vigente | CA-02, CA-03, CA-06 | `AuthResourceIT` usa payload compatível com a proteção RSA/captcha vigente e valida sucesso e credencial inválida sem segredo real. |
| TI-03 | Operações de categoria permitidas exigem identidade e tenant válidos | CA-02, CA-05, CA-06 | `CategoryResourceIT` cria, consulta, atualiza e remove somente os dados criados pelo próprio cenário autenticado. |
| TI-04 | Endpoints de perfil público recusam token ausente ou inválido | CA-02, CA-05 | Perfil, emendas e projetos retornam 401/403 sem revelar dados quando a identidade não existe. |
| TI-05 | Usuário autorizado no tenant correto acessa o recurso protegido | CA-02, CA-06 | O retorno permitido corresponde ao papel, vínculo e tenant de fixture. |
| TI-06 | Tenant ou vínculo divergente não vaza dados nem existência do recurso | CA-02, CA-05 | Acesso é recusado e não retorna conteúdo de outro tenant. |
| TI-07 | Execução completa registra os 60 itens e o resultado por grupo | CA-01, CA-02, CA-03, CA-07 | Inventário e relatórios finais reconciliam todos os itens ou descrevem o bloqueio verificável. |

Os `*IT` serão independentes: sem `@Order`, IDs fixos, reutilização de método de teste, usuário compartilhado ou dependência de dados inicializados em outra classe. Fixtures criam e limpam seus próprios dados e usam nomes/IDs únicos determinísticos quando a API exigir persistência.

### Testes E2E

Não aplicável como novo escopo. A iniciativa estabiliza as suítes unitária/integrada já existentes e não introduz uma jornada de UI. Os cenários de navegação e isolamento multi-tenant continuam cobertos pelo projeto central `e2e/` quando uma mudança necessária alcançar comportamento observável no navegador; nesse caso, será acrescentado um E2E de regressão ao plano da tarefa correspondente, com dados sintéticos e estado autenticado fora do Git.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Executar `npm test -- --watch=false` em `municipalize-app` e `./mvnw test` em `ms-main`; salvar logs sanitizados, listar cada arquivo/caso falho e reconciliar os quantitativos 53/7 antes de qualquer correção.
2. Corrigir a configuração mínima do frontend para que setup e types sejam compilados, e substituir por lotes as APIs Jasmine legadas por APIs Vitest equivalentes. Em paralelo, corrigir fixtures de `TestBed`, inputs obrigatórios e espera assíncrona sem enfraquecer assertions.
3. Corrigir testes de regra/contrato do frontend somente quando a execução demonstrar divergência do contrato vigente; confirmar o comportamento no código de produção antes de alterar a expectation.
4. Estabilizar o profile de integração do backend e reescrever os sete itens de autenticação/autorização como cenários independentes, com SQL Server, Keycloak, papéis, vínculo e tenant controlados.
5. Executar testes focados após cada grupo. Em seguida, executar suites completas, lint/build/coverage aplicáveis e produzir o relatório final aprovado ou bloqueado.

### Dependências técnicas

- Node e dependências instaladas com o lock file do `municipalize-app`; o Node de versão ímpar observado na linha de base deve ser registrado como aviso de ambiente, não confundido com falha funcional.
- JDK 17, Maven Wrapper, Docker/Compose e imagens/fixtures autorizados para o `ms-main`.
- SQL Server e Keycloak isolados e prontos, com health check ou sinal controlado antes dos `*IT`.
- Nenhuma dependência em `municipalize-chat-api` ou `municipalize-mcp`.

## Monitoramento e observabilidade

Não haverá nova telemetria de produção. A observabilidade desta iniciativa é documental e reprodutível:

- relatórios de baseline e resultado final por projeto, contendo comando, data, duração, total de testes, cobertura e grupos de falha;
- logs sanitizados por execução, com referência aos relatórios nativos de Vitest, Surefire, Failsafe e JaCoCo quando existentes;
- registro `blocked` com pré-requisito ausente, impacto e ação necessária, em vez de resultado verde parcial;
- logs de teste com nível apropriado e sem tokens, cabeçalhos de autorização, cookies, senhas, connection strings ou dados municipais/pessoais.

## Considerações técnicas

### Principais decisões

- **Inventário antes da correção:** o PRD fixa 53+7, mas não apresenta a lista. O estado atual também aponta três classes de integração que podem conter mais de sete métodos. O inventário torna essa divergência tratável e auditável, sem inventar uma lista ou alterar a métrica.
- **Migração explícita para Vitest, não shim permanente de Jasmine:** Angular CLI atual usa Vitest. Adaptar os specs a APIs nativas reduz falsos positivos e aproxima os testes do runner suportado. Um setup global pode conter apenas configuração de plataforma inevitável e deve diminuir, não expandir, compatibilidade legada.
- **Infraestrutura hermética para integração:** testes com URLs, usuários, IDs e estado de uma instalação local são frágeis e inseguros. Fixtures isoladas tornam a execução repetível e permitem testar autorização de verdade.
- **Autorização em duas camadas:** identidade/papel OIDC é validado na borda; tenant, vínculo e propriedade devem continuar comprovados na regra de negócio. Desabilitar autorização globalmente é proibido nos cenários que verificam CA-05 e CA-06.
- **Sem alteração de contratos de produção por conveniência de teste:** requests obsoletos serão atualizados para o contrato observado. Um defeito de produção somente será corrigido se o contrato vigente e a camada proprietária comprovarem a necessidade.

### Riscos conhecidos

- **Docker indisponível:** a execução observada de `./mvnw test` foi bloqueada porque Testcontainers não encontrou Docker. Mitigação: health check prévio e instrução de inicialização; enquanto ausente, registrar `blocked` e não aprovar CA-02.
- **Mistura de migrações de teste:** há specs Jasmine, Jest e Vitest, incluindo casos comentados ou sem casos executáveis. Mitigação: classificar cada arquivo no inventário e transformar specs relevantes em casos executáveis com assertions antes de contabilizá-los como aprovados.
- **Dados e ordem compartilhados nos ITs:** métodos que reutilizam IDs fixos ou chamam outro teste podem passar isoladamente e falhar em suíte. Mitigação: fixtures por cenário, cleanup e ausência de `@Order` como dependência.
- **Falso reparo de autorização:** um mock permissivo ou `authorizationEnabled = false` pode ocultar uma regressão. Mitigação: manter cenários negativos e positivos end-to-end no runtime Quarkus, com tenant divergente.
- **Alterações locais em andamento:** há mudanças não relacionadas na raiz e em `municipalize-app`. Mitigação: revisar diffs antes de editar arquivos compartilhados e não reverter, formatar ou incluir trabalho alheio.

### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, os `AGENTS.md` de `municipalize-app` e `ms-main`, `.agents/README.md` e todas as rules globais em `.agents/rules/`. Foram também analisadas as rules locais aplicáveis dos dois projetos, incluindo Angular, arquitetura, TypeScript, testes, Java, Quarkus, estrutura e padrões de código. A especificação respeita a propriedade de cada repositório, preserva os legados somente como consulta, exige execução no diretório de cada projeto, não altera contratos sem validação de consumidores e mantém isolamento por tenant, autenticação, autorização e proteção de segredos.

Os comandos de verificação serão executados a partir do projeto proprietário: `npm test`, `npm run lint` e `npm run build` no frontend; `./mvnw test`, `./mvnw verify` e `./mvnw package` no backend. Cada comando não executável será reportado com motivo, impacto e ação necessária. A documentação e as evidências ficam na raiz coordenadora, em `tasks/prd-estabilizacao-suites-completas/`.

### Conformidade com skills

- **`criar-techspec`:** aplicada para estruturar esta especificação a partir do PRD, da exploração dos projetos e dos casos de teste rastreáveis.
- **`angular-developer`:** aplicável ao planejamento dos testes Angular 22/Vitest; orienta o uso do runner, `TestBed`, estabilização assíncrona e build após alterações.
- **`zard`:** não aplicável: não há criação ou alteração de interface, componentes Zard, estilos ou acessibilidade visual nesta iniciativa.

### Arquivos relevantes e dependentes

- `tasks/prd-estabilizacao-suites-completas/prd.md`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md` e `suite-final.md` (novos, produzidos durante a implementação)
- `municipalize-app/angular.json`
- `municipalize-app/tsconfig.spec.json`
- `municipalize-app/src/test-setup.ts` e `src/test-setup.d.ts`, se forem mantidos após a migração
- `municipalize-app/src/app/**/*.spec.ts` e os respectivos arquivos de produção dos 53 itens inventariados
- `ms-main/pom.xml`
- `ms-main/src/test/resources/application.properties`
- `ms-main/src/test/java/br/com/municipalize/integration/AuthResourceIT.java`
- `ms-main/src/test/java/br/com/municipalize/integration/CategoryResourceIT.java`
- `ms-main/src/test/java/br/com/municipalize/integration/PublicCouncillorProfileResourceIT.java`
- `ms-main/src/main/java/br/com/municipalize/rest/AuthResource.java`, `CategoryResource.java` e `PublicCouncillorProfileResource.java`
- `ms-main/src/main/java/br/com/municipalize/service/AuthService.java` e componentes de tenant/autorização chamados pelos recursos afetados
