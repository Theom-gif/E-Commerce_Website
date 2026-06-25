const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'

export const API_TOKEN_KEY = 'bookbase_api_token_v1'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export function getAuthToken() {
  return localStorage.getItem(API_TOKEN_KEY)
}

export function setAuthToken(token: string) {
  localStorage.setItem(API_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(API_TOKEN_KEY)
}

function buildUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${cleanPath}`
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  })
  const parsed = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as { message?: unknown }).message)
        : `API request failed with status ${response.status}`
    throw new Error(message)
  }

  return parsed as T
}

export const api = {
  get: <T = unknown>(path: string) => apiRequest<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T = unknown>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}
