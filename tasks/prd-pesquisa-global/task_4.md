# Tarefa 4.0: Migration e infraestrutura Full-Text Search

## Visão geral

Criar e validar o catálogo e os índices SQL Server necessários à pesquisa, preservando dados existentes e detectando indisponibilidade do Full-Text Search.

<skills>
### Conformidade com skills

Nenhuma skill adicional específica foi identificada. Aplicar as regras de Java/Quarkus, Flyway, SQL Server e testes do `ms-main`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local e as rules globais e locais aplicáveis. A migration será incremental, posterior à última versão, determinística, segura para dados existentes e validada em todos os tenants.
</rules>

<requirements>

- Criar migration nova sem alterar as migrations 134, 144 ou 145.
- Configurar catálogo compartilhado com idioma português 1046, atualização automática, sem stoplist e accent-insensitive.
- Cobrir prefixo AND de múltiplos termos, caixa, acento, SAPL e CNPJ formatados.
- Tornar incompatibilidade ou ausência do FTS identificável, sem fallback amplo.
</requirements>

## Subtarefas

- [x] 4.1 Inspecionar o estado vigente e escolher a próxima versão Flyway.
- [x] 4.2 Criar catálogo, colunas, índices e condições de população/reconstrução.
- [x] 4.3 Implementar a validação operacional de disponibilidade e compatibilidade.
- [x] 4.4 Criar suíte SQL Server com execução a partir do estado anterior e repetição segura quando aplicável.

## Detalhes de implementação

Consultar `techspec.md`, seções “SQL Server e Flyway”, “Ranking e deduplicação”, “Normalização” e “Testes de integração”.

## Critérios de aceitação relacionados

- CA-17
- CA-25
- CA-26
- CA-27
- CA-30

## Testes da tarefa

### Testes de unidade

- [x] TU-08 — normalização textual, códigos, aspas, operadores e limites.

### Testes de integração

- [x] TI-05 — migration incremental, preservação de dados e população do catálogo.
- [x] TI-06 — FTS real com idioma, acento, prefixo, múltiplos termos, SAPL e CNPJ.
- [x] TI-07 — FTS ausente/incompatível sem fallback silencioso.

## Validação executada

- Criada `V1.0.149__extend_fulltext_for_global_search.sql` a partir do estado `1.0.148`, sem alterar as migrations 134, 144 ou 145. A migration falha com `THROW` quando o FTS, o schema, o catálogo, a chave unique ou os índices esperados são incompatíveis.
- Criado `scripts/verify-global-search-fulltext.sql`, que deve ser executado uma vez por banco tenant. Ele exige FTS instalado, `CatalogoBusca` accent-insensitive, `PopulateStatus = 0`, idioma 1046, `CHANGE_TRACKING = AUTO`, `STOPLIST OFF`, dez colunas obrigatórias e chaves unique de uma coluna.
- No SQL Server 2022 com `Dockerfile.mssql`, a migration foi aplicada no `db-main` e no `db-main-cliente1`; a repetição no `db-main-cliente1` foi bem-sucedida. A verificação passou após a população assíncrona concluir.
- Consultas canário passaram: prefixo com acento e múltiplos termos em `partido`, prefixo SAPL em `emenda` e CNPJ formatado normalizado pelo índice convencional de `instituicao`. A query canário de SAPL/CNPJ também é executada pelo script sem depender de dados específicos.
- `./mvnw test -Dtest=GlobalSearchCommandTest,GlobalSearchResponseSerializationTest` passou com 6 testes; `./mvnw package -DskipTests` passou.
- `./mvnw verify -Dit.test=GlobalSearchFullTextMigrationIT` não foi concluído porque o ambiente de DevServices iniciou um SQL Server genérico sem o pacote FTS e ficou em preflight. A validação real foi executada diretamente no container configurado por `Dockerfile.mssql`; a suíte global Maven permanece dependente dessa configuração de infraestrutura.

## Arquivos relevantes

- `ms-main/src/main/resources/db/migration/V<next>__extend_fulltext_for_global_search.sql`
- `ms-main/Dockerfile.mssql`
- `ms-main/docker-compose.yaml`
- Testes SQL Server em `ms-main/src/test/java/br/com/municipalize/integration`.
