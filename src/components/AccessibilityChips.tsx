'use client'

import type { NecessidadeAcessibilidade } from '@/lib/api'

const OPCOES: { value: NecessidadeAcessibilidade; label: string }[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'auditiva', label: 'Auditiva' },
  { value: 'motora', label: 'Motora' },
  { value: 'intelectual', label: 'Intelectual' },
  { value: 'tea', label: 'TEA (Autismo)' },
  { value: 'neurodivergencia', label: 'Neurodivergência' },
  { value: 'nenhuma', label: 'Nenhuma' },
]

export default function AccessibilityChips({
  value,
  onChange,
}: {
  value: NecessidadeAcessibilidade[]
  onChange: (value: NecessidadeAcessibilidade[]) => void
}) {
  function alternar(opcao: NecessidadeAcessibilidade) {
    if (opcao === 'nenhuma') {
      onChange(value.includes('nenhuma') ? [] : ['nenhuma'])
      return
    }
    const semNenhuma = value.filter((v) => v !== 'nenhuma')
    onChange(semNenhuma.includes(opcao) ? semNenhuma.filter((v) => v !== opcao) : [...semNenhuma, opcao])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {OPCOES.map((o) => {
        const ativo = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => alternar(o.value)}
            style={{
              padding: '0.4rem 0.9375rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: ativo ? '1px solid rgba(26,122,255,0.65)' : '1px solid var(--c-input-border)',
              background: ativo ? 'var(--c-glass-bg-blue)' : 'var(--c-glass-bg-sm)',
              color: ativo ? '#ffffff' : 'var(--c-text-2)',
              transition: 'all 150ms ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
