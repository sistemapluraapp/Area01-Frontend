'use client'

import { useEffect, useState } from 'react'
import CartaoEvento from '@/components/eventos/CartaoEvento'
import { api, type EventoPublico, type PaginaPublica } from '@/lib/api'
import { Cartao, LinkAcao, TituloSecao } from './ui'
import type { useCatalogo } from '@/lib/useCatalogo'

// Próximos eventos da página, com "Tenho interesse"
export default function Eventos({ p, catalogo }: { p: PaginaPublica; catalogo: ReturnType<typeof useCatalogo> }) {
  const [eventos, setEventos] = useState<EventoPublico[]>([])
  useEffect(() => {
    api
      .eventosDaPagina(p.id)
      .then((r) => setEventos(r.eventos))
      .catch(() => {})
  }, [p.id])
  if (eventos.length === 0) return null
  const rotulo = (c: string) => catalogo.recursos[c]?.rotulo ?? c
  return (
    <Cartao id="eventos">
      <TituloSecao acao={<LinkAcao href="/agenda">Agenda cultural</LinkAcao>}>Próximos eventos</TituloSecao>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {eventos.map((e) => (
          <CartaoEvento key={e.id} evento={e} mostrarPagina={false} rotuloRecurso={rotulo} />
        ))}
      </div>
    </Cartao>
  )
}
