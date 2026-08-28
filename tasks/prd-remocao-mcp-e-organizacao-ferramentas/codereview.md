# Relatório de revisão de código — remoção do MCP e organização das ferramentas

## Resumo

- Data: 2026-08-28
- Branch: `agent/refatoracao-admin-app`
- Status: REPROVADO
- QA anterior: APROVADO

O comportamento funcional, a compilação e os testes existentes estão verdes.
Contudo, o gate de cobertura não mede todo o código alterado pela
funcionalidade: `vitest.config.ts` inclui somente um subconjunto pequeno dos
módulos migrados. Uma medição de escopo da funcionalidade falha os thresholds
de 80%, portanto a revisão não pode aprovar a entrega.

## Verificação do QA

| Defeito ou correção | Implementado | Teste de regressão | Observações |
|---------------------|--------------|--------------------|-------------|
| BUG-01 — token explícito no `MunicipalizeHttpClient` | SIM | SIM | Startup coberto por teste de módulo e E2E. |
| BUG-02 — tokens explícitos no `ToolCatalogService` | SIM | SIM | Startup/DI coberto pelo E2E. |
| BUG-03 — exportação do token de ambiente do gateway | SIM | SIM | Composição dos módulos validada. |
| BUG-04 — configuração dedicada para `qa:tools` | SIM | SIM | Runner E2E usa `vitest.e2e.config.ts`. |
| BUG-05 — fixture com client/issuer compatíveis | SIM | SIM | E2E-01 aprovado. |
| BUG-06 — bootstrap com entidades elegíveis e função autorizada | SIM | SIM | E2E-02 aprovado. |
| BUG-07 — timeout E2E ampliado | SIM | SIM | E2E-01/E2E-02 aprovados. |

## Conformidade com regras

| Regra | Status | Observações |
|------|--------|-------------|
| Arquitetura modular NestJS e fronteiras entre módulos | OK | Módulos proprietários exportam APIs estreitas; a injeção do guidance foi corrigida para usar o container. |
| Injeção de dependências e composição no container | OK | Tokens explícitos preservados; removida instanciação manual de `NativeGuidanceRegistryService`. |
| Segurança, autenticação, tenant e não exposição de segredos | OK | Identidade e isolamento foram cobertos pelo QA/E2E; nenhum segredo foi adicionado aos artefatos revisados. |
| Código TypeScript estrito e sem `any` em produção | OK | `typecheck` e `lint` passaram. |
| Cobertura mínima e testes significativos para código alterado | NOK | A configuração de cobertura mascara a maior parte dos adapters/tools migrados e dos módulos de gateway/identity. |
| Compatibilidade HTTP/SSE e ausência de transporte MCP ativo | OK | Suíte HTTP/SSE, teste arquitetural e QA anterior passaram; não há imports MCP ativos em `src`. |

## Aderência à TechSpec

| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Catálogo nativo único com políticas de leitura/confirmação/desabilitação | SIM | Inventário de 91 definições e 89 habilitadas preservado no QA. |
| Ordem de execução: localizar, política, identidade, argumentos e handler | SIM | A ordem de identidade antes da validação de argumentos foi ajustada durante esta revisão. |
| BackendGateway com resolução por cliente/ambiente, timeout e cancelamento | SIM | Validado por testes de gateway e E2E. |
| ExecutionIdentity com validação Keycloak e vínculo do usuário | SIM | Validado por testes unitários, integração e E2E. |
| Guidance nativo com documentos e prompts | SIM | 36 documentos e 18 prompts preservados; assets copiados no build. |
| Chat, AgentRuntime e Mastra usando ferramentas nativas | SIM | Contratos existentes passam; foi acrescentado teste de aprovação/execução nativa no factory do Mastra. |
| Remoção de módulo, rota, transporte e SDK MCP ativos | SIM | `src/modules/mcp` e imports ativos removidos; permanecem pacotes MCP transitivos trazidos pelo Mastra, sem uso direto. Confirmar se RF15 exige remoção também dos transitivos. |
| Cobertura V8 de todo o escopo migrado com thresholds de 80% | NÃO | O script passa apenas porque `coverage.include` seleciona nove arquivos centrais. |

