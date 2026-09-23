'use client'

import { useState } from 'react'
import { IconCircleCheckFilled, IconCircleX } from '@tabler/icons-react'
import Icone from '../Icone'
import { Cartao, IconeRedondo, LinkAcao, TituloSecao } from './ui'
import type { PaginaPublica } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

type Catalogo = ReturnType<typeof useCatalogo>

// Nível do grupo: proporção dos recursos do grupo que o local marcou (0 a 5)
export function nivelDoGrupo(marcados: number, total: number): number {
  if (total === 0 || marcados === 0) return 0
  return Math.max(1, Math.round((marcados / total) * 5))
}

function Bolinhas({ nivel }: { nivel: number }) {
  return (
    <span role="img" aria-label={`Nível ${nivel} de 5`} style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} aria-hidden style={{ width: '12px', height: '12px', borderRadius: '50%', background: i <= nivel ? 'var(--p-accent)' : 'var(--p-soft)', border: i <= nivel ? 'none' : '1px solid var(--p-soft-border)' }} />
      ))}
    </span>
  )
}

export function NivelAcessibilidade({ p, catalogo }: { p: PaginaPublica; catalogo: Catalogo }) {
  const [detalhes, setDetalhes] = useState(false)
  const marcados = new Set(p.recursos_acessibilidade)
  const grupos = catalogo.catalogo.grupos_acessibilidade
    .map((g) => ({ ...g, marcados: g.recursos.filter((r) => marcados.has(r.codigo)) }))
    .filter((g) => g.marcados.length > 0)

  if (grupos.length === 0) return null

  return (
    <Cartao>
      <TituloSecao acao={<LinkAcao onClick={() => setDetalhes((d) => !d)}>{detalhes ? 'Ver resumo' : 'Ver detalhes'}</LinkAcao>}>Nível de acessibilidade</TituloSecao>
      <p style={{ margin: '-0.375rem 0 1rem', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
        Informado pelo empreendimento. O nível mostra quantos recursos de cada grupo o local oferece.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {grupos.map((g) => {
          const nivel = nivelDoGrupo(g.marcados.length, g.recursos.length)
          const lista = detalhes ? g.recursos : g.marcados
          return (
            <div key={g.codigo} style={{ padding: '1rem', borderRadius: '1rem', border: 'var(--c-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <IconeRedondo tamanho={40} cheio>
                  <Icone nome={g.icone} size={22} />
                </IconeRedondo>
                <span style={{ fontWeight: 700, flex: '1 1 140px' }}>{g.rotulo}</span>
                <Bolinhas nivel={nivel} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>{nivel}/5</span>
              </div>
              <ul style={{ listStyle: 'none', margin: '0.75rem 0 0', padding: '0 0 0 3.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {lista.map((r) => {
                  const tem = marcados.has(r.codigo)
                  const obs = p.observacoes_recursos[r.codigo]
                  return (
                    <li key={r.codigo} style={{ fontSize: '0.875rem', color: tem ? 'var(--c-text-1)' : 'var(--c-text-3)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {tem ? <IconCircleCheckFilled size={17} color="var(--p-accent-text)" aria-label="Disponível" /> : <IconCircleX size={17} aria-label="Não disponível" />}
                        {r.rotulo}
                      </span>
                      {tem && obs && <span style={{ display: 'block', paddingLeft: '1.5rem', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>{obs}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </Cartao>
  )
}

export function RecursosEquipamentos({ p, catalogo }: { p: PaginaPublica; catalogo: Catalogo }) {
  const recursos = p.recursos_acessibilidade.map((c) => catalogo.recursos[c]).filter(Boolean)
  if (recursos.length === 0) return null

  return (
    <Cartao>
      <TituloSecao>Recursos e equipamentos</TituloSecao>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: '0.75rem 0.5rem' }}>
        {recursos.map((r) => (
          <li key={r.codigo} title={p.observacoes_recursos[r.codigo] || undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--p-accent-text)', display: 'flex' }}>
              <Icone nome={r.icone} size={28} stroke={1.6} />
            </span>
            <span style={{ fontSize: '0.75rem', lineHeight: 1.3, color: 'var(--c-text-2)' }}>{r.rotulo}</span>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
