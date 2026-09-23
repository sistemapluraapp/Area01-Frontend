'use client'

import { useState, type FormEvent } from 'react'
import { IconAlertTriangle, IconCircleCheckFilled, IconFlag, IconRosetteDiscountCheck, IconShieldCheck, IconSparkles } from '@tabler/icons-react'
import Icone from '../Icone'
import CardPagina from '../CardPagina'
import { Cartao, IconeRedondo, Modal, TituloSecao } from './ui'
import { api, type MotivoDenuncia, type PaginaPublica } from '@/lib/api'
import type { useCatalogo } from '@/lib/useCatalogo'

type Catalogo = ReturnType<typeof useCatalogo>

export function Recomendacoes({ p, catalogo }: { p: PaginaPublica; catalogo: Catalogo }) {
  if (p.recomendacoes.length === 0) return null
  return (
    <Cartao>
      <TituloSecao>Você também pode gostar</TituloSecao>
      <p style={{ margin: '-0.375rem 0 0.875rem', fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>Lugares com recursos de acessibilidade em comum.</p>
      <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(180px, 1fr)', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {p.recomendacoes.map((r) => (
          <CardPagina key={r.id} p={r} catalogo={catalogo} compacto />
        ))}
      </div>
    </Cartao>
  )
}

export function AntesDeIr({ p, catalogo }: { p: PaginaPublica; catalogo: Catalogo }) {
  const itens = p.antes_de_ir.map((c) => catalogo.antesDeIr[c]).filter(Boolean)
  const extras = (p.antes_de_ir_observacoes ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (itens.length === 0 && extras.length === 0) return null

  return (
    <Cartao style={{ background: 'var(--p-soft)', borderColor: 'var(--p-soft-border)' }}>
      <TituloSecao>Antes de ir</TituloSecao>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem 1rem' }}>
        {itens.map((i) => (
          <li key={i.codigo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
            <span style={{ color: 'var(--p-accent-text)', display: 'flex' }}>
              <Icone nome={i.icone} size={20} />
            </span>
            {i.rotulo}
          </li>
        ))}
        {extras.map((e) => (
          <li key={e} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
            <IconCircleCheckFilled size={20} color="var(--p-accent-text)" aria-hidden /> {e}
          </li>
        ))}
      </ul>
    </Cartao>
  )
}

const SEGURANCA: Record<string, string> = {
  informacoes: 'Informações de segurança',
  requisitos: 'Requisitos da atividade',
  equipamentos: 'Equipamentos disponíveis',
  profissionais: 'Profissionais responsáveis',
  procedimentos: 'Procedimentos de emergência',
  contatos_emergencia: 'Contatos de emergência',
}

export function Seguranca({ p }: { p: PaginaPublica }) {
  const campos = Object.keys(SEGURANCA).filter((k) => p.seguranca?.[k])
  if (campos.length === 0) return null
  return (
    <Cartao>
      <TituloSecao>Segurança</TituloSecao>
      <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {campos.map((k) => (
          <div key={k} style={{ display: 'flex', gap: '0.75rem' }}>
            <IconeRedondo tamanho={36}>
              {k === 'contatos_emergencia' ? <IconAlertTriangle size={18} /> : <IconShieldCheck size={18} />}
            </IconeRedondo>
            <div>
              <dt style={{ fontWeight: 700 }}>{SEGURANCA[k]}</dt>
              <dd style={{ margin: '0.125rem 0 0', color: 'var(--c-text-2)', fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{p.seguranca[k]}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Cartao>
  )
}

// TODO(selos): prévia visual, igual em todas as áreas, até a seção de selos
// e certificações ser desenhada (landing page + solicitação à Área 04).
export function SelosPrevia() {
  return (
    <Cartao style={{ borderStyle: 'dashed' }}>
      <TituloSecao
        acao={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'var(--p-soft)', color: 'var(--p-accent-text)' }}>
            <IconSparkles size={14} /> Em breve
          </span>
        }
      >
        Selos e certificações
      </TituloSecao>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-text-2)', fontSize: '0.9rem' }}>
        <IconRosetteDiscountCheck size={32} color="var(--p-accent-text)" aria-hidden />
        Em breve, selos mostrarão quais informações de acessibilidade deste local foram verificadas pela Plura.
      </div>
    </Cartao>
  )
}

const MOTIVOS: { valor: MotivoDenuncia; rotulo: string }[] = [
  { valor: 'recurso_nao_existe', rotulo: 'Recurso não existe' },
  { valor: 'acessibilidade_diferente', rotulo: 'Acessibilidade diferente da descrita' },
  { valor: 'horario_incorreto', rotulo: 'Horário incorreto' },
  { valor: 'local_fechado', rotulo: 'Local fechado' },
  { valor: 'informacao_desatualizada', rotulo: 'Informação desatualizada' },
  { valor: 'outro', rotulo: 'Outro' },
]

export function Denunciar({ p }: { p: PaginaPublica }) {
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState<MotivoDenuncia | ''>('')
  const [comentario, setComentario] = useState('')
  const [estado, setEstado] = useState<'form' | 'enviando' | 'enviado'>('form')
  const [erro, setErro] = useState('')

  function fechar() {
    setAberto(false)
    setEstado('form')
    setMotivo('')
    setComentario('')
    setErro('')
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!motivo) return setErro('Escolha o que está incorreto.')
    setEstado('enviando')
    setErro('')
    try {
      await api.denunciar(p.id, { motivo, comentario: comentario.trim() || undefined })
      setEstado('enviado')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar')
      setEstado('form')
    }
  }

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--c-text-2)', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
        <IconFlag size={16} aria-hidden /> Essa informação está incorreta?
      </button>
      {aberto && (
        <Modal titulo="Essa informação está incorreta?" onClose={fechar} largura={480}>
          {estado === 'enviado' ? (
            <div style={{ textAlign: 'center' }}>
              <IconCircleCheckFilled size={48} color="var(--c-success-text)" aria-hidden />
              <p style={{ fontWeight: 700, margin: '0.75rem 0 0.375rem' }}>Obrigado por avisar!</p>
              <p style={{ color: 'var(--c-text-2)', lineHeight: 1.6 }}>A equipe da Plura vai analisar e corrigir a informação, se necessário.</p>
              <button type="button" onClick={fechar} style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={enviar}>
              <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>O que está incorreto?</legend>
                {MOTIVOS.map((m) => (
                  <label key={m.valor} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', border: motivo === m.valor ? '1px solid var(--p-soft-border)' : '1px solid var(--c-divider)', background: motivo === m.valor ? 'var(--p-soft)' : 'transparent', cursor: 'pointer' }}>
                    <input type="radio" name="motivo" value={m.valor} checked={motivo === m.valor} onChange={() => setMotivo(m.valor)} style={{ accentColor: 'var(--p-accent)' }} />
                    {m.rotulo}
                  </label>
                ))}
              </fieldset>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '1rem', fontWeight: 600 }}>
                Comentário {motivo === 'outro' ? '(obrigatório)' : '(opcional)'}
                <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={1000} rows={3} placeholder="Conte o que você encontrou no local" style={{ padding: '0.625rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--c-input-border)', background: 'var(--c-input-bg)', color: 'var(--c-input-text)', fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 400, resize: 'vertical' }} />
              </label>
              {erro && <p role="alert" style={{ color: 'var(--c-danger-text)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{erro}</p>}
              <button type="submit" disabled={estado === 'enviando'} style={{ marginTop: '1rem', width: '100%', padding: '0.7rem', borderRadius: '0.75rem', border: 'none', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer', opacity: estado === 'enviando' ? 0.7 : 1 }}>
                {estado === 'enviando' ? 'Enviando…' : 'Enviar para a equipe da Plura'}
              </button>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}
