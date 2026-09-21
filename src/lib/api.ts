const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const token = typeof window !== 'undefined' ? localStorage.getItem('plura_token') : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(data?.error ?? 'Erro inesperado ao falar com o servidor')
  }

  return data as T
}

export interface Usuario {
  id: string
  cpf: string
  nome: string
  created_at: string
}

export interface Pagina {
  id: string
  tipo: 'privada' | 'publica'
  nome: string
  descricao: string | null
  created_at: string
}

export interface Avaliacao {
  id: string
  pagina_id: string
  nota: number
  comentario: string | null
  resposta: string | null
  respondido_em: string | null
  created_at: string
}

export interface AuthResponse {
  user: { id: string; email: string; nome?: string }
  access_token: string
  refresh_token: string
}

export const api = {
  signup: (body: { email: string; password: string; cpf: string; nome: string }) =>
    request<AuthResponse | { message: string; pending_email_confirmation: true }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  buscarPaginas: (q: string) =>
    request<{ resultados: Pagina[] }>(`/paginas${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  obterPagina: (id: string) => request<Pagina & { avaliacoes: Avaliacao[] }>(`/paginas/${id}`),

  obterPerfil: () => request<Usuario>('/perfil'),

  atualizarPerfil: (body: { nome: string }) =>
    request<Usuario>('/perfil', { method: 'PUT', body: JSON.stringify(body) }),

  avaliar: (paginaId: string, body: { nota: number; comentario?: string }) =>
    request<Avaliacao>(`/paginas/${paginaId}/avaliacoes`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  minhasAvaliacoes: () => request<{ avaliacoes: Avaliacao[] }>('/me/avaliacoes'),
}
