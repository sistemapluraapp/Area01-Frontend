'use client'

import { useEffect, useState } from 'react'
import CartaoEvento from '@/components/eventos/CartaoEvento'
import { api, type EventoPublico } from '@/lib/api'
import Carregando from '@/components/Carregando'

// Perfil: eventos em que a pessoa marcou "Tenho interesse"
export default function MeusEventos({ rotuloRecurso }: { rotuloRecurso?: (c: string) => string }) {
  const [eventos, setEventos] = useState<EventoPublico[] | null>(null)
  const [verPassados, setVerPassados] = useState(false)

  useEffect(() => {
    api
      .meusEventos()
      .then((r) => setEventos(r.eventos))
      .catch(() => setEventos([]))
  }, [])

  if (eventos === null) return <Carregando compacto />
  const agora = Date.now()
  const proximos = eventos.filter((e) => new Date(e.fim ?? e.inicio).getTime() >= agora)
  const passados = eventos.filter((e) => new Date(e.fim ?? e.inicio).getTime() < agora).reverse()

  if (eventos.length === 0) {
    return (
      <p style={{ color: 'var(--c-text-2)' }}>
        Marque “Tenho interesse” nos eventos da <a href="/agenda" style={{ color: 'var(--c-text-blue)', fontWeight: 600 }}>agenda cultural</a> para acompanhar aqui.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {proximos.length === 0 && <p style={{ color: 'var(--c-text-2)' }}>Nenhum evento futuro na sua lista.</p>}
      {proximos.map((e) => (
        <CartaoEvento key={e.id} evento={e} rotuloRecurso={rotuloRecurso} onMudou={(n) => !n.interessado && setEventos((l) => (l ?? []).filter((x) => x.id !== n.id))} />
      ))}
      {passados.length > 0 && (
        <button type="button" onClick={() => setVerPassados((v) => !v)} aria-expanded={verPassados} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--c-text-blue)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}>
          {verPassados ? 'Esconder' : 'Ver'} eventos que já aconteceram ({passados.length})
        </button>
      )}
      {verPassados && passados.map((e) => <CartaoEvento key={e.id} evento={e} rotuloRecurso={rotuloRecurso} />)}
    </div>
  )
}
