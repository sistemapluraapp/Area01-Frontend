'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NotificationBell from '@/components/NotificationBell'
import { SearchIcon, UserIcon } from '@/components/icons'
import { api, type Categoria, type Pagina } from '@/lib/api'
import { estaLogado } from '@/lib/auth'
import { LOGO_DATA_URI } from '@/lib/logo'

const CATEGORIA_LABEL: Record<Categoria, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  pousada: 'Pousada',
  bar: 'Bar',
  restaurante: 'Restaurante',
  cafe: 'Café',
  espaco_eventos: 'Espaço de eventos',
  passeio_turistico: 'Passeio turístico',
  museu: 'Museu',
  parque: 'Parque',
  academia: 'Academia',
  clinica: 'Clínica',
  outros: 'Outros',
}

function SkeletonCard() {
  return (
    <div style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'var(--c-glass-bg)', border: 'var(--c-border)', animation: 'pulse 1.5s ease infinite' }}>
      <div style={{ height: '120px', background: 'var(--c-glass-bg-sm)' }} />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '0.75rem', width: '60px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
        <div style={{ height: '1.125rem', width: '140px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
      </div>
    </div>
  )
}

function PaginaGridCard({ pagina, onClick }: { pagina: Pagina; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const initials = pagina.nome.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const categoriaLabel = pagina.categoria ? CATEGORIA_LABEL[pagina.categoria] : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '1.25rem',
        overflow: 'hidden',
        background: 'var(--c-glass-bg)',
        border: 'var(--c-border)',
        boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.38)' : 'var(--c-shadow-md)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          height: '120px',
          background: pagina.capa_url ? undefined : 'linear-gradient(135deg,#1a7aff,#0062e6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.25rem',
          fontWeight: 800,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '-0.04em',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {pagina.capa_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pagina.capa_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : pagina.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pagina.logo_url} alt="" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '0.75rem' }} />
        ) : (
          initials
        )}
        {categoriaLabel && (
          <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '9999px',
                padding: '0.25rem 0.625rem',
                color: '#fff',
              }}
            >
              {categoriaLabel}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '0.875rem 1rem 1rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.25rem', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pagina.nome}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', lineHeight: 1.4 }}>{pagina.descricao ?? 'Sem descrição'}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [logado, setLogado] = useState(false)
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<Pagina[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLogado(estaLogado())
    api
      .buscarPaginas('')
      .then(({ resultados }) => setResultados(resultados))
      .finally(() => setLoading(false))
  }, [])

  const filtradas = useMemo(() => {
    const t = termo.trim().toLowerCase()
    if (!t) return resultados
    return resultados.filter((p) => p.nome.toLowerCase().includes(t))
  }, [termo, resultados])

  return (
    <>
      <Grain />

      <Header
        right={
          logado ? (
            <>
              <NotificationBell />
              <button
                onClick={() => router.push('/perfil')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg,#1a7aff,#0062e6)', border: 'none', borderRadius: '0.75rem',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(26,122,255,0.35)',
                }}
              >
                <UserIcon /> Minha Área
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem',
                color: 'var(--c-text-1)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <UserIcon /> Login
            </button>
          )
        }
      />

      <main style={{ paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2.5rem', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.25rem)', marginBottom: '0.875rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_DATA_URI}
              alt=""
              aria-hidden
              draggable={false}
              style={{ height: 'clamp(2.5rem, 6vw, 4rem)', width: 'auto', objectFit: 'contain' }}
            />
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.05, margin: 0 }}>
              Plura
            </h1>
          </div>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--c-text-2)', lineHeight: 1.55, maxWidth: '480px', margin: '0 auto' }}>
            Encontre seu lazer com acessibilidade
          </p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{ background: 'var(--c-glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--c-border)', borderRadius: '1.25rem', boxShadow: 'var(--c-shadow-md)', padding: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome da Página…"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                  background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem',
                  color: 'var(--c-text-1)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          {!loading && (
            <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', marginBottom: '1.25rem' }}>
              {termo ? `${filtradas.length} resultado(s) encontrado(s)` : `${resultados.length} Página(s) na plataforma`}
            </p>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ color: 'var(--c-text-4)', opacity: 0.5 }}>
                <SearchIcon />
              </div>
              <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--c-text-2)' }}>
                {resultados.length === 0 ? 'Nenhuma Página cadastrada ainda' : 'Nenhum resultado para essa busca'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
              {filtradas.map((pagina) => (
                <PaginaGridCard key={pagina.id} pagina={pagina} onClick={() => router.push(`/pagina?id=${pagina.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
