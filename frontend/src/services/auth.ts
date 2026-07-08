import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './api';

export type AppRole = 'user' | 'exhibitor';

export type AuthSession = {
  token: string;
  role: AppRole;
  email: string;
  userId?: string;
  isGuest?: boolean;
};

type AuthResponsePayload = {
  token: string;
  role: string;
  email: string;
  id: string;
};

const LOCAL_SESSION_KEY = 'exhibition.local-auth.session';

const mapBackendRole = (role: string): AppRole => (role === 'exhibitor' ? 'exhibitor' : 'user');

export async function loadStoredSession(): Promise<AuthSession | null> {
  const storedSession = await AsyncStorage.getItem(LOCAL_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
}

export async function loginWithEmailPassword(email: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<{ data: AuthResponsePayload }>('/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });

  const session: AuthSession = {
    token: response.data.token,
    role: mapBackendRole(response.data.role),
    email: response.data.email,
    userId: response.data.id,
  };

  await saveSession(session);
  return session;
}

export async function registerWithEmailPassword(email: string, password: string): Promise<AuthSession> {
  const response = await apiRequest<{ data: AuthResponsePayload }>('/auth/register', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });

  const session: AuthSession = {
    token: response.data.token,
    role: mapBackendRole(response.data.role),
    email: response.data.email,
    userId: response.data.id,
  };

  await saveSession(session);
  return session;
}
