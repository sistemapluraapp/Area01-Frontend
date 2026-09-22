'use client'

import { useState } from 'react'
import type { NecessidadeAcessibilidade } from '@/lib/api'
import { ChevronDownIcon } from './icons'

type Categoria = {
  id: string
  label: string
  itens: { value: NecessidadeAcessibilidade; label: string }[]
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'mobilidade',
    label: 'Mobilidade',
    itens: [
      { value: 'mobilidade_cadeira_rodas', label: 'Uso de cadeira de rodas' },
      { value: 'mobilidade_deslocamento_reduzido', label: 'Deslocamento reduzido' },
      { value: 'mobilidade_amputacao_maos_bracos', label: 'Amputação de mãos/braços' },
      { value: 'mobilidade_amputacao_pes_pernas', label: 'Amputação de pés/pernas' },
      { value: 'mobilidade_bengala_muleta', label: 'Uso de bengala ou muleta' },
    ],
  },
  {
    id: 'visao',
    label: 'Visão',
    itens: [
      { value: 'visao_cego', label: 'Cegueira' },
      { value: 'visao_baixa_visao', label: 'Baixa visão' },
      { value: 'visao_daltonismo', label: 'Daltonismo' },
      { value: 'visao_miopia_severa', label: 'Miopia severa' },
    ],
  },
  {
    id: 'audicao',
    label: 'Audição',
    itens: [
      { value: 'audicao_surdez_total', label: 'Surdez total' },
      { value: 'audicao_baixa_audicao', label: 'Baixa audição' },
      { value: 'audicao_aparelho_auditivo', label: 'Uso de aparelho auditivo' },
      { value: 'audicao_interprete_libras', label: 'Preciso de intérprete de Libras' },
    ],
  },
  {
    id: 'cognitivo',
    label: 'Cognitivo / Neurodivergência',
    itens: [
      { value: 'cognitivo_tea', label: 'TEA (Autismo)' },
      { value: 'cognitivo_tdah', label: 'TDAH' },
      { value: 'cognitivo_deficiencia_intelectual', label: 'Deficiência intelectual' },
      { value: 'cognitivo_sobrecarga_sensorial', label: 'Sensibilidade a estímulos sensoriais' },
    ],
  },
]

export default function AccessibilityTree({
  value,
  onChange,
}: {
  value: NecessidadeAcessibilidade[]
  onChange: (value: NecessidadeAcessibilidade[]) => void
}) {
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>(() => {
    const iniciais: Record<string, boolean> = {}
    for (const cat of CATEGORIAS) {
      iniciais[cat.id] = cat.itens.some((item) => value.includes(item.value))
    }
    return iniciais
  })

  const nenhumaAtiva = value.includes('nenhuma')

  function alternarCategoria(id: string) {
    setExpandidas((atual) => ({ ...atual, [id]: !atual[id] }))
  }

  function alternarNenhuma() {
    onChange(nenhumaAtiva ? [] : ['nenhuma'])
  }

  function alternarItem(item: NecessidadeAcessibilidade) {
    const semNenhuma: NecessidadeAcessibilidade[] = value.filter((v) => v !== 'nenhuma')
    onChange(semNenhuma.includes(item) ? semNenhuma.filter((v) => v !== item) : [...semNenhuma, item])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <button
        type="button"
        onClick={alternarNenhuma}
        style={{
          alignSelf: 'flex-start',
          padding: '0.4rem 0.9375rem',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          border: nenhumaAtiva ? '1px solid rgba(26,122,255,0.65)' : '1px solid var(--c-input-border)',
          background: nenhumaAtiva
            ? 'linear-gradient(135deg,rgba(26,122,255,0.25),rgba(0,98,230,0.18))'
            : 'var(--c-glass-bg-sm)',
          color: nenhumaAtiva ? '#6aadff' : 'var(--c-text-2)',
          boxShadow: nenhumaAtiva ? '0 0 12px rgba(26,122,255,0.18)' : 'none',
          transition: 'all 150ms ease',
        }}
      >
        {nenhumaAtiva && <span style={{ marginRight: '0.3rem', fontSize: '0.625rem' }}>✓</span>}
        Nenhuma necessidade específica
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          opacity: nenhumaAtiva ? 0.4 : 1,
          pointerEvents: nenhumaAtiva ? 'none' : 'auto',
          transition: 'opacity 150ms ease',
        }}
      >
        {CATEGORIAS.map((cat) => {
          const selecionadasNaCategoria = cat.itens.filter((item) => value.includes(item.value)).length
          const aberta = expandidas[cat.id]
          return (
            <div
              key={cat.id}
              style={{
                border: '1px solid var(--c-input-border)',
                borderRadius: '0.875rem',
                overflow: 'hidden',
                background: 'var(--c-glass-bg-sm)',
              }}
            >
              <button
                type="button"
                onClick={() => alternarCategoria(cat.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.75rem 0.9375rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--c-text-1)' }}>{cat.label}</span>
                  {selecionadasNaCategoria > 0 && (
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
                      {selecionadasNaCategoria}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    color: 'var(--c-text-3)',
                    display: 'inline-flex',
                    transform: aberta ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 180ms ease',
                  }}
                >
                  <ChevronDownIcon />
                </span>
              </button>

              {aberta && (
                <div style={{ padding: '0 0.9375rem 0.875rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cat.itens.map((item) => {
                    const ativo = value.includes(item.value)
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => alternarItem(item.value)}
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
                            : 'var(--c-glass-bg)',
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
              )}
            </div>
          )
        })}
      </div>

      <p style={{ marginTop: '0.125rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>
        múltipla escolha, agrupada por categoria
      </p>
    </div>
  )
}
