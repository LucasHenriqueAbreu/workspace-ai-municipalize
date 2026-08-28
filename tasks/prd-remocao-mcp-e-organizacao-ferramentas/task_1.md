# Tarefa 1.0: Caracterização, cobertura e configuração neutra

## Visão geral

Estabelecer o baseline que protege a paridade durante a refatoração e preparar
a infraestrutura de qualidade e configuração para que as capacidades possam
deixar de depender de nomenclatura MCP. Esta tarefa não remove o transporte
antigo nem altera os consumidores finais.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: definir o baseline das capacidades e a
  futura separação de ownership sem criar um módulo compartilhado genérico.
- `nestjs-features-performance`: preparar cobertura, configuração tipada e
  verificações operacionais necessárias ao rollout.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

O `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md` e todas as rules
globais e locais foram lidos. Aplicam-se especialmente: preservação de trabalho
existente, configuração tipada antes do tráfego, ausência de segredos, uso do
monólito modular, cobertura mínima de 80%, comandos do projeto e validação de
`git diff --check`. Não há desvio planejado.
</rules>

<requirements>

- RF2, RF3, RF5, RF6, RF7 e RF15.
- Registrar como contrato de caracterização as 91 definições, 89 tools
  habilitadas, 58 de leitura, 31 com confirmação, 2 desabilitadas, 36
  documentos e 18 prompts.
- Criar ou completar a configuração Vitest/V8 com thresholds de 80% para
  statements, branches, functions e lines, sem reduzir exclusões para mascarar
  código não coberto.
- Preparar a migração de configuração para nomes neutros e a matriz de
  development, homologation, production e CI sem registrar valores secretos.
</requirements>

## Subtarefas

- [x] 1.1 Capturar nomes, schemas, annotations, políticas, resultados e hash do
  catálogo atual como fixture determinística de caracterização.
- [x] 1.2 Capturar ids, domínios, associações e conteúdo dos documentos e
  prompts atuais como baseline de guidance.
- [x] 1.3 Configurar o provider de cobertura V8, seu script de execução e os
  thresholds obrigatórios.
- [x] 1.4 Definir os contratos de configuração neutra, os nomes de variáveis e
  a matriz de atualização de CI/deploy para a migração coordenada.
- [x] 1.5 Documentar dependências, sinais de startup, rollback por artefato e
  comandos de validação que serão usados nas tarefas seguintes.

## Detalhes de implementação

Consultar `techspec.md`, seções **Modelos de dados**, **Abordagem de testes**,
**Sequenciamento do desenvolvimento**, **Monitoramento e observabilidade** e
**Riscos conhecidos**. A caracterização deve ser reutilizável pelos testes
pelos testes das capacidades migradas e pela validação final; não deve
introduzir uma API HTTP ou uma dependência nova de MCP.

## Critérios de aceitação relacionados

- CA-10

## Testes da tarefa

Os testes abaixo são preparatórios e devem possuir assertions significativas;
os casos normativos da TechSpec serão concluídos nas tarefas proprietárias.

### Testes de unidade

- [x] Caracterização determinística do inventário atual do catálogo.
- [x] Caracterização determinística de ids, associações e conteúdo de guidance.
- [x] Loader/configuração de cobertura com thresholds de 80%.

### Testes de integração

- [x] Verificação do carregamento da configuração de teste sem valores reais ou
  exposição de segredos.

### Testes E2E

- Não aplicável nesta tarefa.

## Arquivos relevantes

- `municipalize-admin-app/package.json`
- `municipalize-admin-app/package-lock.json`
- `municipalize-admin-app/vitest.config.ts`
- `municipalize-admin-app/tests/modules/mcp/mcp-catalog-compatibility.spec.ts`
- `municipalize-admin-app/src/modules/mcp/tools/**`
- `municipalize-admin-app/src/modules/mcp/resources/**`
- `municipalize-admin-app/src/modules/mcp/prompts/**`
- `municipalize-admin-app/.env.example`
- `municipalize-admin-app/README.md`
- `municipalize-admin-app/.github/workflows/main_municipalize-hml-srv-node.yml`
