# Tarefa 3.0: Estabilizar fixtures, componentes e contratos de negócio do frontend

## Visão geral

Corrigir os arquivos de teste do frontend classificados como fixtures incompletas, inputs requeridos ausentes, sincronização assíncrona incorreta ou expectation divergente do contrato vigente. A tarefa preserva autorização no frontend como experiência visual, sem deslocar a responsabilidade de segurança do backend.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação incremental desta entrega.
- `angular-developer`: obrigatório para componentes Angular, Signals, `TestBed`, inputs, guards e testes Vitest.
- `zard`: obrigatório pelo `AGENTS.md` do frontend para testes de componentes que usam componentes Zard, diálogos e interações; não criar nem alterar primitives do Zard fora do escopo.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Aplicar `municipalize-app/AGENTS.md` e todas as rules locais aplicáveis. Preparar `input.required()` antes da estabilização, usar Act, Wait, Assert, mocks apenas em fronteiras e assertions sobre a API pública, DOM ou interação relevante. Não confiar em role, tenant ou ID apenas no navegador como controle de segurança; os testes de UI apenas refletem a política já aplicada no backend.
</rules>

<requirements>

- RF4 e RF5: todos os specs mapeados seguem executáveis e significativos.
- RF6: expectativas de integrações e contratos vigentes permanecem compatíveis.
- RF8 e RF9: políticas de ação na UI continuam apresentando a permissão e a recusa esperadas.
</requirements>

## Subtarefas

- [x] 3.1 Corrigir fixtures, providers, inputs e ciclo de vida dos componentes classificados no inventário.
- [x] 3.2 Corrigir a estabilização assíncrona dos testes sem usar delays reais ou detectar mudanças como atalho para estado não preparado.
- [x] 3.3 Confirmar contratos de usecases, parsers e repositórios HTTP no código proprietário antes de ajustar expectations.
- [x] 3.4 Acrescentar ou reparar assertions de sucesso, erro, ausência e interação relevantes.
- [x] 3.5 Cobrir permissões de emenda/projeto para usuário sem papel, vínculo ou propriedade e para usuário válido.
- [x] 3.6 Executar os grupos de specs afetados e atualizar seu resultado no inventário.

## Detalhes de implementação

Seguir “Specs e fixtures do frontend” e “Abordagem de testes” da [TechSpec](techspec.md), especialmente TU-02, TU-03 e TU-04. Mudanças no código de produção somente são permitidas quando a confirmação do contrato vigente provar defeito real; não alterar APIs, guards, permissões ou tenancy apenas para fazer um teste passar.

## Critérios de aceitação relacionados

- CA-01
- CA-04
- CA-05
- CA-06

## Testes da tarefa

### Testes de unidade

- [x] TU-02 — Fixture de componente prepara providers e inputs requeridos
- [x] TU-03 — Usecases e adapters preservam resultado e erro do contrato vigente
- [x] TU-04 — Políticas de acesso de emenda/projeto mantêm negação e permissão

### Testes de integração

Não aplicável. Os adapters HTTP podem usar `HttpTestingController` como teste de unidade/integrado local do frontend, conforme o padrão do spec afetado.

### Testes E2E

Não aplicável, salvo se uma alteração necessária modificar comportamento observável no navegador; nesse caso, seguir a decisão de escopo da TechSpec e o projeto central `e2e/`.

## Arquivos relevantes

- `municipalize-app/src/app/**/*.spec.ts` classificados como fixture, input, assincronia ou contrato
- `municipalize-app/src/app/presenter/common/mz-components/**/*.component.ts`
- `municipalize-app/src/app/aplication/**/*.ts`
- `municipalize-app/src/app/infra/repositories/**/*.ts`
- `municipalize-app/src/app/presenter/common/services/auth.service.ts`
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md`
