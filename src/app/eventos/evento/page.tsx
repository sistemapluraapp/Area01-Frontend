'use client'

import { useEffect, useState } from 'react'
import { LandingSite } from '@/landing/LandingSite'
import { Tracker } from '@/landing/Tracker'
import { PageRenderer } from '@/landing/shared/render/PageRenderer'
import { currentTime } from '@/landing/shared/format'
import { carregarPagina, carregarSite, siteVazio, type DadosSite, type PublicPage } from '@/landing/dados'
import Carregando from '@/components/Carregando'

// Etapa 9: página de evento ou institucional (/eventos/<endereço>, reescrito para cá pelo _redirects)
export default function EventoPage() {
  const [dados, setDados] = useState<DadosSite | null>(null)
  const [pagina, setPagina] = useState<PublicPage | null | undefined>(undefined)

  useEffect(() => {
    const doCaminho = window.location.pathname.replace(/^\/eventos\/?/, '').replace(/\/$/, '')
    const slug = new URLSearchParams(window.location.search).get('slug') ?? (doCaminho !== 'evento' ? doCaminho : '')
    carregarSite().then(setDados).catch(() => setDados(siteVazio()))
    if (slug) carregarPagina(slug).then(setPagina).catch(() => setPagina(null))
    else setPagina(null)
  }, [])

  if (!dados || pagina === undefined) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Carregando /></div>
  if (!pagina)
    return (
      <LandingSite dados={dados} titulo="Página não encontrada">
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-16 text-center">
          <h1 className="fp-heading fp-h2">Página não encontrada</h1>
          <p className="mt-4 opacity-70">Este evento pode ter sido removido ou ainda não foi publicado.</p>
          <a href="/eventos" className="fp-btn fp-btn-primary mt-8">Ver todos os eventos</a>
        </div>
      </LandingSite>
    )
  return (
    <LandingSite dados={dados} titulo={pagina.seo?.title || pagina.title}>
      {pagina.content.sections.length === 0 ? (
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-16">
          <h1 className="fp-heading fp-h1">{pagina.title}</h1>
          <p className="mt-4 opacity-70">Conteúdo em breve.</p>
        </div>
      ) : (
        <PageRenderer
          content={pagina.content}
          ctx={{ mode: 'public', pageId: pagina.id, settings: dados.settings, events: dados.events, now: currentTime(), page: { title: pagina.title, starts_at: pagina.starts_at, ends_at: pagina.ends_at, location: pagina.location } }}
        />
      )}
      <Tracker pageId={pagina.id} />
    </LandingSite>
  )
}
