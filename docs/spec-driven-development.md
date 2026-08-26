# Spec Driven Development no Municipalize

Este documento orienta uma pessoa nova a conduzir uma funcionalidade do
Municipalize desde a definição do problema até o código publicado.

## O que é Spec Driven Development

Spec Driven Development (SDD) é uma forma de desenvolver em que a
especificação vem antes do código. Em vez de começar pela implementação e
explicar as decisões depois, o time registra o problema, o comportamento
esperado, a solução técnica e a divisão do trabalho antes de mudar o produto.

No Municipalize, as especificações funcionam como contratos vivos: cada decisão
deve poder ser rastreada do requisito ao teste, da implementação ao QA e do QA
ao review. Isso reduz ambiguidades, torna impactos entre repositórios visíveis
e facilita explicar por que uma mudança existe.

SDD não significa burocracia para toda alteração. Uma correção pequena pode
seguir o ciclo direto descrito em [Como trabalhar no workspace](como-trabalhar.md).
Use o fluxo completo quando houver uma funcionalidade nova ou uma mudança
relevante, com risco, múltiplos critérios de aceitação ou impacto em mais de
um projeto.

## As peças do processo

| Peça | O que responde | Resultado |
|---|---|---|
| PRD | Qual problema será resolvido e para quem? | Escopo, requisitos e critérios de aceitação `CA-*` |
| TechSpec | Como a solução atenderá o PRD? | Arquitetura, contratos, riscos e testes `TU-*`, `TI-*`, `E2E-*` |
| Tasks | Em que ordem o trabalho será feito? | Entregas menores, dependências e estado da implementação |
| Implementação | O que foi alterado no produto? | Código e testes que atendem cada tarefa |
| QA | O comportamento realmente atende ao combinado? | Evidências, resultado dos critérios e correções revalidadas |
| Review | O código final está seguro, coerente e pronto? | Veredito sobre o código após o QA |

As etapas são sequenciais porque respondem perguntas diferentes. O review vem
depois do QA: se o QA exigir uma correção, o código revisado precisa incluir
essa correção.

## Visão do fluxo

```text
Preparar contexto e branch
          ↓
PRD → TechSpec → Tasks → Executar tasks → QA → Review → Commit/Push
  ↑                                                       ↓
  └────────────── feedback e correções ──────────────────┘
```

O fluxo formal é obrigatório para novas funcionalidades e mudanças relevantes.
Correções pequenas podem dispensar o conjunto completo de documentos quando o
usuário não solicitar o fluxo formal, mas ainda devem seguir as regras de Git,
testes de regressão e validações do projeto.

## Antes de começar

### 1. Entenda o contexto

Leia, nesta ordem prática:

1. [`AGENTS.md`](../AGENTS.md) da raiz;
2. o `AGENTS.md` do projeto que será alterado;
3. as rules aplicáveis em [`../.agents/rules/`](../.agents/rules/);
4. a documentação e os testes existentes nos módulos afetados.

Em caso de conflito, a solicitação atual prevalece; depois vêm o `AGENTS.md`
do projeto, as rules específicas, o `AGENTS.md` da raiz, as rules globais e as
skills globais, conforme a precedência documentada no workspace.

### 2. Escolha o dono da mudança

- `municipalize-app`: UI, navegação, estado de tela e integração HTTP do
  navegador.
- `ms-main`: regras e dados operacionais de um tenant.
- `municipalize-admin-app`: administração global, Chat, agentes, ferramentas,
  modelos de IA e LiteLLM.

Se a funcionalidade atravessar projetos, salve os artefatos em
`tasks/prd-[slug]/` na raiz coordenadora do workspace (ou na raiz da sessão
worktree) e registre todos os repositórios, contratos e consumidores afetados.
Nunca mova a responsabilidade de um módulo para outro apenas para facilitar a
implementação.

### 3. Prepare a branch

Use [`iniciar-tarefa-paralela`](../.agents/skills/iniciar-tarefa-paralela/SKILL.md)
antes de implementar:

```bash
# Executar na raiz do workspace
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  start --slug nome-da-tarefa --mode workspace
```

Escolha `workspace` quando a tarefa deve usar os diretórios atuais. Use o modo
`worktree` padrão quando precisar de uma sessão isolada e paralela. Em ambos os
casos, a mesma branch `agent/<slug>` é criada em cada repositório ativo.

