---
name: iniciar-tarefa-paralela
description: Start a Municipalize workspace task either in coordinated Git worktrees or in the existing workspace by creating the task branch in the root and every active project. Use when work must be isolated across the workspace shell, frontend, backend, or Admin API; do not use for legacy repositories or ordinary single-repository changes.
---

# Iniciar Tarefa Paralela

Use this skill to prepare the Git state for a task that may span the workspace
repository and one or more active projects. The default `worktree` mode creates
a coordinator worktree named `workspace-<slug>` next to the current workspace
and places the project worktrees inside it. The `workspace` mode keeps the
existing directories and creates/activates the same task branch in the root and
each active project.

The resulting session has this shape:

```text
workspace-<slug>/
├── .agents/
├── tasks/
├── municipalize-app/
├── ms-main/
└── municipalize-admin-app/
```

## Scope and safety

- Read `.agents/workspace-projects.json` as the source of truth for active
  projects. Do not discover arbitrary nested Git repositories.
- Include only the active projects listed there. Never create worktrees for
  `municipalize-chat-api` or `municipalize-mcp`.
- Create the same task branch name, `agent/<slug>`, in each independent
  repository. Branches are independent because the repositories have separate
  Git histories.
- Use `HEAD` from each repository by default. In `worktree` mode, a dirty source
  worktree does not prevent creation, but its uncommitted changes are not copied.
  In `workspace` mode, dirty changes remain in the newly activated branch and
  must be reviewed before they can be included in a commit. Report the dirty
  state clearly in both modes.
- Do not use stash, reset, clean, force removal, or copy `.env` files.
- Do not overwrite an existing session, branch, or worktree path. Stop with a
  useful diagnostic instead.
- The root worktree owns the shared `tasks/` artifacts. Do not invent a second
  task tree inside each project unless the workspace conventions are changed
  explicitly.

## Commands

Run the helper from the current workspace root:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  start --slug pesquisa-global
```

Use `--base <ref>` when the task must start from a known ref in every
repository. `--base current` (the default) resolves to each repository's
current `HEAD`; it does not mean the current uncommitted working tree.

Create a task in the current directories with:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
  start --slug pesquisa-global --mode workspace
```

Inspect a session with:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
 status --slug pesquisa-global
```

Only after the user confirms the exact files, commit message, repositories, and
push operation, use [`encerrar-tarefa`](../encerrar-tarefa/SKILL.md) to finish
the task. A worktree session is removed only after its commits are pushed and
the user confirms removal:

```bash
python3 .agents/skills/iniciar-tarefa-paralela/scripts/manage_worktrees.py \
 close --slug pesquisa-global --confirm
```

`close` requires `--confirm`, removes only clean worktrees, and never deletes
their branches. If any session worktree has changes, it stops before removing
anything and reports the path that needs attention. A `workspace` session has
no worktree to remove; its branches remain in the existing directories.

After `start`, continue development from
`../workspace-<slug>/` and run project-specific commands inside its respective
project directory. The skill prepares the isolated session; it does not
implement the task or start application infrastructure automatically.
