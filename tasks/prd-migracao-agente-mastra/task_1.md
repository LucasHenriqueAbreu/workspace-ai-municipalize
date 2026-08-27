# Tarefa 1.0: Spike de compatibilidade, dependências e configuração

## Visão geral

Validar a compatibilidade do Mastra com a versão atual de Node.js, TypeScript,
NestJS, CommonJS, MongoDB e LiteLLM antes de construir a integração. Após a
compatibilidade ser comprovada, preparar as dependências pinadas, a configuração
tipada do Studio, o comando local e a infraestrutura de cobertura necessária.
Uma incompatibilidade sem estratégia de build suportada interrompe a tarefa
antes de uma instalação parcial.

<skills>
### Conformidade com skills

- `nestjs-architecture-principles`: composição local, limites do bootstrap e
  preservação do monólito NestJS.
- `nestjs-features-performance`: configuração tipada, segredos, dependências
  externas, cobertura e operação local.
- `nestjs-oop-design-patterns`: contratos pequenos para configuração e seams de
  teste, sem abstrações além das fronteiras reais.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-admin-app/AGENTS.md`, todas
as rules globais em `.agents/rules/` e as rules locais da Admin API. Aplicam-se
especialmente: mudança somente no repositório `municipalize-admin-app`,
configuração validada antes do uso, segredos fora de arquivos versionados,
compatibilidade CommonJS/TypeScript, cobertura mínima de 80%, documentação das
novas variáveis e `git diff --check`. Não há desvios planejados.
</rules>

<requirements>

- RF17: permitir a execução local do Mastra Studio.
- RF18: preservar a base e o ambiente de QA usados pelos testes de integração.
- RF19: manter a seleção de ambiente e backend baseada na configuração vigente,
  sem URL fixa específica de teste.
- A dependência e a versão escolhidas devem ser compatíveis com a configuração
  atual do projeto e documentadas como decisão do spike.
- A configuração local deve representar `mastraStudioEnabled`,
  `mastraStorageDatabaseName` e `modelId`; o bearer deve ser obrigatório quando
  o Studio estiver habilitado, efêmero e nunca versionado.
- O comando `mastra:dev` deve ser local e não deve alterar o listener de
  produção, o deploy ou os contratos HTTP/SSE atuais.
- O comando de testes deve aplicar os thresholds V8 de statements, branches,
  functions e lines em 80%, sem exclusões indevidas.
</requirements>

## Subtarefas

- [x] 1.1 Levantar as versões atuais e validar as APIs oficiais necessárias do
  Mastra, MongoDBStore, AI SDK, provider compatível com LiteLLM e CLI/Studio.
- [x] 1.2 Fixar as dependências compatíveis e comprovar build/entrypoint no
  modelo CommonJS atual; registrar o resultado e o sinal de parada em caso de
  incompatibilidade.
- [x] 1.3 Implementar o loader tipado `loadMastraStudioEnvironment`, sua
  validação, `.env.example`, README e configuração local/QA sem incluir bearer
  ou qualquer credencial real.
- [x] 1.4 Adicionar o script local `mastra:dev` e garantir que a configuração
  não carregue o Studio na inicialização normal da API.
- [x] 1.5 Configurar cobertura V8 do Vitest com os thresholds obrigatórios e
  criar os testes do loader e do comportamento de habilitação/ausência de
  bearer.
- [x] 1.6 Executar a verificação de compatibilidade, lint, typecheck e testes
  aplicáveis antes de liberar as tarefas dependentes.

## Detalhes de implementação

Consultar `techspec.md`, principalmente `Sequenciamento do desenvolvimento`,
`Dependências técnicas`, `Pontos de integração > Configuração`, `Abordagem de
testes` e os riscos de incompatibilidade de runtime e persistência de bearer.
Seguir os scripts reais de `municipalize-admin-app/package.json`; não criar uma
segunda configuração E2E dentro da API.

## Critérios de aceitação relacionados

- CA-10

## Testes da tarefa

Casos complementares de configuração necessários para habilitar os casos
formalmente definidos na TechSpec:

### Testes de unidade (se aplicável)

- [x] CFG-01 — rejeita configuração incompleta quando o Studio está habilitado
- [x] CFG-02 — aceita configuração local sem expor ou persistir o bearer

### Testes de integração (se aplicável)

- [x] SPIKE-01 — confirma que o entrypoint Mastra compatível inicia com a matriz
  de versões escolhida

## Arquivos relevantes

- `municipalize-admin-app/package.json`
- `municipalize-admin-app/tsconfig.json`
- `municipalize-admin-app/nest-cli.json`
- `municipalize-admin-app/src/config/load-mastra-studio-environment.ts`
- `municipalize-admin-app/src/config/`
- `municipalize-admin-app/.env.example`
- `municipalize-admin-app/README.md`
- `municipalize-admin-app/vitest.config.ts`
- `municipalize-admin-app/tests/config/`
