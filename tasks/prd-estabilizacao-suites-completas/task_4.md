# Tarefa 4.0: Tornar a infraestrutura de integração do backend isolada e reproduzível

## Visão geral

Estabilizar o ambiente dos testes de integração do `ms-main` para que SQL Server, Keycloak e as fixtures necessárias sejam provisionados, verificados e limpos de modo isolado. A tarefa elimina dependências implícitas de uma instalação local e torna qualquer indisponibilidade de infraestrutura um bloqueio explícito.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação incremental desta entrega.
- Não há skill local específica do `ms-main`; seguir o `AGENTS.md` e as rules Java/Quarkus/testes do projeto.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Aplicar integralmente `ms-main/AGENTS.md` e suas rules de Java, Java/Quarkus, testes, estrutura e padrões de código. Usar JDK 17 e Maven Wrapper; subir apenas dependências necessárias, confirmar prontidão real e encerrar apenas recursos iniciados nesta execução. Não versionar ou imprimir credenciais, tokens e connection strings; usar fixtures e configuração de teste seguras.
</rules>

<requirements>

- RF1, RF2 e RF3: distinguir falha de infraestrutura de falha de teste/contrato com evidência.
- RF7: permitir a execução dos sete testes backend inicialmente identificados.
- RF10 e RF11: registrar comando, pré-requisito, impacto e ação necessária em caso de bloqueio.
</requirements>

## Subtarefas

- [x] 4.1 Mapear os perfis Maven/Quarkus, Testcontainers, Docker Compose e fixtures usados pelos `*IT` afetados.
- [ ] 4.2 Definir um único caminho de provisionamento de SQL Server e Keycloak de teste, sem URL, usuários ou estado compartilhado de `localhost`.
- [ ] 4.3 Adicionar health check/prontidão antes dos testes e cleanup determinístico posterior.
- [ ] 4.4 Ajustar dados de teste para serem sintéticos, isolados e compatíveis com OIDC e tenant.
- [x] 4.5 Executar o ambiente controlado e registrar bloqueio explícito se Docker ou dependências não estiverem disponíveis.

## Detalhes de implementação

Seguir “Infraestrutura de integração do backend”, “Pontos de integração”, TI-01 e os riscos de Docker da [TechSpec](techspec.md). Não adicionar uma dependência para produção e não usar serviços de homologação ou produção. O mecanismo escolhido deve aproveitar a infraestrutura existente do projeto, evitando uma segunda estratégia concorrente de containers.

## Critérios de aceitação relacionados

- CA-02
- CA-03
- CA-07

## Testes da tarefa

### Testes de unidade

Não aplicável.

### Testes de integração

- [ ] TI-01 — Ambiente de teste Quarkus é provisionado e limpo de forma isolada

### Testes E2E

Não aplicável.

## Arquivos relevantes

- `ms-main/pom.xml`
- `ms-main/src/test/resources/application.properties`
- `ms-main/src/main/resources/application.properties`
- `ms-main/docker-compose.yml` ou arquivo Compose efetivamente utilizado
- `ms-main/keycloak/`
- `ms-main/src/test/java/br/com/municipalize/integration/`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md`
