'use client'

import { useState, type FormEvent } from 'react'
import { IconHourglassHigh, IconPencil, IconStarFilled } from '@tabler/icons-react'
import { Cartao, Estrelas, LinkAcao, Modal, TituloSecao, formatarNota } from './ui'
import { api, type PaginaPublica } from '@/lib/api'

function iniciais(nome: string) {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const ROTULO_NOTA = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente']

function ModalAvaliar({ p, onClose }: { p: PaginaPublica; onClose: () => void }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!nota) return setErro('Escolha uma nota de 1 a 5 estrelas.')
    setEnviando(true)
    setErro('')
    try {
      await api.avaliar(p.id, { nota, comentario: comentario.trim() || undefined })
      setEnviado(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <Modal titulo="Comentário enviado" onClose={onClose} largura={440}>
        <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem' }}>
          <span style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-warning-soft)', color: 'var(--c-warning-text)' }}>
            <IconHourglassHigh size={32} aria-hidden />
          </span>
          <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.5rem' }}>Obrigado por compartilhar sua experiência!</p>
          <p style={{ color: 'var(--c-text-2)', lineHeight: 1.6 }}>
            Seu comentário está <strong>aguardando a moderação</strong> da equipe da Plura. Assim que for aprovado, ele aparece na página de {p.nome}.
          </p>
          <button type="button" onClick={onClose} style={{ marginTop: '1.25rem', padding: '0.65rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            Entendi
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal titulo={`Avaliar ${p.nome}`} onClose={onClose} largura={500}>
      <form onSubmit={enviar}>
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
          <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Sua nota</legend>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} style={{ cursor: 'pointer', display: 'flex', color: n <= nota ? '#f59e0b' : 'var(--c-text-4)' }}>
                <input type="radio" name="nota" value={n} checked={nota === n} onChange={() => setNota(n)} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} aria-label={`${n} estrela${n > 1 ? 's' : ''} — ${ROTULO_NOTA[n]}`} />
                <IconStarFilled size={34} aria-hidden />
              </label>
            ))}
            {nota > 0 && <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: 'var(--c-text-2)' }}>{ROTULO_NOTA[nota]}</span>}
          </div>
        </fieldset>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontWeight: 600 }}>
          Conte sua experiência
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={2000} rows={5} placeholder="Como foi a acessibilidade? A entrada, o banheiro, o atendimento…" style={{ padding: '0.75rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--c-input-border)', background: 'var(--c-input-bg)', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit', fontWeight: 400, resize: 'vertical', lineHeight: 1.55 }} />
        </label>
        <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', marginTop: '0.5rem' }}>Seu comentário passa por moderação antes de ser publicado. Seu nome aparece como primeiro nome e inicial do sobrenome.</p>
        {erro && <p role="alert" style={{ color: 'var(--c-danger-text)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{erro}</p>}
        <button type="submit" disabled={enviando} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: 'none', background: 'var(--p-accent)', color: 'var(--p-accent-contrast)', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit', cursor: 'pointer', opacity: enviando ? 0.7 : 1 }}>
          {enviando ? 'Enviando…' : 'Enviar avaliação'}
        </button>
      </form>
    </Modal>
  )
}

export default function Avaliacoes({ p }: { p: PaginaPublica }) {
  const [avaliando, setAvaliando] = useState(false)
  const [todas, setTodas] = useState(false)
  const lista = todas ? p.avaliacoes : p.avaliacoes.slice(0, 3)
  const distribuicao = [5, 4, 3, 2, 1].map((n) => ({ n, total: p.avaliacoes.filter((a) => a.nota === n).length }))

  return (
    <Cartao id="avaliacoes">
      <TituloSecao acao={p.avaliacoes.length > 3 && <LinkAcao onClick={() => setTodas((t) => !t)}>{todas ? 'Ver menos' : 'Ver todas'}</LinkAcao>}>Avaliações</TituloSecao>

      {p.nota_media != null ? (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{formatarNota(p.nota_media)}</p>
            <Estrelas nota={p.nota_media} tamanho={18} />
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>{p.total_avaliacoes} {p.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'}</p>
          </div>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }} aria-label="Distribuição das notas">
            {distribuicao.map(({ n, total }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ width: '1.75rem', color: 'var(--c-text-2)' }}>{n}★</span>
                <span style={{ flex: 1, height: '8px', borderRadius: '9999px', background: 'var(--p-soft)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: `${p.total_avaliacoes ? (total / p.total_avaliacoes) * 100 : 0}%`, background: 'var(--p-accent)', borderRadius: '9999px' }} />
                </span>
                <span style={{ width: '1.5rem', textAlign: 'right', color: 'var(--c-text-3)' }}>{total}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--c-text-2)', marginBottom: '1rem' }}>Ainda não há avaliações publicadas. Seja a primeira pessoa a contar como foi!</p>
      )}

      <button type="button" onClick={() => setAvaliando(true)} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.7rem', borderRadius: '0.875rem', border: '1px solid var(--p-soft-border)', background: 'transparent', color: 'var(--p-accent-text)', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer' }}>
        <IconPencil size={18} aria-hidden /> Avaliar este local
      </button>

      {lista.length > 0 && (
        <>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.5rem 0 0.75rem' }}>Comentários</h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lista.map((a) => (
              <li key={a.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.875rem', borderRadius: '1rem', border: 'var(--c-border)' }}>
                <span aria-hidden style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: a.autor_avatar_url ? `url("${a.autor_avatar_url}") center/cover` : 'var(--p-accent)', color: 'var(--p-accent-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  {!a.autor_avatar_url && iniciais(a.autor_nome)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>{a.autor_nome}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Estrelas nota={a.nota} tamanho={14} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)' }}>{new Date(a.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {a.comentario && <p style={{ margin: '0.375rem 0 0', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--c-text-2)', whiteSpace: 'pre-line' }}>{a.comentario}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {avaliando && <ModalAvaliar p={p} onClose={() => setAvaliando(false)} />}
    </Cartao>
  )
}
