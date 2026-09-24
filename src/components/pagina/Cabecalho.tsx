'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowLeft,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconCheck,
  IconCopy,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconNavigation,
  IconPhoto,
  IconShare,
  IconHandLoveYou,
} from '@tabler/icons-react'
import Icone from '../Icone'
import { BotaoContorno, Estrelas, IconeRedondo, Modal, formatarNota } from './ui'
import { linkCompartilhamento, type PaginaPublica } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

type Catalogo = ReturnType<typeof useCatalogo>

export function urlComoChegar(p: PaginaPublica): string {
  const destino = p.latitude != null && p.longitude != null ? `${p.latitude},${p.longitude}` : [p.endereco, p.cidade, p.uf].filter(Boolean).join(', ')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`
}

export function urlWhatsapp(p: PaginaPublica): string | null {
  if (!p.whatsapp) return null
  const mensagem = `Olá! Vi a página de ${p.nome} na Plura e gostaria de mais informações.`
  return `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

function distanciaKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

// Distância até o visitante. Só pede a localização quando a pessoa clica;
// se ela já autorizou antes, calcula direto.
export function useDistancia(lat: number | null, lon: number | null) {
  const [km, setKm] = useState<number | null>(null)
  const [estado, setEstado] = useState<'inicial' | 'buscando' | 'negado'>('inicial')

  function calcular() {
    if (lat == null || lon == null || !navigator.geolocation) return
    setEstado('buscando')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setKm(distanciaKm({ lat: pos.coords.latitude, lon: pos.coords.longitude }, { lat, lon }))
        setEstado('inicial')
      },
      () => setEstado('negado'),
      { maximumAge: 10 * 60 * 1000, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (lat == null || lon == null || !navigator.permissions) return
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((r) => r.state === 'granted' && calcular())
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon])

  const texto = km == null ? null : km < 1 ? `a ${Math.round(km * 1000)} m de você` : `a ${km.toLocaleString('pt-BR', { maximumFractionDigits: km < 10 ? 1 : 0 })} km de você`
  return { texto, estado, calcular, disponivel: lat != null && lon != null }
}

