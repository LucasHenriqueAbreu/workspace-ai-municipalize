# Tarefa 9.0: Integração, acessibilidade, responsividade e performance

## Visão geral

Concluir a integração entre backend e frontend, validar a experiência completa e cumprir os gates de qualidade, acessibilidade, cobertura e desempenho.

<skills>
### Conformidade com skills

- `municipalize-app/.agents/skills/angular-developer/SKILL.md`
- `municipalize-app/.agents/skills/zard/SKILL.md`
- `browser:control-in-app-browser`, se a validação utilizar o navegador in-app disponível
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos os `AGENTS.md` dos projetos, as rules globais e as regras de ambiente, segurança, testes e definição de pronto. Evidências devem ser sintéticas/anonimizadas; não criar o projeto Playwright central antes da tarefa específica.
</rules>

<requirements>

- Validar desktop/mobile, teclado, foco, nomes acessíveis, rolagem e textos longos.
- Executar suíte unitária, integração e E2E aplicável dos dois projetos.
- Atingir cobertura mínima de 80%, lint, typecheck, verify, package e build.
- Validar p95 de até 500 ms no endpoint em volume representativo.
- Corrigir regressões de contrato, autorização, cache, Drawer e navegação.
</requirements>

## Subtarefas

- [ ] 9.1 Completar testes integrados frontend/backend e cenários E2E no navegador disponível.
- [ ] 9.2 Executar auditoria de acessibilidade WCAG 2.1 AA e validar responsividade.
- [ ] 9.3 Configurar/verificar thresholds de cobertura nos dois projetos.
- [ ] 9.4 Executar lint, testes, verify, packages e builds definidos pelos projetos.
- [ ] 9.5 Executar benchmark e corrigir problemas de performance ou regressões.

## Detalhes de implementação

Consultar `techspec.md`, seções “Testes de integração”, “Testes E2E”, “Rastreabilidade dos critérios”, “Monitoramento e observabilidade” e “Conformidade com o AGENTS.md”.

## Critérios de aceitação relacionados

- CA-01–CA-41

## Testes da tarefa

### Testes de integração

- [ ] TI-16 — contrato e tráfego ponta a ponta sem endpoints paralelos.
- [ ] TI-17 — cobertura, lint, typecheck, verify, package e build dos dois projetos.
- [ ] TI-18 — benchmark p95 com volume representativo.

### Testes E2E

- [ ] E2E-07 — cenários desktop/mobile, teclado, foco, rolagem e responsividade.
- [ ] E2E-08 — auditoria WCAG 2.1 AA sem violações críticas ou sérias da feature.
- [ ] E2E-09 — fluxo completo de pesquisa, seleção, detalhe, cache, erro e recentes.

## Arquivos relevantes

- Suítes de testes e configurações de cobertura de `ms-main` e `municipalize-app`.
- `tasks/prd-pesquisa-global/qa.md` e `tasks/prd-pesquisa-global/evidences/` (na etapa de QA).
- Relatórios e artefatos de benchmark não sensíveis.
