import sql from 'mssql';

const port = Number(process.env.E2E_MSSQL_PORT || '1433');
const password = process.env.E2E_MSSQL_PASSWORD || 'MsProject@2025@';
const databaseNames = ['db-main', 'db-main-cliente1', 'db-main-cliente2'];
const maxAttempts = 300;

const connectionConfig = {
  server: process.env.E2E_MSSQL_HOST || 'localhost',
  port,
  user: 'sa',
  password,
  database: 'master',
  options: { encrypt: false, trustServerCertificate: true },
};

const connectToSqlServer = async () => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const pool = new sql.ConnectionPool(connectionConfig);
    try {
      await pool.connect();
      return pool;
    } catch (error) {
      await pool.close().catch(() => undefined);
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error('Não foi possível conectar ao SQL Server.');
};

const createDatabases = async (pool) => {
  const request = pool.request();
  const statements = databaseNames
    .map((name) => `IF DB_ID(N'${name}') IS NULL CREATE DATABASE [${name}];`)
    .join('\n');
  await request.query(statements);
};

const pool = await connectToSqlServer();
try {
  await createDatabases(pool);
  console.log('Bancos QA do ms-main preparados.');
} finally {
  await pool.close();
}
