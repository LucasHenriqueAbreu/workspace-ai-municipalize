# Tarefa 10.0: Verificação operacional e ativação gradual

## Visão geral

Verificar a migration e a população do catálogo em todos os bancos tenant e ativar a funcionalidade somente após todos os gates técnicos e operacionais.

<skills>
### Conformidade com skills

Nenhuma skill adicional específica foi identificada. Aplicar as regras globais de ambiente, segurança, documentação e definição de pronto.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos os `AGENTS.md` envolvidos e as rules globais. Não criar nova orquestração de migrations no `ms-main`, não iniciar projetos legados, não registrar dados sensíveis e documentar comandos/ambiente a partir de fontes verificadas.
</rules>

<requirements>

- Aplicar e verificar a migration em todos os bancos tenant pelo mecanismo operacional existente.
- Confirmar catálogo, índices, população, permissões e desempenho em cada tenant.
- Bloquear rollout se houver tenant sem migration válida, p95 acima do limite, regressão de autorização ou gate de qualidade falho.
- Liberar frontend somente após backend e infraestrutura estarem prontos.
- Registrar evidências e limitações operacionais no relatório de QA.
</requirements>

## Subtarefas

- [ ] 10.1 Inventariar tenants alvo e registrar o mecanismo existente de execução de migrations.
- [ ] 10.2 Aplicar/verificar migration, catálogo, índices e população tenant a tenant.
- [ ] 10.3 Reexecutar smoke tests de contrato, isolamento, FTS, cache e detalhes.
- [ ] 10.4 Registrar evidências, riscos restantes e decisão de ativação gradual.

## Detalhes de implementação

Consultar `techspec.md`, seções “SQL Server e Flyway”, “Dependências técnicas”, “Bloqueios de rollout” e “Sequenciamento do desenvolvimento”.

## Critérios de aceitação relacionados

- CA-25
- CA-26
- CA-27
- CA-29
- CA-30

## Testes da tarefa

### Testes de integração

- [ ] TI-19 — migration e população verificadas em todos os bancos tenant.
- [ ] TI-20 — smoke test de isolamento, FTS, contrato e desempenho por tenant.

### Testes E2E

- [ ] E2E-10 — ativação com backend pronto e pesquisa funcional no tenant autorizado.

## Arquivos relevantes

- Migrations e documentação operacional do `ms-main`.
- Configuração/mecanismo existente de registry e execução de migrations tenant.
- `tasks/prd-pesquisa-global/qa.md`
- `tasks/prd-pesquisa-global/evidences/`
