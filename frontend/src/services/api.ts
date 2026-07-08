import Constants from 'expo-constants';

const BACKEND_PORT = 5000;

function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:${BACKEND_PORT}/api/v1`;
  }

  return `http://localhost:${BACKEND_PORT}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_BASE_URL}. Make sure the backend is running and your device is on the same network.`
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status);
  }

  return data as T;
}
