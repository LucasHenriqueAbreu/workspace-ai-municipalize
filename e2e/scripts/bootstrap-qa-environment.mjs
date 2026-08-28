import 'dotenv/config';

import { MongoClient } from 'mongodb';
import sql from 'mssql';
import { createConnection } from 'node:net';

const requiredEnvironment = (name) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Defina ${name} para executar o bootstrap integrado.`);
  }
  return value;
};

const environment = {
  adminMongoUri: requiredEnvironment('E2E_ADMIN_MONGODB_URI'),
  adminDatabaseName: process.env.E2E_ADMIN_DATABASE_NAME?.trim() || 'municipalize_admin_development',
  customerId: process.env.E2E_QA_CUSTOMER_ID?.trim() || '00000000-0000-4000-8000-000000000001',
  tenantSlug: process.env.E2E_TENANT_SLUG?.trim() || 'e2e-tenant',
  tenantApiBaseUrl: requiredEnvironment('E2E_TENANT_API_BASE_URL').replace(/\/$/u, ''),
  tenantBrowserApiBaseUrl: process.env.E2E_TENANT_BROWSER_API_BASE_URL?.trim() || 'http://localhost:8080',
  keycloakBaseUrl: (process.env.E2E_KEYCLOAK_BASE_URL?.trim() || 'http://localhost:8180').replace(/\/$/u, ''),
  mssqlHost: process.env.E2E_MSSQL_HOST?.trim() || 'localhost',
  mssqlPort: Number(process.env.E2E_MSSQL_PORT || '1433'),
  mssqlDatabase: process.env.E2E_MSSQL_DATABASE?.trim() || 'db-main',
  mssqlPassword: process.env.E2E_MSSQL_PASSWORD?.trim() || 'MsProject@2025@',
  userEmail: requiredEnvironment('E2E_REAL_USER_EMAIL'),
  userPassword: requiredEnvironment('E2E_REAL_USER_PASSWORD'),
  userFullName: process.env.E2E_QA_USER_FULL_NAME?.trim() || 'QA Administrador',
  snapshotDate: process.env.E2E_QA_SNAPSHOT_DATE?.trim() || '2026-08-20',
};

const waitForTcp = async (host, port, timeoutMs = 120_000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const available = await new Promise((resolve) => {
      const socket = createConnection({ host, port });
      const finish = (result) => {
        socket.removeAllListeners();
        socket.destroy();
        resolve(result);
      };
      socket.once('connect', () => finish(true));
      socket.once('error', () => finish(false));
      socket.setTimeout(2_000, () => finish(false));
    });

    if (available) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timeout aguardando ${host}:${port}.`);
};

const waitForMssqlSchema = async (timeoutMs = 180_000) => {
  const deadline = Date.now() + timeoutMs;
  const config = {
    server: environment.mssqlHost,
    port: environment.mssqlPort,
    user: 'sa',
    password: environment.mssqlPassword,
    database: environment.mssqlDatabase,
    options: { encrypt: false, trustServerCertificate: true },
  };

  while (Date.now() < deadline) {
    let pool;
    try {
      pool = await new sql.ConnectionPool(config).connect();
      const result = await pool.request().query("SELECT OBJECT_ID('dbo.usuario', 'U') AS usuarioTable");
      if (result.recordset[0]?.usuarioTable !== null) return;
    } catch {
      // O Quarkus pode ainda estar conectando ou executando o Flyway.
    } finally {
      await pool?.close().catch(() => undefined);
    }

    await new Promise(resolve => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timeout aguardando o schema do ms-main em ${environment.mssqlDatabase}.`);
};

const seedAdminCustomer = async () => {
  const client = new MongoClient(environment.adminMongoUri);
  await client.connect();

  try {
    const now = new Date();
    await client.db(environment.adminDatabaseName).collection('customers').replaceOne(
      { _id: environment.customerId },
      {
        _id: environment.customerId,
        backendDomain: environment.tenantBrowserApiBaseUrl,
        bannerUrl: null,
        createdAt: now,
        logoUrl: null,
        name: 'Município QA',
        populationEstimate: 1000,
        populationReferenceLabel: 'Base sintética de QA',
        shortDescription: 'Município determinístico para testes integrados.',
        slug: environment.tenantSlug,
        stateCode: 'PR',
        stateName: 'Paraná',
        stateRegion: 'Sul',
        updatedAt: now,
      },
      { upsert: true },
    );
  } finally {
    await client.close();
  }
};

const keycloakRequest = async (path, options = {}) => {
  const response = await fetch(`${environment.keycloakBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body === undefined ? {} : { 'content-type': 'application/x-www-form-urlencoded' }),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Keycloak respondeu ${response.status} em ${path}.`);
  }

  return response;
};

const ensureKeycloakUser = async () => {
  const tokenResponse = await keycloakRequest('/realms/master/protocol/openid-connect/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'password',
      password: 'admin',
      username: 'admin',
    }),
  });
  const { access_token: accessToken } = await tokenResponse.json();
  const headers = { Authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' };
  const realm = 'quarkus-realm';
  const query = new URLSearchParams({ email: environment.userEmail, exact: 'true' });
  const usersResponse = await keycloakRequest(`/admin/realms/${realm}/users?${query.toString()}`, { headers });
  const users = await usersResponse.json();
  const existingUser = users.find((user) => user.email === environment.userEmail);
  let userId = existingUser?.id;

  if (userId === undefined) {
    const createResponse = await keycloakRequest(`/admin/realms/${realm}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        username: environment.userEmail,
        email: environment.userEmail,
        firstName: environment.userFullName,
        lastName: 'QA',
        emailVerified: true,
        enabled: true,
        requiredActions: [],
        credentials: [{ type: 'password', value: environment.userPassword, temporary: false }],
      }),
    });
    const location = createResponse.headers.get('location');
    userId = location?.split('/').pop();
  } else {
    await keycloakRequest(`/admin/realms/${realm}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ username: environment.userEmail, email: environment.userEmail, firstName: environment.userFullName, lastName: 'QA', enabled: true, emailVerified: true, requiredActions: [] }),
    });
    await keycloakRequest(`/admin/realms/${realm}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ type: 'password', value: environment.userPassword, temporary: false }),
    });
  }

  if (!userId) throw new Error('Keycloak não retornou o identificador do usuário de QA.');

  const roleResponse = await keycloakRequest(`/admin/realms/${realm}/roles/admin`, { headers });
  const adminRole = await roleResponse.json();
  await keycloakRequest(`/admin/realms/${realm}/users/${userId}/role-mappings/realm`, {
    method: 'POST',
    headers,
    body: JSON.stringify([adminRole]),
  });

  return userId;
};

