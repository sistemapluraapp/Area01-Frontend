'use client'

import { useState } from 'react'
import { IconCalendarEvent, IconChevronDown, IconExternalLink, IconMapPin, IconStar, IconStarFilled } from '@tabler/icons-react'
import TextoRico from '@/components/TextoRico'
import { api, type EventoPublico } from '@/lib/api'
import { exigirLogin } from '@/lib/exigirLogin'

export function formatarPeriodo(inicio: string, fim: string | null) {
  const i = new Date(inicio)
  const data = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  const hora = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (!fim) return `${data(i)}, ${hora(i)}`
  const f = new Date(fim)
  return i.toDateString() === f.toDateString() ? `${data(i)}, ${hora(i)} às ${hora(f)}` : `${data(i)}, ${hora(i)} até ${data(f)}, ${hora(f)}`
}

// Cartão de evento com "Tenho interesse" (exige login)
export default function CartaoEvento({
  evento,
  rotuloRecurso,
  mostrarPagina = true,
  onMudou,
}: {
  evento: EventoPublico
  rotuloRecurso?: (codigo: string) => string
  mostrarPagina?: boolean
  onMudou?: (e: EventoPublico) => void
}) {
  const [e, setE] = useState(evento)
  const [aberto, setAberto] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const inicio = new Date(e.inicio)
  const passou = new Date(e.fim ?? e.inicio).getTime() < Date.now()

  async function alternarInteresse() {
    if (!exigirLogin()) return
    setOcupado(true)
    try {
      const r = await api.marcarInteresse(e.id, !e.interessado)
      const novo = { ...e, interessado: r.interessado, total_interessados: r.total_interessados }
      setE(novo)
      onMudou?.(novo)
    } catch {
      // mantém o estado atual se falhar
    } finally {
      setOcupado(false)
    }
  }

  const local = [e.local_nome, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ')
  return (
    <article style={{ display: 'flex', flexDirection: 'column', borderRadius: '1rem', border: '1px solid var(--c-divider)', background: 'var(--c-glass-bg-lg)', overflow: 'hidden', opacity: passou ? 0.7 : 1 }}>
      {e.imagem_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.imagem_url} alt="" style={{ width: '100%', aspectRatio: '16 / 7', objectFit: 'cover' }} loading="lazy" />
      )}
      <div style={{ display: 'flex', gap: '0.875rem', padding: '0.875rem 1rem 1rem' }}>
        <div aria-hidden style={{ flexShrink: 0, alignSelf: 'flex-start', width: '3.25rem', textAlign: 'center', borderRadius: '0.75rem', background: 'var(--c-accent-soft)', color: 'var(--c-text-blue)', padding: '0.375rem 0' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' }}>{inicio.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</div>
          <div style={{ fontSize: '1.375rem', fontWeight: 800, lineHeight: 1.1 }}>{inicio.getDate()}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{e.titulo}</h3>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <IconCalendarEvent size={14} aria-hidden /> {formatarPeriodo(e.inicio, e.fim)}
          </p>
          {local && (
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <IconMapPin size={14} aria-hidden /> {local}
            </p>
          )}
          {mostrarPagina && (
            <a href={`/pagina?id=${e.pagina.id}`} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text-blue)', textDecoration: 'none' }}>
              {e.pagina.nome}
            </a>
          )}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {e.gratuito === true && <span style={etiqueta}>Gratuito</span>}
            {e.acessibilidades.slice(0, 4).map((a) => (
              <span key={a} style={etiqueta}>
                {rotuloRecurso?.(a) ?? a}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.5rem' }}>
            {!passou && (
              <button
                type="button"
                onClick={alternarInteresse}
                disabled={ocupado}
                aria-pressed={e.interessado}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 0.875rem', borderRadius: '9999px', border: e.interessado ? 'none' : '1px solid var(--c-accent-soft-border, var(--c-divider))', background: e.interessado ? 'linear-gradient(135deg,#1a7aff,#0062e6)' : 'transparent', color: e.interessado ? '#fff' : 'var(--c-text-blue)', fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {e.interessado ? <IconStarFilled size={15} aria-hidden /> : <IconStar size={15} aria-hidden />}
                {e.interessado ? 'Tenho interesse' : 'Tenho interesse?'}
              </button>
            )}
            <span style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
              {e.total_interessados} {e.total_interessados === 1 ? 'pessoa interessada' : 'pessoas interessadas'}
            </span>
            {(e.descricao || e.link || e.endereco) && (
              <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: 'var(--c-text-2)', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                Detalhes <IconChevronDown size={15} aria-hidden style={{ transform: aberto ? 'rotate(180deg)' : undefined }} />
              </button>
            )}
          </div>
          {aberto && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--c-text-1)', lineHeight: 1.6 }}>
              {e.endereco && <p style={{ margin: '0 0 0.5rem', color: 'var(--c-text-2)' }}>Endereço: {e.endereco}</p>}
              {e.descricao && <TextoRico valor={e.descricao} />}
              {e.link && (
                <a href={e.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', color: 'var(--c-text-blue)', fontWeight: 600 }}>
                  Ingressos e informações <IconExternalLink size={14} aria-hidden />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

const etiqueta = { fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-divider)', color: 'var(--c-text-2)' } as const
