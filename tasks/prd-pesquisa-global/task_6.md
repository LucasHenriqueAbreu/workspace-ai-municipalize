# Tarefa 6.0: Detalhes canônicos e GetById seguro

## Visão geral

Garantir que cada resultado da busca abra um detalhe atual e autorizado, reutilizando os fluxos existentes e adicionando o detalhe seguro de usuário.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`

Aplicar também as regras Java/Quarkus do `ms-main` e as regras frontend de arquitetura e testes.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos os `AGENTS.md` dos dois projetos, as rules globais e as regras locais aplicáveis. Não contornar guards, políticas ou tenant; manter componentes e usecases separados e contratos de erro seguros.
</rules>

<requirements>

- Disponibilizar GetById canônico para usuário e reutilizar os quatro detalhes existentes.
- Garantir autorização por registro no momento da abertura.
- Distinguir 403 de registro existente não autorizado e 404 de inexistente.
- Propagar cancelamento e não usar o resumo ou cache da busca como detalhe.
</requirements>

## Subtarefas

- [ ] 6.1 Implementar endpoint, usecase e conteúdo read-only de detalhe de usuário.
- [ ] 6.2 Adaptar os quatro detalhes existentes aos contratos de erro e cancelamento necessários.
- [ ] 6.3 Extrair conteúdos reutilizáveis de projeto e emenda sem duplicar regras.
- [ ] 6.4 Criar fixtures de contrato para comparar listagem, busca e detalhe.

## Detalhes de implementação

Consultar `techspec.md`, seções “Endpoints de detalhe”, “Matriz canônica de visibilidade” e “Detalhes unificados no Drawer”.

## Critérios de aceitação relacionados

- CA-23
- CA-24
- CA-31
- CA-32
- CA-33
- CA-34
- CA-35

## Testes da tarefa

### Testes de unidade

- [ ] TU-12 — registro de detalhe exhaustivo para os cinco tipos.
- [ ] TU-13 — mapeamento de 403, 404, erro recuperável e ausência de campos protegidos.

### Testes de integração

- [ ] TI-12 — GetById autorizado por tipo e tenant.
- [ ] TI-13 — regressão de consumidores dos detalhes existentes.

## Arquivos relevantes

- Resources/services/repositories de usuário, projeto, emenda, vereador e instituição em `ms-main`.
- `municipalize-app/src/app/aplication/user/GetUserByIdUsecase.ts`
- Repositories e usecases GetById existentes do `municipalize-app`.
- Componentes de detalhe de projeto e emenda.
