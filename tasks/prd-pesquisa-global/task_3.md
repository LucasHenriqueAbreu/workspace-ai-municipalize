# Tarefa 3.0: Contratos e modelos da Pesquisa Global

## Visão geral

Definir os contratos controlados e extensíveis que serão compartilhados entre o endpoint backend e o frontend, sem acoplar a API a rotas ou componentes Angular.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`

No backend, aplicar as regras Java/Quarkus e de testes do `ms-main`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos os `AGENTS.md` dos projetos afetados, as rules globais e as regras de arquitetura, tipagem e testes. Manter unions discriminadas, contratos imutáveis, enumeração fechada e compatibilidade HTTP.
</rules>

<requirements>

- Criar tipos controlados para origem, tipo, ícone, match, campo e relacionamento.
- Modelar requisição, comando, página, contagens, resultado resumido e metadados discriminados.
- Modelar os itens de navegação e dados no mesmo modelo visual do frontend.
- Bloquear tipos desconhecidos e campos sensíveis no contrato.
</requirements>

## Subtarefas

- [ ] 3.1 Criar enums, records, request/response e comando no `ms-main`.
- [ ] 3.2 Criar entidades de domínio, contratos de repository e usecase no `municipalize-app`.
- [ ] 3.3 Implementar mapeamentos seguros e testes de contrato/serialização.
- [ ] 3.4 Documentar o contrato público e o envelope de erro sem expor detalhes internos.

## Detalhes de implementação

Consultar `techspec.md`, seções “Principais interfaces”, “Modelos de dados”, “Resposta agregada”, “Metadados discriminados” e “Envelope de erro”.

## Critérios de aceitação relacionados

- CA-13
- CA-14
- CA-15
- CA-22
- CA-23
- CA-27

## Testes da tarefa

### Testes de unidade

- [ ] TU-06 — validação de termo, página, limite e tipos desconhecidos.
- [ ] TU-07 — união discriminada e bloqueio de campos sensíveis.

### Testes de integração

- [ ] TI-04 — contrato REST de requisição, resposta e envelope de erro.

## Arquivos relevantes

- `ms-main/src/main/java/br/com/municipalize/rest/request/GlobalSearchRequest.java`
- `ms-main/src/main/java/br/com/municipalize/rest/response/GlobalSearch*Response.java`
- `ms-main/src/main/java/br/com/municipalize/model/enums/GlobalSearch*.java`
- `municipalize-app/src/app/domain/entities/GlobalSearch.ts`
- `municipalize-app/src/app/domain/repositories/GlobalSearchRepository.ts`
