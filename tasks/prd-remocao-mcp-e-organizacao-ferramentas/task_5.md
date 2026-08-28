# Tarefa 5.0: Migrar resources e prompts para o AgentGuidanceModule

## Visão geral

Retirar a orientação operacional da forma de resource/prompt MCP e torná-la um
catálogo interno de documentos e prompts, preservando conteúdo, identificadores,
domínios e associações com as tools.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: definir ownership da orientação e a API
  pública mínima do `AgentGuidanceModule`.
- `nestjs-oop-design-patterns`: modelar registry, summaries e carregamento de
  assets sem wrappers sem comportamento.
- `nestjs-features-performance`: garantir carregamento de assets no artefato,
  limites, erros seguros e verificação de build.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se ownership por feature, assets copiados
para `dist`, filesystem assíncrono no runtime, conteúdo sem segredos, contratos
tipados, testes determinísticos e ausência de URI ou SDK MCP. Não há desvio
planejado.
</rules>

<requirements>

- RF5, RF6 e RF7.
- Preservar os 36 documentos Markdown e 18 prompts com conteúdo, ids, títulos,
  domínios e associação às tools.
- Expor somente consulta interna por lista, id, domínio ou tool, sem endpoint
  HTTP, URI, registro ou tipo de protocolo.
- Incluir os assets no build e falhar de forma explícita e segura quando um
  asset registrado não estiver disponível.
</requirements>

## Subtarefas

- [x] 5.1 Criar `AgentGuidanceModule` e o contrato `ToolGuidanceService`.
- [x] 5.2 Mover documentos e prompts para `agent-guidance/assets/**`, mantendo
  ids, conteúdo e associações.
- [x] 5.3 Criar registry tipado para descoberta por id, domínio e tool.
- [x] 5.4 Atualizar `nest-cli.json` e validar a presença dos assets em `dist`.
- [x] 5.5 Comparar o catálogo nativo de guidance com o baseline da tarefa 1.

## Detalhes de implementação

Consultar `techspec.md`, seções **Visão dos componentes**, **Principais
interfaces**, **Modelos de dados**, **Pontos de integração** e **Abordagem de
testes**. A orientação é estática e versionada; não deve ser transformada em
endpoint nem exigir Keycloak, MongoDB, `ms-main` ou E2E de navegador.

## Critérios de aceitação relacionados

- CA-03

## Testes da tarefa

### Testes de unidade

- [x] TU-08 — preserva orientação interna.
- [x] TU-09 — carrega assets de guidance empacotados.

### Testes de integração

- [ ] Verificação do build e leitura dos assets registrados no artefato.

### Testes E2E

- Não aplicável nesta tarefa; a presença no artefato será confirmada na tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mcp/resources/docs/**`
- `municipalize-admin-app/src/modules/mcp/resources/register-resources.ts`
- `municipalize-admin-app/src/modules/mcp/resources/read-markdown-resource.ts`
- `municipalize-admin-app/src/modules/mcp/prompts/**`
- `municipalize-admin-app/src/modules/agent-guidance/agent-guidance.module.ts`
- `municipalize-admin-app/src/modules/agent-guidance/application/**`
- `municipalize-admin-app/src/modules/agent-guidance/infrastructure/**`
- `municipalize-admin-app/src/modules/agent-guidance/assets/**`
- `municipalize-admin-app/nest-cli.json`
- `municipalize-admin-app/tests/modules/agent-guidance/**`
