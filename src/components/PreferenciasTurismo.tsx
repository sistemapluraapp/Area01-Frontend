'use client'

import Icone from './Icone'
import { useCatalogo } from '@/lib/useCatalogo'

// Preferências de turismo do usuário (lista mantida pela Área 04).
export default function PreferenciasTurismo({ valor, onChange }: { valor: string[]; onChange: (v: string[]) => void }) {
  const { catalogo, carregado } = useCatalogo()

  if (!carregado) return <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>carregando…</p>

  return (
    <div role="group" aria-label="Preferências de turismo" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {catalogo.preferencias_turismo.map((p) => {
        const ativo = valor.includes(p.codigo)
        return (
          <button
            key={p.codigo}
            type="button"
            aria-pressed={ativo}
            onClick={() => onChange(ativo ? valor.filter((v) => v !== p.codigo) : [...valor, p.codigo])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: ativo ? '1px solid var(--c-accent-soft-border)' : '1px solid var(--c-input-border)',
              background: ativo ? 'var(--c-accent-soft)' : 'var(--c-glass-bg-sm)',
              color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-2)',
            }}
          >
            <Icone nome={p.icone} size={17} />
            {p.rotulo}
          </button>
        )
      })}
    </div>
  )
}
