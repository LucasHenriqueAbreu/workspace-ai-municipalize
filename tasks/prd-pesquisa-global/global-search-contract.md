# Contrato público da Pesquisa Global

## Pesquisa

`GET /global-search` recebe `term`, `types`, `page` e `limit` como query
parameters. `term` é obrigatório e, após normalização Unicode, deve ter entre 3
e 120 caracteres. `page` começa em zero e `limit` varia de 1 a 20; os padrões
são `0` e `20`. `types` é repetível e aceita somente `USER`, `PROJECT`,
`AMENDMENT`, `COUNCILLOR` e `INSTITUTION`. O tenant é resolvido pelos
interceptors e pelo contexto autenticado, nunca por um identificador informado
como prova de acesso.

## Resultado

A resposta contém `normalizedTerm`, `results`, `total`, `countsByType`, `page`,
`pageSize`, `totalPages` e `hasMore`. O backend produz somente resultados de
origem `DATA`; `NAVIGATION` é reservado para o catálogo local do frontend.

Cada resultado possui `resourceId`, `origin`, `type`, `group`, `title`, textos
resumidos opcionais, `icon`, `score`, `match` e `metadata`. `match.kind` é
`DIRECT` ou `RELATIONSHIP`; correspondências diretas informam um
`GlobalSearchField`, e correspondências relacionais informam um
`GlobalSearchRelationship`. `displayText` tem no máximo 160 caracteres.

`metadata.kind` discrimina os campos permitidos por tipo:

- `USER`: `status`, `function`;
- `PROJECT`: `status`, `institutionName`;
- `AMENDMENT`: `saplCode`, `status`, `amendmentType`;
- `COUNCILLOR`: `partyName`, `partyAcronym`, `partyNumber`, `termEndDate`;
- `INSTITUTION`: `tradeName`, `cnpj`, `email`.

CPF, telefone, endereço completo, documentos, senha, token, Keycloak ID,
conteúdo completo e coleções relacionadas não pertencem ao contrato. Campos
ausentes são omitidos; o frontend descarta propriedades desconhecidas ao
mapear a resposta.

## Erros

O envelope permanece compatível com `ErrorResponse`:

```json
{
  "error": "GLOBAL_SEARCH_UNAVAILABLE",
  "message": "A pesquisa está temporariamente indisponível."
}
```

Os códigos previstos são `INVALID_SEARCH_TERM`, `INVALID_PAGINATION`,
`INVALID_SEARCH_TYPE`, `GLOBAL_SEARCH_UNAVAILABLE` e `GLOBAL_SEARCH_ERROR`.
Mensagens públicas não contêm SQL, o termo digitado, identificadores de outro
tenant ou a causa interna.
