'use client'

import { useState, type ReactNode } from 'react'
import { IconBrandInstagram, IconBrandWhatsapp, IconBus, IconCar, IconChevronDown, IconMapPin, IconWheelchair, IconWorld } from '@tabler/icons-react'
import { Cartao, LinkAcao, TituloSecao } from './ui'
import { urlComoChegar, urlWhatsapp, useDistancia } from './Cabecalho'
import type { PaginaPublica } from '@/lib/api'

function Rota({ icone, titulo, texto, destaque }: { icone: ReactNode; titulo: string; texto: string; destaque?: boolean }) {
  const [aberto, setAberto] = useState(!!destaque)
  return (
    <div style={{ borderRadius: '0.875rem', border: destaque ? '1px solid var(--p-soft-border)' : 'var(--c-border)', background: destaque ? 'var(--p-soft)' : 'transparent' }}>
      <button type="button" aria-expanded={aberto} onClick={() => setAberto((a) => !a)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 0.875rem', background: 'none', border: 'none', color: 'var(--c-text-1)', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: 'var(--p-accent-text)', display: 'flex' }}>{icone}</span>
        <span style={{ flex: 1 }}>{titulo}</span>
        <IconChevronDown size={18} style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} aria-hidden />
      </button>
      {aberto && <p style={{ margin: 0, padding: '0 0.875rem 0.875rem 2.75rem', fontSize: '0.9rem', color: 'var(--c-text-2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{texto}</p>}
    </div>
  )
}

export function Localizacao({ p }: { p: PaginaPublica }) {
  const distancia = useDistancia(p.latitude, p.longitude)
  const temCoordenadas = p.latitude != null && p.longitude != null
  const endereco = [p.endereco, p.complemento].filter(Boolean).join(' · ')
  const cidade = [p.cidade, p.uf].filter(Boolean).join(' - ')
  if (!temCoordenadas && !endereco && !cidade) return null

  const d = 0.004
  const mapa = temCoordenadas
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude! - d},${p.latitude! - d * 0.6},${p.longitude! + d},${p.latitude! + d * 0.6}&layer=mapnik&marker=${p.latitude},${p.longitude}`
    : null

  return (
    <Cartao>
      <TituloSecao acao={<LinkAcao href={urlComoChegar(p)}>Abrir no mapa</LinkAcao>}>Como chegar</TituloSecao>
      {mapa && (
        <iframe
          title={`Mapa com a localização de ${p.nome}`}
          src={mapa}
          loading="lazy"
          style={{ width: '100%', height: '220px', border: 0, borderRadius: '1rem', marginBottom: '0.875rem', filter: 'var(--mapa-filtro, none)' }}
        />
      )}
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
        <IconMapPin size={20} color="var(--p-accent-text)" style={{ flexShrink: 0, marginTop: '0.1rem' }} aria-hidden />
        <div style={{ fontSize: '0.9375rem', lineHeight: 1.55 }}>
          {endereco && <p style={{ margin: 0, fontWeight: 600 }}>{endereco}</p>}
          {cidade && <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{cidade}{p.cep ? ` · CEP ${p.cep}` : ''}</p>}
          {p.ponto_referencia && <p style={{ margin: '0.25rem 0 0', color: 'var(--c-text-2)' }}>Referência: {p.ponto_referencia}</p>}
          {distancia.texto && <p style={{ margin: '0.25rem 0 0', color: 'var(--p-accent-text)', fontWeight: 600 }}>{distancia.texto}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {p.rota_acessivel && <Rota icone={<IconWheelchair size={20} />} titulo="Como chegar com cadeira de rodas" texto={p.rota_acessivel} destaque />}
        {p.como_chegar_carro && <Rota icone={<IconCar size={20} />} titulo="Como chegar de carro" texto={p.como_chegar_carro} />}
        {p.como_chegar_transporte && <Rota icone={<IconBus size={20} />} titulo="Como chegar de transporte público" texto={p.como_chegar_transporte} />}
      </div>
    </Cartao>
  )
}

export function Contato({ p }: { p: PaginaPublica }) {
  const whatsapp = urlWhatsapp(p)
  const instagram = p.instagram?.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
  const site = p.website
  if (!whatsapp && !instagram && !site) return null

  const numero = p.whatsapp?.replace(/^55/, '')
  const telefone = numero ? (numero.length === 11 ? `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}` : `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`) : null

  const itens = [
    whatsapp && { href: whatsapp, rotulo: 'WhatsApp', valor: telefone, Icone: IconBrandWhatsapp, cor: '#16a34a' },
    instagram && { href: `https://instagram.com/${instagram}`, rotulo: 'Instagram', valor: `@${instagram}`, Icone: IconBrandInstagram, cor: '#e1306c' },
    site && { href: site, rotulo: 'Site', valor: site.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), Icone: IconWorld, cor: 'var(--p-accent-text)' },
  ].filter(Boolean) as { href: string; rotulo: string; valor: string | null; Icone: typeof IconWorld; cor: string }[]

  return (
    <Cartao>
      <TituloSecao>Contato e redes sociais</TituloSecao>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
        {itens.map(({ href, rotulo, valor, Icone: I, cor }) => (
          <li key={rotulo}>
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', borderRadius: '0.875rem', border: 'var(--c-border)', textDecoration: 'none', color: 'var(--c-text-1)' }}>
              <I size={26} color={cor} aria-hidden />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>{rotulo}</span>
                {valor && <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--c-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{valor}</span>}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
