# Tarefa 7.0: Retirar completamente o MCP e atualizar a operação

## Visão geral

Após todos os consumidores usarem as APIs nativas, remover o transporte, o
servidor, os tipos, a configuração e os testes exclusivos de MCP, atualizando o
artefato operacional para que não restem referências ativas ou aliases `MCP_*`.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: confirmar que a remoção não deixa módulos,
  providers ou dependências órfãos nem altera o ownership final.
- `nestjs-features-performance`: conduzir limpeza de configuração, pipeline,
  artefato, observabilidade, smoke e rollback coordenado.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas
as rules globais e locais. Aplicam-se retirada segura de legado, busca de
consumidores em código/CI/deploy/secrets, atualização coordenada de variáveis,
preservação de contratos Chat/SSE, ausência de segredos e `git diff --check`.
Não há desvio planejado.
</rules>

<requirements>

- RF15 e RF16.
- Remover `src/modules/mcp`, rota, JSON-RPC, transporte, rate limiter, factory,
  SDK, tipos, adapters, configuração, testes exclusivos e nomenclatura MCP
  ativa.
- Atualizar `package.json` e `package-lock.json` juntos, `.env.example`,
  README, documentação operacional, CI/deploy e compose E2E.
- Confirmar que não há `MCP_*`, imports MCP, `@modelcontextprotocol/sdk`, rota
  MCP ou arquivo legado ativo no código de produção e no artefato.
</requirements>

## Subtarefas

- [x] 7.1 Procurar consumidores em código, frontend conhecido, jobs, CI,
  deploy, DNS, secrets e documentação antes das exclusões.
- [x] 7.2 Remover controller, transporte, servidor, tokens, erros, tipos e
  testes exclusivos da árvore MCP.
- [x] 7.3 Remover a dependência do SDK e atualizar o lockfile pelo npm.
- [x] 7.4 Remover configuração e nomenclatura MCP de `.env.example`, loaders,
  docs, workflow e compose, migrando para os nomes neutros coordenados.
- [x] 7.5 Implementar a verificação estática de ausência em fonte, dependências,
  configuração e artefato.

## Detalhes de implementação

Consultar `techspec.md`, seções **Endpoints da API**, **Sequenciamento do
desenvolvimento**, **Monitoramento e observabilidade**, **Riscos conhecidos** e
**Arquivos relevantes e dependentes**. Não executar nem corrigir os repositórios
legados `municipalize-mcp` ou `municipalize-chat-api`; qualquer referência
histórica deve ser apenas confirmada e removida dos projetos ativos.

## Critérios de aceitação relacionados

- CA-08
- CA-10

## Testes da tarefa

### Testes de unidade

- [x] TU-10 — verifica a ausência estática do transporte legado.

### Testes de integração

- [ ] Verificação do lockfile, configuração neutra, workflow, compose e
  conteúdo do artefato produzido pelo build.

### Testes E2E

- A validação do artefato em ambiente QA será feita na tarefa 8.

## Arquivos relevantes

- `municipalize-admin-app/src/modules/mcp/**`
- `municipalize-admin-app/src/modules/municipalize-tools/contextual-in-memory.transport.ts`
- `municipalize-admin-app/package.json`
- `municipalize-admin-app/package-lock.json`
- `municipalize-admin-app/.env.example`
- `municipalize-admin-app/README.md`
- `municipalize-admin-app/docs/mcp-deployment.md`
- `municipalize-admin-app/.github/workflows/main_municipalize-hml-srv-node.yml`
- `municipalize-admin-app/e2e/docker-compose.ms-main.qa.yaml`
- `municipalize-admin-app/tests/modules/mcp/**`
