'use client'

import type { RecursoAcessibilidade } from '@/lib/apiPaginas'

const OPCOES: { value: RecursoAcessibilidade; label: string }[] = [
  { value: 'rampa', label: 'Rampa de acesso' },
  { value: 'elevador', label: 'Elevador' },
  { value: 'banheiro_adaptado', label: 'Banheiro adaptado' },
  { value: 'vaga_pcd', label: 'Vaga PCD' },
  { value: 'piso_tatil', label: 'Piso tátil' },
  { value: 'libras', label: 'Libras' },
  { value: 'braille', label: 'Braille' },
  { value: 'cadeira_rodas', label: 'Cadeira de rodas' },
  { value: 'audiodescricao', label: 'Audiodescrição' },
  { value: 'entrada_acessivel', label: 'Entrada acessível' },
]

export default function RecursosAcessibilidadeChips({
  value,
  onChange,
}: {
  value: RecursoAcessibilidade[]
  onChange: (value: RecursoAcessibilidade[]) => void
}) {
  function alternar(opcao: RecursoAcessibilidade) {
    onChange(value.includes(opcao) ? value.filter((v) => v !== opcao) : [...value, opcao])
  }

  return (
    <div>
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
                background: ativo
                  ? 'linear-gradient(135deg,rgba(26,122,255,0.25),rgba(0,98,230,0.18))'
                  : 'var(--c-glass-bg-sm)',
                color: ativo ? '#6aadff' : 'var(--c-text-2)',
                boxShadow: ativo ? '0 0 12px rgba(26,122,255,0.18)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              {ativo && <span style={{ marginRight: '0.3rem', fontSize: '0.625rem' }}>✓</span>}
              {o.label}
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

export const RECURSOS_ACESSIBILIDADE_LABELS: Record<RecursoAcessibilidade, string> = OPCOES.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<RecursoAcessibilidade, string>
)
