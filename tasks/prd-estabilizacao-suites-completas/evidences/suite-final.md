# Evidência final da estabilização das suítes

## Escopo e data

Execução local em 2026-08-26, nos repositórios proprietários. Os resultados
abaixo distinguem testes aprovados de gates que ainda impedem a aprovação
integrada; nenhum teste foi removido ou excluído para obter os resultados.

## Frontend — `municipalize-app`

| Comando | Resultado | Evidência |
| --- | --- | --- |
| `npm test -- --watch=false --coverage=false` | **passou** — 178 arquivos, 453 testes | `/tmp/frontend-pass-final.log` |
| `npx tsc -p tsconfig.spec.json --noEmit` | **passou** | execução local |
| `npm test -- --watch=false` | **gate bloqueado** — 178 arquivos e 453 testes passaram, mas a cobertura ficou em 39,76% statements, 17,11% branches, 26,25% functions e 38,79% lines, abaixo dos 80% exigidos | `/tmp/frontend-coverage-final.log` |
| `npm run build` | **passou**, com avisos existentes de dependências CommonJS | `/tmp/frontend-build-final.log` |
| `npm run lint -- --no-fix` | **bloqueado por baseline de lint** — 108 erros e 13 avisos nas regras atuais do projeto | saída do comando; não relacionado à migração de runner |

### Migração de runner

O target `test` usa `@angular/build:unit-test` com `runner: "vitest"`, o setup
legado foi removido e os tipos de spec usam `vitest/globals`. A busca exata por
Jasmine/Jest, `expectAsync` e aliases Jasmine nos arquivos de código,
configuração e testes não encontrou ocorrências. Os testes assíncronos alterados
usam timers do Vitest ou APIs nativas do Angular; não restaram `setTimeout` em
specs.

## Backend — `ms-main`

| Comando | Resultado | Evidência |
| --- | --- | --- |
| `./mvnw test` | **bloqueado** — 278 testes executados, 0 falhas, 1 erro e 10 skips; o erro ocorre antes do teste de banco, no SQL Server DevService | `/tmp/ms-main-test.log` |
| `DOCKER_HOST=... ./mvnw -Dtest=UserImplTest test` | **bloqueado** — repetição com o socket do Docker Desktop e sem Ryuk manteve o erro | saída da execução local |

O Docker CLI responde pelo contexto `desktop-linux`, mas o Testcontainers 1.20.6
não consegue validar o mesmo daemon: as estratégias de socket e de ambiente
retornam HTTP 400 ao consultar o daemon. Como consequência, o SQL Server
DevService não sobe. Não foi usada conexão de homologação/produção, não foi
adicionada desativação global de autenticação e nenhum recurso externo foi
encerrado.

Os sete casos backend da linha de base permanecem `blocked` até que o daemon
seja acessível ao Testcontainers: três de `AuthResourceIT`, o preparo de token
de `CategoryResourceIT` e três de `PublicCouncillorProfileResourceIT`. Os
relatórios históricos ainda registram as falhas de contrato desses casos; a
execução atual não alcançou esses ITs e, portanto, não os declara aprovados.

## Reconciliação dos 60 itens

- 53/53 itens frontend: **passed** na execução sem o gate de cobertura.
- 7/7 itens backend: **blocked** por infraestrutura antes da execução dos ITs.
- 0 itens foram descartados; o inventário inicial e seus dez arquivos sem
  suíte executável foram reparados com casos executáveis.
- Aprovação global: **não aprovada**, pois cobertura frontend, lint baseline e
  infraestrutura backend ainda impedem o gate final. Os thresholds de 80% e as
  exclusões de cobertura foram preservados.

