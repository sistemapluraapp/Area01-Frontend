'use client'

import { useState } from 'react'
import { IconClock, IconCurrencyReal, IconMapPin, IconMountain, IconUsers } from '@tabler/icons-react'
import Icone from '../Icone'
import { Cartao, Modal, TextoFormatado, TituloSecao } from './ui'
import type { Experiencia, PaginaPublica } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

const NIVEL: Record<string, string> = { todos: 'Todos os níveis', facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' }

function preco(valor: number | null) {
  return valor == null ? null : `A partir de ${Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} por pessoa`
}

function Info({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>
      <span style={{ color: 'var(--p-accent-text)', display: 'flex' }}>{icone}</span>
      {children}
    </span>
  )
}

export default function Experiencias({ p, catalogo }: { p: PaginaPublica; catalogo: ReturnType<typeof useCatalogo> }) {
  const [aberta, setAberta] = useState<Experiencia | null>(null)
  if (p.experiencias.length === 0) return null

  return (
    <Cartao>
      <TituloSecao>Experiências</TituloSecao>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {p.experiencias.map((e) => (
          <article key={e.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px, 40%) 1fr', borderRadius: '1rem', overflow: 'hidden', border: 'var(--c-border)' }}>
            <div aria-hidden style={{ minHeight: '150px', background: e.imagem_url ? `url("${e.imagem_url}") center/cover` : 'var(--p-soft)' }} />
            <div style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{e.nome}</h3>
              {e.duracao && <Info icone={<IconClock size={16} />}>{e.duracao}</Info>}
              {preco(e.preco_a_partir) && <Info icone={<IconCurrencyReal size={16} />}>{preco(e.preco_a_partir)}</Info>}
              {e.nivel_dificuldade && <Info icone={<IconMountain size={16} />}>{NIVEL[e.nivel_dificuldade]}</Info>}
              <button type="button" onClick={() => setAberta(e)} style={{ alignSelf: 'flex-start', marginTop: '0.375rem', padding: '0.45rem 1rem', borderRadius: '0.625rem', border: 'none', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                Saiba mais
              </button>
            </div>
          </article>
        ))}
      </div>

      {aberta && (
        <Modal titulo={aberta.nome} onClose={() => setAberta(null)}>
          {aberta.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={aberta.imagem_url} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: '0.875rem', marginBottom: '1rem' }} />
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem', marginBottom: '1rem' }}>
            {aberta.duracao && <Info icone={<IconClock size={16} />}>{aberta.duracao}</Info>}
            {preco(aberta.preco_a_partir) && <Info icone={<IconCurrencyReal size={16} />}>{preco(aberta.preco_a_partir)}</Info>}
            {aberta.nivel_dificuldade && <Info icone={<IconMountain size={16} />}>{NIVEL[aberta.nivel_dificuldade]}</Info>}
            {aberta.local && <Info icone={<IconMapPin size={16} />}>{aberta.local}</Info>}
            {aberta.faixa_etaria && <Info icone={<IconUsers size={16} />}>{aberta.faixa_etaria}</Info>}
            {aberta.requer_acompanhamento && <Info icone={<IconUsers size={16} />}>Necessário estar acompanhado</Info>}
          </div>
          {aberta.descricao && (
            <div style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>
              <TextoFormatado texto={aberta.descricao} />
            </div>
          )}
          {aberta.acessibilidades.length > 0 && (
            <div style={{ margin: '0.75rem 0' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Acessibilidade</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {aberta.acessibilidades.map((c) => catalogo.recursos[c]).filter(Boolean).map((r) => (
                  <span key={r.codigo} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'var(--p-soft)', color: 'var(--p-accent-text)', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <Icone nome={r.icone} size={15} /> {r.rotulo}
                  </span>
                ))}
              </div>
            </div>
          )}
          {aberta.equipamentos && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Equipamentos fornecidos</p>
              <p style={{ color: 'var(--c-text-2)', whiteSpace: 'pre-line', fontSize: '0.9375rem' }}>{aberta.equipamentos}</p>
            </div>
          )}
          {aberta.o_que_levar && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>O que levar</p>
              <p style={{ color: 'var(--c-text-2)', whiteSpace: 'pre-line', fontSize: '0.9375rem' }}>{aberta.o_que_levar}</p>
            </div>
          )}
        </Modal>
      )}
    </Cartao>
  )
}
