# Tarefa 8.0: Drawer unificado e detalhes dos cinco tipos

## Visão geral

Adicionar o Drawer oficial do Zard UI e um registro central de detalhes que carregue cada entidade por tipo e identificador, mantendo a URL e o contexto da tela.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`
- `municipalize-app/.agents/skills/zard/SKILL.md`
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local, as rules globais e as regras Angular, arquitetura, TypeScript, testes e Zard aplicáveis. Usar Drawer oficial, OnPush, resource, foco acessível e nenhum fallback para listagem.
</rules>

<requirements>

- Seleção de dado fecha o Command e abre o Drawer sem alterar URL.
- Registro central recebe somente tipo controlado e ID.
- Cada abertura, reabertura ou troca incrementa `openRevision` e faz nova consulta.
- Exibir detalhes de usuário, projeto, emenda, vereador e instituição.
- Exibir loading, sucesso, 403, 404 e erro recuperável.
- Exibir botão “Ações” sem ação, navegação ou mutação.
</requirements>

## Subtarefas

- [ ] 8.1 Adicionar o Drawer pelo Zard CLI conforme o registry instalado.
- [ ] 8.2 Implementar registro tipado e carregamento por `resource`/GetById.
- [ ] 8.3 Integrar os cinco conteúdos read-only e seus estados.
- [ ] 8.4 Integrar seleção de item DATA ao Drawer e manter navegação para item NAVIGATION.
- [ ] 8.5 Implementar foco, fechamento, retry e limpeza do estado.

## Detalhes de implementação

Consultar `techspec.md`, seções “Detalhes unificados no Drawer”, “Registro de detalhe”, “Endpoints de detalhe” e “Frontend integrado”.

## Critérios de aceitação relacionados

- CA-10
- CA-23
- CA-31
- CA-32
- CA-33
- CA-34
- CA-35
- CA-36
- CA-40

## Testes da tarefa

### Testes de unidade

- [ ] TU-18 — registro dos cinco tipos, `openRevision` e `resource` idle ao fechar.
- [ ] TU-19 — reload, 403, 404, erro e botão Ações sem efeitos.

### Testes de integração

- [ ] TI-15 — Drawer Zard real, URL imutável, consulta GetById e foco.

### Testes E2E

- [ ] E2E-04 — abrir cinco detalhes por mouse, toque e Enter sem mudar URL.
- [ ] E2E-05 — fechar/reabrir o mesmo detalhe e comprovar nova requisição.
- [ ] E2E-06 — estados 403, 404 e erro recuperável.
