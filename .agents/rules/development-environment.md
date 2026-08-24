# Ambiente de desenvolvimento

## Fonte de verdade

Antes de iniciar um serviço, consulte o `AGENTS.md`, os arquivos de configuração
e os scripts do próprio projeto. Este documento coordena o ecossistema, mas não
substitui comandos locais nem autoriza presumir dependências inexistentes.

## Mapa local padrão

| Componente | Porta padrão | Responsabilidade |
|---|---:|---|
| `municipalize-app` | 4200 | Aplicação Angular |
| `ms-main` | 8080 | API principal Quarkus |
| `municipalize-admin-app` | 3000 | API administrativa NestJS |
| Keycloak | 8180 | Autenticação e OIDC |
| SQL Server | 1433 | Persistência do `ms-main` |
| MongoDB | 27017 | Persistência da Admin API |
| LiteLLM | 4000 | Gateway de modelos usado pelo Chat |

Confirme as portas nos logs e configurações antes de automatizar chamadas. Uma
porta configurável pode diferir do valor padrão.

## Dependências por projeto

- `municipalize-app` consome `ms-main`, `municipalize-admin-app` e Keycloak nos
  fluxos correspondentes.
- `ms-main` requer SQL Server e Keycloak para o ambiente local completo. Sua
  infraestrutura é iniciada pelo Docker Compose do próprio projeto.
- `municipalize-admin-app` requer MongoDB. LiteLLM é necessário somente para
  fluxos de Chat ou IA que realizem chamadas a modelos.
- Os projetos legados não devem ser iniciados.

Suba apenas as dependências necessárias para a tarefa. Testes isolados não devem
exigir toda a plataforma quando mocks, stubs ou containers de teste forem
suficientes e coerentes com a camada validada.

## Ordem de inicialização integrada

Para um fluxo completo, use esta ordem:

1. infraestrutura: SQL Server, Keycloak e MongoDB;
2. LiteLLM, quando o fluxo de Chat ou IA exigir modelos;
3. `ms-main`;
4. `municipalize-admin-app`;
5. `municipalize-app`.

Espere cada dependência ficar pronta antes de iniciar seu consumidor. Não trate
um container em estado `running` como prova de prontidão; use health check,
endpoint conhecido, conexão controlada ou sinal inequívoco do log.

## Comandos de referência

Execute sempre a partir do projeto indicado:

```bash
cd ms-main
docker compose up -d
./mvnw quarkus:dev
```

```bash
cd municipalize-admin-app
npm run database:up
npm run dev
```

```bash
cd municipalize-app
npm start
```

Confirme os scripts atuais no `package.json` ou no `AGENTS.md` local antes de
incorporá-los em automações permanentes.

## Isolamento e portas alternativas

Ao executar ambientes paralelos ou worktrees, verifique a disponibilidade da
porta antes de iniciar o processo. Configure todas as URLs consumidoras para as
portas escolhidas e registre processos, containers e recursos criados.

Não reutilize bancos persistentes quando o teste puder alterar dados de forma
destrutiva. Prefira bancos, schemas, databases ou containers isolados e
identificados pela execução.

## Encerramento

Encerre de forma graciosa somente os processos e containers iniciados pela
execução atual. Não mate processos pela porta sem confirmar sua identidade. Ao
final, libere portas, conexões, bancos temporários e arquivos transitórios,
inclusive quando a execução falhar ou for interrompida.

O projeto Playwright centralizado ainda não existe. Não crie comandos, caminhos
ou dependências para ele até a tarefa específica de implantação do QA E2E.
