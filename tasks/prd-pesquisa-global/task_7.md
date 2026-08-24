# Tarefa 7.0: Repository, cache, store e Command da Pesquisa Global

## Visão geral

Implementar a experiência principal no frontend: busca local e remota, estados, debounce, cancelamento, cache contextual e integração do Command ao private-layout.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`
- `municipalize-app/.agents/skills/zard/SKILL.md`
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` local, as rules globais e todas as regras frontend aplicáveis. Usar Signals/computed para estado, RxJS somente no pipeline assíncrono, OnPush, Command oficial, tokens existentes e acessibilidade.
</rules>

<requirements>

- Abrir pelo acionador e por Ctrl/Cmd+K, sem interferir em campos editáveis.
- Mostrar navegação local imediatamente e consultar dados somente a partir de três caracteres após 300 ms.
- Cancelar consultas anteriores e deduplicar chamadas idênticas em andamento.
- Implementar estados inicial, recentes, mínimo, loading, resultados, vazio e erro recuperável.
- Preservar resultados locais quando a fonte remota falhar.
- Implementar cache contextual TTL de cinco minutos, LRU 50 e cinco recentes.
</requirements>

## Subtarefas

- [ ] 7.1 Implementar repository HTTP e usecases de busca de dados e navegação.
- [ ] 7.2 Implementar cache, fingerprint, TTL, LRU, in-flight, limpeza e recentes.
- [ ] 7.3 Implementar store com Signals, computed, debounce, switchMap e retry.
- [ ] 7.4 Criar o componente Command com grupos, mensagens, teclado e seleção.
- [ ] 7.5 Integrar o acionador ao cabeçalho do `private-layout` e limpar o estado ao fechar/selecionar.

## Detalhes de implementação

Consultar `techspec.md`, seções “Modelos do frontend”, “Cache e ciclo de vida”, “Zard UI e Angular” e “Limites visuais”.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-28
- CA-37
- CA-38
- CA-39
- CA-41

## Testes da tarefa

### Testes de unidade

- [ ] TU-14 — cache TTL, LRU, MRU, fingerprint, clear, erro e cancelamento.
- [ ] TU-15 — compartilhamento in-flight e liberação após sucesso, erro ou cancelamento.
- [ ] TU-16 — store em 299/300 ms, mínimo, switchMap, retry e falha parcial.
- [ ] TU-17 — repository HTTP, query params, mapeamento e cancelamento.

### Testes de integração

- [ ] TI-14 — TestBed com Command/Dialog reais, acionador, estados e tráfego único.

### Testes E2E

- [ ] E2E-01 — clique, Ctrl/Cmd+K, exceção em campo editável e teclado.
- [ ] E2E-02 — busca local/remota, agrupamento, erro parcial e limpeza.
- [ ] E2E-03 — cache, recentes, contexto, expiração e limite LRU.

## Arquivos relevantes

- `municipalize-app/src/app/presenter/common/mz-components/global-search/*`
- `municipalize-app/src/app/infra/repositories/GlobalSearchRepositoryHttp.ts`
- `municipalize-app/src/app/aplication/global-search/*Usecase.ts`
- `municipalize-app/src/app/presenter/layouts/private-layout/*`
- `municipalize-app/src/app/domain/entities/GlobalSearch.ts`
