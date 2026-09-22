'use client'

import type { NecessidadeAcessibilidade } from '@/lib/api'
import { useFiltrosAcessibilidade } from '@/lib/useFiltrosAcessibilidade'

export default function AccessibilityChips({
  value,
  onChange,
}: {
  value: NecessidadeAcessibilidade[]
  onChange: (value: NecessidadeAcessibilidade[]) => void
}) {
  const { necessidadesPessoal, carregando } = useFiltrosAcessibilidade()

  function alternar(opcao: NecessidadeAcessibilidade) {
    if (opcao === 'nenhuma') {
      onChange(value.includes('nenhuma') ? [] : ['nenhuma'])
      return
    }
    const semNenhuma = value.filter((v) => v !== 'nenhuma')
    onChange(semNenhuma.includes(opcao) ? semNenhuma.filter((v) => v !== opcao) : [...semNenhuma, opcao])
  }

  if (carregando) {
    return (
      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>
        carregando…
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {necessidadesPessoal.map((o) => {
          const ativo = value.includes(o.codigo)
          return (
            <button
              key={o.codigo}
              type="button"
              onClick={() => alternar(o.codigo)}
              style={{
                padding: '0.4rem 0.9375rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: ativo ? '1px solid rgba(26,122,255,0.65)' : '1px solid var(--c-input-border)',
                background: ativo
                  ? 'linear-gradient(135deg,rgba(26,122,255,0.25),rgba(0,98,230,0.18))'
                  : 'var(--c-glass-bg-sm)',
                color: ativo ? '#6aadff' : 'var(--c-text-2)',
                boxShadow: ativo ? '0 0 12px rgba(26,122,255,0.18)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              {ativo && <span style={{ marginRight: '0.3rem', fontSize: '0.625rem' }}>✓</span>}
              {o.rotulo}
            </button>
          )
        })}
      </div>
      <p style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>
        múltipla escolha
      </p>
    </div>
  )
}
