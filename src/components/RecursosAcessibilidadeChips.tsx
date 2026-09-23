'use client'

import { useMemo } from 'react'
import type { RecursoAcessibilidade } from '@/lib/apiPaginas'
import { useFiltrosAcessibilidade } from '@/lib/useFiltrosAcessibilidade'

export default function RecursosAcessibilidadeChips({
  value,
  onChange,
}: {
  value: RecursoAcessibilidade[]
  onChange: (value: RecursoAcessibilidade[]) => void
}) {
  const { recursosLocal, carregando } = useFiltrosAcessibilidade()

  function alternar(opcao: RecursoAcessibilidade) {
    onChange(value.includes(opcao) ? value.filter((v) => v !== opcao) : [...value, opcao])
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
        {recursosLocal.map((o) => {
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
                color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-2)',
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

export function useRecursosAcessibilidadeLabels(): Record<string, string> {
  const { recursosLocal } = useFiltrosAcessibilidade()
  return useMemo(
    () => recursosLocal.reduce((acc, o) => ({ ...acc, [o.codigo]: o.rotulo }), {} as Record<string, string>),
    [recursosLocal]
  )
}
