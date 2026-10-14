'use client'

import { useEffect, useState } from 'react'
import { LandingSite } from '@/landing/LandingSite'
import { Tracker } from '@/landing/Tracker'
import { EventCard } from '@/landing/shared/render/BlockView'
import { BrandIcon } from '@/landing/shared/render/BrandIcon'
import { carregarSite, siteVazio, type DadosSite } from '@/landing/dados'
import Carregando from '@/components/Carregando'

// Etapa 9: lista de eventos da landing (cópia de /eventos do site do Festival)
export default function EventosPage() {
  const [dados, setDados] = useState<DadosSite | null>(null)
  const [ativa, setAtiva] = useState<string | null>(null)

  useEffect(() => {
    setAtiva(new URLSearchParams(window.location.search).get('categoria'))
    carregarSite().then(setDados).catch(() => setDados(siteVazio()))
  }, [])

  if (!dados) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Carregando /></div>
  const s = dados.settings
  const events = dados.events
  const cats = [...new Set(events.map((e) => e.category).filter(Boolean))] as string[]
  const list = ativa ? events.filter((e) => e.category === ativa) : events
  return (
    <LandingSite dados={dados} titulo="Eventos">
      <div className="@container fp-page">
        <section className="fp-on-dark px-5 pb-10 pt-32 text-white md:px-8" style={{ background: 'linear-gradient(135deg, var(--fp-primary), var(--fp-accent))' }}>
          <div className="mx-auto max-w-6xl">
            <span className="fp-label !text-white/80">{s.festival_name}</span>
            <h1 className="fp-heading fp-h1 mt-2">Eventos</h1>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          {cats.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              <a href="/eventos" className={`rounded-full border px-4 py-1.5 text-sm ${!ativa ? 'border-[var(--fp-primary)] bg-[var(--fp-primary)] text-white' : 'border-black/15'}`}>Todos</a>
              {cats.map((c) => (
                <a key={c} href={`/eventos?categoria=${encodeURIComponent(c)}`} className={`rounded-full border px-4 py-1.5 text-sm ${ativa === c ? 'border-[var(--fp-primary)] bg-[var(--fp-primary)] text-white' : 'border-black/15'}`}>
                  {c}
                </a>
              ))}
            </div>
          )}
          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center text-lg opacity-70">
              <BrandIcon url={s.brand.icon_url} className="h-14" />
              <p>A programação será divulgada em breve.</p>
            </div>
          ) : (
            <div className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
              {list.map((e) => (
                <EventCard key={e.id} e={e} fallback={s.brand.event_cover_url} icon={s.brand.icon_url} />
              ))}
            </div>
          )}
        </section>
        <Tracker />
      </div>
    </LandingSite>
  )
}
