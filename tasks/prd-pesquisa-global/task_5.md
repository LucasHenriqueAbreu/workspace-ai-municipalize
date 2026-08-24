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

- [ ] 5.1 Implementar normalizador, autorização de tipos e construção do contexto.
- [ ] 5.2 Criar assembler, repository e estratégias de usuário, projeto, emenda, vereador e instituição.
- [ ] 5.3 Implementar ranking, deduplicação, contagens, paginação e projeção tipada.
- [ ] 5.4 Criar resource, validações, timeout e mapeamento de erros.
- [ ] 5.5 Validar plano de execução e p95 com volume representativo.

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

- [ ] TU-09 — bindings, campos permitidos, relações e ausência de ID interno por estratégia.
- [ ] TU-10 — interseção de tipos autorizados, paginação, counts, vazio, timeout e envelopes.
- [ ] TU-11 — mapeamento seguro dos metadados discriminados.

### Testes de integração

- [ ] TI-08 — REST com autenticação, filtros, limites, paginação e contrato genérico.
- [ ] TI-09 — cinco tipos simultâneos, ranking direto/relacional, deduplicação e counts.
- [ ] TI-10 — autorização, isolamento, dados sensíveis e nenhum resultado.
- [ ] TI-11 — plano e p95 de até 500 ms no volume representativo.

## Arquivos relevantes

- `ms-main/src/main/java/br/com/municipalize/rest/GlobalSearchResource.java`
- `ms-main/src/main/java/br/com/municipalize/service/GlobalSearchService.java`
- `ms-main/src/main/java/br/com/municipalize/repository/GlobalSearchRepository.java`
- `ms-main/src/main/java/br/com/municipalize/impl/GlobalSearchRepositoryImpl.java`
- `ms-main/src/main/java/br/com/municipalize/impl/query/*GlobalSearchQueryStrategy.java`
