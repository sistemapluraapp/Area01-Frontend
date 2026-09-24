'use client'

import { useState } from 'react'
import { IconExternalLink, IconEye, IconHandLoveYou, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Cartao, TextoFormatado, TituloSecao } from './ui'
import { youtubeId } from './Galeria'
import type { PaginaPublica } from '@/lib/api'

// Vídeo com intérprete apresentando o lugar em Libras. Só carrega o player
// do YouTube quando a pessoa toca em "Assistir" (a página não fica pesada).
export function ApresentacaoLibras({ p }: { p: PaginaPublica }) {
  const [tocando, setTocando] = useState(false)
  if (!p.video_libras) return null
  const id = youtubeId(p.video_libras)

  return (
    <Cartao id="libras">
      <TituloSecao id="titulo-libras">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconHandLoveYou size={22} aria-hidden style={{ color: 'var(--p-accent-text)' }} /> Apresentação em Libras
        </span>
      </TituloSecao>
      <p style={{ margin: '0 0 0.875rem', fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>Vídeo com intérprete de Libras apresentando o lugar.</p>
      {id ? (
        tocando ? (
          <iframe
            title={`Apresentação em Libras de ${p.nome}`}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&cc_load_policy=1&hl=pt-BR`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: '1rem', background: '#000' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setTocando(true)}
            aria-label={`Assistir à apresentação em Libras de ${p.nome}`}
            style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', border: 'none', borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', background: `#000 url("https://i.ytimg.com/vi/${id}/hqdefault.jpg") center/cover`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '9999px', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 800, fontSize: '1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              <IconPlayerPlayFilled size={20} /> Assistir
            </span>
          </button>
        )
      ) : (
        <a href={p.video_libras} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--p-accent-text)', fontWeight: 700 }}>
          Abrir vídeo em Libras <IconExternalLink size={16} aria-hidden />
        </a>
      )}
    </Cartao>
  )
}

// Descrição do ambiente e do percurso, escrita pela empresa para quem não
// enxerga (e útil para todos): entrada, piso, obstáculos, onde fica cada coisa.
export function ComoEOLugar({ p }: { p: PaginaPublica }) {
  if (!p.como_e_o_lugar) return null
  return (
    <Cartao id="como-e-o-lugar">
      <TituloSecao>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconEye size={22} aria-hidden style={{ color: 'var(--p-accent-text)' }} /> Como é o lugar
        </span>
      </TituloSecao>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>Descrição do ambiente e do percurso, pensada para pessoas cegas ou com baixa visão.</p>
      <div style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>
        <TextoFormatado texto={p.como_e_o_lugar} />
      </div>
    </Cartao>
  )
}
