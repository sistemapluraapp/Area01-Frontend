import { obterRefreshToken, obterToken, salvarSessao, limparSessao } from './auth'

const AREA02_BASE_URL = process.env.NEXT_PUBLIC_AREA02_BACKEND_URL ?? 'https://area02-backend.sistemapluraapp.workers.dev'

export class ApiPaginasError extends Error {}

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
    const res = await fetch(`${AREA02_BASE_URL}/auth/refresh`, {
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

  const token = obterToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${AREA02_BASE_URL}${path}`, { ...options, headers })

  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && !isRetry) {
      const renovou = await tentarRenovarSessao()
      if (renovou) {
        return request<T>(path, options, true)
      }
    }
    throw new ApiPaginasError(data?.error ?? 'Erro inesperado ao falar com o servidor')
  }

  return data as T
}

// Empreendimentos do usuário (backend da Área 02). A criação e a edição
// acontecem no painel da Área 02 (ver lib/area02.ts).
export interface Empreendimento {
  id: string
  tipo: 'privada' | 'publica'
  nome: string
  subtitulo: string | null
  descricao_curta: string | null
  categoria: string | null
  cidade: string | null
  uf: string | null
  logo_url: string | null
  capa_url: string | null
  tema: string
  cnpj: string | null
  legado: boolean
  suspensa: boolean
  created_at: string
}

export interface MinhaPaginaVinculo {
  papel: 'administrador' | 'colaborador'
  paginas: Empreendimento | null
}

export const apiPaginas = {
  minhasPaginas: () => request<{ paginas: MinhaPaginaVinculo[] }>('/minhas-paginas'),
}