## Tarefas verificadas

| Tarefa | Status | Observações |
|------|--------|-------------|
| 1.0 Caracterização, cobertura e configuração neutra | INCOMPLETA | Baseline e thresholds existem, mas a inclusão seletiva não cobre o escopo migrado e contraria a exigência de não mascarar código. |
| 2.0 Extrair o BackendGatewayModule | COMPLETA | Composição, timeout e cancelamento validados. |
| 3.0 Extrair o ExecutionIdentityModule | COMPLETA | Validações e isolamento validados. |
| 4.0 Construir catálogo nativo e migrar tools | COMPLETA | Inventário/políticas preservados e execução coberta funcionalmente. |
| 5.0 Migrar resources e prompts para AgentGuidanceModule | COMPLETA | Assets, documentos e prompts validados. |
| 6.0 Adaptar AgentRuntime, Chat e Mastra | COMPLETA | Contratos e teste de execução Mastra nativa validados. |
| 7.0 Retirar transporte legado e atualizar operação | COMPLETA | Nenhum transporte MCP ativo encontrado em produção. |
| 8.0 Executar integração QA, E2E e gate final | INCOMPLETA | QA/E2E e gates básicos passaram, mas o gate de cobertura não é representativo do escopo real. |

## Testes

- Total de testes: 245
- Passando: 245
- Falhando: 0
- Cobertura do script atual: 95,29% statements/lines; 89,41% branches; 100% functions
- Cobertura do escopo real avaliado: 71,74% statements/lines; 70,11% branches; 53,81% functions — abaixo da meta de 80%

Comandos aprovados nesta revisão: `npm test`, `npm run test:coverage`,
`npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`.

## Problemas encontrados

| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| Alta | `municipalize-admin-app/vitest.config.ts` | 8-18 | `coverage.include` seleciona somente nove arquivos centrais. A migração alterou dezenas de adapters/tools de domínio, além de gateway, identity, guidance, Chat, runtime e Mastra, que ficam fora da medição oficial. A execução direcionada ao escopo real passou todos os testes, mas obteve 71,74%/70,11%/53,81% e falhou o threshold de 80%. Isso torna o CA-10 falsamente verde. | Remover a lista curada ou ampliá-la para todo o código novo/alterado da funcionalidade, preservar os quatro thresholds de 80% e criar testes unitários/integrados significativos para as linhas descobertas. Reexecutar o gate completo antes de aprovar. |

## Pontos positivos

- A remoção do transporte MCP ativo foi ampla e não deixou módulo, rota ou import de produção ativo.
- A separação entre catálogo, identidade, gateway e guidance está coerente com o monólito modular.
- O QA cobriu os quatro cenários E2E relevantes e revalidou os sete bugs encontrados.
- Durante a revisão, a autenticação passou a ocorrer antes da validação de argumentos e a dependência de guidance deixou de ser criada manualmente.
- O teste adicionado cobre `requireApproval`, propagação de contexto e execução confirmada pelo Mastra.

## Recomendações

- Corrigir a configuração de cobertura antes do merge; este é o único bloqueador encontrado nesta revisão.
- Adicionar uma verificação de dependências para decidir explicitamente se os pacotes MCP transitivos trazidos por `@mastra/core` são aceitáveis sob RF15.
- Após a correção, repetir a suíte completa, cobertura, build e os cenários E2E do QA.

## Conclusão

Parecer REPROVADO. A implementação está funcionalmente consistente e os gates
de comportamento, tipos, lint e build passam, mas o gate de cobertura não é
confiável para o escopo entregue. Enquanto o `vitest.config.ts` não medir o
código migrado e os thresholds de 80% não forem atendidos nessa medição, a
entrega não deve ser considerada pronta para aprovação final.