## Etapa 1 — Criar o PRD

Skill: [`criar-prd`](../.agents/skills/criar-prd/SKILL.md)

### Objetivo

Definir o problema, os usuários, o valor esperado, o escopo e os critérios de
aceitação sem decidir ainda a implementação interna.

### Como trabalhar

1. Reúna problema, metas mensuráveis, usuários, histórias, fluxos, entradas,
   saídas, dependências, restrições, UI/UX e acessibilidade.
2. Esclareça dúvidas antes de redigir. Toda pergunta deve terminar com uma
   resposta ou uma premissa registrada.
3. Diferencie requisitos funcionais de detalhes técnicos. Banco, classes,
   componentes e algoritmos pertencem à TechSpec.
4. Escreva critérios objetivos no formato `CA-01`, `CA-02`, …, relacionando-os
   às histórias ou aos requisitos.
5. Salve em `tasks/prd-[slug]/prd.md` usando o
   [template de PRD](../.agents/skills/criar-prd/references/TEMPLATE.md).

### Checklist de conclusão

- [ ] O problema e o público estão claros.
- [ ] Objetivos e métricas podem ser verificados.
- [ ] Fluxos principais, bordas e fora de escopo estão registrados.
- [ ] Cada requisito relevante possui critério de aceitação.
- [ ] A experiência inclui acessibilidade quando houver interface.
- [ ] O arquivo foi salvo no slug correto.

O resultado desta etapa é um contrato de produto. Se uma decisão ainda for
técnica, registre-a como restrição de alto nível ou deixe-a para a TechSpec.

## Etapa 2 — Criar a TechSpec

Skill: [`criar-techspec`](../.agents/skills/criar-techspec/SKILL.md)

### Objetivo

Transformar o PRD em uma solução técnica implementável, com componentes,
contratos, dados, integrações, testes, riscos e sequência de construção.

### Como trabalhar

1. Leia o PRD inteiro e inventarie requisitos, `CA-*`, restrições e métricas.
2. Explore os projetos antes de decidir: componentes existentes, chamadas,
   persistência, autorização, configuração, infraestrutura, tratamento de
   erros e testes.
3. Consulte a documentação das bibliotecas envolvidas quando a informação for
   incerta ou depender de versão.
4. Esclareça somente o que a exploração não resolveu.
5. Documente contratos completos: modelos, parâmetros, respostas de sucesso,
   listas vazias, validações, erros e degradações.
6. Nomeie os testes da TechSpec com `TU-*` (unidade), `TI-*` (integração) e
   `E2E-*` (end-to-end), vinculando cada caso aos `CA-*` que ele verifica.
7. Salve em `tasks/prd-[slug]/techspec.md` usando o
   [template de TechSpec](../.agents/skills/criar-techspec/references/TEMPLATE.md).

### Checklist de conclusão

- [ ] Todo componente novo ou modificado tem localização e responsabilidade.
- [ ] Os contratos entre projetos estão explícitos.
- [ ] Autenticação, autorização, tenant, erros e timeouts foram considerados.
- [ ] Cada critério de aceitação possui casos de teste aplicáveis.
- [ ] Dependências, riscos, observabilidade e sequenciamento estão descritos.
- [ ] A solução pode ser implementada sem novas decisões estruturais ocultas.

A TechSpec especifica; ela não implementa. Use código apenas para exemplos de
interfaces e payloads do contrato.

## Etapa 3 — Decompor em tasks

Skill: [`criar-tasks`](../.agents/skills/criar-tasks/SKILL.md)

### Objetivo

Dividir a solução em entregas incrementais, ordenadas por dependência e com
testes próprios.

### Como trabalhar

1. Leia `AGENTS.md`, rules, PRD e TechSpec.
2. Monte uma proposta, preferencialmente com no máximo dez tarefas de alto
   nível. Coloque dependências antes dos consumidores; por exemplo, backend
   antes de frontend e ambos antes de E2E.
3. Mostre a lista ao usuário e aguarde aprovação antes de criar arquivos.
4. Gere `tasks.md` e um `task_[num].md` sequencial para cada entrega, usando os
   templates da skill.
5. Em cada tarefa, registre subtarefas, requisitos, `CA-*`, testes da TechSpec,
   arquivos relevantes e skills aplicáveis.
