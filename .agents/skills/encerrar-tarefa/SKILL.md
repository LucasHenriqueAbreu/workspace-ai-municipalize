---
name: encerrar-tarefa
description: Finish a Municipalize workspace task by reviewing its changes, committing and pushing the task branch in each affected repository, and optionally removing its coordinated worktrees after explicit confirmation.
---

# Encerrar Tarefa

Use this skill when a task started with
[`iniciar-tarefa-paralela`](../iniciar-tarefa-paralela/SKILL.md) is ready to be
published. It supports both task modes:

- `workspace`: commit and push from the existing workspace and active project
  directories; leave the branches in place.
- `worktree`: commit and push from the coordinator and nested project
  worktrees, then remove those clean worktrees only after a second confirmation.

## Safety and confirmation

- Resolve the task slug and inspect its manifest with `status` before changing
  Git state. The manifest identifies the exact repositories, paths, branch, and
  mode; do not discover or include legacy repositories.
- Review `git status --short`, `git diff`, and, when applicable,
  `git diff --cached` in every repository. List the exact files that will be
  committed, the commit message, repositories, branch, remotes, and whether
  worktrees will be removed.
- Do not commit or push until the user explicitly confirms that exact summary.
  Do not include dirty source changes recorded at task creation unless the user
  explicitly approves them too. Stage only reviewed task files with `git add`.
  If approved changes include files that were already dirty when a `workspace`
  task started, add `--include-preexisting` to the finish command.
- The helper refuses to finish while any repository has unstaged or untracked
  changes. Resolve or explicitly exclude unrelated changes before retrying; do
  not use stash, reset, clean, or force options.
- A push can mutate a shared remote. If commit or push fails in one repository,
  stop and report which repositories were already committed or pushed; do not
  retry blindly or remove any worktree.

## Finish procedure

After confirmation and after staging only the approved files, run the helper
from the workspace root:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  finish --slug pesquisa-global \
  --message "Implementa pesquisa global" \
  --confirm
```

Use `--include-preexisting` only when the confirmation explicitly includes the
changes that existed before the task branch was created.

The helper commits and pushes only repositories with staged changes, using
`origin` and the branch recorded in the manifest. It does not create empty
commits, stage files automatically, delete branches, or push a different
branch.

For a `worktree` session, inspect the resulting clean state and ask for (or
obtain) explicit confirmation to remove the worktrees. Only then run:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  close --slug pesquisa-global --confirm
```

For a `workspace` session, do not run `close`: there is no temporary worktree
to remove. Report the branches and their pushed commits instead.
