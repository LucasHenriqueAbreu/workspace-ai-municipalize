# Evidência E2E — catálogo nativo

- Runner: `municipalize-admin-app/e2e/scripts/native-tools-qa.spec.ts`
- Composição: Keycloak, MongoDB, SQL Server e `ms-main` em Docker Compose isolado.
- Resultado: 1 arquivo de teste, 4 testes aprovados.
- Cenários: leitura autenticada; confirmação, mutação e reconciliação; rejeição de cliente divergente; startup/artefato sem transporte legado.
- Dados e credenciais: fixture sintética e credenciais temporárias; nenhum bearer ou segredo foi persistido.
