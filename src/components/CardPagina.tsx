'use client'

import { IconHeart, IconHeartFilled, IconMapPin, IconStarFilled } from '@tabler/icons-react'
import Icone from './Icone'
import type { PaginaCard } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

// Card de empreendimento (busca, destinos salvos e "Você também pode gostar")
export default function CardPagina({
  p,
  catalogo,
  compacto = false,
  favoritado,
  onFavoritar,
}: {
  p: PaginaCard
  catalogo: ReturnType<typeof useCatalogo>
  compacto?: boolean
  favoritado?: boolean
  onFavoritar?: () => void
}) {
  const categoria = p.categoria ? catalogo.categorias[p.categoria] : null
  const destaques = (p.destaques_acessibilidade?.length ? p.destaques_acessibilidade : p.recursos_acessibilidade ?? []).slice(0, 4).map((c) => catalogo.recursos[c]).filter(Boolean)
  const local = [p.cidade, p.uf].filter(Boolean).join(', ')

  return (
    <article data-tema={p.tema ?? 'plura'} style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', background: 'var(--c-glass-bg-lg)', border: 'var(--c-border)', boxShadow: 'var(--c-shadow-sm)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <a href={`/pagina?id=${p.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div aria-hidden style={{ position: 'relative', aspectRatio: compacto ? '4 / 3' : '16 / 9', background: p.capa_url ? `url("${p.capa_url}") center/cover` : 'linear-gradient(135deg, var(--p-accent), color-mix(in srgb, var(--p-accent) 55%, #000))' }}>
          {categoria && (
            <span style={{ position: 'absolute', top: '0.625rem', left: '0.625rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700 }}>
              <Icone nome={categoria.icone} size={13} /> {categoria.rotulo}
            </span>
          )}
          {!compacto && (
            <span style={{ position: 'absolute', left: '0.75rem', bottom: '-20px', width: '44px', height: '44px', borderRadius: '50%', border: '3px solid var(--c-glass-bg-lg)', background: p.logo_url ? `#fff url("${p.logo_url}") center/cover` : 'var(--p-accent)', color: 'var(--p-accent-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {!p.logo_url && p.nome.trim()[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ padding: compacto ? '0.75rem' : '1.625rem 0.95rem 0.95rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: compacto ? '0.9375rem' : '1.0625rem', fontWeight: 700, lineHeight: 1.25 }}>{p.nome}</h3>
          {p.subtitulo && <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>{p.subtitulo}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>
            {p.nota_media != null && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, color: 'var(--c-text-1)' }}>
                <IconStarFilled size={14} color="#f59e0b" aria-hidden /> {p.nota_media.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                <span style={{ fontWeight: 400, color: 'var(--c-text-3)' }}>({p.total_avaliacoes})</span>
              </span>
            )}
            {local && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <IconMapPin size={14} aria-hidden /> {local}
              </span>
            )}
          </div>
          {!compacto && p.descricao_curta && <p style={{ margin: '0.125rem 0 0', fontSize: '0.875rem', color: 'var(--c-text-2)', lineHeight: 1.45 }}>{p.descricao_curta}</p>}
          {destaques.length > 0 && (
            <ul aria-label="Recursos de acessibilidade" style={{ listStyle: 'none', margin: 'auto 0 0', padding: '0.375rem 0 0', display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {destaques.map((r) => (
                <li key={r.codigo} title={r.rotulo} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--p-soft)', color: 'var(--p-accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icone nome={r.icone} size={17} />
                  <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{r.rotulo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </a>
      {onFavoritar && (
        <button type="button" onClick={onFavoritar} aria-label={favoritado ? `Remover ${p.nome} dos destinos salvos` : `Salvar ${p.nome} nos destinos`} aria-pressed={favoritado} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: favoritado ? '#ef4444' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {favoritado ? <IconHeartFilled size={19} /> : <IconHeart size={19} />}
        </button>
      )}
    </article>
  )
}
