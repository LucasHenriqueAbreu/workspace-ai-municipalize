# Regras de Git

## Escopo do repositório

Confirme o diretório raiz do Git antes de executar qualquer comando. A raiz do
workspace e cada projeto interno possuem históricos e estados independentes.
Execute `git status` e `git diff` no repositório que receberá a alteração.

Os projetos internos estão ignorados pelo repositório da raiz. Não os adicione
como submódulos, subtrees ou repositórios incorporados sem solicitação explícita.

## Preservação do trabalho

Não descarte alterações existentes do usuário. Evite comandos destrutivos como
`git reset --hard`, `git clean -fd` e restauração ampla de arquivos. Antes de
editar um arquivo já modificado, confira o diff e preserve mudanças não
relacionadas.

Não use stash como mecanismo automático. Não troque de branch quando houver
risco de interferir no trabalho atual.

## Commits e publicação

Não crie commits, branches, tags, pushes ou pull requests sem pedido explícito.
Quando solicitado, inclua somente arquivos pertencentes ao escopo e revise o
diff preparado antes do commit.

Um commit no repositório da raiz pode incluir documentação, `.agents`, scripts
de automação e o futuro projeto de QA. Alterações de produto devem ser
commitadas separadamente dentro de cada repositório responsável.

## Validação

Antes de concluir alterações, execute `git diff --check` no repositório afetado.
Use `git status --short` para informar arquivos alterados sem esconder mudanças
preexistentes.
