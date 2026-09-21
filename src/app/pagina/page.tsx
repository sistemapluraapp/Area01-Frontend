'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import { api, type Pagina, type Avaliacao } from '@/lib/api'
import { estaLogado } from '@/lib/auth'

function PaginaDetalhe() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [pagina, setPagina] = useState<(Pagina & { avaliacoes: Avaliacao[] }) | null>(null)
  const [erro, setErro] = useState('')
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function carregar() {
    try {
      const dados = await api.obterPagina(id)
      setPagina(dados)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Página não encontrada')
    }
  }

  useEffect(() => {
    if (id) carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function avaliar(e: React.FormEvent) {
    e.preventDefault()
    if (!estaLogado()) {
      setErro('Faça login para avaliar esta Página')
      return
    }
    setEnviando(true)
    try {
      await api.avaliar(id, { nota, comentario })
      setComentario('')
      await carregar()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar avaliação')
    } finally {
      setEnviando(false)
    }
  }

  if (erro && !pagina) {
    return (
      <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
        {erro}
      </div>
    )
  }
  if (!pagina) return <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>

  return (
    <>
      <GlassCard variant="lg">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {pagina.tipo}
        </span>
        <h2 style={{ margin: '0.4rem 0', fontSize: '1.375rem', fontWeight: 800 }}>{pagina.nome}</h2>
        <p style={{ color: 'var(--c-text-2)' }}>{pagina.descricao}</p>
      </GlassCard>

      <GlassCard style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Avaliar</h3>
        {erro && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem', color: '#f87171' }}>
            {erro}
          </div>
        )}
        <form onSubmit={avaliar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Nota</label>
            <select
              value={nota}
              onChange={(e) => setNota(Number(e.target.value))}
              style={{ padding: '0.625rem 1rem', background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit' }}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrela(s)
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Comentário</label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ padding: '0.75rem 1rem', background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: '0.75rem', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <Button type="submit" loading={enviando}>
            Enviar avaliação
          </Button>
        </form>
      </GlassCard>

      <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Avaliações ({pagina.avaliacoes.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {pagina.avaliacoes.map((a) => (
          <GlassCard key={a.id} variant="sm">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--c-text-blue)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              nota {a.nota}/5
            </span>
            <p style={{ margin: '0.4rem 0', fontSize: '0.9375rem' }}>{a.comentario}</p>
            {a.resposta && (
              <p style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', borderLeft: '2px solid var(--blue-500)', paddingLeft: '0.6rem' }}>Resposta: {a.resposta}</p>
            )}
          </GlassCard>
        ))}
      </div>
    </>
  )
}

export default function PaginaPage() {
  return (
    <>
      <Grain />
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.25rem 3rem', position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>}>
          <PaginaDetalhe />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