function ModalCompartilhar({ p, onClose }: { p: PaginaPublica; onClose: () => void }) {
  const [copiado, setCopiado] = useState(false)
  const link = linkCompartilhamento(p.id)
  const texto = `${p.nome}${p.descricao_curta ? ` — ${p.descricao_curta}` : ''}`
  const opcoes = [
    { rotulo: 'WhatsApp', Icone: IconBrandWhatsapp, cor: '#16a34a', href: `https://wa.me/?text=${encodeURIComponent(`${texto}\n${link}`)}` },
    { rotulo: 'Facebook', Icone: IconBrandFacebook, cor: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}` },
  ]

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      window.prompt('Copie o link:', link)
    }
  }

  return (
    <Modal titulo="Compartilhar" onClose={onClose} largura={440}>
      <p style={{ fontSize: '0.875rem', color: 'var(--c-text-2)', marginBottom: '1rem', lineHeight: 1.55 }}>
        O link mostra a capa, o nome e a descrição do lugar. Quem ainda não tem conta na Plura será convidado a se cadastrar para ver a página completa.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {opcoes.map(({ rotulo, Icone: I, cor, href }) => (
          <a key={rotulo} href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.875rem', border: 'var(--c-border)', color: 'var(--c-text-1)', textDecoration: 'none', fontWeight: 600 }}>
            <I size={22} color={cor} /> {rotulo}
          </a>
        ))}
        <button type="button" onClick={copiar} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.875rem', border: 'var(--c-border)', background: 'transparent', color: 'var(--c-text-1)', fontWeight: 600, fontFamily: 'inherit', fontSize: '1rem', cursor: 'pointer' }}>
          {copiado ? <IconCheck size={22} color="var(--c-success-text)" aria-hidden /> : <IconCopy size={22} aria-hidden />} {copiado ? 'Link copiado!' : 'Copiar link'}
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', marginTop: '0.875rem' }}>No Instagram, cole o link copiado nos stories ou na bio.</p>
    </Modal>
  )
}

export default function Cabecalho({
  p,
  catalogo,
  favoritado,
  onFavoritar,
  onVerGaleria,
  totalMidias,
}: {
  p: PaginaPublica
  catalogo: Catalogo
  favoritado: boolean
  onFavoritar: () => void
  onVerGaleria: () => void
  totalMidias: number
}) {
  const router = useRouter()
  const [compartilhando, setCompartilhando] = useState(false)
  const distancia = useDistancia(p.latitude, p.longitude)
  const categoria = p.categoria ? catalogo.categorias[p.categoria] : null
  const whatsapp = urlWhatsapp(p)
  const local = [p.cidade, p.uf].filter(Boolean).join(', ')
  const inicial = p.nome.trim()[0]?.toUpperCase() ?? '?'

  async function compartilhar() {
    const dados = { title: p.nome, text: p.descricao_curta ?? p.subtitulo ?? p.nome, url: linkCompartilhamento(p.id) }
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share(dados)
        return
      } catch {
        // cancelado ou indisponível: mostra as opções
      }
    }
    setCompartilhando(true)
  }

  const destaques = p.destaques_acessibilidade.map((c) => catalogo.recursos[c]).filter(Boolean)

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div
          role={p.capa_url ? 'img' : undefined}
          aria-label={p.capa_url ? `Capa de ${p.nome}` : undefined}
          style={{ position: 'relative', aspectRatio: '16 / 9', maxHeight: '420px', width: '100%', borderRadius: '1.5rem', overflow: 'hidden', background: p.capa_url ? `url("${p.capa_url}") center/cover no-repeat` : 'linear-gradient(135deg, var(--p-accent), color-mix(in srgb, var(--p-accent) 55%, #000))' }}
        >
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.45) 100%)' }} />
          <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))} aria-label="Voltar" style={{ position: 'absolute', top: '0.875rem', left: '0.875rem', width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
            <IconArrowLeft size={22} aria-hidden />
          </button>
          {totalMidias > 0 && (
            <button type="button" onClick={onVerGaleria} style={{ position: 'absolute', right: '0.875rem', bottom: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.55)', color: '#fff', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
              <IconPhoto size={16} aria-hidden /> Ver galeria ({totalMidias})
            </button>
          )}
        </div>
        <div
          aria-hidden={!!p.logo_url}
          style={{ position: 'absolute', left: '1.25rem', bottom: '-48px', width: '112px', height: '112px', borderRadius: '50%', border: '4px solid var(--c-glass-bg-lg)', background: p.logo_url ? `#fff url("${p.logo_url}") center/cover no-repeat` : 'var(--p-accent)', color: 'var(--p-accent-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
        >
          {!p.logo_url && inicial}
        </div>
      </div>

      <div style={{ padding: '3.75rem 0.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: 'clamp(1.625rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>{p.nome}</h1>
        {p.subtitulo && <p style={{ margin: 0, color: 'var(--c-text-2)', fontSize: '1rem' }}>{p.subtitulo}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.9375rem' }}>
          {p.nota_media != null ? (
            <>
              <Estrelas nota={p.nota_media} />
              <strong>{formatarNota(p.nota_media)}</strong>
              <span style={{ color: 'var(--c-text-2)' }}>({p.total_avaliacoes} {p.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'})</span>
            </>
          ) : (
            <span style={{ color: 'var(--c-text-2)' }}>Ainda sem avaliações</span>
          )}
        </div>

        {(local || distancia.disponivel) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>
            {local && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconMapPin size={17} color="var(--p-accent-text)" aria-hidden /> {local}
              </span>
            )}
            {distancia.texto ? (
              <span>· {distancia.texto}</span>
            ) : distancia.disponivel && distancia.estado !== 'negado' ? (
              <button type="button" onClick={distancia.calcular} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--p-accent-text)', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer' }}>
                · {distancia.estado === 'buscando' ? 'calculando…' : 'ver distância'}
              </button>
            ) : null}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {categoria && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'var(--p-soft)', color: 'var(--p-accent-text)', fontSize: '0.8125rem', fontWeight: 700 }}>
              <Icone nome={categoria.icone} size={15} /> {categoria.rotulo}
            </span>
          )}
          {p.video_libras && (
            <a href="#libras" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--p-soft-border)', color: 'var(--p-accent-text)', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none' }}>
              <IconHandLoveYou size={15} aria-hidden /> Apresentação em Libras
            </a>
          )}
          {p.faixa_preco && (
            <span title="Faixa de preço" style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--c-divider)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--c-text-2)' }}>
              {'$'.repeat(p.faixa_preco)}
              <span style={{ opacity: 0.3 }}>{'$'.repeat(4 - p.faixa_preco)}</span>
            </span>
          )}
        </div>

        {p.slogan && <p style={{ margin: '0.25rem 0 0', fontSize: '1.0625rem', fontWeight: 600, fontStyle: 'italic' }}>“{p.slogan}”</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: whatsapp ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '1.25rem' }}>
        {whatsapp && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem 1rem', borderRadius: '0.75rem', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none', boxShadow: '0 6px 18px color-mix(in srgb, var(--p-accent) 35%, transparent)' }}>
            <IconBrandWhatsapp size={19} aria-hidden /> Entrar em contato
          </a>
        )}
        <a href={urlComoChegar(p)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem 0.95rem', borderRadius: '0.75rem', border: '1px solid var(--p-soft-border)', background: 'var(--c-glass-bg-lg)', color: 'var(--p-accent-text)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
          <IconNavigation size={18} aria-hidden /> Como chegar
        </a>
        <BotaoContorno onClick={onFavoritar} rotulo={favoritado ? 'Remover dos destinos salvos' : 'Salvar destino'}>
          {favoritado ? <IconHeartFilled size={18} color="#ef4444" aria-hidden /> : <IconHeart size={18} aria-hidden />} {favoritado ? 'Salvo' : 'Salvar destino'}
        </BotaoContorno>
        <BotaoContorno onClick={compartilhar}>
          <IconShare size={18} aria-hidden /> Compartilhar
        </BotaoContorno>
      </div>

      {destaques.length > 0 && (
        <ul aria-label="Principais recursos de acessibilidade" style={{ listStyle: 'none', margin: '1.25rem 0 0', padding: 0, display: 'grid', gridTemplateColumns: `repeat(${Math.min(destaques.length, 4)}, minmax(0, 1fr))`, gap: '0.5rem' }}>
          {destaques.map((r) => (
            <li key={r.codigo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 0.375rem', borderRadius: '1rem', background: 'var(--c-glass-bg-lg)', border: 'var(--c-border)', textAlign: 'center' }}>
              <IconeRedondo tamanho={48} cheio>
                <Icone nome={r.icone} size={26} />
              </IconeRedondo>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.25 }}>{r.rotulo}</span>
            </li>
          ))}
        </ul>
      )}

      {compartilhando && <ModalCompartilhar p={p} onClose={() => setCompartilhando(false)} />}
    </>
  )
}
