'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { IconBuildingStore, IconCamera, IconExternalLink, IconHeart, IconLogout, IconPlus, IconSettings } from '@tabler/icons-react'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NotificationBell from '@/components/NotificationBell'
import BottomNav from '@/components/BottomNav'
import EditProfileModal from '@/components/EditProfileModal'
import EnviarImagemModal from '@/components/EnviarImagemModal'
import PreferenciasTurismo from '@/components/PreferenciasTurismo'
import CardPagina from '@/components/CardPagina'
import { api, type Avaliacao, type Favorito, type Perfil } from '@/lib/api'
import { apiPaginas, type MinhaPaginaVinculo } from '@/lib/apiPaginas'
import { urlGerenciar } from '@/lib/area02'
import { estaLogado, limparSessao, obterUsuarioSalvo } from '@/lib/auth'
import { formatarCpf } from '@/lib/cpf'
import { useCatalogo } from '@/lib/useCatalogo'

function iniciaisDe(nome: string): string {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function Bloco({ id, titulo, acao, children }: { id?: string; titulo: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: '5rem', background: 'var(--c-glass-bg-lg)', border: 'var(--c-border)', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: 'var(--c-shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  )
}

const STATUS_COMENTARIO = {
  pendente: { rotulo: 'Aguardando moderação', cor: 'var(--c-warning-text)', fundo: 'var(--c-warning-soft)' },
  aprovado: { rotulo: 'Publicado', cor: 'var(--c-success-text)', fundo: 'var(--c-success-soft)' },
  reprovado: { rotulo: 'Não aprovado', cor: 'var(--c-danger-text)', fundo: 'var(--c-danger-soft)' },
} as const

const botaoPrimario = { display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.55rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none' } as const
const botaoSecundario = { display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--c-btn-secondary-border)', background: 'var(--c-btn-secondary-bg)', color: 'var(--c-text-1)', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none' } as const

export default function PerfilPage() {
  const router = useRouter()
  const catalogo = useCatalogo()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [favoritos, setFavoritos] = useState<Favorito[]>([])
  const [empreendimentos, setEmpreendimentos] = useState<MinhaPaginaVinculo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [editando, setEditando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [preferencias, setPreferencias] = useState<string[]>([])
  const [salvandoPreferencias, setSalvandoPreferencias] = useState(false)
  const [mensagemPreferencias, setMensagemPreferencias] = useState('')

  useEffect(() => {
    if (!estaLogado()) {
      router.replace('/login?destino=/perfil')
      return
    }
    Promise.all([api.obterPerfil(), api.minhasAvaliacoes()])
      .then(([p, { avaliacoes }]) => {
        setPerfil(p)
        setPreferencias(p.preferencias_turismo ?? [])
        setAvaliacoes(avaliacoes)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfil'))
      .finally(() => setCarregando(false))
    api.listarFavoritos().then(({ favoritos }) => setFavoritos(favoritos)).catch(() => {})
    apiPaginas.minhasPaginas().then(({ paginas }) => setEmpreendimentos(paginas.filter((v) => v.paginas))).catch(() => {})
  }, [router])

  // Abre a seção pedida pela barra inferior (/perfil#destinos) depois de carregar
  useEffect(() => {
    if (!carregando && window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView()
  }, [carregando])

  function sair() {
    limparSessao()
    router.push('/login')
  }

  async function removerFavorito(paginaId: string) {
    setFavoritos((atual) => atual.filter((f) => f.paginas.id !== paginaId))
    try {
      await api.desfavoritar(paginaId)
    } catch {
      // se falhar, a lista correta volta na próxima visita
    }
  }

  async function salvarPreferencias() {
    if (!perfil) return
    setSalvandoPreferencias(true)
    setMensagemPreferencias('')
    try {
      const atualizado = await api.atualizarPerfil({ nome: perfil.nome, preferencias_turismo: preferencias })
      setPerfil((p) => (p ? { ...p, ...atualizado } : p))
      setMensagemPreferencias('Preferências salvas.')
    } catch (e) {
      setMensagemPreferencias(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvandoPreferencias(false)
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
        <p style={{ color: 'var(--c-danger-text)' }}>{erro || 'Não foi possível carregar o perfil'}</p>
      </main>
    )
  }

  const nomeExibido = perfil.nome_social?.trim() || perfil.nome
  const preferenciasAlteradas = JSON.stringify([...preferencias].sort()) !== JSON.stringify([...(perfil.preferencias_turismo ?? [])].sort())

  return (
    <>
      <Grain />
      <Header
        right={
          <>
            <NotificationBell />
            <button type="button" onClick={sair} aria-label="Sair da conta" title="Sair" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--c-input-border)', background: 'var(--c-glass-bg-sm)', color: 'var(--c-text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <IconLogout size={18} />
            </button>
          </>
        }
      />

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '5.5rem 1rem 3rem', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <section style={{ background: 'var(--c-glass-bg-lg)', border: 'var(--c-border)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: 'var(--c-shadow-sm)', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setEnviandoFoto(true)}
            aria-label="Alterar foto de perfil"
            style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', border: '3px solid var(--c-accent-soft-border)', padding: 0, cursor: 'pointer', flexShrink: 0, background: perfil.avatar_url ? `url("${perfil.avatar_url}") center/cover` : 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontSize: '1.75rem', fontWeight: 800 }}
          >
            {!perfil.avatar_url && iniciaisDe(nomeExibido)}
            <span aria-hidden style={{ position: 'absolute', right: '-2px', bottom: '-2px', width: '30px', height: '30px', borderRadius: '50%', background: '#1a7aff', border: '2px solid var(--c-glass-bg-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconCamera size={16} />
            </span>
          </button>
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800 }}>{nomeExibido}</h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>cpf {formatarCpf(perfil.cpf)}</p>
            {(perfil.cidade || perfil.uf) && <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--c-text-2)' }}>{[perfil.cidade, perfil.uf].filter(Boolean).join(' - ')}</p>}
            <button type="button" onClick={() => setEditando(true)} style={{ ...botaoSecundario, marginTop: '0.75rem' }}>
              <IconSettings size={16} /> Editar perfil
            </button>
          </div>
          <dl style={{ display: 'flex', gap: '1.5rem', margin: 0 }}>
            {[
              { valor: favoritos.length, rotulo: 'destinos salvos' },
              { valor: avaliacoes.length, rotulo: 'avaliações' },
            ].map((s) => (
              <div key={s.rotulo} style={{ textAlign: 'center' }}>
                <dd style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{s.valor}</dd>
                <dt style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>{s.rotulo}</dt>
              </div>
            ))}
          </dl>
        </section>

        <Bloco titulo="Minhas preferências de turismo">
          <p style={{ margin: '-0.375rem 0 0.875rem', fontSize: '0.875rem', color: 'var(--c-text-2)' }}>O que você gosta de fazer? Usamos isso para sugerir lugares para você.</p>
          <PreferenciasTurismo valor={preferencias} onChange={(v) => { setPreferencias(v); setMensagemPreferencias('') }} />
          {(preferenciasAlteradas || mensagemPreferencias) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.875rem' }}>
              {preferenciasAlteradas && (
                <button type="button" onClick={salvarPreferencias} disabled={salvandoPreferencias} style={{ ...botaoPrimario, opacity: salvandoPreferencias ? 0.7 : 1 }}>
                  {salvandoPreferencias ? 'Salvando…' : 'Salvar preferências'}
                </button>
              )}
              {mensagemPreferencias && <span role="status" style={{ fontSize: '0.875rem', color: 'var(--c-text-2)' }}>{mensagemPreferencias}</span>}
            </div>
          )}
        </Bloco>

        <Bloco id="destinos" titulo="Meus destinos salvos">
          {favoritos.length === 0 ? (
            <p style={{ color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconHeart size={18} aria-hidden /> Use o botão “Salvar destino” nas páginas dos lugares para montar sua lista.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
              {favoritos.map(({ paginas: p }) => (
                <CardPagina key={p.id} p={p} catalogo={catalogo} favoritado onFavoritar={() => removerFavorito(p.id)} />
              ))}
            </div>
          )}
        </Bloco>

        <Bloco
          titulo="Meus empreendimentos"
          acao={
            <a href={urlGerenciar('/nova-pagina')} style={botaoPrimario}>
              <IconPlus size={16} /> Cadastrar empreendimento
            </a>
          }
        >
          <p style={{ margin: '-0.375rem 0 0.875rem', fontSize: '0.875rem', color: 'var(--c-text-2)' }}>
            A gestão das páginas acontece no painel de empreendimentos da Plura. Você entra nele automaticamente, sem precisar fazer login de novo.
          </p>
          {empreendimentos.length === 0 ? (
            <p style={{ color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconBuildingStore size={18} aria-hidden /> Você ainda não administra nem colabora com nenhum empreendimento.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {empreendimentos.map(({ papel, paginas: e }) =>
                e ? (
                  <li key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', borderRadius: '1rem', border: 'var(--c-border)', flexWrap: 'wrap' }}>
                    <span aria-hidden data-tema={e.tema ?? 'plura'} style={{ width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0, background: e.logo_url ? `#fff url("${e.logo_url}") center/cover` : 'var(--p-accent)', color: 'var(--p-accent-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {!e.logo_url && e.nome.trim()[0]?.toUpperCase()}
                    </span>
                    <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700 }}>{e.nome}</p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
                        {papel === 'administrador' ? 'Administrador' : 'Colaborador'}
                        {e.suspensa && ' · suspensa'}
                        {e.legado && !e.cnpj && ' · complete o CNPJ'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <a href={`/pagina?id=${e.id}`} style={botaoSecundario}>
                        Ver página
                      </a>
                      <a href={urlGerenciar(`/pagina?id=${e.id}`)} style={botaoPrimario}>
                        Gerenciar <IconExternalLink size={15} />
                      </a>
                    </div>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </Bloco>

        <Bloco titulo="Minhas avaliações">
          {avaliacoes.length === 0 ? (
            <p style={{ color: 'var(--c-text-2)' }}>Você ainda não avaliou nenhum lugar.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {avaliacoes.map((a) => {
                const st = STATUS_COMENTARIO[a.status] ?? STATUS_COMENTARIO.pendente
                return (
                  <li key={a.id} style={{ padding: '0.875rem 1rem', borderRadius: '1rem', border: 'var(--c-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <a href={`/pagina?id=${a.pagina_id}`} style={{ fontWeight: 700, color: 'var(--c-text-1)' }}>
                        {a.paginas?.nome ?? 'Empreendimento'}
                      </a>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>· nota {a.nota}/5</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', color: st.cor, background: st.fundo }}>{st.rotulo}</span>
                    </div>
                    {a.comentario && <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.55 }}>{a.comentario}</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </Bloco>
      </main>

      <Footer />
      <div style={{ height: '4.5rem' }} aria-hidden />
      <BottomNav />

      {editando && (
        <EditProfileModal
          perfil={perfil}
          email={obterUsuarioSalvo()?.email ?? ''}
          onClose={() => setEditando(false)}
          onSaved={(p) => {
            setPerfil((atual) => (atual ? { ...atual, ...p } : p))
            setEditando(false)
          }}
        />
      )}
      {enviandoFoto && (
        <EnviarImagemModal
          tipo="perfil"
          onClose={() => setEnviandoFoto(false)}
          onConfirm={async (base64, extensao) => {
            const { avatar_url } = await api.uploadAvatar(base64, extensao)
            setPerfil((p) => (p ? { ...p, avatar_url } : p))
          }}
        />
      )}
    </>
  )
}
