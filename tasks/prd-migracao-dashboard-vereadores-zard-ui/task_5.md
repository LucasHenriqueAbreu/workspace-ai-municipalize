# Tarefa 5.0: Migrar impedimentos técnicos e snapshot administrativo

## Visão geral

Isolar a apresentação dos impedimentos técnicos e migrar a ação administrativa de snapshot para componentes e feedback Zard. Os impedimentos devem continuar separados dos indicadores gerais, e a ação deve preservar autorização, proteção contra clique concorrente, resposta visual e recarga completa após sucesso.

**Dependências:** tarefas 1 e 3.

<skills>
### Conformidade com skills

- `angular-developer`: aplicar autorização visual derivada do estado existente, método assíncrono explícito para comando e testes de integração com dependências controladas.
- `zard`: usar Card, Table, Sheet, Button com `zLoading`/`zDisabled`, Empty, Alert e `ZardSonnerService`.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram lidos o `AGENTS.md` da raiz, o `municipalize-app/AGENTS.md` e todas as rules globais e locais aplicáveis.

Aplicam-se especialmente: preservar autenticação, autorização e tenant; não tratar ocultação visual como controle de segurança do backend; não registrar payloads ou dados pessoais; POST sem retry automático; feedback via serviço Zard; nenhuma alteração de endpoint ou papel. Não há desvio previsto.
</rules>

<requirements>

- RF11: preservar data, quantidade, total, linhas, prévia e abertura do detalhe de impedimentos.
- RF12: exibir e habilitar snapshot apenas para administradores, com processamento e sucesso/falha.
- RF19–RF21: fornecer loading, vazio, erro e retry para a leitura de impedimentos.
- RF23–RF24: manter ações acessíveis e motivo completo disponível.
- Não incluir impedimentos nos indicadores gerais.
- Recarregar todos os resources, inclusive breakdowns, somente após snapshot aceito.

</requirements>

## Subtarefas

- [x] 5.1 Criar `DashboardTechnicalImpedimentsComponent` com resumo, linhas e estados próprios.
- [x] 5.2 Aplicar o builder de deduplicação e prévia textual sem renderizar HTML.
- [x] 5.3 Preservar abertura do detalhe por `ZardSheetService` somente para ID válido.
- [x] 5.4 Criar ou migrar o header do dashboard com ação administrativa de snapshot.
- [x] 5.5 Substituir feedback direto por `ZardSonnerService` e bloquear submissão concorrente.
- [x] 5.6 Conectar o sucesso do POST a `reloadAll()` e cobrir sucesso, falha e papéis.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “TechnicalImpedimentViewModel”, endpoints `GET/POST /dashboard/snapshot`, “Sheets e feedback”, “Monitoramento e observabilidade” e o passo 5 de “Ordem de construção”. O POST não recebe retry automático porque dispara processamento.

## Critérios de aceitação relacionados

- CA-01
- CA-03
- CA-07
- CA-08
- CA-12
- CA-15
- CA-16

## Testes da tarefa

### Testes de unidade (se aplicável)

- [x] TU-06 — Separar impedimentos e normalizar prévia
- [x] TU-07 — Resolver permissão visual de snapshot

### Testes de integração (se aplicável)

- [x] TI-08 — Disparar snapshot conforme papel
- [x] TI-12 — Abrir detalhe de impedimento
- [x] TI-14 — Consumir breakdowns e snapshot raw

### Testes E2E (se aplicável)

Não se aplica isoladamente; ação administrativa e isolamento dos impedimentos serão validados por E2E-04 e E2E-10 na tarefa 8.

## Arquivos relevantes

- `tasks/prd-migracao-dashboard-vereadores-zard-ui/techspec.md`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard.component.ts`
- `municipalize-app/src/app/presenter/features/tenant/public/dashboard/dashboard.component.html`
- `municipalize-app/src/app/aplication/dashboard/RunDashboardSnapshotUsecase.ts`
- `municipalize-app/src/app/aplication/report/GetDashboardSnapshotRawUsecase.ts`
- `municipalize-app/src/app/infra/repositories/DashboardApiService.ts`
