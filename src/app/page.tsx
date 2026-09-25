'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch, IconUser, IconHandLoveYou } from '@tabler/icons-react'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NotificationBell from '@/components/NotificationBell'
import AcessibilidadeFiltro from '@/components/AcessibilidadeFiltro'
import SugestaoAcessibilidade from '@/components/SugestaoAcessibilidade'
import BuscaPorVoz from '@/components/BuscaPorVoz'
import BottomNav from '@/components/BottomNav'
import CardPagina from '@/components/CardPagina'
import Icone from '@/components/Icone'
import { api, type PaginaCard, type RecursoAcessibilidade } from '@/lib/api'
import { estaLogado } from '@/lib/auth'
import { LOGO_DATA_URI } from '@/lib/logo'
import { useCatalogo } from '@/lib/useCatalogo'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function HomePage() {
  const router = useRouter()
  const catalogo = useCatalogo()
  const [pronto, setPronto] = useState(false)
  const [termo, setTermo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [resultados, setResultados] = useState<PaginaCard[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [filtroAcessibilidade, setFiltroAcessibilidade] = useState<RecursoAcessibilidade[]>([])
  const [apenasLibras, setApenasLibras] = useState(false)
  const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set())
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    // A busca é aberta a visitantes; salvar destinos e ver a página completa pedem login
    const temLogin = estaLogado()
    setLogado(temLogin)
    setPronto(true)
    api
      .buscarPaginas('')
      .then(({ resultados }) => setResultados(resultados))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
    if (!temLogin) return
    api
      .listarFavoritos()
      .then(({ favoritos }) => setFavoritosIds(new Set(favoritos.map((f) => f.paginas.id))))
      .catch(() => {})
  }, [])

  async function alternarFavorito(paginaId: string) {
    if (!logado) {
      router.push('/login?destino=/')
      return
    }
    const jaFavoritado = favoritosIds.has(paginaId)
    const alterar = (adicionar: boolean) =>
      setFavoritosIds((atual) => {
        const proximo = new Set(atual)
        if (adicionar) proximo.add(paginaId)
        else proximo.delete(paginaId)
        return proximo
      })
    alterar(!jaFavoritado)
    try {
      if (jaFavoritado) await api.desfavoritar(paginaId)
      else await api.favoritar(paginaId)
    } catch {
      alterar(jaFavoritado)
    }
  }

  const categoriasPresentes = useMemo(
    () => catalogo.catalogo.categorias.filter((c) => resultados.some((r) => r.categoria === c.codigo)),
    [catalogo, resultados]
  )

  const filtradas = useMemo(() => {
    const t = normalizar(termo.trim())
    return resultados.filter((p) => {
      if (t && ![p.nome, p.cidade, p.subtitulo, p.descricao_curta].some((campo) => campo && normalizar(campo).includes(t))) return false
      if (categoria && p.categoria !== categoria) return false
      if (filtroAcessibilidade.length && !filtroAcessibilidade.every((r) => p.recursos_acessibilidade.includes(r))) return false
      if (apenasLibras && !p.video_libras) return false
      return true
    })
  }, [termo, categoria, resultados, filtroAcessibilidade, apenasLibras])

  if (!pronto) return null

  return (
    <>
      <Grain />
      <Header
        right={
          !logado ? (
            <a href="/login?destino=/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', height: '38px', padding: '0 1rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', flexShrink: 0 }}>
              Entrar
            </a>
          ) : (
          <>
            <NotificationBell />
            <button type="button" onClick={() => router.push('/perfil')} aria-label="Minha área" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--c-input-border)', background: 'var(--c-glass-bg-sm)', color: 'var(--c-text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <IconUser size={18} aria-hidden />
            </button>
          </>
          )
        }
      />

      <main id="conteudo" tabIndex={-1} style={{ paddingTop: '5rem', paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', padding: '2.5rem 1.25rem 2rem', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.25rem)', marginBottom: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_DATA_URI} alt="" aria-hidden draggable={false} style={{ height: 'clamp(2.5rem, 6vw, 3.5rem)', width: 'auto', objectFit: 'contain' }} />
            <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 1.05, margin: 0 }}>Plura</h1>
          </div>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)', color: 'var(--c-text-2)', lineHeight: 1.55 }}>Encontre experiências sem barreiras</p>
        </div>

        <SugestaoAcessibilidade />

        <div id="busca" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.25rem 1rem', scrollMarginTop: '5rem' }}>
          <div style={{ position: 'relative' }}>
          <label style={{ position: 'relative', display: 'block' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)', display: 'flex' }}>
              <IconSearch size={20} aria-hidden />
            </span>
            <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Buscar lugares</span>
            <input
              type="search"
              placeholder="Buscar por nome, cidade ou tipo de lugar…"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              style={{ width: '100%', padding: '0.95rem 3.25rem 0.95rem 2.875rem', background: 'var(--c-glass-bg-lg)', border: 'var(--c-border)', borderRadius: '1.125rem', boxShadow: 'var(--c-shadow-md)', color: 'var(--c-text-1)', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }}
            />
          </label>
          <BuscaPorVoz onTexto={setTermo} />
          </div>
        </div>

        {categoriasPresentes.length > 1 && (
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.25rem 1rem' }}>
            <div role="group" aria-label="Filtrar por categoria" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {[{ codigo: '', rotulo: 'Todos', icone: 'sparkles' }, ...categoriasPresentes].map((c) => {
                const ativo = categoria === c.codigo
                return (
                  <button key={c.codigo || 'todos'} type="button" aria-pressed={ativo} onClick={() => setCategoria(c.codigo)} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.95rem', borderRadius: '9999px', border: ativo ? '1px solid var(--c-accent-soft-border)' : 'var(--c-border)', background: ativo ? 'var(--c-accent-soft)' : 'var(--c-glass-bg-lg)', color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-2)', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                    <Icone nome={c.icone} size={16} /> {c.rotulo}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <AcessibilidadeFiltro value={filtroAcessibilidade} onChange={setFiltroAcessibilidade} />
          <button
            type="button"
            aria-pressed={apenasLibras}
            onClick={() => setApenasLibras((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.7rem 1.1rem', borderRadius: '9999px', border: apenasLibras ? '1px solid var(--c-accent-soft-border)' : 'var(--c-border)', background: apenasLibras ? 'var(--c-accent-soft)' : 'var(--c-glass-bg-lg)', boxShadow: 'var(--c-shadow-sm)', color: apenasLibras ? 'var(--c-accent-text)' : 'var(--c-text-1)', fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <IconHandLoveYou size={19} aria-hidden /> Apresentação em Libras
          </button>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
          {!logado && (
            <p style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', borderRadius: '0.875rem', background: 'var(--c-accent-soft)', border: '1px solid var(--c-accent-soft-border)', fontSize: '0.875rem', color: 'var(--c-text-1)' }}>
              <a href="/login?destino=/" style={{ color: 'var(--c-accent-text)', fontWeight: 700 }}>Entre</a> ou{' '}
              <a href="/signup" style={{ color: 'var(--c-accent-text)', fontWeight: 700 }}>crie sua conta</a> para salvar destinos, avaliar lugares e receber sugestões para você.
            </p>
          )}
          {erro && <p role="alert" style={{ color: 'var(--c-danger-text)', marginBottom: '1rem' }}>{erro}</p>}
          {!loading && (
            <p aria-live="polite" style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
              {filtradas.length} {filtradas.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
            </p>
          )}

          {loading ? (
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>
          ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--c-text-2)' }}>
              <IconSearch size={32} style={{ opacity: 0.4 }} aria-hidden />
              <p style={{ fontSize: '1.0625rem', fontWeight: 600, marginTop: '0.75rem' }}>{resultados.length === 0 ? 'Nenhum lugar cadastrado ainda' : 'Nenhum resultado para essa busca'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {filtradas.map((p) => (
                <CardPagina key={p.id} p={p} catalogo={catalogo} favoritado={favoritosIds.has(p.id)} onFavoritar={() => alternarFavorito(p.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <div style={{ height: '4.5rem' }} aria-hidden />
      <BottomNav />
    </>
  )
}
