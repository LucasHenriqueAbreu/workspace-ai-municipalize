import { constants, publicEncrypt, randomUUID } from 'node:crypto';

export interface LoginTokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
}

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

export async function loginAgainstMsMain(baseUrl: string, email: string, password: string): Promise<LoginTokens> {
  const apiBaseUrl = normalizeBaseUrl(baseUrl);
  const publicKeyResponse = await fetch(`${apiBaseUrl}/auth/pubkey`);
  if (!publicKeyResponse.ok) {
    throw new Error(`Não foi possível obter a chave pública do ms-main (HTTP ${publicKeyResponse.status}).`);
  }

  const nonce = randomUUID();
  const timestamp = Math.floor(Date.now() / 1000);
  const ciphertext = publicEncrypt(
    {
      key: await publicKeyResponse.text(),
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(JSON.stringify({ password, nonce, ts: timestamp })),
  ).toString('base64');

  const loginResponse = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      captchaToken: 'e2e-local-bypass',
      action: 'LOGIN',
      ciphertext,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Login E2E recusado pelo ms-main (HTTP ${loginResponse.status}).`);
  }

  const tokens = (await loginResponse.json()) as LoginTokens;
  if (!tokens.accessToken) {
    throw new Error('Login E2E não retornou accessToken.');
  }
  return tokens;
}

export async function loginAgainstKeycloak(baseUrl: string, email: string, password: string): Promise<LoginTokens> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/realms/quarkus-realm/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: 'backend-service',
      client_secret: 'secret',
      grant_type: 'password',
      username: email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login E2E recusado pelo Keycloak (HTTP ${response.status}).`);
  }

  const keycloakTokens = (await response.json()) as { access_token?: string; refresh_token?: string };
  const tokens: LoginTokens = { accessToken: keycloakTokens.access_token ?? '', refreshToken: keycloakTokens.refresh_token };
  if (!tokens.accessToken) {
    throw new Error('Login E2E não retornou accessToken do Keycloak.');
  }
  return tokens;
}
