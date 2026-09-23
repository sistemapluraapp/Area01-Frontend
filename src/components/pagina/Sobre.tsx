'use client'

import { IconStarFilled } from '@tabler/icons-react'
import Icone from '../Icone'
import { Cartao, TextoFormatado, TituloSecao } from './ui'
import type { PaginaPublica } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

export default function Sobre({ p, catalogo }: { p: PaginaPublica; catalogo: ReturnType<typeof useCatalogo> }) {
  const tags = p.tags.map((t) => catalogo.tags[t]).filter(Boolean)
  if (!p.descricao && !p.diferencial && tags.length === 0) return null

  return (
    <Cartao>
      <TituloSecao>Sobre o empreendimento</TituloSecao>
      {p.descricao && (
        <div style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>
          <TextoFormatado texto={p.descricao} />
        </div>
      )}
      {p.diferencial && (
        <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', borderRadius: '1rem', background: 'var(--p-soft)', margin: '0.5rem 0 1rem' }}>
          <IconStarFilled size={20} color="var(--p-accent-text)" style={{ flexShrink: 0, marginTop: '0.125rem' }} aria-hidden />
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>Diferencial</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.6 }}>{p.diferencial}</p>
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <ul aria-label="Tags" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {tags.map((t) => (
            <li key={t.codigo} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--p-soft-border)', color: 'var(--p-accent-text)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Icone nome={t.icone} size={14} /> {t.rotulo}
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  )
}
