'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NotificationBell from '@/components/NotificationBell'
import EditProfileModal from '@/components/EditProfileModal'
import CriarEmpreendimentoModal from '@/components/CriarEmpreendimentoModal'
import EmpreendimentoModal from '@/components/EmpreendimentoModal'
import { CameraIcon, CloseIcon, EditIcon, PlusIcon } from '@/components/icons'
import { api, type Perfil, type Colaboracao, type Avaliacao, type Favorito } from '@/lib/api'
import { apiPaginas, type Empreendimento, type MinhaPaginaVinculo } from '@/lib/apiPaginas'
import { estaLogado, limparSessao, obterUsuarioSalvo } from '@/lib/auth'
import { formatarCpf } from '@/lib/cpf'

function iniciaisDe(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function PerfilPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [colaboracoes, setColaboracoes] = useState<Colaboracao[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [empreendimentos, setEmpreendimentos] = useState<MinhaPaginaVinculo[]>([])
  const [carregandoEmpreendimentos, setCarregandoEmpreendimentos] = useState(true)
  const [erroEmpreendimentos, setErroEmpreendimentos] = useState('')

  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [carregandoFavoritos, setCarregandoFavoritos] = useState(true)
  const [erroFavoritos, setErroFavoritos] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [empreendimentoAbertoId, setEmpreendimentoAbertoId] = useState<string | null>(null)
  const [avatarHover, setAvatarHover] = useState(false)
  const [enviandoAvatar, setEnviandoAvatar] = useState(false)
  const [erroAvatar, setErroAvatar] = useState('')

  useEffect(() => {
    if (!estaLogado()) {
      router.replace('/login')
      return
    }
    Promise.all([api.obterPerfil(), api.minhasColaboracoes(), api.minhasAvaliacoes()])
      .then(([p, { colaboracoes }, { avaliacoes }]) => {
        setPerfil(p)
        setColaboracoes(colaboracoes)
        setAvaliacoes(avaliacoes)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfil'))
      .finally(() => setCarregando(false))
  }, [router])

  useEffect(() => {
    if (!estaLogado()) return
    apiPaginas
      .minhasPaginas()
      .then(({ paginas }) => setEmpreendimentos(paginas))
      .catch((e) => setErroEmpreendimentos(e instanceof Error ? e.message : 'Erro ao carregar empreendimentos'))
      .finally(() => setCarregandoEmpreendimentos(false))
  }, [])

  useEffect(() => {
    if (!estaLogado()) return
    api
      .listarFavoritos()
      .then(({ favoritos }) => setFavoritos(favoritos))
      .catch((e) => setErroFavoritos(e instanceof Error ? e.message : 'Erro ao carregar favoritos'))
      .finally(() => setCarregandoFavoritos(false))
  }, [])

  function sair() {
    limparSessao()
    router.push('/')
  }

  async function removerFavorito(paginaId: string) {
    setFavoritos((atual) => atual.filter((f) => f.paginas.id !== paginaId))
    try {
      await api.desfavoritar(paginaId)
    } catch {
      // se a remoção falhar no servidor, uma nova visita à página recarrega a lista correta
    }
  }

  function aoAtualizarEmpreendimento(atualizado: Empreendimento) {
    setEmpreendimentos((atual) =>
      atual.map((v) => (v.paginas.id === atualizado.id ? { ...v, paginas: atualizado } : v))
    )
  }

  async function aoSelecionarAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setErroAvatar('')

    if (file.size > 5 * 1024 * 1024) {
      setErroAvatar('A imagem deve ter no máximo 5MB')
      return
    }

    const tipoParaExtensao: Record<string, string> = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const extensao = tipoParaExtensao[file.type]
    if (!extensao) {
      setErroAvatar('Formato de imagem não suportado. Use JPG, PNG ou WEBP.')
      return
    }

    setEnviandoAvatar(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const resultado = reader.result as string
          resolve(resultado.split(',')[1] ?? '')
        }
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo'))
        reader.readAsDataURL(file)
      })

      const { avatar_url } = await api.uploadAvatar(base64, extensao)
      setPerfil((atual) => (atual ? { ...atual, avatar_url } : atual))
    } catch (err) {
      setErroAvatar(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setEnviandoAvatar(false)
    }
  }

  if (carregando) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>
      </main>
    )
  }

  if (!perfil) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>{erro || 'Não foi possível carregar o perfil'}</p>
      </main>
    )
  }

  const nomeExibido = perfil.nome_social?.trim() || perfil.nome

  return (
    <>
      <Grain />

      <Header
        label="minha área"
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={sair}>
              Sair
            </Button>
          </div>
        }
      />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '5.5rem 1.25rem 3rem', position: 'relative', zIndex: 1 }}>
        {erro && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.875rem',
              color: '#f87171',
            }}
          >
            {erro}
          </div>
        )}

        <GlassCard variant="lg" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.125rem' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={aoSelecionarAvatar}
                style={{ display: 'none' }}
              />
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                  role="button"
                  tabIndex={0}
                  aria-label="Alterar foto de perfil"
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  style={{
                    position: 'relative',
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg,#1a7aff,#0062e6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(26,122,255,0.45)',
                    boxShadow: '0 0 20px rgba(26,122,255,0.20)',
                  }}
                >
                  {perfil.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={perfil.avatar_url}
                      alt={nomeExibido}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      draggable={false}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>
                      {iniciaisDe(nomeExibido)}
                    </span>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      opacity: avatarHover || enviandoAvatar ? 1 : 0,
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    {enviandoAvatar ? (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }}
                      />
                    ) : (
                      <CameraIcon />
                    )}
                  </div>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#1a7aff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--c-bg, #04040f)',
                    boxShadow: '0 2px 8px rgba(26,122,255,0.45)',
                    color: '#fff',
                  }}
                >
                  <EditIcon />
                </div>
              </div>

              <div>
                <h1 style={{ margin: 0, fontSize: '1.3125rem', fontWeight: 800 }}>{nomeExibido}</h1>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>
                  cpf {formatarCpf(perfil.cpf)}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <Button size="sm" variant="secondary" onClick={() => setModalAberto(true)}>
                    Editar perfil
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{perfil.paginas_administradas}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--c-text-3)' }}>empreendimentos administrados</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{perfil.colaboracoes}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--c-text-3)' }}>colaborações</p>
              </div>
            </div>
          </div>

          {erroAvatar && (
            <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{erroAvatar}</p>
          )}
        </GlassCard>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2.25rem 0 1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>Gerenciar empreendimentos</h3>
          <Button size="sm" variant="primary" icon={<PlusIcon />} onClick={() => setModalCriarAberto(true)}>
            Adicionar empreendimento
          </Button>
        </div>

        {erroEmpreendimentos && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{erroEmpreendimentos}</p>
        )}

        {carregandoEmpreendimentos ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>carregando…</p>
        ) : empreendimentos.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não tem nenhum empreendimento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem' }}>
            {empreendimentos.map(({ paginas: emp, papel }) => (
              <div
                key={emp.id}
                onClick={() => setEmpreendimentoAbertoId(emp.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setEmpreendimentoAbertoId(emp.id)}
                className="glass-sm"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1',
                    width: '100%',
                    filter: emp.suspensa ? 'grayscale(1)' : undefined,
                    background: emp.capa_url
                      ? `url(${emp.capa_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg,#1a7aff,#0062e6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!emp.capa_url && (
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>
                      {emp.nome.trim()[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                  {emp.suspensa && (
                    <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          background: 'rgba(239,68,68,0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.18)',
                          borderRadius: '9999px',
                          padding: '0.25rem 0.625rem',
                          color: '#fff',
                        }}
                      >
                        Suspensa
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.75rem 0.875rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.nome}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--c-text-3)' }}>
                    {papel === 'administrador' ? 'administrador' : 'colaborador'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Empreendimentos que colaboro</h3>
        {colaboracoes.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não colabora em nenhum empreendimento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {colaboracoes.map((c) => (
              <GlassCard key={c.id} variant="sm">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem' }}>{c.paginas.nome}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
                      {c.papel} · {c.paginas.tipo === 'publica' ? 'pública' : 'privada'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Favoritos</h3>
        {erroFavoritos && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>{erroFavoritos}</p>
        )}
        {carregandoFavoritos ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>carregando…</p>
        ) : favoritos.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não favoritou nenhum empreendimento.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '1rem' }}>
            {favoritos.map(({ paginas: p }) => (
              <div
                key={p.id}
                onClick={() => router.push(`/pagina?id=${p.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/pagina?id=${p.id}`)}
                className="glass-sm"
                style={{
                  position: 'relative',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <button
                  type="button"
                  aria-label="Remover dos favoritos"
                  onClick={(e) => {
                    e.stopPropagation()
                    removerFavorito(p.id)
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 1,
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                >
                  <CloseIcon />
                </button>
                <div
                  style={{
                    aspectRatio: '1',
                    width: '100%',
                    background: p.capa_url
                      ? `url(${p.capa_url}) center/cover no-repeat`
                      : 'linear-gradient(135deg,#1a7aff,#0062e6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!p.capa_url && (
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)' }}>
                      {p.nome.trim()[0]?.toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
                <div style={{ padding: '0.75rem 0.875rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.nome}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--c-text-3)' }}>
                    {p.cidade ? `${p.cidade}${p.uf ? `/${p.uf}` : ''}` : 'localização não informada'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Minhas avaliações</h3>
        {avaliacoes.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não avaliou nenhum empreendimento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {avaliacoes.map((a) => (
              <GlassCard key={a.id} variant="sm">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  nota {a.nota}/5
                </span>
                <p style={{ margin: '0.4rem 0', fontSize: '0.9375rem' }}>{a.comentario}</p>
                {a.resposta && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', borderLeft: '2px solid var(--blue-500)', paddingLeft: '0.6rem' }}>Resposta: {a.resposta}</p>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      {modalAberto && (
        <EditProfileModal
          perfil={perfil}
          email={obterUsuarioSalvo()?.email ?? ''}
          onClose={() => setModalAberto(false)}
          onSaved={(atualizado) => {
            setPerfil(atualizado)
            setModalAberto(false)
          }}
        />
      )}

      {modalCriarAberto && (
        <CriarEmpreendimentoModal
          onClose={() => setModalCriarAberto(false)}
          onCreated={(criado) => {
            setEmpreendimentos((atual) => [...atual, { papel: 'administrador', paginas: criado }])
            setModalCriarAberto(false)
            setEmpreendimentoAbertoId(criado.id)
          }}
        />
      )}

      {empreendimentoAbertoId && (
        <EmpreendimentoModal
          empreendimentoId={empreendimentoAbertoId}
          onClose={() => setEmpreendimentoAbertoId(null)}
          onUpdated={aoAtualizarEmpreendimento}
        />
      )}

      <Footer />
    </>
  )
}
