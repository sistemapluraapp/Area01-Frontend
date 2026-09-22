'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import { ArrowLeftIcon, CloseIcon, HeartIcon, MapPinIcon } from '@/components/icons'
import { RECURSOS_ACESSIBILIDADE_LABELS } from '@/components/RecursosAcessibilidadeChips'
import { api, type Avaliacao, type Categoria, type Pagina } from '@/lib/api'
import { estaLogado } from '@/lib/auth'

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

const CATEGORIA_GRADIENTE: Record<Categoria, string> = {
  hotel: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  hostel: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  pousada: 'linear-gradient(135deg,#10b981,#059665)',
  bar: 'linear-gradient(135deg,#f59e0b,#d97706)',
  restaurante: 'linear-gradient(135deg,#ef4444,#dc2626)',
  cafe: 'linear-gradient(135deg,#92400e,#78350f)',
  espaco_eventos: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  passeio_turistico: 'linear-gradient(135deg,#06b6d4,#0891b2)',
  museu: 'linear-gradient(135deg,#d97706,#b45705)',
  parque: 'linear-gradient(135deg,#22c55e,#15803d)',
  academia: 'linear-gradient(135deg,#f97316,#c2410c)',
  clinica: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
  outros: 'linear-gradient(135deg,#6b7280,#4b5563)',
}

const GRADIENTE_PADRAO = 'linear-gradient(135deg,#1a7aff,#0062e6)'

function gradientePor(categoria: Categoria | null): string {
  return categoria ? CATEGORIA_GRADIENTE[categoria] ?? GRADIENTE_PADRAO : GRADIENTE_PADRAO
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1rem' }}>
      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
    </div>
  )
}

function RedeChip({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-2)', textDecoration: 'none' }}
    >
      {label}
    </a>
  )
}