6. Confira que nenhum `CA-*` ou caso de teste ficou sem mapeamento.
7. Apresente os arquivos e aguarde confirmação antes de iniciar a implementação.

### Checklist de conclusão

- [ ] `tasks.md` lista a ordem correta.
- [ ] Cada tarefa tem escopo e dependências claros.
- [ ] As subtarefas são executáveis e verificáveis.
- [ ] Todos os `CA-*` estão mapeados.
- [ ] Todos os `TU-*`, `TI-*` e `E2E-*` aplicáveis estão mapeados.
- [ ] O usuário aprovou a estrutura e pode iniciar a execução.

## Etapa 4 — Executar as tasks

Skill: [`executar-task`](../.agents/skills/executar-task/SKILL.md)

### Objetivo

Implementar a próxima tarefa não concluída, incluindo testes e atualização do
estado dos artefatos.

### Como trabalhar

1. Selecione a primeira tarefa não concluída em `tasks.md` e leia seu arquivo
   completo.
2. Revise PRD, TechSpec, regras, dependências e skills aplicáveis.
3. Leia o `AGENTS.md` do projeto e use seus scripts como fonte de verdade.
4. Implemente as subtarefas na ordem, mantendo a mudança focada no projeto
   responsável.
5. Escreva ou ajuste os testes relacionados e execute as validações aplicáveis.
6. Se precisar iniciar serviços, isole a execução, confirme portas, registre
   processos e encerre somente o que foi iniciado por esta execução.
7. Só depois de tudo passar, marque subtarefas, testes e a tarefa como `[x]`.

### Checklist de conclusão

- [ ] Todas as subtarefas foram implementadas.
- [ ] Os testes da tarefa e os testes de regressão passaram.
- [ ] Lint, typecheck, build, cobertura e verificações exigidas passaram.
- [ ] Contratos e consumidores afetados foram conferidos.
- [ ] A tarefa e suas subtarefas estão marcadas como concluídas.
- [ ] Serviços, portas e recursos temporários foram liberados.

Uma tarefa concluída não significa que a funcionalidade está pronta: ainda é
necessário validar todos os critérios no QA.

## Etapa 5 — Executar o QA

Skill: [`executar-qa`](../.agents/skills/executar-qa/SKILL.md)

### Objetivo

Validar a funcionalidade contra o PRD, a TechSpec e as tasks, corrigindo os
defeitos encontrados e mantendo evidências reproduzíveis.

### Como trabalhar

1. Leia todos os documentos e monte um checklist com um item por `CA-*` e os
   casos `TU-*`, `TI-*` e `E2E-*` associados.
2. Prepare apenas os serviços necessários em ambiente isolado e confirme sua
   prontidão por health check, endpoint, conexão ou log inequívoco.
3. Execute os fluxos de UI na ferramenta de navegador disponível. Registre
   estado da tela, requisições relevantes, console e logs quando houver falha.
4. Execute os testes automatizados e a cobertura aplicável nos projetos
   afetados.
5. Para cada defeito, corrija a causa raiz, adicione teste de regressão e repita
   a validação.
6. Salve capturas e outras evidências em `tasks/prd-[slug]/evidences/` sem
   expor credenciais ou dados reais.
7. Preencha `qa.md` com resultados, comandos, bugs, correções e limitações.

### Critério de aprovação

O QA só é `APROVADO` quando todos os critérios de aceitação estão verificados e
atendidos, todos os testes aplicáveis passam e as evidências estão registradas.
Se algo não puder ser executado, registre o comando, o motivo, o impacto e a
ação necessária; não declare aprovação silenciosamente.

## Etapa 6 — Executar o review

Skill: [`executar-review`](../.agents/skills/executar-review/SKILL.md)

### Objetivo

Fazer a revisão final do código já validado pelo QA, conferindo conformidade,
aderência à TechSpec, segurança, testes e qualidade da implementação.

### Como trabalhar

1. Confirme que `qa.md` está aprovado e leia PRD, TechSpec, tasks e correções do
   QA.
2. Revise o diff real nos repositórios afetados e a aderência às regras locais.
3. Execute os testes, lint, build e demais verificações exigidas que forem
   aplicáveis.
4. Verifique contratos entre projetos, autorização, isolamento de tenant,
   tratamento de erros, observabilidade e documentação operacional.
5. Registre problemas por severidade, arquivo e linha em `codereview.md`.
6. Só marque `APROVADO` quando não houver problema bloqueador e o QA continuar
   válido para o código revisado.

