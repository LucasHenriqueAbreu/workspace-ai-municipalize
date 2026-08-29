import 'dotenv/config';

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { parse } from 'dotenv';

const workspace = resolve(import.meta.dirname, '../..');
const e2eDirectory = resolve(workspace, 'e2e');
const runtimeDirectory = resolve(workspace, 'e2e/.runtime');
const composeFiles = [
  '-f',
  resolve(workspace, 'ms-main/docker-compose.yaml'),
  '-f',
  resolve(workspace, 'e2e/docker-compose.ms-main.qa.yaml'),
];

const defaultLiteLlmEnvironmentFile = resolve(workspace, 'municipalize-admin-app/.env.litellm');

const isAvailable = port =>
  new Promise(resolveResult => {
    const server = createServer();
    server.once('error', () => resolveResult(false));
    server.listen(port, '127.0.0.1', () => server.close(() => resolveResult(true)));
  });

const findPort = async (start, end) => {
  for (let port = start; port <= end; port += 1) {
    if (await isAvailable(port)) return port;
  }
  throw new Error(`Nenhuma porta livre encontrada entre ${start} e ${end}.`);
};

const runCommand = (commandName, args, env, cwd = workspace) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(commandName, args, { cwd, env, stdio: 'inherit' });
    child.on('error', rejectPromise);
    child.on('exit', code => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${commandName} ${args.join(' ')} terminou com código ${code ?? 1}.`));
    });
  });

const loadLiteLlmEnvironment = async () => {
  const configuredFile = process.env.E2E_LITELLM_ENV_FILE;
  const environmentFile = configuredFile === undefined
    ? defaultLiteLlmEnvironmentFile
    : resolve(e2eDirectory, configuredFile);
  try {
    await access(environmentFile);
  } catch {
    throw new Error(`Arquivo de ambiente do LiteLLM não encontrado: ${environmentFile}`);
  }
  const values = parse(await readFile(environmentFile, 'utf8'));
  for (const [name, value] of Object.entries(values)) {
    if (process.env[name] === undefined) {
      process.env[name] = value;
    }
  }
  if (!process.env.LITELLM_MASTER_KEY || !process.env.OPENAI_API_KEY) {
    throw new Error('O ambiente do LiteLLM precisa de LITELLM_MASTER_KEY e OPENAI_API_KEY.');
  }
};

const validateQaCredentials = () => {
  const missing = ['E2E_REAL_USER_EMAIL', 'E2E_REAL_USER_PASSWORD'].filter(
    name => !process.env[name]?.trim(),
  );
  if (missing.length > 0) {
    throw new Error(`Defina no e2e/.env: ${missing.join(' e ')} antes de subir a stack QA.`);
  }
};

const command = process.argv[2] ?? 'up';
const projectArgumentIndex = process.argv.findIndex(argument => argument === '--project');
const projectFromArgument = projectArgumentIndex >= 0 ? process.argv[projectArgumentIndex + 1] : undefined;
const project = process.env['E2E_DOCKER_PROJECT'] ?? projectFromArgument ?? `municipalize-qa-${process.pid}`;
const env = { ...process.env, E2E_DOCKER_PROJECT: project };

if (command === 'down') {
  await loadLiteLlmEnvironment();
  Object.assign(env, process.env);
  await runCommand('docker', ['compose', ...composeFiles, '-p', project, 'down', '--remove-orphans'], env);
} else if (command === 'up') {
  await loadLiteLlmEnvironment();
  validateQaCredentials();
  Object.assign(env, process.env);
  const externalLiteLlmBaseUrl = env.E2E_LITELLM_BASE_URL?.trim();
  const frontendPort = await findPort(5100, 5199);
  const backendPort = await findPort(3000, 3099);
  const adminApiPort = await findPort(3200, 3299);
  const adminMongoPort = await findPort(27000, 27099);
  const mssqlPort = await findPort(1400, 1499);
  const keycloakPort = await findPort(8180, 8199);
  Object.assign(env, {
    E2E_TENANT_SLUG: env.E2E_TENANT_SLUG?.trim() || 'e2e-tenant',
    E2E_ADMIN_API_PORT: String(adminApiPort),
    E2E_ADMIN_API_PROXY_URL: `http://localhost:${adminApiPort}`,
    E2E_ADMIN_MONGO_PORT: String(adminMongoPort),
    E2E_ADMIN_MONGODB_URI: `mongodb://municipalize_admin:municipalize_admin_password@localhost:${adminMongoPort}/municipalize_admin_development?authSource=admin`,
    E2E_BASE_URL: `http://localhost:${frontendPort}`,
    E2E_FRONTEND_PORT: String(frontendPort),
    E2E_BACKEND_PORT: String(backendPort),
    E2E_MSSQL_PORT: String(mssqlPort),
    E2E_KEYCLOAK_PORT: String(keycloakPort),
    E2E_KEYCLOAK_BASE_URL: `http://localhost:${keycloakPort}`,
    E2E_MSSQL_HOST: 'localhost',
    E2E_MSSQL_PORT: String(mssqlPort),
    MS_MSSQL_PORT: String(mssqlPort),
    MS_KEYCLOAK_PORT: String(keycloakPort),
    E2E_TENANT_API_BASE_URL: `http://localhost:${backendPort}`,
    E2E_TENANT_API_PROXY_URL: `http://localhost:${backendPort}`,
    E2E_TENANT_BROWSER_API_BASE_URL: `http://host.docker.internal:${backendPort}`,
    E2E_START_APP: 'false',
  });
  await mkdir(runtimeDirectory, { recursive: true });
  const runtimeFile = resolve(runtimeDirectory, `${project}.env`);
  await writeFile(
    runtimeFile,
    `E2E_DOCKER_PROJECT=${project}\nE2E_TENANT_SLUG=${env.E2E_TENANT_SLUG}\nE2E_BASE_URL=http://localhost:${frontendPort}\nE2E_FRONTEND_PORT=${frontendPort}\nE2E_START_APP=false\nE2E_USE_API_FIXTURES=false\nE2E_LOGIN_WITH_API=true\nE2E_BACKEND_PORT=${backendPort}\nE2E_ADMIN_API_PORT=${adminApiPort}\nE2E_ADMIN_API_PROXY_URL=http://localhost:${adminApiPort}\nE2E_ADMIN_MONGO_PORT=${adminMongoPort}\nE2E_ADMIN_MONGODB_URI=mongodb://municipalize_admin:municipalize_admin_password@localhost:${adminMongoPort}/municipalize_admin_development?authSource=admin\nE2E_MSSQL_HOST=localhost\nE2E_MSSQL_PORT=${mssqlPort}\nMS_MSSQL_PORT=${mssqlPort}\nE2E_KEYCLOAK_BASE_URL=http://localhost:${keycloakPort}\nMS_KEYCLOAK_PORT=${keycloakPort}\nE2E_TENANT_API_BASE_URL=http://localhost:${backendPort}\nE2E_TENANT_API_PROXY_URL=http://localhost:${backendPort}\nE2E_TENANT_BROWSER_API_BASE_URL=http://api:8080\n`,
    { mode: 0o600 },
  );
  console.log(`Ambiente Docker: ${project}`);
  console.log(`Arquivo de portas: ${runtimeFile}`);
  console.log(`E2E_FRONTEND_PORT=${frontendPort}`);
  console.log(`E2E_BACKEND_PORT=${backendPort}`);
  console.log(`MS_MSSQL_PORT=${mssqlPort}`);
  console.log(`MS_KEYCLOAK_PORT=${keycloakPort}`);
  const infrastructureServices = externalLiteLlmBaseUrl
    ? ['admin-mongo', 'mssql', 'keycloak']
    : ['admin-mongo', 'admin-api', 'mssql', 'keycloak', 'litellm-postgres', 'litellm'];
  await runCommand(
    'docker',
    [
      'compose',
      ...composeFiles,
      '-p',
      project,
      'up',
      '--build',
      '--detach',
      '--remove-orphans',
      ...infrastructureServices,
    ],
    env,
  );
  if (externalLiteLlmBaseUrl) {
    console.log(`LiteLLM externo para esta execução: ${externalLiteLlmBaseUrl}`);
    await runCommand(
      'docker',
      ['compose', ...composeFiles, '-p', project, 'up', '--build', '--detach', '--remove-orphans', '--no-deps', 'admin-api'],
      env,
    );
  }
  await runCommand(process.execPath, [resolve(import.meta.dirname, 'bootstrap-mssql-databases.mjs')], env);
  await runCommand('docker', ['compose', ...composeFiles, '-p', project, 'up', '--build', '--detach', '--remove-orphans', 'api'], env);
  await runCommand(process.execPath, [resolve(import.meta.dirname, 'bootstrap-qa-environment.mjs')], env);
  await runCommand('npm', ['run', 'build', '--', '--configuration', 'development'], env, resolve(workspace, 'municipalize-app'));
  await runCommand('docker', ['compose', ...composeFiles, '-p', project, 'up', '--build', '--detach', '--remove-orphans', 'frontend'], env);
} else {
  throw new Error(`Comando desconhecido: ${command}. Use up ou down.`);
}
