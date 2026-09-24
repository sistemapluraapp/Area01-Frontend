'use client'

import { useMemo, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconExternalLink, IconPlayerPlayFilled, IconView360 } from '@tabler/icons-react'
import { Cartao, Modal, TituloSecao } from './ui'
import type { Midia, PaginaPublica } from '@/lib/api'

const CATEGORIAS: Record<string, string> = {
  ambiente: 'Ambiente',
  entrada: 'Entrada',
  acessibilidade: 'Acessibilidade',
  banheiros: 'Banheiros',
  quartos: 'Quartos',
  cardapio: 'Cardápio',
  equipe: 'Equipe',
  equipamentos: 'Equipamentos',
  trilhas: 'Trilhas',
  piscina: 'Piscina',
  area_externa: 'Área externa',
}

const FORMATO: Record<string, string> = { video: 'Vídeo', reel: 'Reel', foto_360: 'Foto 360°', tour_virtual: 'Tour virtual' }

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null
    if (!u.hostname.includes('youtube')) return null
    if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

type Item = Midia & { rotuloFormato?: string }

function Miniatura({ item, onClick, grande }: { item: Item; onClick: () => void; grande?: boolean }) {
  const yt = item.tipo === 'link' ? youtubeId(item.url) : null
  const fundo = item.tipo === 'foto' ? `url("${item.url}") center/cover` : yt ? `url(https://img.youtube.com/vi/${yt}/hqdefault.jpg) center/cover` : 'linear-gradient(135deg, var(--p-accent), color-mix(in srgb, var(--p-accent) 50%, #000))'
  const e360 = item.formato === 'foto_360' || item.formato === 'tour_virtual'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.texto_alt || item.legenda || (item.tipo === 'foto' ? 'Abrir foto' : `Abrir ${FORMATO[item.formato ?? 'video'] ?? 'vídeo'}`)}
      style={{ position: 'relative', gridColumn: grande ? 'span 2' : undefined, gridRow: grande ? 'span 2' : undefined, aspectRatio: '1', border: 'none', padding: 0, borderRadius: '0.875rem', overflow: 'hidden', background: fundo, cursor: 'pointer' }}
    >
      {item.tipo === 'link' && (
        <>
          <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
          <span aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {e360 ? <IconView360 size={24} aria-hidden /> : <IconPlayerPlayFilled size={22} aria-hidden />}
          </span>
          <span style={{ position: 'absolute', left: '0.5rem', bottom: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6875rem', fontWeight: 700 }}>{FORMATO[item.formato ?? 'video']}</span>
        </>
      )}
    </button>
  )
}

function Visualizador({ itens, indice, onMudar, onClose }: { itens: Item[]; indice: number; onMudar: (i: number) => void; onClose: () => void }) {
  const item = itens[indice]
  const yt = item.tipo === 'link' ? youtubeId(item.url) : null
  const navegar = (d: number) => onMudar((indice + d + itens.length) % itens.length)

  return (
    <Modal titulo={item.legenda || (item.tipo === 'foto' ? `Foto ${indice + 1} de ${itens.length}` : FORMATO[item.formato ?? 'video'])} onClose={onClose} largura={880}>
      <div style={{ position: 'relative' }}>
        {item.tipo === 'foto' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.texto_alt ?? item.legenda ?? ''} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '0.875rem', background: '#000' }} />
        ) : yt ? (
          <iframe title={item.legenda || 'Vídeo do YouTube'} src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&cc_load_policy=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ width: '100%', aspectRatio: '16 / 9', border: 0, borderRadius: '0.875rem' }} />
        ) : (
          <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--c-text-2)' }}>Este conteúdo abre no site de origem ({item.plataforma}).</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.125rem', borderRadius: '0.75rem', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, textDecoration: 'none' }}>
              Abrir {FORMATO[item.formato ?? 'video']?.toLowerCase()} <IconExternalLink size={16} aria-hidden />
            </a>
          </div>
        )}
        {itens.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <button type="button" onClick={() => navegar(-1)} aria-label="Anterior" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.875rem', borderRadius: '9999px', border: 'var(--c-border)', background: 'transparent', color: 'var(--c-text-1)', fontFamily: 'inherit', cursor: 'pointer' }}>
              <IconChevronLeft size={18} aria-hidden /> Anterior
            </button>
            <button type="button" onClick={() => navegar(1)} aria-label="Próxima" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.875rem', borderRadius: '9999px', border: 'var(--c-border)', background: 'transparent', color: 'var(--c-text-1)', fontFamily: 'inherit', cursor: 'pointer' }}>
              Próxima <IconChevronRight size={18} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export function itensDaGaleria(p: PaginaPublica): Item[] {
  const itens: Item[] = [...p.midias]
  if (p.video_apresentacao) {
    itens.unshift({ id: 'apresentacao', tipo: 'link', url: p.video_apresentacao, plataforma: 'youtube', formato: 'video', categoria: null, legenda: 'Vídeo de apresentação', texto_alt: null, ordem: -1 })
  }
  return itens
}

export default function Galeria({ p, id }: { p: PaginaPublica; id: string }) {
  const [filtro, setFiltro] = useState('todas')
  const [aberto, setAberto] = useState<number | null>(null)
  const itens = useMemo(() => itensDaGaleria(p), [p])

  const abas = useMemo(() => {
    const presentes = Object.keys(CATEGORIAS).filter((c) => itens.some((i) => i.tipo === 'foto' && i.categoria === c))
    return [
      { id: 'todas', rotulo: 'Todas' },
      ...presentes.map((c) => ({ id: c, rotulo: CATEGORIAS[c] })),
      ...(itens.some((i) => i.tipo === 'link') ? [{ id: 'videos', rotulo: 'Vídeos e 360°' }] : []),
    ]
  }, [itens])

  if (itens.length === 0) return null

  const visiveis = filtro === 'todas' ? itens : filtro === 'videos' ? itens.filter((i) => i.tipo === 'link') : itens.filter((i) => i.categoria === filtro)

  return (
    <Cartao id={id}>
      <TituloSecao>Galeria de fotos e vídeos</TituloSecao>
      {abas.length > 2 && (
        <div role="tablist" aria-label="Filtrar galeria" style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '0.625rem', marginBottom: '0.375rem' }}>
          {abas.map((a) => (
            <button key={a.id} role="tab" aria-selected={filtro === a.id} onClick={() => setFiltro(a.id)} style={{ flexShrink: 0, padding: '0.375rem 0.875rem', borderRadius: '9999px', border: filtro === a.id ? 'none' : '1px solid var(--c-divider)', background: filtro === a.id ? 'var(--p-accent)' : 'transparent', color: filtro === a.id ? 'var(--p-accent-contrast)' : 'var(--c-text-2)', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
              {a.rotulo}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {visiveis.map((item, i) => (
          <Miniatura key={item.id} item={item} grande={i === 0 && visiveis.length >= 5} onClick={() => setAberto(i)} />
        ))}
      </div>
      {aberto !== null && <Visualizador itens={visiveis} indice={aberto} onMudar={setAberto} onClose={() => setAberto(null)} />}
    </Cartao>
  )
}
