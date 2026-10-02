'use client'

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import type { EventoPublico } from '@/lib/api'

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export const chaveDia = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

// Dias (no horário do navegador) em que o evento acontece, dentro do mês
export function diasDoEvento(e: EventoPublico, ano: number, mes: number): string[] {
  const inicio = new Date(e.inicio)
  const fim = e.fim ? new Date(e.fim) : inicio
  const dias: string[] = []
  const d = new Date(Math.max(inicio.getTime(), new Date(ano, mes, 1).getTime()))
  d.setHours(0, 0, 0, 0)
  const limite = new Date(Math.min(fim.getTime(), new Date(ano, mes + 1, 0, 23, 59, 59).getTime()))
  for (let i = 0; d <= limite && i < 62; i++) {
    dias.push(chaveDia(d))
    d.setDate(d.getDate() + 1)
  }
  return dias
}

export default function CalendarioMensal({
  ano,
  mes,
  eventos,
  diaSelecionado,
  onSelecionarDia,
  onMudarMes,
}: {
  ano: number
  mes: number
  eventos: EventoPublico[]
  diaSelecionado: string | null
  onSelecionarDia: (chave: string | null) => void
  onMudarMes: (delta: number) => void
}) {
  const porDia = new Map<string, number>()
  for (const e of eventos) for (const k of diasDoEvento(e, ano, mes)) porDia.set(k, (porDia.get(k) ?? 0) + 1)

  const primeiro = new Date(ano, mes, 1)
  const totalDias = new Date(ano, mes + 1, 0).getDate()
  const celulas: (number | null)[] = [...Array(primeiro.getDay()).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)]
  const hoje = chaveDia(new Date())
  const nomeMes = primeiro.toLocaleDateString('pt-BR', { month: 'long' })
  const titulo = `${nomeMes.charAt(0).toUpperCase()}${nomeMes.slice(1)} de ${ano}`

  return (
    <div style={{ borderRadius: '1rem', border: '1px solid var(--c-divider)', background: 'var(--c-glass-bg-lg)', padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <button type="button" onClick={() => onMudarMes(-1)} aria-label="Mês anterior" style={botaoSeta}>
          <IconChevronLeft size={18} aria-hidden />
        </button>
        <h2 aria-live="polite" style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
          {titulo}
        </h2>
        <button type="button" onClick={() => onMudarMes(1)} aria-label="Próximo mês" style={botaoSeta}>
          <IconChevronRight size={18} aria-hidden />
        </button>
      </div>
      <div role="grid" aria-label={`Calendário de ${titulo}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} role="columnheader" style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', padding: '0.25rem 0' }}>
            {d}
          </div>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`v${i}`} />
          const chave = chaveDia(new Date(ano, mes, dia))
          const qtd = porDia.get(chave) ?? 0
          const selecionado = diaSelecionado === chave
          const rotulo = `${dia} de ${primeiro.toLocaleDateString('pt-BR', { month: 'long' })}: ${qtd === 0 ? 'nenhum evento' : qtd === 1 ? '1 evento' : `${qtd} eventos`}`
          return (
            <button
              key={chave}
              type="button"
              role="gridcell"
              aria-label={rotulo}
              aria-pressed={selecionado}
              onClick={() => onSelecionarDia(selecionado ? null : chave)}
              disabled={qtd === 0}
              style={{
                aspectRatio: '1',
                minHeight: '2.25rem',
                borderRadius: '0.625rem',
                border: chave === hoje ? '1px solid var(--c-text-blue)' : '1px solid transparent',
                background: selecionado ? 'linear-gradient(135deg,#1a7aff,#0062e6)' : qtd ? 'var(--c-accent-soft)' : 'transparent',
                color: selecionado ? '#fff' : qtd ? 'var(--c-text-blue)' : 'var(--c-text-3)',
                fontWeight: qtd ? 800 : 500,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                cursor: qtd ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.125rem',
              }}
            >
              {dia}
              {qtd > 0 && <span aria-hidden style={{ fontSize: '0.625rem', fontWeight: 700 }}>{qtd}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const botaoSeta = { display: 'flex', padding: '0.375rem', borderRadius: '0.625rem', border: '1px solid var(--c-divider)', background: 'transparent', color: 'var(--c-text-1)', cursor: 'pointer' } as const
