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
import { CameraIcon, LayersIcon, PlusIcon } from '@/components/icons'
import { api, type Perfil, type Colaboracao, type Avaliacao } from '@/lib/api'
import { estaLogado, limparSessao } from '@/lib/auth'
import { formatarCpf } from '@/lib/cpf'

const GESTAO_URL = 'https://area02-frontend.pages.dev/login'

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

  const [modalAberto, setModalAberto] = useState(false)
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

  function sair() {
    limparSessao()
    router.push('/')
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
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg,#1a7aff,#0062e6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.18)',
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
                  <CameraIcon />
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
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--c-text-3)' }}>páginas administradas</p>
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

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Gerenciar páginas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
          <GlassCard hoverable style={{ padding: '1.25rem' }}>
            <a href={GESTAO_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg,#1a7aff,#0062e6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <PlusIcon />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem' }}>Criar página</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
                  Use seu login e senha do Plura na Área de Páginas para criar uma nova página.
                </p>
              </div>
            </a>
          </GlassCard>

          <GlassCard hoverable style={{ padding: '1.25rem' }}>
            <a href={GESTAO_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.75rem',
                  background: 'var(--c-glass-bg-sm)',
                  border: '1px solid var(--c-input-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LayersIcon />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem' }}>Minhas páginas</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
                  Acesse a Área de Páginas para administrar as páginas que você já criou.
                </p>
              </div>
            </a>
          </GlassCard>
        </div>

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Páginas que colaboro</h3>
        {colaboracoes.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não colabora em nenhuma página.</p>
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

        <h3 style={{ margin: '2.25rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Minhas avaliações</h3>
        {avaliacoes.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não avaliou nenhuma Página.</p>
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
          onClose={() => setModalAberto(false)}
          onSaved={(atualizado) => {
            setPerfil(atualizado)
            setModalAberto(false)
          }}
        />
      )}

      <Footer />
    </>
  )
}
