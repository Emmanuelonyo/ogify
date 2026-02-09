const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
  token?: string
  apiKey?: string
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, apiKey } = options
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }
  
  return data
}

// Auth API
export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    api<{ success: boolean; data: { token: string; user: any; apiKey: string } }>('/auth/signup', {
      method: 'POST',
      body: { email, password, name },
    }),
  
  login: (email: string, password: string) =>
    api<{ success: boolean; data: { token: string; user: any; apiKey: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  
  getKeys: (token: string) =>
    api<{ success: boolean; data: any[] }>('/auth/keys', { token }),
  
  createKey: (token: string, name: string) =>
    api<{ success: boolean; data: any }>('/auth/keys', {
      method: 'POST',
      token,
      body: { name },
    }),
  
  deleteKey: (token: string, keyId: string) =>
    api<{ success: boolean }>(`/auth/keys/${keyId}`, {
      method: 'DELETE',
      token,
    }),
}

// Dashboard API
export const dashboardApi = {
  getStats: (token: string) =>
    api<{ success: boolean; data: any }>('/dashboard/stats', { token }),
  
  getHistory: (token: string, days = 30) =>
    api<{ success: boolean; data: any[] }>(`/dashboard/history?days=${days}`, { token }),
  
  getRequests: (token: string, limit = 50, offset = 0) =>
    api<{ success: boolean; data: any[]; pagination: any }>(
      `/dashboard/requests?limit=${limit}&offset=${offset}`,
      { token }
    ),
  
  getProfile: (token: string) =>
    api<{ success: boolean; data: any }>('/dashboard/profile', { token }),
}

// Extract API
export const extractApi = {
  extract: (url: string, apiKey: string) =>
    api<{ success: boolean; data: any; cached: boolean; latencyMs: number }>(
      `/extract?url=${encodeURIComponent(url)}`,
      { apiKey }
    ),
}
