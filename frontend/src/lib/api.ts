const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
export const API_BASE_URL = metaEnv.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export async function fetchWithAuth<T>(
  path: string,
  token?: string | null,
  options: RequestInit = {},
): Promise<{ data: T | null; error: ApiError | null }> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: {
          statusCode: res.status,
          message: body?.message || res.statusText || 'API Request failed',
          error: body?.error,
        },
      };
    }

    return { data: body as T, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        statusCode: 500,
        message: (err as Error).message || 'Network error connecting to backend',
        error: 'NetworkError',
      },
    };
  }
}

export async function fetchCurrentProfile(token: string) {
  return fetchWithAuth<{
    id: string;
    email: string;
    fullName: string;
    role: 'customer' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    avatarUrl?: string | null;
    preferences?: {
      language: 'id' | 'en';
      marketingOptIn: boolean;
    } | null;
    createdAt: string;
  }>('/auth/me', token);
}
