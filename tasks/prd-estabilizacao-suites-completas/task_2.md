# Tarefa 2.0: Estabilizar a configuração e compatibilidade Vitest do frontend

## Visão geral

Tornar a infraestrutura de testes do `municipalize-app` compatível com Angular 22 e Vitest, eliminando incompatibilidades de configuração e APIs legadas sem introduzir uma camada de compatibilidade permanente que esconda defeitos.

<skills>
### Conformidade com skills

- `executar-task`: aplicável à implementação incremental desta entrega.
- `angular-developer`: obrigatório para configuração Angular 22, Vitest, `TestBed` e build.
- `zard`: obrigatório pelo `AGENTS.md` do frontend para alterações em testes de componentes que importam componentes Zard; consultar apenas as referências pertinentes, sem alterar o design system.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Aplicar integralmente `municipalize-app/AGENTS.md` e suas rules de Angular, arquitetura, TypeScript, testes, estrutura e padrões de código. Manter `coverageThresholds` de 80%, não ampliar `coverageExclude`, usar npm e preservar `package-lock.json` consistente. Ao final, executar lint, testes e build conforme aplicável.
</rules>

<requirements>

- RF4 e RF5: a suíte executa os itens abrangidos sem remover, ignorar ou enfraquecer testes.
- RF6: contratos de outros projetos só são atualizados após confirmação no proprietário.
</requirements>

## Subtarefas

- [x] 2.1 Confirmar `angular.json`, `tsconfig.spec.json` e os arquivos de setup usados pelo target `test`.
- [x] 2.2 Corrigir a inclusão/type-check dos arquivos de setup necessária para a suíte.
- [x] 2.3 Substituir, por lotes do inventário, chamadas Jasmine/Jest incompatíveis por APIs Vitest e Angular nativas.
- [x] 2.4 Reduzir ou remover compatibilidade global temporária que apenas mascara diferenças sem quebrar specs ainda em migração.
- [x] 2.5 Executar os specs alterados e confirmar que cada um preserva assertion observável.

## Detalhes de implementação

Seguir “Configuração de testes do frontend”, “Principais interfaces” e TU-01 da [TechSpec](techspec.md). O setup global só pode conter configuração inevitável de plataforma; a expectativa é que cada spec use `vi`, `expect` e os mecanismos oficiais de teste, sem adaptar resultados para passar artificialmente.

## Critérios de aceitação relacionados

- CA-01
- CA-04

## Testes da tarefa

### Testes de unidade

- [x] TU-01 — Compatibilidade nativa de cada spec Angular migrado

### Testes de integração

Não aplicável.

### Testes E2E

Não aplicável.

## Arquivos relevantes

- `municipalize-app/angular.json`
- `municipalize-app/tsconfig.spec.json`
- `municipalize-app/src/test-setup.ts`
- `municipalize-app/src/test-setup.d.ts`
- `municipalize-app/src/app/**/*.spec.ts` classificados como incompatibilidade Jasmine/Jest/Vitest no inventário
- `tasks/prd-estabilizacao-suites-completas/evidences/suite-baseline.md`
