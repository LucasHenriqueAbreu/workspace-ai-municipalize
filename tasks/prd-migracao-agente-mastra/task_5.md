# Tarefa 5.0: Catálogo de tools e contexto de entidades

## Visão geral

Extrair uma API de catálogo transport-neutral a partir das definições e handlers
atuais, adaptá-la para tools nativas do Mastra e conectar a execução ao contexto
autenticado. A tarefa deve preservar nomes, schemas, disponibilidade, políticas
e confirmações das 91 definições caracterizadas, expondo ao agente somente as 89
habilitadas e sem criar servidor, client ou transporte MCP.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: ownership do catálogo, API pública de
  `MunicipalizeToolsModule` e dependência direta sem reintroduzir MCP.
- `nestjs-oop-design-patterns`: adapters/factory e contratos de execução,
  separando política, validação, handler e normalização de resultado.
- `nestjs-features-performance`: autenticação, autorização, confirmação,
  timeout/cancelamento, sanitização, logs e testes de integração.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais e todas as rules locais da Admin API. Aplicam-se isolamento por
tenant e usuário, autenticação distinta do access token administrativo, uso
exclusivo do catálogo e do resolver existentes, validação de entradas externas,
política em defesa profunda, ausência de dados sensíveis em logs/persistência e
proibição de iniciar ou alterar os serviços legados. Não haverá duplicação da
semântica municipal nem dependência Mastra de transporte MCP.
</rules>

<requirements>

- RF6: resolver backend pela Câmara cadastrada.
- RF8: manter referências e evidências necessárias das entidades na thread.
- RF13: registrar todas as tools habilitadas do catálogo vigente.
- RF14: executar somente com contexto autenticado e encaminhá-lo ao handler.
- RF15: respeitar disponibilidade, autorização e confirmação vigentes.
- RF16: registrar evidências sanitizadas de tools e resultados.
- Preservar os nomes, descrições e schemas das tools; converter JSON Schema para
  Zod na fronteira Mastra sem alterar o contrato de argumentos.
- O catálogo atual caracteriza 91 tools, sendo 89 habilitadas, 58 de leitura e
  31 com confirmação; os testes devem proteger essa contagem e seus nomes.
- Tools de risco médio/alto devem retornar pendência até confirmação válida; o
  prompt não pode fornecer livremente `confirmed` como prova de autorização.
- O resultado bruto não deve ser copiado para working memory; guardar apenas
  referências, rótulos, tipo, versão quando disponível, resumo limitado e
  evidência permitida.
</requirements>

## Subtarefas

- [x] 5.1 Extrair `MunicipalizeToolDefinition` e handler para catálogo interno
  transport-neutral, preservando os registradores e consumidores MCP atuais.
- [x] 5.2 Expor `listEnabled()` e `execute()` pela API pública estreita do
  `MunicipalizeToolsModule`, com política e resolução do backend centralizadas.
- [x] 5.3 Implementar `MunicipalizeMastraToolFactory` com conversão de schema,
  nome/descrição, filtragem das 89 tools e adaptação do executor nativo Mastra.
- [x] 5.4 Reaplicar a política de acesso e confirmação antes do handler, mantendo
  a defesa em profundidade do `MunicipalizeToolPolicyService`.
- [x] 5.5 Encaminhar bearer efêmero, cliente, resource/thread e contexto de
  requisição ao handler direto, usando `RequestAuthenticationService` e o
  `CustomerBackendResolverService` sem HTTP interno ou MCP.
- [x] 5.6 Normalizar resultados, atualizar `MastraConversationContext`, filtrar
  segredos e testar consultas autorizadas de projetos, emendas, instituições e
  orçamento.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Visão dos componentes`, `Principais
interfaces`, `Mapeamento catálogo Municipalize → tool Mastra`, `Parâmetros fixos
na origem`, `Pontos de integração > Autenticação e backend da Câmara`, `Abordagem
de testes` e as decisões sobre catálogo direto, políticas e working memory.
Preservar `McpServerFactory` e `MunicipalizeToolExecutorService` para seus
consumidores existentes, sem fazê-los dependência do Mastra.

## Critérios de aceitação relacionados

- CA-02
- CA-03
- CA-07
- CA-08
- CA-09

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-04 — atualiza contexto apenas com referências permitidas de tool
- [x] TU-06 — mapeia somente tools habilitadas e conserva schema/nome
- [x] TU-07 — exige confirmação para tool de risco antes da execução

### Testes de integração (se aplicável)

- [ ] TI-05 — registra diretamente o catálogo Municipalize no Mastra
- [ ] TI-06 — executa tool de leitura com contexto autenticado
- [ ] TI-07 — bloqueia tool de escrita sem confirmação e autoriza após confirmação
- [ ] TI-08 — resolve URL de QA pelo cadastro da Câmara

## Arquivos relevantes

- `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tools.module.ts`
- `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tool.ts`
- `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tool-registrar.service.ts`
- `municipalize-admin-app/src/modules/municipalize-tools/municipalize-tool-executor.service.ts`
- `municipalize-admin-app/src/modules/municipalize-tools/policy/**`
- `municipalize-admin-app/src/modules/mcp/tools/**`
- `municipalize-admin-app/src/modules/mcp/auth/request-authentication.service.ts`
- `municipalize-admin-app/src/modules/mcp/context/**`
- `municipalize-admin-app/src/modules/mcp/integrations/customer-backend-resolver.service.ts`
- `municipalize-admin-app/tests/modules/mcp/mcp-catalog-compatibility.spec.ts`
- `municipalize-admin-app/tests/modules/mastra-studio/**`