O review é a última etapa de validação. Se ele exigir uma correção, faça a
alteração, repita os testes afetados e atualize o QA antes de aprovar novamente.

## Etapa 7 — Commit, push e encerramento

Skill: [`encerrar-tarefa`](../.agents/skills/encerrar-tarefa/SKILL.md)

### Objetivo

Publicar somente o trabalho revisado e limpar uma sessão de worktrees quando o
usuário autorizar.

### Procedimento

1. Inspecione o manifesto e o estado de cada repositório:

   ```bash
   # Executar na raiz da sessão/workspace correspondente
   python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
     status --slug nome-da-tarefa
   ```

2. Revise `git status --short`, `git diff` e `git diff --cached` em cada projeto.
3. Apresente ao usuário os arquivos exatos, a mensagem de commit, os
   repositórios, a branch, os remotes e, se aplicável, a remoção da worktree.
4. Aguarde confirmação explícita. Faça `git add` somente nos arquivos aprovados.
5. Execute o encerramento:

   ```bash
   python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
     finish --slug nome-da-tarefa \
     --message "Descrição da mudança" \
     --confirm
   ```

   O comando não cria commit vazio, não faz stage automático e publica apenas
   repositórios com mudanças staged. Ele bloqueia se houver alterações
   unstaged ou untracked.

6. Se a tarefa em `workspace` começou com alterações pré-existentes, só use
   `--include-preexisting` quando a confirmação também aprovar explicitamente
   essas alterações.
7. Para uma sessão `worktree`, peça uma confirmação específica para remover os
   diretórios e então execute:

   ```bash
   python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
     close --slug nome-da-tarefa --confirm
   ```

   O fechamento remove apenas worktrees limpas e nunca apaga branches. Em modo
   `workspace`, não existe worktree temporária para remover.

Se um commit ou push falhar em um projeto, pare, informe o que já foi commitado
ou publicado e não remova a sessão nem repita cegamente a operação.

## Rastreabilidade

Use os mesmos identificadores durante todo o ciclo:

| Artefato | Identificadores |
|---|---|
| PRD | `CA-*` para critérios de aceitação |
| TechSpec | `TU-*`, `TI-*`, `E2E-*` para casos de teste |
| Tasks | referências a `CA-*` e aos testes correspondentes |
| QA | resultado de cada critério, teste, bug e evidência |
| Review | conformidade com regras, TechSpec, tasks e QA |

Uma pessoa deve conseguir responder, sem reconstruir a história pelo Git:

```text
Qual requisito foi pedido?
→ Qual critério o verifica?
→ Qual decisão técnica o atende?
→ Qual tarefa implementou?
→ Qual teste e evidência provaram o resultado?
→ Qual review aprovou o código final?
```

## Quando o trabalho está concluído

Uma tarefa está concluída quando suas subtarefas, testes, validações e limpeza
estão completos. Uma funcionalidade formal só está concluída quando:

1. todas as tasks estão concluídas;
2. todos os `CA-*` foram validados no QA;
3. defeitos do QA foram corrigidos e revalidados;
4. `qa.md` está aprovado com evidências;
5. o review foi executado sobre o código pós-QA;
6. `codereview.md` está aprovado;
7. o commit/push ocorreu após confirmação, quando a publicação fizer parte do
   escopo.

Bloqueios, falhas preexistentes e verificações não executadas devem permanecer
visíveis nos relatórios. Transparência sobre o que não foi validado faz parte da
definição de pronto.

## Glossário rápido

- **Critério de aceitação (`CA-*`)**: condição objetiva que prova que um
  requisito de produto foi atendido.
- **PRD**: documento de requisitos de produto; descreve o problema, o escopo e
  o resultado esperado.
- **TechSpec**: especificação técnica; descreve a solução, os contratos, riscos
  e a estratégia de testes.
- **Task**: unidade incremental de implementação, ligada a requisitos e casos
  de teste.
- **QA**: validação funcional e técnica da entrega, com evidências e correções
  revalidadas.
- **Review**: revisão final do código que já passou pelo QA.
- **`TU-*`, `TI-*`, `E2E-*`**: identificadores de testes de unidade, integração
  e ponta a ponta, respectivamente.

Volte ao [índice da documentação](README.md) para os demais guias.
