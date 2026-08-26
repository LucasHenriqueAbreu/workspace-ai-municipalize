# Tarefa 2.0: Catálogo canônico de navegação

## Visão geral

Transformar a configuração privada de rotas na fonte única para menu, pesquisa local, metadados e autorização de telas.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`
- `municipalize-app/.agents/skills/zard/SKILL.md` (quando houver impacto em navegação/interface)
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local, as rules globais e as regras frontend aplicáveis. Usar Signals/computed quando houver estado, manter guards intactos, tipagem estrita, OnPush e cobertura mínima de 80%.
</rules>

<requirements>

- Adicionar identificador, descrição, palavras-chave, sinônimos, intenções e flag de pesquisa ao catálogo.
- Derivar metadados duplicados de rotas por `catalogId`.
- Excluir itens não autorizados sem substituir a proteção dos guards.
- Garantir que cada item pesquisável resolva uma rota real e tenha ID único.
</requirements>

## Subtarefas

- [x] 2.1 Evoluir `PRIVATE_ROUTE_CONFIGS` com o modelo de catálogo pesquisável.
- [x] 2.2 Criar helper de metadados para `privateRoutes`, menus e permissões.
- [x] 2.3 Associar intenções como cadastrar, consultar, editar e acompanhar aos destinos existentes.
- [x] 2.4 Criar teste estrutural de IDs, rotas, duplicidades e autorização.

## Detalhes de implementação

Consultar `techspec.md`, seções “Catálogo privado”, “Catálogo de navegação e guards” e “Modelos do frontend”.

## Critérios de aceitação relacionados

- CA-03
- CA-04
- CA-07
- CA-28
- CA-40
- CA-41

## Testes da tarefa

### Testes de unidade

- [x] TU-04 — normalização, sinônimos, intenções e score do catálogo.
- [x] TU-05 — IDs únicos, rotas reais e filtragem por autorização.

### Testes de integração

- [x] TI-03 — consistência entre catálogo, menu e guards.

### Validação executada

Os testes focados do catálogo, menu e guard executaram 19 testes, sem falhas, via Vitest com `jsdom`. O build Angular foi concluído com sucesso.

`npm test` permanece bloqueado por falhas preexistentes na compilação de specs incompatíveis com Vitest/Jasmine (`toBeTrue`, `jasmine`, `spyOn` e outros), inclusive um spec com sintaxe inválida. `npm run lint` permanece bloqueado porque o repositório não possui arquivo de configuração ESLint. Essas falhas não foram introduzidas pela tarefa.

## Arquivos relevantes

- `municipalize-app/src/app/config/private.routes.config.ts`
- `municipalize-app/src/app/presenter/routes/private.routes.ts`
- `ListRoutesMenuUsecase.ts`
- `CheckPermissionsRouteUsecase.ts`
- `role.guard.ts`
