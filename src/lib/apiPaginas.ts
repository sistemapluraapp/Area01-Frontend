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

export interface Empreendimento {
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

export interface VinculoPagina {
  id: string
  usuario_id: string
  papel: 'administrador' | 'colaborador'
  created_at: string
  usuarios: { nome: string } | null
}

export interface EmpreendimentoDetalhado extends Empreendimento {
  vinculos: VinculoPagina[]
  avaliacoes: unknown[]
  certificados: unknown[]
}

export interface MinhaPaginaVinculo {
  papel: 'administrador' | 'colaborador'
  paginas: Empreendimento
}

export interface NovoEmpreendimentoBody {
  nome: string
  descricao?: string
  categoria?: Categoria
  cep?: string
  endereco?: string
  cidade?: string
  uf?: string
  complemento?: string
  recursos_acessibilidade?: RecursoAcessibilidade[]
  youtube?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  website?: string
}

export const apiPaginas = {
  criar: (body: NovoEmpreendimentoBody) =>
    request<Empreendimento>('/paginas', { method: 'POST', body: JSON.stringify(body) }),

  minhasPaginas: () => request<{ paginas: MinhaPaginaVinculo[] }>('/minhas-paginas'),

  obter: (id: string) => request<EmpreendimentoDetalhado>(`/paginas/${id}`),

  atualizar: (id: string, patch: Partial<NovoEmpreendimentoBody>) =>
    request<Empreendimento>(`/paginas/${id}`, { method: 'PUT', body: JSON.stringify(patch) }),

  uploadLogo: (id: string, imagemBase64: string, extensao: string) =>
    request<{ logo_url: string }>(`/paginas/${id}/logo`, {
      method: 'POST',
      body: JSON.stringify({ imagem_base64: imagemBase64, extensao }),
    }),

  uploadCapa: (id: string, imagemBase64: string, extensao: string) =>
    request<{ capa_url: string }>(`/paginas/${id}/capa`, {
      method: 'POST',
      body: JSON.stringify({ imagem_base64: imagemBase64, extensao }),
    }),

  adicionarFoto: (id: string, imagemBase64: string, extensao: string) =>
    request<{ fotos_urls: string[] }>(`/paginas/${id}/fotos`, {
      method: 'POST',
      body: JSON.stringify({ imagem_base64: imagemBase64, extensao }),
    }),

  removerFoto: (id: string, url: string) =>
    request<{ fotos_urls: string[] }>(`/paginas/${id}/fotos`, {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    }),

  convidarColaborador: (paginaId: string, cpf: string) =>
    request<VinculoPagina>(`/paginas/${paginaId}/colaboradores`, {
      method: 'POST',
      body: JSON.stringify({ cpf }),
    }),

  removerColaborador: (paginaId: string, vinculoId: string) =>
    request<void>(`/paginas/${paginaId}/colaboradores/${vinculoId}`, { method: 'DELETE' }),
}
