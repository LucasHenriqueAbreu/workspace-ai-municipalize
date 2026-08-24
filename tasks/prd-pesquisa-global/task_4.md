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

- [ ] 4.1 Inspecionar o estado vigente e escolher a próxima versão Flyway.
- [ ] 4.2 Criar catálogo, colunas, índices e condições de população/reconstrução.
- [ ] 4.3 Implementar a validação operacional de disponibilidade e compatibilidade.
- [ ] 4.4 Criar suíte SQL Server com execução a partir do estado anterior e repetição segura quando aplicável.

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

- [ ] TU-08 — normalização textual, códigos, aspas, operadores e limites.

### Testes de integração

- [ ] TI-05 — migration incremental, preservação de dados e população do catálogo.
- [ ] TI-06 — FTS real com idioma, acento, prefixo, múltiplos termos, SAPL e CNPJ.
- [ ] TI-07 — FTS ausente/incompatível sem fallback silencioso.

## Arquivos relevantes

- `ms-main/src/main/resources/db/migration/V<next>__extend_fulltext_for_global_search.sql`
- `ms-main/Dockerfile.mssql`
- `ms-main/docker-compose.yaml`
- Testes SQL Server em `ms-main/src/test/java/br/com/municipalize/integration`.
