import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { ServiceConnection } from '../../types';

WebBrowser.maybeCompleteAuthSession();

const MND_API_BASE = 'https://www.mynetdiary.com/api/v1';
const MND_AUTH_BASE = 'https://www.mynetdiary.com/oauth';
const TOKEN_KEY = 'mynetdiary_tokens';

// Register your app at https://www.mynetdiary.com/api.html to get credentials.
// Store these in environment variables / app.json extra fields.
const CLIENT_ID = process.env.EXPO_PUBLIC_MND_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_MND_CLIENT_SECRET ?? '';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: `${MND_AUTH_BASE}/authorize`,
  tokenEndpoint: `${MND_AUTH_BASE}/token`,
  revocationEndpoint: `${MND_AUTH_BASE}/revoke`,
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export function useMyNetDiaryAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'fitnessfab' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['food_diary_read', 'nutrition_read', 'weight_read'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  return { request, response, promptAsync };
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<ServiceConnection> {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'fitnessfab' });

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${MND_AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to connect to MyNetDiary. Please try again.');
  }

  const tokens: TokenResponse = await response.json();
  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000
  ).toISOString();

  await SecureStore.setItemAsync(
    TOKEN_KEY,
    JSON.stringify({ ...tokens, expiresAt })
  );

  const userInfo = await fetchMyNetDiaryUser(tokens.access_token);

  return {
    service: 'mynetdiary',
    connected: true,
    username: userInfo.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
    lastSync: new Date().toISOString(),
  };
}

async function fetchMyNetDiaryUser(
  accessToken: string
): Promise<{ email: string }> {
  const res = await fetch(`${MND_API_BASE}/user/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return { email: 'MyNetDiary User' };
  return res.json();
}

export async function refreshMyNetDiaryToken(): Promise<string | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) return null;

  const stored = JSON.parse(raw);
  if (new Date(stored.expiresAt) > new Date()) {
    return stored.access_token;
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: stored.refresh_token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(`${MND_AUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return null;
  }

  const tokens: TokenResponse = await response.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify({ ...tokens, expiresAt }));
  return tokens.access_token;
}

export async function fetchNutritionSummary(date: string): Promise<{
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} | null> {
  const token = await refreshMyNetDiaryToken();
  if (!token) return null;

  const res = await fetch(`${MND_API_BASE}/diary/summary?date=${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function disconnectMyNetDiary(): Promise<void> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (raw) {
    const stored = JSON.parse(raw);
    await fetch(`${MND_AUTH_BASE}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: stored.access_token,
        client_id: CLIENT_ID,
      }).toString(),
    }).catch(() => {});
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
