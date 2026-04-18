import * as SecureStore from 'expo-secure-store';
import { ServiceConnection } from '../../types';

const PELOTON_API_BASE = 'https://api.onepeloton.com';
const SESSION_KEY = 'peloton_session';

interface PelotonSession {
  sessionId: string;
  userId: string;
  username: string;
}

interface PelotonWorkout {
  id: string;
  name: string;
  start_time: number;
  end_time: number;
  fitness_discipline: string;
  total_output: number;
  calories: number;
  duration: number;
}

// Peloton uses session-based auth rather than standard OAuth2.
// Users log in with credentials; the session cookie is stored securely.
export async function loginWithPeloton(
  username: string,
  password: string
): Promise<ServiceConnection> {
  const response = await fetch(`${PELOTON_API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'fitnessfab/1.0',
    },
    body: JSON.stringify({
      username_or_email: username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid Peloton credentials. Please check your username and password.');
  }

  const data = await response.json();
  const session: PelotonSession = {
    sessionId: data.session_id,
    userId: data.user_id,
    username: data.user_data?.username ?? username,
  };

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));

  return {
    service: 'peloton',
    connected: true,
    username: session.username,
    accessToken: session.sessionId,
    lastSync: new Date().toISOString(),
  };
}

export async function getPelotonSession(): Promise<PelotonSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function fetchPelotonWorkouts(): Promise<PelotonWorkout[]> {
  const session = await getPelotonSession();
  if (!session) throw new Error('Not connected to Peloton.');

  const response = await fetch(
    `${PELOTON_API_BASE}/api/user/${session.userId}/workouts?joins=ride&limit=20&sort_by=-created`,
    {
      headers: {
        Cookie: `peloton_session_id=${session.sessionId}`,
        'User-Agent': 'fitnessfab/1.0',
        'peloton-platform': 'web',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Peloton workouts. Please reconnect your account.');
  }

  const data = await response.json();
  return data.data ?? [];
}

export async function searchPelotonWorkouts(query: string): Promise<{ id: string; title: string; duration: number; instructor: string }[]> {
  const session = await getPelotonSession();
  if (!session) throw new Error('Not connected to Peloton.');

  const response = await fetch(
    `${PELOTON_API_BASE}/api/v2/ride/archived?content_format=audio,video&limit=20&browse_category=cycling&sort_by=original_air_time&desc=true&page=0`,
    {
      headers: {
        Cookie: `peloton_session_id=${session.sessionId}`,
        'User-Agent': 'fitnessfab/1.0',
        'peloton-platform': 'web',
      },
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  const rides: any[] = data.data ?? [];
  return rides
    .filter((r) =>
      r.title?.toLowerCase().includes(query.toLowerCase())
    )
    .map((r) => ({
      id: r.id,
      title: r.title,
      duration: Math.round(r.duration / 60),
      instructor: r.instructor?.name ?? 'Unknown',
    }));
}

export async function logoutPeloton(): Promise<void> {
  const session = await getPelotonSession();
  if (session) {
    await fetch(`${PELOTON_API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: `peloton_session_id=${session.sessionId}`,
        'User-Agent': 'fitnessfab/1.0',
      },
    }).catch(() => {});
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