const seedTenantUserAndDashboard = async (keycloakId) => {
  const pool = await sql.connect({
    server: environment.mssqlHost,
    port: environment.mssqlPort,
    user: 'sa',
    password: environment.mssqlPassword,
    database: environment.mssqlDatabase,
    options: { encrypt: false, trustServerCertificate: true },
  });

  try {
    await new sql.Request(pool)
      .input('email', sql.VarChar(255), environment.userEmail)
      .input('fullName', sql.VarChar(255), environment.userFullName)
      .input('keycloakId', sql.VarChar(255), keycloakId)
      .input('snapshotDate', sql.Date, environment.snapshotDate)
      .query(`
        DECLARE @userId BIGINT;
        SELECT @userId = id FROM dbo.usuario WHERE email = @email;

        IF @userId IS NULL
        BEGIN
          INSERT INTO dbo.usuario (nome_completo, email, id_keycloak, data_cadastro, status, funcao, foto_perfil_url)
          VALUES (@fullName, @email, @keycloakId, GETDATE(), 'ACTIVE', 'ADMIN', NULL);
          SET @userId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
          UPDATE dbo.usuario
          SET nome_completo = @fullName, id_keycloak = @keycloakId, status = 'ACTIVE', funcao = 'TECNICO_PREFEITURA'
          WHERE id = @userId;
        END;

        IF NOT EXISTS (SELECT 1 FROM dbo.usuario_papeis WHERE usuario_id = @userId AND papel = 'ADMIN')
          INSERT INTO dbo.usuario_papeis (usuario_id, papel) VALUES (@userId, 'ADMIN');

        UPDATE dbo.usuario
        SET funcao = 'TECNICO_PREFEITURA'
        WHERE id = @userId;

        DELETE FROM dbo.fato_vereador_dashboard WHERE snapshot_date = @snapshotDate AND vereador_id = 42;
        INSERT INTO dbo.fato_vereador_dashboard (
          snapshot_date, vereador_id, usuario_id, usuario_nome, usuario_email, partido_id, partido_sigla,
          bancada_quantidade, emendas_criadas_qtd, emendas_criadas_valor_total, emendas_bancada_qtd,
          emendas_bancada_valor_total, projetos_acompanhados_qtd, projetos_acompanhados_valor_total
        ) VALUES (
          @snapshotDate, 42, @userId, @fullName, @email, 1, 'PEX', 0, 14, 1250000, 0, 0, 2, 100000
        );

        DELETE FROM dbo.fato_emenda_dashboard WHERE snapshot_date = @snapshotDate AND budget_amendment_id = 9001;
        INSERT INTO dbo.fato_emenda_dashboard (
          snapshot_date, budget_amendment_id, amendment_id, status_emenda, tipo_emenda, codigo_sapl,
          valor_total, instituicao_id, instituicao_nome, usuario_id, vereador_id, vereador_nome, partido_sigla,
          bancada_id, bancada_desc, is_remanejamento, motivo_impedimento_tecnico, valor_total_emenda,
          criador_usuario_id, criador_nome, responsavel_tipo, responsavel_id, responsavel_nome,
          responsavel_partido_sigla, valor_total_orcamento
        ) VALUES (
          @snapshotDate, 9001, 9001, 'TECHNICAL_IMPEDIMENT', 'INDIVIDUAL', 'E2E-9001', 75000,
          7, 'Instituição QA', @userId, 42, @fullName, 'PEX', NULL, NULL, 0, 'Motivo sintético do impedimento técnico.', 75000,
          @userId, @fullName, 'VEREADOR', 42, @fullName, 'PEX', 75000
        );

        DELETE FROM dbo.fato_emenda_dashboard WHERE snapshot_date = @snapshotDate AND budget_amendment_id = 9002;
        INSERT INTO dbo.fato_emenda_dashboard (
          snapshot_date, budget_amendment_id, amendment_id, status_emenda, tipo_emenda, codigo_sapl,
          valor_total, instituicao_id, instituicao_nome, usuario_id, vereador_id, vereador_nome, partido_sigla,
          is_remanejamento, destino_acao_funcao_id, destino_acao_funcao_codigo, destino_acao_funcao_desc,
          destino_acao_subfuncao_id, destino_acao_subfuncao_codigo, destino_acao_subfuncao_desc, valor_total_emenda,
          criador_usuario_id, criador_nome, responsavel_tipo, responsavel_id, responsavel_nome,
          responsavel_partido_sigla, valor_total_orcamento
        ) VALUES (
          @snapshotDate, 9002, 9002, 'APPROVED_IN_PLENARY', 'INDIVIDUAL', 'E2E-9002', 125000,
          7, 'Instituição QA', @userId, 42, @fullName, 'PEX', 0, 10, '10', 'Saúde',
          301, '301', 'Atenção básica', 125000, @userId, @fullName, 'VEREADOR', 42, @fullName,
          'PEX', 125000
        );

        DECLARE @institutionId BIGINT;
        SELECT @institutionId = id FROM dbo.instituicao WHERE cnpj = '00000000000001';
        IF @institutionId IS NULL
        BEGIN
          INSERT INTO dbo.instituicao (nome, nome_fantasia, cnpj, email)
          VALUES ('Instituição QA', 'Instituição QA', '00000000000001', 'qa-institution@example.invalid');
          SET @institutionId = SCOPE_IDENTITY();
        END;

        DECLARE @impedimentIds TABLE (id BIGINT PRIMARY KEY);
        INSERT INTO @impedimentIds (id)
        SELECT id FROM dbo.emenda_impedimento_tecnico WHERE emenda_id = 9001;
        DELETE FROM dbo.emenda_impedimento_tecnico_evento
        WHERE impedimento_tecnico_id IN (SELECT id FROM @impedimentIds);
        DELETE FROM dbo.emenda_impedimento_tecnico_oficio_item
        WHERE impedimento_tecnico_id IN (SELECT id FROM @impedimentIds);
        DELETE FROM dbo.emenda_impedimento_tecnico
        WHERE id IN (SELECT id FROM @impedimentIds);

        IF NOT EXISTS (SELECT 1 FROM dbo.emenda WHERE id = 9001)
        BEGIN
          SET IDENTITY_INSERT dbo.emenda ON;
          INSERT INTO dbo.emenda (
            id, instituicao_id, usuario_id, tipo_emenda, status, justificativa,
            codigo_sapl, valor_total, is_remanejamento, data_cadastro
          ) VALUES (
            9001, @institutionId, @userId, 'INDIVIDUAL', 'SENT_TO_MAYOR',
            'Emenda sintética para QA de ferramentas nativas.', 'E2E-9001', 75000, 0, SYSUTCDATETIME()
          );
          SET IDENTITY_INSERT dbo.emenda OFF;
        END
        ELSE
        BEGIN
          UPDATE dbo.emenda
          SET instituicao_id = @institutionId, usuario_id = @userId,
              tipo_emenda = 'INDIVIDUAL', status = 'SENT_TO_MAYOR',
              justificativa = 'Emenda sintética para QA de ferramentas nativas.',
              codigo_sapl = 'E2E-9001', valor_total = 75000, is_remanejamento = 0
          WHERE id = 9001;
        END;
      `);
  } finally {
    await pool.close();
  }
};

const run = async () => {
  const adminMongoUrl = new URL(environment.adminMongoUri);
  await Promise.all([
    waitForTcp(adminMongoUrl.hostname, Number(adminMongoUrl.port || 27017)),
    waitForTcp(new URL(environment.keycloakBaseUrl).hostname, Number(new URL(environment.keycloakBaseUrl).port || 80)),
    waitForTcp(environment.mssqlHost, environment.mssqlPort),
    waitForTcp(new URL(environment.tenantApiBaseUrl).hostname, Number(new URL(environment.tenantApiBaseUrl).port || 80)),
  ]);
  await waitForMssqlSchema();

  await seedAdminCustomer();
  const keycloakId = await ensureKeycloakUser();
  await seedTenantUserAndDashboard(keycloakId);

  console.log(`Bootstrap QA concluído para o município /${environment.tenantSlug}.`);
  console.log('Admin API, Keycloak, usuário do ms-main e dados mínimos do dashboard foram preparados.');
};

await run();
