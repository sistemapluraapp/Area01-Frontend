import { obterRefreshToken, salvarSessao, limparSessao } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export class ApiError extends Error {}

function redirecionarParaLogin(): void {
  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/signup'
  ) {
    window.location.href = '/login'
  }
}

async function tentarRenovarSessao(): Promise<boolean> {
  const refreshToken = obterRefreshToken()
  if (!refreshToken) {
    limparSessao()
    redirecionarParaLogin()
    return false
  }
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) {
      limparSessao()
      redirecionarParaLogin()
      return false
    }
    const data = await res.json()
    salvarSessao(data)
    return true
  } catch {
    limparSessao()
    redirecionarParaLogin()
    return false
  }
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')

  const token = typeof window !== 'undefined' ? localStorage.getItem('plura_token') : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && !isRetry) {
      const renovou = await tentarRenovarSessao()
      if (renovou) {
        return request<T>(path, options, true)
      }
    }
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

export type NecessidadeAcessibilidade =
  | 'visual'
  | 'auditiva'
  | 'motora'
  | 'intelectual'
  | 'tea'
  | 'neurodivergencia'
  | 'nenhuma'

export interface Perfil {
  id: string
  cpf: string
  nome: string
  nome_social: string | null
  avatar_url: string | null
  cep: string | null
  endereco: string | null
  complemento: string | null
  necessidades_acessibilidade: NecessidadeAcessibilidade[]
  paginas_administradas: number
  colaboracoes: number
  created_at: string
}

export interface Colaboracao {
  id: string
  papel: string
  paginas: {
    id: string
    nome: string
    tipo: string
    descricao: string | null
  }
}

export type Categoria =
  | 'hotel'
  | 'hostel'
  | 'pousada'
  | 'bar'
  | 'restaurante'
  | 'cafe'
  | 'espaco_eventos'
  | 'passeio_turistico'
  | 'museu'
  | 'parque'
  | 'academia'
  | 'clinica'
  | 'outros'

export type RecursoAcessibilidade =
  | 'rampa'
  | 'elevador'
  | 'banheiro_adaptado'
  | 'vaga_pcd'
  | 'piso_tatil'
  | 'libras'
  | 'braille'
  | 'cadeira_rodas'
  | 'audiodescricao'
  | 'entrada_acessivel'

export interface Pagina {
  id: string
  tipo: 'privada' | 'publica'
  nome: string
  descricao: string | null
  categoria: Categoria | null
  cep: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  complemento: string | null
  logo_url: string | null
  capa_url: string | null
  fotos_urls: string[]
  recursos_acessibilidade: RecursoAcessibilidade[]
  youtube: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  website: string | null
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

export interface Notificacao {
  id: string
  tipo: string
  titulo: string
  corpo: string
  entidade_tipo: string | null
  entidade_id: string | null
  lida: boolean
  lida_em: string | null
  criada_em: string
  metadata: Record<string, unknown>
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

  obterPerfil: () => request<Perfil>('/perfil'),

  atualizarPerfil: (body: {
    nome?: string
    nome_social?: string
    cep?: string
    endereco?: string
    complemento?: string
    necessidades_acessibilidade?: NecessidadeAcessibilidade[]
  }) => request<Perfil>('/perfil', { method: 'PUT', body: JSON.stringify(body) }),

  uploadAvatar: (imagemBase64: string, extensao: string) =>
    request<{ avatar_url: string }>('/perfil/avatar', {
      method: 'POST',
      body: JSON.stringify({ imagem_base64: imagemBase64, extensao }),
    }),

  minhasColaboracoes: () => request<{ colaboracoes: Colaboracao[] }>('/minhas-colaboracoes'),

  avaliar: (paginaId: string, body: { nota: number; comentario?: string }) =>
    request<Avaliacao>(`/paginas/${paginaId}/avaliacoes`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  minhasAvaliacoes: () => request<{ avaliacoes: Avaliacao[] }>('/me/avaliacoes'),

  listarNotificacoes: (apenasNaoLidas?: boolean) =>
    request<{ notificacoes: Notificacao[] }>(
      apenasNaoLidas ? '/notificacoes?status=nao_lidas&limit=30' : '/notificacoes?limit=30'
    ),

  contarNaoLidas: () => request<{ total: number }>('/notificacoes/contagem-nao-lidas'),

  marcarNotificacaoComoLida: (id: string) =>
    request<void>(`/notificacoes/${id}/ler`, { method: 'PATCH' }),

  marcarTodasNotificacoesComoLidas: () =>
    request<void>('/notificacoes/marcar-todas-lidas', { method: 'PATCH' }),
}
