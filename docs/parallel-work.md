# Branches e trabalho paralelo

O workspace Municipalize contém uma raiz e três repositórios ativos com
históricos Git independentes. A skill
[`iniciar-tarefa-paralela`](../.agents/skills/iniciar-tarefa-paralela/SKILL.md)
coordena esses repositórios sem transformá-los em submódulos.

## Escolha do modo

| Modo | Quando usar | Resultado |
|---|---|---|
| `workspace` | A tarefa deve usar os diretórios atuais | Cria e ativa `agent/<slug>` na raiz e em cada projeto ativo |
| `worktree` | É necessário isolamento físico ou trabalho paralelo | Cria `workspace-<slug>/` ao lado do workspace, com um worktree por projeto |

Os projetos incluídos vêm exclusivamente de
`.agents/workspace-projects.json`. Repositórios legados nunca entram na sessão.

## Criar uma tarefa

Execute na raiz do workspace:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  start --slug pesquisa-global --mode workspace
```

O slug é normalizado para kebab-case e usado na branch `agent/pesquisa-global`.
Branches já existentes, sessões duplicadas e caminhos ocupados interrompem a
operação. `--base current` usa o `HEAD` de cada repositório; ele não inclui
alterações não commitadas.

Para isolamento:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  start --slug pesquisa-global
```

O resultado esperado é:

```text
workspace-pesquisa-global/
├── .agents/
├── tasks/
├── municipalize-app/
├── ms-main/
└── municipalize-admin-app/
```

O worktree da raiz é o coordenador dos artefatos em `tasks/`. Não crie uma
segunda árvore de PRD dentro de cada projeto.

## Manifesto e status

Cada sessão possui um manifesto ao lado do workspace, com slug, branch, modo,
paths, commits-base, repositórios preparados e estado da operação:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  status --slug pesquisa-global
```

Use o status antes de implementar e novamente antes de publicar. Em modo
`workspace`, alterações existentes permanecem na nova branch. Em modo
`worktree`, alterações não commitadas da origem não são copiadas; elas são
listadas no manifesto e na saída da criação.

## Publicar uma tarefa

O encerramento é deliberadamente em duas partes: publicar e, se aplicável,
remover a sessão.

1. Revise o status e os diffs de cada repositório.
2. Liste arquivos, mensagem, branch, remotes e repositórios que serão
   publicados.
3. Aguarde confirmação explícita do usuário.
4. Faça stage apenas dos arquivos aprovados.
5. Execute o commit e push:

   ```bash
   python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
     finish --slug pesquisa-global \
     --message "Implementa pesquisa global" \
     --confirm
   ```

O comando usa `origin` e a branch do manifesto. Só processa repositórios com
mudanças staged; não cria commits vazios. Para evitar incluir trabalho alheio,
ele recusa qualquer repositório com alterações unstaged ou untracked.

Se alterações já existiam quando uma tarefa `workspace` foi criada, elas exigem
revisão e aprovação explícitas. Use `--include-preexisting` somente quando essa
aprovação incluir tais arquivos.

## Remover uma sessão worktree

Depois que os commits forem publicados, confirme novamente a remoção. Então:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  close --slug pesquisa-global --confirm
```

O comando:

- exige `--confirm`;
- verifica que todos os worktrees estão limpos antes de remover qualquer um;
- para se encontrar alterações não commitadas;
- remove os diretórios coordenados;
- preserva branches e o manifesto para histórico.

Em modo `workspace`, `close` não se aplica: os diretórios e branches continuam
no workspace atual. O `encerrar-tarefa` orienta a sequência completa e a
confirmação humana.

## Falhas e recuperação

- **Branch ou sessão já existe:** escolha outro slug ou inspecione a sessão
  existente; não sobrescreva seus arquivos.
- **Criação parcial:** leia o manifesto, que registra as branches/worktrees já
  preparados e o erro. Preserve o estado para diagnóstico.
- **Alterações dirty na origem:** não use stash, reset ou clean automático.
  Decida quais arquivos pertencem à tarefa e quais devem continuar fora dela.
- **Push parcial:** registre quais repositórios já foram publicados, corrija o
  projeto restante e só então continue; não remova a sessão.
- **Worktree não fecha:** execute `status`, trate todos os arquivos não limpos e
  confirme novamente antes de usar `close --confirm`.
