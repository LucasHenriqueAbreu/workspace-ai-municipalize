# Relatório de QA — remoção do MCP e organização das ferramentas

As evidências estão em `tasks/prd-remocao-mcp-e-organizacao-ferramentas/evidences/`.

## Resumo

- Data: 2026-08-28
- Status: APROVADO
- Total de critérios de aceitação: 10
- Critérios de aceitação atendidos: 10
- Bugs encontrados: 7, todos corrigidos e revalidados

## Critérios de aceitação verificados

| ID | Critério de aceitação | Casos de teste | Status | Evidência |
|----|-----------------------|----------------|--------|-----------|
| CA-01 | Catálogo com 91 definições, 89 habilitadas e contratos/políticas preservados | TU catálogo, arquitetura, E2E-04 | PASSOU | [E2E nativo](evidences/e2e-native-tools.md) |
| CA-02 | Leitura, confirmação e ferramentas desabilitadas respeitam as políticas | TU catálogo/política; E2E-02 | PASSOU | [E2E nativo](evidences/e2e-native-tools.md) |
| CA-03 | Guidance interno preserva documentos, prompts e resolução por domínio/tool | TU guidance; artefato | PASSOU | [Artefato estático](evidences/static-artifact.md) |
| CA-04 | Token ausente/inválido, usuário não confirmado e cliente divergente são rejeitados antes do backend | TU identidade; E2E-03 | PASSOU | [E2E nativo](evidences/e2e-native-tools.md) |
| CA-05 | Backend correto e contexto do usuário são propagados | TI gateway/identidade; E2E-01 | PASSOU | [E2E nativo](evidences/e2e-native-tools.md) |
| CA-06 | Gateway usa backend cadastrado, timeout e cancelamento seguros | TU/TI gateway; E2E-01 | PASSOU | [Gates automatizados](evidences/automated-gates.md) |
| CA-07 | Chat/runtime/Mastra usam catálogo nativo, sem servidor/cliente/transportes MCP ativos | arquitetura; E2E-04 | PASSOU | [Artefato estático](evidences/static-artifact.md) |
| CA-08 | Não há módulo, rota, configuração ou import MCP ativo; artefato legado ausente | arquitetura; build; E2E-04 | PASSOU | [Artefato estático](evidences/static-artifact.md) |
| CA-09 | Contratos HTTP/SSE atuais do Chat permanecem compatíveis | suíte HTTP/SSE existente | PASSOU | [Gates automatizados](evidences/automated-gates.md) |
| CA-10 | Lint, typecheck, testes, cobertura e build passam | gates finais | PASSOU | [Gates automatizados](evidences/automated-gates.md) |

## Testes E2E executados

| ID | Fluxo | Resultado | Observações |
|----|-------|-----------|-------------|
| E2E-01 | Ler snapshot autenticado no `ms-main` real | PASSOU | Keycloak, Mongo, SQL Server e backend em composição isolada |
| E2E-02 | Exigir confirmação, criar impedimento e reconciliar emenda | PASSOU | Mutação executada uma vez e leitura posterior aprovada |
| E2E-03 | Rejeitar cliente divergente antes do backend municipal | PASSOU | Nenhuma chamada ao tenant divergente |
| E2E-04 | Validar startup, guidance e ausência do artefato legado | PASSOU | 89 tools habilitadas; diretórios legados ausentes |

## Testes automatizados e cobertura

| Camada | ID | Resultado | Validação/comando | Observações |
|--------|----|-----------|-------------------|------------|
| Unidade/Integração | TU/TI | PASSOU | `npm test` | 83 arquivos, 244 testes |
| Cobertura | CA-10 | PASSOU | `npm run test:coverage` | 95,25% statements/lines; 89,28% branches; 100% functions |
| Qualidade estática | CA-10 | PASSOU | `npm run lint` | Sem warnings |
| Tipos | CA-10 | PASSOU | `npm run typecheck` | Produção e testes |
| Build | CA-10 | PASSOU | `npm run build` | Guidance copiado para `dist` |

- Cobertura: acima da meta mínima de 80% em todos os quatro indicadores.
- Acessibilidade e responsividade: não aplicáveis; o PRD não altera interface, rota ou componente frontend. A estratégia E2E definida para esta funcionalidade é execução direta via Nest DI. Ver [justificativa](evidences/ui-not-applicable.md).

## Bugs encontrados e corrigidos

| ID | Descrição | Severidade | Status | Correção | Teste de regressão | Evidência |
|----|-----------|------------|--------|----------|--------------------|-----------|
| BUG-01 | `MunicipalizeHttpClient` não resolvia a interface de ambiente em startup Nest | Alta | Corrigido | Token `BACKEND_GATEWAY_ENVIRONMENT` explícito | `municipalize-http-client.module.spec.ts`; E2E | [E2E nativo](evidences/e2e-native-tools.md) |
| BUG-02 | `ToolCatalogService` dependia de metadata implícita no runner E2E | Alta | Corrigido | Tokens explícitos no construtor | E2E-04/startup | [E2E nativo](evidences/e2e-native-tools.md) |
| BUG-03 | Token de ambiente do gateway não era exportado ao `ToolsModule` | Alta | Corrigido | Exportação do token pelo módulo proprietário | E2E-04/startup | [E2E nativo](evidences/e2e-native-tools.md) |
| BUG-04 | `qa:tools` era filtrado pela inclusão exclusiva de `tests/**/*.spec.ts` | Média | Corrigido | Configuração `vitest.e2e.config.ts` dedicada | Execução de `npm run qa:tools` | [Gates automatizados](evidences/automated-gates.md) |
| BUG-05 | Fixture E2E usava client/issuer incompatíveis com o realm Docker | Média | Corrigido | Client `backend-service`, secret por env e issuer interno | E2E-01 | [E2E nativo](evidences/e2e-native-tools.md) |
| BUG-06 | Bootstrap não criava emenda elegível nem função municipal autorizada | Média | Corrigido | Fixture cria instituição/emenda e usa `TECNICO_PREFEITURA` | E2E-02 | [E2E nativo](evidences/e2e-native-tools.md) |
| BUG-07 | Timeout padrão de 5 s era insuficiente para chamadas reais | Baixa | Corrigido | Timeout E2E configurado em 60 s | E2E-01/E2E-02 | [E2E nativo](evidences/e2e-native-tools.md) |

## Conclusão

QA aprovado. Os critérios funcionais, de segurança/isolamento, catálogo nativo,
guidance, compatibilidade Chat/SSE e qualidade do artefato foram validados. A
composição integrada passou nos quatro cenários E2E e os gates finais passaram
com cobertura superior à meta. Não foram alterados frontend, `ms-main` ou os
repositórios legados.
