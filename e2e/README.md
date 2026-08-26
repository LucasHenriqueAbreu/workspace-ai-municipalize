# Projeto E2E do workspace

Esta é a suíte Playwright centralizada do workspace Municipalize. Ela fica na
raiz do workspace, fora dos projetos de frontend e backend, e valida os fluxos
de navegador do `municipalize-app`.

## Inventário realizado

- `municipalize-app`: não possuía `playwright.config.*`, pasta E2E própria nem
  dependência Playwright de primeiro nível. O resultado encontrado em
  `node_modules/cytoscape/` pertence a uma dependência de terceiros e não é uma
  suíte do produto.
- `municipalize-admin-app`: não possui configuração ou dependência Playwright.
- `ms-main`: não possui configuração ou dependência Playwright; seus testes
  seguem JUnit/Quarkus.
- `e2e/`: projeto criado para concentrar os testes de navegador dos projetos
  ativos, sem iniciar ou depender dos projetos legados.

## Instalação

Na raiz deste projeto E2E:

```bash
npm install
npm run install:browsers
```

O segundo comando instala somente o Chromium usado pela configuração. Em CI ou
em uma máquina Linux que exija bibliotecas do sistema, use
`npx playwright install --with-deps chromium`.

## Preparação

1. Copie `.env.example` para `.env` sem adicionar credenciais.
2. Para QA integrado, preencha no `.env` local `E2E_TENANT_SLUG`,
   `E2E_REAL_USER_EMAIL` e `E2E_REAL_USER_PASSWORD`. O arquivo é ignorado pelo
   Git; não coloque esses valores em `tests/`, fixtures, logs ou no relatório.
   O mesmo usuário é criado/atualizado no Keycloak e vinculado à tabela
   `usuario` do `ms-main` pelo bootstrap.
3. O fluxo integrado usa a home global para carregar o catálogo público da
   Admin API. Depois seleciona o card do município e somente então acessa a
   rota pública do tenant. A conta só é usada depois dessa seleção.
4. Os testes usam as portas `51**` para o frontend. Para subir todo o ambiente
   de QA isolado, com Admin API, Mongo administrativo, `ms-main`, SQL Server e
   Keycloak em portas dinâmicas:

   ```bash
   npm run docker:ms-main:up
   # o comando também executa o bootstrap idempotente do município e do usuário
   # carregue as portas impressas para executar a suíte na mesma sessão
   set -a; source .env; source .runtime/municipalize-qa-<pid>.env; set +a
   E2E_START_APP=true E2E_USE_API_FIXTURES=false E2E_LOGIN_WITH_API=true npm test
   npm run docker:ms-main:down -- --project municipalize-qa-<pid>
   ```

   O comando cria um projeto Docker próprio, remove `container_name` fixo e
   escolhe portas livres nas faixas `30**` (`ms-main`), `32**` (Admin API),
   `27***` (Mongo administrativo), `14**` (SQL Server), `81**` (Keycloak) e
   `51**` (frontend). O arquivo de portas fica em `.runtime/` e não é
   versionado.

   O bootstrap é idempotente e prepara:

   - um município `E2E_TENANT_SLUG` na collection `customers` da Admin API;
   - o mesmo usuário no realm `quarkus-realm` do Keycloak com papel `admin`;
   - o vínculo desse usuário na tabela `usuario` e em `usuario_papeis` do
     banco do `ms-main`;
   - uma linha mínima nas tabelas fato do dashboard para permitir smoke tests
     com dados reais do backend.

   Para executar somente o seed depois de uma alteração ou reinício dos
   serviços, use `npm run qa:bootstrap` com o arquivo `.runtime` carregado.

5. Para uma execução manual sem o script Docker, inicie o frontend em uma porta `51**`, por exemplo `5100`:

   ```bash
   cd ../municipalize-app
   npm start -- --port 5100
   ```

6. Por padrão, a suíte intercepta as APIs com fixtures sintéticas e inicia
   somente o Angular. O Playwright não cria dados, não usa produção e não
   registra tokens, cookies ou dados pessoais.

## Execução

Com as fixtures sintéticas, a suíte pode iniciar o frontend automaticamente:

```bash
E2E_START_APP=true npm test
```

Para validar contra APIs reais sem Docker, é necessário iniciar o frontend e as
duas APIs conforme os `AGENTS.md` locais, preparar o Mongo, o Keycloak e o SQL
Server, executar `npm run qa:bootstrap` com as URLs/portas correspondentes,
preencher a sessão no `.env` e desativar as fixtures:

```bash
E2E_START_APP=false E2E_USE_API_FIXTURES=false E2E_LOGIN_WITH_API=true npm test
```

O login técnico do E2E busca a chave pública do `ms-main`, cifra a senha em
memória com RSA-OAEP e grava somente os tokens temporários no contexto isolado
do Playwright. No fluxo Docker, o `qa:bootstrap` cria a conta no Keycloak e o
vínculo correspondente na base do tenant antes da suíte iniciar. O seed não
imprime senha, token, cookie ou identificador sensível.

Quando o backend estiver em porta dinâmica, defina
`E2E_TENANT_API_PROXY_URL=http://localhost:<E2E_BACKEND_PORT>`. O frontend pode
continuar usando as URLs lógicas `3000`/`8080`; o Playwright redireciona as
chamadas para as portas da execução atual.

Os testes com fixtures comprovam a interface e suas interações com dados
determinísticos. Eles não substituem o QA integrado com contratos reais,
autorização, tenant e permissões.

Os cenários estão em `tests/migracao-dashboard-vereadores.spec.ts` e cobrem a
estrutura migrada, seleção de fluxo, legenda/alternativa textual, perfil,
responsividade e teclado. Os demais casos E2E do TechSpec devem ser adicionados
à mesma suíte conforme existirem fixtures e sessão de teste seguras.

## Encerramento

Encerre o processo do frontend e os serviços iniciados para a execução. Não
finalize processos de outra worktree ou do usuário.
