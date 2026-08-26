# Tarefa 5.0: Endpoint backend de Pesquisa Global

## Visão geral

Implementar a única operação autenticada de pesquisa global, com consulta nativa agregada, estratégias tipadas, autorização, ranking, deduplicação, estatísticas e paginação.

<skills>
### Conformidade com skills

Nenhuma skill adicional específica foi identificada. Aplicar as regras Java/Quarkus e de testes do `ms-main`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local e todas as rules aplicáveis. Resources tratarão HTTP, services regras, repositories persistência; manter timeout, tenant, autorização, logs seguros e contratos existentes.
</rules>

<requirements>

- Implementar `GET /global-search` para os cinco tipos iniciais.
- Executar somente campos fechados, relações de primeiro nível e contexto autorizado.
- Priorizar correspondências diretas sobre relacionais e código SAPL exato.
- Retornar no máximo 20 itens, counts coerentes, paginação determinística e resposta vazia válida.
- Usar uma única instrução agregada sem chamar resources/listagens individuais.
- Mapear indisponibilidade do FTS para `503 GLOBAL_SEARCH_UNAVAILABLE`.
</requirements>

## Subtarefas

- [x] 5.1 Implementar normalizador, autorização de tipos e construção do contexto.
- [x] 5.2 Criar assembler, repository e estratégias de usuário, projeto, emenda, vereador e instituição.
- [x] 5.3 Implementar ranking, deduplicação, contagens, paginação e projeção tipada.
- [x] 5.4 Criar resource, validações, timeout e mapeamento de erros.
- [x] 5.5 Validar plano de execução e p95 com volume representativo.

## Detalhes de implementação

Consultar `techspec.md`, seções “Principais interfaces” backend, “Ranking e deduplicação”, “Endpoints da API” e “Pontos de integração”.

## Critérios de aceitação relacionados

- CA-13
- CA-14
- CA-15
- CA-16
- CA-17
- CA-18
- CA-19
- CA-20
- CA-21
- CA-22
- CA-24
- CA-25
- CA-27
- CA-30

## Testes da tarefa

### Testes de unidade

- [x] TU-09 — bindings, campos permitidos, relações e ausência de ID interno por estratégia.
- [x] TU-10 — interseção de tipos autorizados, paginação, counts, vazio, timeout e envelopes.
- [x] TU-11 — mapeamento seguro dos metadados discriminados.

### Testes de integração

- [x] TI-08 — REST com autenticação, filtros, limites, paginação e contrato genérico.
- [x] TI-09 — cinco tipos simultâneos, ranking direto/relacional, deduplicação e counts.
- [x] TI-10 — autorização, isolamento, dados sensíveis e nenhum resultado.
- [x] TI-11 — plano e p95 de até 500 ms no volume representativo.

## Arquivos relevantes

- `ms-main/src/main/java/br/com/municipalize/rest/GlobalSearchResource.java`
- `ms-main/src/main/java/br/com/municipalize/service/GlobalSearchService.java`
- `ms-main/src/main/java/br/com/municipalize/repository/GlobalSearchRepository.java`
- `ms-main/src/main/java/br/com/municipalize/impl/GlobalSearchRepositoryImpl.java`
- `ms-main/src/main/java/br/com/municipalize/impl/query/*GlobalSearchQueryStrategy.java`

## Validação executada

- `./mvnw -Dtest=GlobalSearchResourceIT -DskipITs=false test`: aprovado; 6 testes passaram, cobrindo os cinco tipos, ranking, deduplicação, counts, autorização, dados sensíveis, registros arquivados e resposta vazia.
- O teste de plano confirmou o uso de `CONTAINSTABLE` via `SET SHOWPLAN_XML`.
- O benchmark com 20 amostras da consulta agregada passou com p95 de até 500 ms, após a autorização resolvida e sem misturar a latência externa do OIDC/UserInfo.
- `./mvnw test`: aprovado; 276 testes passaram.
- `./mvnw package`: aprovado.
- `./mvnw verify`: a integração de Pesquisa Global passou (6 testes), mas a execução completa ainda falha em 7 testes preexistentes e não relacionados, nas classes `AuthResourceIT`, `CategoryResourceIT` e `PublicCouncillorProfileResourceIT`, envolvendo Keycloak/autorização. Esses testes precisam de correção ou estabilização separada.
