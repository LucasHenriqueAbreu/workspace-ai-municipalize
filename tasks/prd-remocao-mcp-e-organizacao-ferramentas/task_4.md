# Tarefa 4.0: Construir o catálogo nativo e migrar as tools

## Visão geral

Substituir os registradores acoplados ao servidor MCP por definições nativas de
tools, um catálogo central e um executor que aplica policy, valida argumentos,
resolve identidade e chama handlers de domínio pelo gateway.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: definir `ToolsModule`, sua API pública e a
  direção acíclica para identidade e gateway.
- `nestjs-oop-design-patterns`: organizar `ToolDefinition`, policies,
  handlers, adaptadores de resultado e classificação de conta/perfil.
- `nestjs-features-performance`: garantir ordem de autorização, erros seguros,
  confirmação, cancelamento e cobertura dos fluxos críticos.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se providers privados, exports mínimos,
domínio sem Nest/HTTP/SDK, schemas Zod na fronteira, argumentos imutáveis,
ausência de `any`, política antes de I/O e cobertura direta de código novo.
Não há desvio planejado.
</rules>

<requirements>

- RF1, RF2, RF3, RF4 e RF14.
- Preservar as 91 definições, 89 habilitadas, nomes, descrições, schemas,
  annotations, resultados, metadados e políticas vigentes.
- Fazer `ToolCatalogService.execute` localizar a definição, aplicar policy,
  resolver identidade, validar argumentos, chamar handler e normalizar resultado
  nessa ordem.
- Recusar tool desconhecida, desabilitada ou não confirmada antes de
  autenticação, gateway ou qualquer I/O.
- Manter tools de conta/perfil no domínio próprio, sem classificá-las como
  autenticação da execução.
</requirements>

## Subtarefas

- [ ] 4.1 Criar contratos nativos de definição, execução, resultado, erro e
  metadados em `ToolsModule`.
- [ ] 4.2 Adaptar policy e catálogo para `listEnabled()` e `execute()` com
  validação Zod e ordem invariável de execução.
- [ ] 4.3 Converter registradores, schemas, handlers, paginação e resultados de
  todos os domínios de `mcp/tools/**`.
- [ ] 4.4 Conectar identidade e gateway somente por suas APIs públicas e passar
  contexto e `AbortSignal` explicitamente aos handlers.
- [ ] 4.5 Comparar catálogo nativo com a caracterização e corrigir qualquer
  diferença de nome, schema, política, resultado ou contagem.

## Detalhes de implementação

Consultar `techspec.md`, seções **Visão dos componentes**, **Fluxo alvo**,
**Principais interfaces**, **Modelos de dados**, **Pontos de integração** e
**Principais decisões**. Não criar servidor em memória, cast de `McpServer`,
contexto de transporte, URL do consumidor ou HTTP para a própria Admin API.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-04
- CA-05
- CA-06

## Testes da tarefa

### Testes de unidade

- [ ] TU-01 — caracteriza o catálogo nativo completo.
- [ ] TU-02 — aplica política antes de qualquer I/O.
- [ ] TU-03 — executa tool de leitura com argumentos validados.
- [ ] TU-04 — mantém classificação de conta/perfil sem confundir identidade.

### Testes de integração

- [ ] TI-01 — executa tool de leitura no grafo real de módulos.
- [ ] TI-02 — bloqueia mutação antes de chamar o backend.

### Testes E2E

- Não aplicável nesta tarefa; a execução real será validada na tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/municipalize-tools/**`
- `municipalize-admin-app/src/modules/mcp/tools/**`
- `municipalize-admin-app/src/modules/tools/tools.module.ts`
- `municipalize-admin-app/src/modules/tools/application/**`
- `municipalize-admin-app/src/modules/tools/domain/**`
- `municipalize-admin-app/src/modules/tools/infrastructure/**`
- `municipalize-admin-app/tests/modules/municipalize-tools/**`
- `municipalize-admin-app/tests/modules/mcp/mcp-catalog-compatibility.spec.ts`
- `municipalize-admin-app/tests/modules/tools/**`
