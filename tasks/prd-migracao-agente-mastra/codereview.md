# Relatório de revisão de código — Migração do agente para Mastra

## Resumo
- Data: 2026-08-27
- Branch: `manutencao-chat-ia` (`municipalize-admin-app`)
- Status: APROVADO COM RESSALVAS
- QA anterior: APROVADO no escopo unitário

## Verificação do QA
| Defeito ou correção | Implementado | Teste de regressão | Observações |
|---------------------|--------------|--------------------|-------------|
| BUG-01 — fronteira de policy | SIM | SIM | `mastra-studio.module.spec.ts` permanece verde. |
| BUG-02 — listener HTTP do `mastra:dev` | SIM | SIM | Bootstrap usa `createNodeServer`; build e smoke anterior passam. |
| BUG-03 — HTML/assets públicos | SIM | PARCIAL | Middleware autentica somente `/api/*`; o envelope foi alinhado à TechSpec, mas não há teste HTTP automatizado para o novo formato. |
| BUG-04 — ajustes LiteLLM/lint | SIM | SIM | Lint, typecheck, build e testes Mastra passam. |

## Conformidade com regras
| Regra | Status | Observações |
|------|--------|-------------|
| Autenticação, autorização e isolamento por `resourceId` | OK | A identidade é derivada do backend cadastrado e as credenciais ficam fora do `RequestContext` serializável, em tabela fraca de memória. |
| Segredos fora de metadata, traces e logs | OK | Regressão confirma que bearer/customer não aparecem na serialização do contexto. |
| Cobertura mínima da entrega | EXCEÇÃO DOCUMENTADA | Por solicitação do responsável, o threshold desta entrega é temporariamente 50%, devido à cobertura preexistente de outras atividades. A meta permanente da Admin API continua 80%. |
| Arquivos e métodos pequenos | PARCIAL | Bootstrap, catálogo e lifecycle ainda excedem o limite local de 100 linhas; auxiliares novos foram extraídos. |
| Encerramento de recursos | OK | O shutdown tenta fechar servidor, Mastra, memória e contexto Nest mesmo quando uma etapa falha. |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Runtime Mastra local sem nova API de produção | SIM | A execução continua no bootstrap de desenvolvimento com `createNodeServer`. |
| Identidade e `resourceId` server-derived | SIM | O contexto seguro preserva a identidade somente em memória e o `resourceId` reservado no request context. |
| Tools nativas sem transporte MCP | PARCIAL | Não há cliente/servidor/transporte criado, mas o catálogo ainda depende dos tipos `McpServer`/`McpToolRequestExtra` e do registrador MCP. |
| Storage Mongo separado e working memory | SIM | Configuração e providers estão presentes; TI/E2E de persistência ainda não foram executados. |
| Título determinístico da primeira mensagem | SIM | `sendMessage` aguarda o stream e aplica o lifecycle idempotente; falta teste de integração do Studio. |
| Envelope `{ error: { name, message } }` | SIM | Middleware segue o contrato da TechSpec. |
| Cobertura temporária de 50% | SIM | O threshold foi configurado em 50% nesta entrega por decisão explícita do responsável. |

## Tarefas verificadas
| Tarefa | Status | Observações |
|------|--------|-------------|
| 1.0 a 5.0 | COMPLETA | Checklists e testes unitários correspondentes revisados. |
| 6.0 | INCOMPLETA | A subtarefa 6.6 permanece `[ ]`; os fluxos TI/E2E do Studio continuam para uma validação posterior, conforme o escopo aprovado do QA. |

## Testes
- Total de testes: 284
- Passando: 284
- Falhando: 0
- Cobertura: 59,71% statements/lines, 70,20% functions e 71,98% branches; threshold temporário 50%
- Também passaram: `npm test -- tests/modules/mastra-studio` (22 testes), `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`.

## Problemas encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Média | `tasks/prd-migracao-agente-mastra/task_6.md` | 62-64 | A subtarefa 6.6 e cinco critérios de aceitação permanecem sem validação de integração/E2E. | Executar TI/E2E no ambiente QA/homologação, incluindo isolamento, retomada, remoção, quatro domínios e persistência Mongo. |
| Média | `municipalize-admin-app/src/modules/mastra-studio/municipalize-tool-catalog.capture.ts` | 1-3, 22-46 | A captura declarada como transport-neutral ainda usa tipos e assinatura de registro MCP. | Introduzir uma interface de catalogação própria e um adapter MCP separado. |
| Média | `municipalize-admin-app/src/modules/mastra-studio/mastra-studio.module.ts` | 59-65 | `MunicipalizeToolCatalogService` é provido pelo `MastraStudioModule`, embora a TechSpec defina sua API pública em `MunicipalizeToolsModule`. | Mover o provider para o módulo dono ou formalizar uma porta pública sem ciclo de dependência. |
| Baixa | `municipalize-admin-app/vitest.config.ts` | 9-12 | O threshold temporário de 50% não representa a meta permanente de 80%. | Manter a exceção somente nesta entrega e elevar o threshold após cobrir a dívida preexistente. |

## Pontos positivos
- A suíte completa permaneceu verde, com 90 arquivos e 284 testes aprovados.
- O bearer e o access token não ficam mais dentro do `RequestContext` serializável.
- O `resourceId` continua server-derived e a policy de tools é aplicada antes da execução.
- O bootstrap inicia listener real, mantém Studio/assets públicos e fecha os recursos em cadeia.
- O título determinístico foi conectado ao caminho nativo de `sendMessage`.

## Recomendações
- Executar a subtarefa 6.6 e atualizar a matriz de CA/TI/E2E com evidências sanitizadas.
- Adicionar testes HTTP/integração para middleware, stream, persistência, cancelamento e envelope de erro.
- Desacoplar o catálogo ativo dos tipos de transporte MCP antes de consolidar a migração.
- Recuperar gradualmente a meta permanente de 80% de cobertura.

## Conclusão

A implementação está aprovada no escopo unitário definido pelo QA: 284 testes passam, a cobertura atende ao threshold temporário de 50%, e lint, typecheck, build e integridade também passam. O resultado é APROVADO COM RESSALVAS porque os fluxos de integração/E2E ainda não foram validados e permanecem desvios arquiteturais documentados. A aprovação não cobre os critérios explicitamente deixados para a subtarefa 6.6.
