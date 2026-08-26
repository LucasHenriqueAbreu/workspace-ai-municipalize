#!/usr/bin/env python3
"""Create, inspect, finish, and close coordinated Git task sessions."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


CONFIG_RELATIVE_PATH = Path(".agents") / "workspace-projects.json"


@dataclass(frozen=True)
class Project:
    name: str
    path: Path


def fail(message: str) -> None:
    raise RuntimeError(message)


def run_git(repository: Path, *arguments: str) -> str:
    command = ["git", "-C", str(repository), *arguments]
    result = subprocess.run(command, text=True, capture_output=True)
    if result.returncode != 0:
        details = result.stderr.strip() or result.stdout.strip()
        fail(f"Git falhou em {repository}: git {' '.join(arguments)}\n{details}")
    # Preserve the two porcelain status columns when callers inspect
    # `git status --porcelain`; stripping leading whitespace would turn an
    # unstaged first entry into a staged-looking entry.
    return result.stdout.rstrip("\n")


def is_git_repository(path: Path) -> bool:
    result = subprocess.run(
        ["git", "-C", str(path), "rev-parse", "--show-toplevel"],
        text=True,
        capture_output=True,
    )
    return result.returncode == 0


def discover_workspace_root() -> Path:
    candidate = Path(__file__).resolve()
    for directory in [candidate, *candidate.parents]:
        if (directory / CONFIG_RELATIVE_PATH).is_file():
            return directory
    fail("Não encontrei .agents/workspace-projects.json a partir da skill.")


def load_configuration(workspace_root: Path) -> tuple[dict[str, Any], list[Project]]:
    configuration_path = workspace_root / CONFIG_RELATIVE_PATH
    try:
        configuration = json.loads(configuration_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"Não foi possível ler {configuration_path}: {error}")

    projects: list[Project] = []
    for item in configuration.get("projects", []):
        if item.get("active") is not True:
            continue
        name = item.get("name")
        relative_path = item.get("path")
        if not isinstance(name, str) or not isinstance(relative_path, str):
            fail("Cada projeto ativo precisa de name e path textuais.")
        project_path = (workspace_root / relative_path).resolve()
        if not project_path.is_dir() or not is_git_repository(project_path):
            fail(f"Projeto ativo não é um repositório Git válido: {project_path}")
        projects.append(Project(name=name, path=project_path))

    if not projects:
        fail("Nenhum projeto ativo foi configurado.")
    return configuration, projects


def normalize_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    if not normalized:
        fail("O slug da tarefa precisa conter letras ou números.")
    return normalized


def session_paths(workspace_root: Path, configuration: dict[str, Any], slug: str) -> tuple[Path, Path]:
    prefix = configuration.get("session_prefix", workspace_root.name)
    session_directory = workspace_root.parent / f"{prefix}-{slug}"
    manifest_path = workspace_root.parent / f"{session_directory.name}.session.json"
    return session_directory, manifest_path


def branch_name(configuration: dict[str, Any], slug: str) -> str:
    prefix = configuration.get("branch_prefix", "agent")
    return f"{prefix}/{slug}"


def repository_status(repository: Path) -> str:
    return run_git(repository, "status", "--porcelain")


def resolve_base(repository: Path, base: str) -> tuple[str, str]:
    reference = "HEAD" if base == "current" else base
    commit = run_git(repository, "rev-parse", "--verify", f"{reference}^{{commit}}")
    return reference, commit


def ensure_branch_is_available(repository: Path, branch: str) -> None:
    existing = subprocess.run(
        ["git", "-C", str(repository), "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"],
        capture_output=True,
    )
    if existing.returncode == 0:
        fail(f"A branch já existe em {repository}: {branch}")


def start_session(workspace_root: Path, configuration: dict[str, Any], projects: list[Project], slug: str, base: str) -> None:
    session_directory, manifest_path = session_paths(workspace_root, configuration, slug)
    branch = branch_name(configuration, slug)
    if session_directory.exists() or manifest_path.exists():
        fail(f"A sessão já existe: {session_directory}")

    repositories = [("workspace", workspace_root), *[(project.name, project.path) for project in projects]]
    resolved_bases: dict[str, tuple[str, str]] = {}
    dirty_repositories: list[str] = []
    for name, repository in repositories:
        ensure_branch_is_available(repository, branch)
        resolved_bases[name] = resolve_base(repository, base)
        if repository_status(repository):
            dirty_repositories.append(name)

    project_entries: dict[str, dict[str, str]] = {
        "workspace": {
            "path": str(session_directory),
            "baseReference": resolved_bases["workspace"][0],
            "baseCommit": resolved_bases["workspace"][1],
        }
    }
    project_entries.update(
        {
            project.name: {
                "path": str(session_directory / project.name),
                "baseReference": resolved_bases[project.name][0],
                "baseCommit": resolved_bases[project.name][1],
            }
            for project in projects
        }
    )
    manifest = {
        "status": "creating",
        "mode": "worktree",
        "slug": slug,
        "branch": branch,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "sessionPath": str(session_directory),
        "sourceWorkspace": str(workspace_root),
        "dirtySources": dirty_repositories,
        "createdProjects": [],
        "projects": project_entries,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    created_projects: list[str] = []
    try:
        root_target = session_directory
        run_git(workspace_root, "worktree", "add", "-b", branch, str(root_target), resolved_bases["workspace"][1])
        created_projects.append("workspace")
        manifest["createdProjects"] = created_projects
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        for project in projects:
            target = session_directory / project.name
            run_git(project.path, "worktree", "add", "-b", branch, str(target), resolved_bases[project.name][1])
            created_projects.append(project.name)
            manifest["createdProjects"] = created_projects
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except Exception as error:
        manifest["status"] = "partial"
        manifest["error"] = str(error)
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("A criação foi interrompida; os worktrees já criados foram preservados para diagnóstico.", file=sys.stderr)
        raise

    manifest["status"] = "ready"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Sessão criada: {session_directory}")
    print(f"Branch: {branch}")
    if dirty_repositories:
        print("Fontes com alterações não commitadas (não copiadas): " + ", ".join(dirty_repositories))
    print(f"Manifesto: {manifest_path}")


def start_in_workspace(
    workspace_root: Path,
    configuration: dict[str, Any],
    projects: list[Project],
    slug: str,
    base: str,
) -> None:
    """Create and activate the task branch in the existing worktrees."""
    _, manifest_path = session_paths(workspace_root, configuration, slug)
    branch = branch_name(configuration, slug)
    if manifest_path.exists():
        fail(f"A sessão já existe: {manifest_path}")

    repositories = [("workspace", workspace_root), *[(project.name, project.path) for project in projects]]
    resolved_bases: dict[str, tuple[str, str]] = {}
    dirty_repositories: list[str] = []
    for name, repository in repositories:
        ensure_branch_is_available(repository, branch)
        resolved_bases[name] = resolve_base(repository, base)
        if repository_status(repository):
            dirty_repositories.append(name)

    project_entries = {
        name: {
            "path": str(repository),
            "baseReference": resolved_bases[name][0],
            "baseCommit": resolved_bases[name][1],
        }
        for name, repository in repositories
    }
    manifest = {
        "status": "creating",
        "mode": "workspace",
        "slug": slug,
        "branch": branch,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "sessionPath": str(workspace_root),
        "sourceWorkspace": str(workspace_root),
        "dirtySources": dirty_repositories,
        "createdProjects": [],
        "projects": project_entries,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    prepared_projects: list[str] = []
    try:
        for name, repository in repositories:
            run_git(repository, "switch", "--create", branch, resolved_bases[name][1])
            prepared_projects.append(name)
            manifest["createdProjects"] = prepared_projects
            manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except Exception as error:
        manifest["status"] = "partial"
        manifest["error"] = str(error)
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("A criação foi interrompida; as branches já preparadas foram preservadas para diagnóstico.", file=sys.stderr)
        raise

    manifest["status"] = "ready"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Tarefa criada no workspace atual: {workspace_root}")
    print(f"Branch: {branch}")
    if dirty_repositories:
        print("Repositórios já alterados (as mudanças permaneceram na nova branch): " + ", ".join(dirty_repositories))
    print(f"Manifesto: {manifest_path}")


def read_manifest(workspace_root: Path, configuration: dict[str, Any], slug: str) -> tuple[Path, Path, dict[str, Any]]:
    session_directory, manifest_path = session_paths(workspace_root, configuration, slug)
    if not manifest_path.is_file():
        fail(f"Manifesto não encontrado: {manifest_path}")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"Não foi possível ler {manifest_path}: {error}")
    return session_directory, manifest_path, manifest


def status_session(workspace_root: Path, configuration: dict[str, Any], slug: str) -> None:
    session_directory, _, manifest = read_manifest(workspace_root, configuration, slug)
    print(f"Sessão: {session_directory}")
    print(f"Modo: {manifest.get('mode', 'worktree')}")
    print(f"Branch: {manifest['branch']}")
    for name, entry in manifest["projects"].items():
        path = Path(entry["path"])
        if not path.exists():
            print(f"- {name}: ausente ({path})")
            continue
        dirty = bool(repository_status(path))
        commit = run_git(path, "rev-parse", "HEAD")
        state = "alterado" if dirty else "limpo"
        print(f"- {name}: {state}, {commit[:12]}, {path}")


def close_session(workspace_root: Path, configuration: dict[str, Any], slug: str, confirmed: bool) -> None:
    if not confirmed:
        fail("O fechamento remove worktrees. Repita com --confirm após confirmar com o usuário.")
    _, manifest_path, manifest = read_manifest(workspace_root, configuration, slug)
    if manifest.get("mode", "worktree") != "worktree":
        fail("Esta tarefa usa o workspace atual e não possui worktree coordenado para remover.")
    entries = list(manifest["projects"].items())
    dirty_paths = [Path(entry["path"]) for _, entry in entries if Path(entry["path"]).exists() and repository_status(Path(entry["path"]))]
    if dirty_paths:
        paths = "\n".join(f"- {path}" for path in dirty_paths)
        fail(f"A sessão possui alterações não commitadas; nada foi removido:\n{paths}")

    source_by_name = {"workspace": workspace_root}
    _, projects = load_configuration(workspace_root)
    source_by_name.update({project.name: project.path for project in projects})
    for name, entry in reversed(entries):
        path = Path(entry["path"])
        if path.exists():
            run_git(source_by_name[name], "worktree", "remove", str(path))

    manifest["closedAt"] = datetime.now(timezone.utc).isoformat()
    manifest["status"] = "closed"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Worktrees removidos. Branches preservadas: {manifest['branch']}")
    print(f"Manifesto preservado: {manifest_path}")


def staged_changes(repository: Path) -> bool:
    return any(line and line[0] not in (" ", "?") for line in run_git(repository, "status", "--porcelain=v1").splitlines())


def unstaged_changes(repository: Path) -> bool:
    return any(
        line and (line.startswith("??") or len(line) > 1 and line[1] != " ")
        for line in run_git(repository, "status", "--porcelain=v1").splitlines()
    )


def finish_session(
    workspace_root: Path,
    configuration: dict[str, Any],
    slug: str,
    message: str,
    confirmed: bool,
    include_preexisting: bool,
) -> None:
    if not confirmed:
        fail("Commit e push exigem confirmação explícita. Repita com --confirm após confirmar com o usuário.")
    if not message.strip():
        fail("A mensagem do commit não pode ser vazia.")

    _, manifest_path, manifest = read_manifest(workspace_root, configuration, slug)
    if manifest.get("status") not in ("ready", "finished"):
        fail(f"A sessão não está pronta para encerramento: status={manifest.get('status')}")
    if manifest.get("mode", "worktree") == "workspace" and manifest.get("dirtySources") and not include_preexisting:
        dirty_sources = ", ".join(manifest["dirtySources"])
        fail(
            "A tarefa foi criada com alterações pré-existentes em: "
            f"{dirty_sources}. Revise-as e confirme explicitamente com --include-preexisting "
            "se elas também pertencerem à tarefa."
        )

    repositories = []
    for name, entry in manifest["projects"].items():
        repository = Path(entry["path"])
        if not repository.is_dir():
            fail(f"Repositório da sessão não encontrado: {repository}")
        current_branch = run_git(repository, "branch", "--show-current")
        if current_branch != manifest["branch"]:
            fail(f"{name} não está na branch da tarefa {manifest['branch']}: {current_branch or 'detached HEAD'}")
        if unstaged_changes(repository):
            fail(f"{name} possui alterações não staged. Revise e faça git add apenas dos arquivos da tarefa: {repository}")
        if staged_changes(repository):
            if subprocess.run(["git", "-C", str(repository), "remote", "get-url", "origin"], capture_output=True).returncode != 0:
                fail(f"{name} não possui remote origin configurado: {repository}")
            repositories.append((name, repository))

    if not repositories:
        fail("Nenhum arquivo staged para commit nos repositórios da tarefa.")

    committed: list[str] = []
    try:
        for name, repository in repositories:
            run_git(repository, "commit", "-m", message)
            run_git(repository, "push", "--set-upstream", "origin", manifest["branch"])
            committed.append(name)
    except Exception as error:
        manifest["status"] = "partial"
        manifest["error"] = str(error)
        manifest["committedProjects"] = committed
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        raise

    manifest["status"] = "finished"
    manifest["finishedAt"] = datetime.now(timezone.utc).isoformat()
    manifest["committedProjects"] = committed
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Commit e push concluídos em: " + ", ".join(committed))
    print(f"Manifesto: {manifest_path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Gerencia sessões de Git worktrees do workspace Municipalize.")
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("start", "status", "finish", "close"):
        subparser = subparsers.add_parser(command)
        subparser.add_argument("--slug", required=True, help="Nome da tarefa ou sessão.")
        if command == "start":
            subparser.add_argument("--base", default="current", help="Ref base comum; padrão: current (HEAD por repositório).")
            subparser.add_argument(
                "--mode",
                choices=("worktree", "workspace"),
                default="worktree",
                help="worktree cria uma sessão isolada; workspace usa os diretórios atuais.",
            )
        elif command == "finish":
            subparser.add_argument("--message", required=True, help="Mensagem do commit em cada repositório.")
            subparser.add_argument("--confirm", action="store_true", help="Confirma commit e push nos arquivos staged.")
            subparser.add_argument(
                "--include-preexisting",
                action="store_true",
                help="Inclui alterações que já existiam ao criar uma tarefa no workspace atual.",
            )
        else:
            subparser.add_argument("--confirm", action="store_true", help="Confirma a remoção dos worktrees limpos.")
    return parser


def main() -> int:
    try:
        arguments = build_parser().parse_args()
        workspace_root = discover_workspace_root()
        configuration, projects = load_configuration(workspace_root)
        slug = normalize_slug(arguments.slug)
        if arguments.command == "start":
            if arguments.mode == "workspace":
                start_in_workspace(workspace_root, configuration, projects, slug, arguments.base)
            else:
                start_session(workspace_root, configuration, projects, slug, arguments.base)
        elif arguments.command == "status":
            status_session(workspace_root, configuration, slug)
        elif arguments.command == "finish":
            finish_session(
                workspace_root,
                configuration,
                slug,
                arguments.message,
                arguments.confirm,
                arguments.include_preexisting,
            )
        else:
            close_session(workspace_root, configuration, slug, arguments.confirm)
        return 0
    except RuntimeError as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