function PerfilEmpreendimento({ pagina }: { pagina: Pagina }) {
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)
  const gradiente = gradientePor(pagina.categoria)
  const inicial = pagina.nome.trim()[0]?.toUpperCase() ?? '?'

  return (
    <>
      {fotoAmpliada && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={() => setFotoAmpliada(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '1rem', objectFit: 'contain' }} />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFotoAmpliada(null)
            }}
            aria-label="Fechar"
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <GlassCard variant="lg" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Banner */}
        <div style={{ position: 'relative', height: '240px', width: '100%', background: pagina.capa_url ? `url(${pagina.capa_url}) center/cover no-repeat` : gradiente }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.60) 100%)' }} />
          <div
            style={{
              position: 'absolute', bottom: '-32px', left: '1.75rem',
              width: '80px', height: '80px', borderRadius: '1rem',
              background: pagina.logo_url ? `url(${pagina.logo_url}) center/cover no-repeat` : gradiente,
              border: '3px solid var(--c-bg, #04040f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
            }}
          >
            {!pagina.logo_url && inicial}
          </div>
        </div>

        <div style={{ padding: '2.5rem 1.75rem 1.75rem' }}>
          {/* Head */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--c-divider)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em' }}>{pagina.nome}</h2>
              {pagina.categoria && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'rgba(26,122,255,0.15)', color: '#6aadff', border: '1px solid rgba(26,122,255,0.3)' }}>
                  {CATEGORIA_LABEL[pagina.categoria]}
                </span>
              )}
            </div>
            {(pagina.endereco || pagina.cidade) && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9375rem', color: 'var(--c-text-3)', margin: 0 }}>
                <MapPinIcon />
                {pagina.endereco ?? ''}{pagina.cidade ? ` · ${pagina.cidade}` : ''}{pagina.uf ? `/${pagina.uf}` : ''}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {pagina.website && <RedeChip label={pagina.website} href={pagina.website} />}
              {pagina.instagram && <RedeChip label={pagina.instagram} href={`https://instagram.com/${pagina.instagram.replace('@', '')}`} />}
              {pagina.facebook && <RedeChip label={pagina.facebook} href={pagina.facebook} />}
              {pagina.tiktok && <RedeChip label={pagina.tiktok} href={pagina.tiktok} />}
              {pagina.youtube && <RedeChip label="YouTube" href={pagina.youtube} />}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <SectionLabel label="Sobre" />
              <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.7 }}>
                {pagina.descricao || 'Nenhuma descrição cadastrada.'}
              </p>
            </div>

            {pagina.fotos_urls.length > 0 && (
              <div>
                <SectionLabel label="Galeria" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: '0.625rem' }}>
                  {pagina.fotos_urls.map((url) => (
                    <div
                      key={url}
                      style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--c-input-border)', cursor: 'zoom-in' }}
                      onClick={() => setFotoAmpliada(url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pagina.recursos_acessibilidade.length > 0 && (
              <div>
                <SectionLabel label="Acessibilidade" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {pagina.recursos_acessibilidade.map((r) => (
                    <span key={r} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500, background: 'rgba(26,122,255,0.12)', border: '1px solid rgba(26,122,255,0.25)', color: '#6aadff' }}>
                      {RECURSOS_ACESSIBILIDADE_LABELS[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </>
  )
}

function PaginaDetalhe() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [pagina, setPagina] = useState<(Pagina & { avaliacoes: Avaliacao[] }) | null>(null)
  const [erro, setErro] = useState('')
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [logado, setLogado] = useState(false)
  const [favoritado, setFavoritado] = useState(false)
  const [alternandoFavorito, setAlternandoFavorito] = useState(false)

  async function carregar() {
    try {
      const dados = await api.obterPagina(id)
      setPagina(dados)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Página não encontrada')
    }
  }

  useEffect(() => {
    if (id) carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const usuarioLogado = estaLogado()
    setLogado(usuarioLogado)
    if (usuarioLogado && id) {
      api
        .listarFavoritos()
        .then(({ favoritos }) => setFavoritado(favoritos.some((f) => f.paginas.id === id)))
        .catch(() => {})
    }
  }, [id])

  async function alternarFavorito() {
    if (!id || alternandoFavorito) return
    const jaFavoritado = favoritado
    setFavoritado(!jaFavoritado)
    setAlternandoFavorito(true)
    try {
      if (jaFavoritado) await api.desfavoritar(id)
      else await api.favoritar(id)
    } catch {
      setFavoritado(jaFavoritado)
    } finally {
      setAlternandoFavorito(false)
    }
  }

  async function avaliar(e: React.FormEvent) {
    e.preventDefault()
    if (!estaLogado()) {
      setErro('Faça login para avaliar esta Página')
      return
    }
    setEnviando(true)
    try {
      await api.avaliar(id, { nota, comentario })
      setComentario('')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar avaliação')
    } finally {
      setEnviando(false)
    }
  }

  const botaoVoltar = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <button
        onClick={() => router.push('/')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
          background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', borderRadius: '9999px',
          color: 'var(--c-text-1)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        }}
      >
        <ArrowLeftIcon /> Voltar
      </button>
      {logado && pagina && (
        <button
          onClick={alternarFavorito}
          aria-label={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
            background: favoritado ? 'rgba(239,68,68,0.12)' : 'var(--c-glass-bg-sm)',
            border: favoritado ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--c-input-border)',
            borderRadius: '9999px',
            color: favoritado ? '#ef4444' : 'var(--c-text-1)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          <HeartIcon filled={favoritado} /> {favoritado ? 'Favoritado' : 'Favoritar'}
        </button>
      )}
    </div>
  )

  if (erro && !pagina) {
    return (
      <>
        {botaoVoltar}
        <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {erro}
        </div>
      </>
    )
  }
  if (!pagina) {
    return (
      <>
        {botaoVoltar}
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>
      </>
    )
  }

  return (
    <>
      {botaoVoltar}

      <PerfilEmpreendimento pagina={pagina} />

      <GlassCard style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Avaliar</h3>
        {erro && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem', color: '#f87171' }}>
            {erro}
          </div>
        )}
        <form onSubmit={avaliar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Nota</label>
            <select
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
              style={{ padding: '0.625rem 1rem', background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit' }}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrela(s)
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Comentário</label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ padding: '0.75rem 1rem', background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <Button type="submit" loading={enviando}>
            Enviar avaliação
          </Button>
        </form>
      </GlassCard>

      <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Avaliações ({pagina.avaliacoes.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {pagina.avaliacoes.map((a) => (
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
    </>
  )
}

export default function PaginaPage() {
  return (
    <>
      <Grain />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.25rem 3rem', position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>}>
          <PaginaDetalhe />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
