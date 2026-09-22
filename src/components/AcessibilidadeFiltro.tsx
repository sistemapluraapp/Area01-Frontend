'use client'

import { useMemo, useState } from 'react'
import type { RecursoAcessibilidade } from '@/lib/api'
import { useFiltrosAcessibilidade } from '@/lib/useFiltrosAcessibilidade'
import { ChevronDownIcon, FilterIcon } from './icons'

const GRUPO_LABEL: Record<string, string> = {
  mobilidade: 'Mobilidade',
  sensorial: 'Sensorial',
}

export default function AcessibilidadeFiltro({
  value,
  onChange,
}: {
  value: RecursoAcessibilidade[]
  onChange: (value: RecursoAcessibilidade[]) => void
}) {
  const { recursosLocal, carregando } = useFiltrosAcessibilidade()
  const [aberto, setAberto] = useState(false)

  const grupos = useMemo(() => {
    const lista: { id: string; label: string; itens: { value: string; label: string }[] }[] = []
    for (const item of recursosLocal) {
      let grupo = lista.find((g) => g.id === item.categoria)
      if (!grupo) {
        grupo = { id: item.categoria, label: GRUPO_LABEL[item.categoria] ?? item.categoria, itens: [] }
        lista.push(grupo)
      }
      grupo.itens.push({ value: item.codigo, label: item.rotulo })
    }
    return lista
  }, [recursosLocal])

  function alternar(item: RecursoAcessibilidade) {
    onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item])
  }

  if (carregando) return null

  return (
    <div style={{ background: 'var(--c-glass-bg)', backdropFilter: 'blur(20px)', border: 'var(--c-border)', borderRadius: '1.25rem', boxShadow: 'var(--c-shadow-md)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-text-1)', fontSize: '0.9375rem', fontWeight: 700 }}>
          <FilterIcon />
          Filtrar por acessibilidade
          {value.length > 0 && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                borderRadius: '9999px',
                padding: '0.1rem 0.5rem',
                background: 'rgba(26,122,255,0.22)',
                color: '#6aadff',
              }}
            >
              {value.length}
            </span>
          )}
        </span>
        <span
          style={{
            color: 'var(--c-text-3)',
            display: 'inline-flex',
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
          }}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {aberto && (
        <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {grupos.map((grupo) => (
            <div key={grupo.id}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {grupo.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {grupo.itens.map((item) => {
                  const ativo = value.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => alternar(item.value)}
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
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--c-text-3)',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
