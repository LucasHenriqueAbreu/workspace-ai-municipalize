# Tarefa 1.0: Matriz de autorização e políticas canônicas de leitura

## Visão geral

Consolidar e testar o universo autorizado de usuários, projetos, emendas, vereadores e instituições, garantindo coerência entre listagens, pesquisa e detalhes.

<skills>
### Conformidade com skills

Nenhuma skill adicional específica foi identificada para o backend. Aplicar as regras Java/Quarkus e de testes do `ms-main`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local, as rules globais e as regras referenciadas pelo `ms-main`. Preservar autenticação, autorização, tenant, contratos existentes, migrations incrementais e cobertura mínima de 80%.
</rules>

<requirements>

- Implementar a matriz de visibilidade definida na TechSpec para os cinco tipos.
- Extrair ou adaptar políticas de leitura reutilizáveis por listagem, busca e GetById.
- Resolver o usuário local ativo sem provisionamento ou sincronização durante a pesquisa.
- Impedir vazamento por tenant, vínculo, município, status, arquivamento ou inativação.
</requirements>

## Subtarefas

- [x] 1.1 Criar fixtures de caracterização das listagens e dos GetById atuais.
- [x] 1.2 Extrair serviços de política de leitura por tipo e preservar consumidores existentes.
- [x] 1.3 Implementar a resolução autenticada não provisionadora do usuário local.
- [x] 1.4 Adicionar testes negativos de tenant, papel, função, vínculo e registro inativo.

## Detalhes de implementação

Consultar `techspec.md`, seções “Matriz canônica de visibilidade”, “Autenticação e tenant”, “Endpoints de detalhe” e “Abordagem de testes”.

## Critérios de aceitação relacionados

- CA-04
- CA-19
- CA-20
- CA-21
- CA-23
- CA-24
- CA-27
- CA-34
- CA-35

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — autorização por tipo, papel, função e vínculo.
- [x] TU-02 — resolução local ativa sem provisionamento.
- [x] TU-03 — políticas de busca e detalhe com fixtures equivalentes.

### Testes de integração

- [x] TI-01 — regressão das listagens e GetById canônicos.
- [x] TI-02 — isolamento entre tenants e exclusão de registros inacessíveis.

### Validação executada

O conjunto focado de regressão executou 70 testes, sem falhas ou erros, e o
build de produção foi concluído com sucesso. A inicialização de
`UserImplTest` no ambiente local ainda depende de uma imagem SQL Server
amd64 sem Full-Text Search e falha na migration legada `1.0.144`; esse é um
bloqueio de infraestrutura do ambiente de testes, não uma falha das
políticas implementadas nesta tarefa.

## Arquivos relevantes

- `ms-main/src/main/java/br/com/municipalize/service/*ReadAccessService.java`
- `ms-main/src/main/java/br/com/municipalize/service/AuthService.java`
- Resources, services e repositories canônicos dos cinco tipos.
- Testes de caracterização e regressão em `ms-main/src/test/java`.
