import { obterRefreshToken, salvarSessao, limparSessao } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export class ApiError extends Error {
  status?: number
  suspensa?: boolean

  constructor(message: string, options?: { status?: number; suspensa?: boolean }) {
    super(message)
    this.status = options?.status
    this.suspensa = options?.suspensa
  }
}

function redirecionarParaLogin(): void {
  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/signup' &&
    window.location.pathname !== '/esqueci-senha' &&
    window.location.pathname !== '/redefinir-senha'
  ) {
    const destino = window.location.pathname + window.location.search
    window.location.href = `/login?destino=${encodeURIComponent(destino)}`
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

export async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
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
    throw new ApiError(data?.error ?? 'Erro inesperado ao falar com o servidor', {
      status: res.status,
      suspensa: data?.suspensa === true,
    })
  }

  return data as T
}

export interface Usuario {
  id: string
  cpf: string
  nome: string
  created_at: string
}

export type NecessidadeAcessibilidade = string

export interface FiltroAcessibilidade {
  tipo: string
  categoria: string
  codigo: string
  rotulo: string
  ordem: number
}

export interface Perfil {
  id: string
  cpf: string
  nome: string
  nome_social: string | null
  avatar_url: string | null
  pais: string
  cep: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  complemento: string | null
  necessidades_acessibilidade: NecessidadeAcessibilidade[]
  preferencias_turismo: string[]
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

export type Categoria = string
export type RecursoAcessibilidade = string

export type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
export type Turno = { abre: string; fecha: string }
export type Horarios = Partial<Record<DiaSemana, Turno[]>>

// Dados de um empreendimento nos cards (busca, destinos salvos, recomendações)
export interface PaginaCard {
  id: string
  tipo: 'privada' | 'publica'
  nome: string
  subtitulo: string | null
  descricao_curta: string | null
  categoria: string | null
  pais?: string
  cidade: string | null
  uf: string | null
  logo_url: string | null
  capa_url: string | null
  tema: string
  faixa_preco: number | null
  recursos_acessibilidade: string[]
  destaques_acessibilidade: string[]
  video_libras?: string | null
  // Etiqueta aplicada pela administração (só aparece se ativo)
  etiqueta?: { titulo: string; icone: string | null; ativo: boolean } | null
  nota_media: number | null
  total_avaliacoes: number
  created_at: string
}

export type Pagina = PaginaCard

export interface Midia {
  id: string
  tipo: 'foto' | 'link'
  url: string
  plataforma: string | null
  formato: 'video' | 'reel' | 'foto_360' | 'tour_virtual' | null
  categoria: string | null
  legenda: string | null
  texto_alt: string | null
  ordem: number
}

export interface Experiencia {
  id: string
  nome: string
  descricao: string | null
  imagem_url: string | null
  duracao: string | null
  preco_a_partir: number | null
  local: string | null
  faixa_etaria: string | null
  nivel_dificuldade: 'todos' | 'facil' | 'moderado' | 'dificil' | null
  requer_acompanhamento: boolean
  equipamentos: string | null
  o_que_levar: string | null
  acessibilidades: string[]
}

export interface AvaliacaoPublica {
  id: string
  nota: number
  comentario: string | null
  created_at: string
  autor_nome: string
  autor_avatar_url: string | null
}

export type CanalContato = 'whatsapp' | 'ligacao' | 'email' | 'sms' | 'instagram' | 'site' | 'presencial' | 'outro'

export interface ContatoPagina {
  canal: CanalContato
  titulo: string
  descricao: string | null
  link: string | null
  preferencial: boolean
}

export interface PaginaPublica extends Omit<PaginaCard, 'nota_media' | 'total_avaliacoes'> {
  descricao: string | null
  slogan: string | null
  diferencial: string | null
  tags: string[]
  whatsapp: string | null
  instagram: string | null
  website: string | null
  video_apresentacao: string | null
  como_e_o_lugar: string | null
  cep: string | null
  endereco: string | null
  complemento: string | null
  latitude: number | null
  longitude: number | null
  ponto_referencia: string | null
  como_chegar_carro: string | null
  como_chegar_transporte: string | null
  rota_acessivel: string | null
  horarios: Horarios
  feriados: string | null
  requer_agendamento: boolean
  tempo_medio: string | null
  antecedencia: string | null
  observacoes_recursos: Record<string, string>
  antes_de_ir: string[]
  antes_de_ir_observacoes: string | null
  seguranca: Record<string, string>
  contatos: ContatoPagina[]
  mapa_link: string | null
  localizacao_comentarios: string | null
  updated_at: string
  midias: Midia[]
  experiencias: Experiencia[]
  avaliacoes: AvaliacaoPublica[]
  nota_media: number | null
  total_avaliacoes: number
  recomendacoes: PaginaCard[]
}

export interface ItemCatalogo {
  codigo: string
  rotulo: string
  icone: string | null
  descricao?: string | null
}

export interface Catalogo {
  categorias: ItemCatalogo[]
  tags: ItemCatalogo[]
  antes_de_ir: ItemCatalogo[]
  preferencias_turismo: ItemCatalogo[]
  grupos_acessibilidade: (ItemCatalogo & { descricao: string | null; recursos: (ItemCatalogo & { descricao: string | null })[] })[]
}

export type MotivoDenuncia =
  | 'recurso_nao_existe'
  | 'acessibilidade_diferente'
  | 'horario_incorreto'
  | 'local_fechado'
  | 'informacao_desatualizada'
  | 'outro'

// Link curto (backend) que gera a prévia no WhatsApp/Facebook e redireciona
export function linkCompartilhamento(paginaId: string): string {
  return `${BASE_URL}/s/${paginaId}`
}

export interface Avaliacao {
  id: string
  pagina_id: string
  nota: number
  comentario: string | null
  status: 'pendente' | 'aprovado' | 'reprovado'
  created_at: string
  paginas?: { nome: string } | null
}

export interface AuthResponse {
  user: { id: string; email: string; nome?: string }
  access_token: string
  refresh_token: string
}

export interface Favorito {
  id: string
  created_at: string
  paginas: PaginaCard
}

export interface EventoPublico {
  id: string
  pagina_id: string
  titulo: string
  descricao: string | null
  imagem_url: string | null
  link: string | null
  inicio: string
  fim: string | null
  local_nome: string | null
  endereco: string | null
  pais: string
  uf: string | null
  cidade: string | null
  gratuito: boolean | null
  acessibilidades: string[]
  total_interessados: number
  interessado: boolean
  pagina: { id: string; nome: string; tipo: string; logo_url: string | null; recursos_acessibilidade: string[] }
}

export interface FiltrosAgenda {
  de?: string
  ate?: string
  pais?: string
  uf?: string
  cidade?: string
  q?: string
  acessibilidade?: string[]
  gratuito?: boolean
}

export interface LocalFavorito {
  id: string
  pais: string
  uf: string
  cidade: string | null
  criado_em: string
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

// Conteúdo das páginas de boas-vindas, editado no ADM
export interface ConteudoPagina {
  titulo: string | null
  corpo_html: string | null
  botao_texto: string | null
  imagem_url: string | null
}

export const api = {
  conteudoPagina: (chave: string) => request<ConteudoPagina>(`/conteudo/${chave}`),

  agenda: (f: FiltrosAgenda) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(f)) {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) || v === false) continue
      p.set(k, Array.isArray(v) ? v.join(',') : String(v))
    }
    return request<{ eventos: EventoPublico[] }>(`/eventos?${p.toString()}`)
  },

  eventosDaPagina: (id: string) => request<{ eventos: EventoPublico[] }>(`/paginas/${id}/eventos`),

  marcarInteresse: (id: string, interessado: boolean) =>
    request<{ interessado: boolean; total_interessados: number }>(`/eventos/${id}/interesse`, { method: interessado ? 'POST' : 'DELETE' }),

  meusEventos: () => request<{ eventos: EventoPublico[] }>('/meus-eventos'),

  locaisFavoritos: () => request<{ locais: LocalFavorito[]; avisos_email: boolean }>('/locais-favoritos'),

  adicionarLocalFavorito: (body: { pais: string; uf: string; cidade?: string | null }) =>
    request<LocalFavorito>('/locais-favoritos', { method: 'POST', body: JSON.stringify(body) }),

  removerLocalFavorito: (id: string) => request<void>(`/locais-favoritos/${id}`, { method: 'DELETE' }),

  definirAvisosFavoritosEmail: (ativo: boolean) =>
    request<{ avisos_email: boolean }>('/locais-favoritos/avisos-email', { method: 'PUT', body: JSON.stringify({ ativo }) }),

  termo: (chave: string) => request<import('@/components/CheckboxTermos').Termo>(`/termos/${chave}`),

  reenviarConfirmacao: (email: string) =>
    request<{ message: string }>('/auth/reenviar-confirmacao', { method: 'POST', body: JSON.stringify({ email }) }),

  signup: (body: { email: string; password: string; cpf: string; nome: string; aceite_termos: boolean }) =>
    request<AuthResponse | { message: string; pending_email_confirmation: true }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  buscarPaginas: (q: string) =>
    request<{ resultados: PaginaCard[] }>(`/paginas${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  obterPagina: (id: string) => request<PaginaPublica>(`/paginas/${id}`),

  catalogo: () => request<Catalogo>('/catalogo'),

  denunciar: (paginaId: string, body: { motivo: MotivoDenuncia; comentario?: string }) =>
    request<{ ok: true }>(`/paginas/${paginaId}/denuncias`, { method: 'POST', body: JSON.stringify(body) }),

  obterPerfil: () => request<Perfil>('/perfil'),

  atualizarPerfil: (body: {
    nome?: string
    nome_social?: string
    cep?: string
    endereco?: string
    cidade?: string
    uf?: string
    pais?: string
    complemento?: string
    necessidades_acessibilidade?: NecessidadeAcessibilidade[]
    preferencias_turismo?: string[]
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

  listarFavoritos: () => request<{ favoritos: Favorito[] }>('/favoritos'),

  favoritar: (paginaId: string) => request<void>(`/favoritos/${paginaId}`, { method: 'POST' }),

  desfavoritar: (paginaId: string) => request<void>(`/favoritos/${paginaId}`, { method: 'DELETE' }),

  listarFiltrosAcessibilidade: () =>
    request<{ recursos_local: FiltroAcessibilidade[]; necessidades_pessoal: FiltroAcessibilidade[] }>(
      '/filtros-acessibilidade'
    ),
}
