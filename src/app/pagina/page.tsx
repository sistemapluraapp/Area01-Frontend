'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
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

  if (erro && !pagina) return <p className="error-banner">{erro}</p>
  if (!pagina) return <p className="label-mono">carregando…</p>

  return (
    <>
      <GlassCard>
        <span className="label-mono">{pagina.tipo}</span>
        <h2 style={{ margin: '0.4rem 0' }}>{pagina.nome}</h2>
        <p style={{ color: 'var(--c-text-2)' }}>{pagina.descricao}</p>
      </GlassCard>

      <GlassCard className="pagina-card" style={{ marginTop: '1.5rem', cursor: 'default' }}>
        <h3 style={{ marginTop: 0 }}>Avaliar</h3>
        {erro && <p className="error-banner">{erro}</p>}
        <form onSubmit={avaliar}>
          <div className="field">
            <label>Nota</label>
            <select className="input" value={nota} onChange={(e) => setNota(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrela(s)
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Comentário</label>
            <textarea
              className="input"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <Button type="submit" loading={enviando}>
            Enviar avaliação
          </Button>
        </form>
      </GlassCard>

      <h3 style={{ marginTop: '2rem' }}>Avaliações ({pagina.avaliacoes.length})</h3>
      {pagina.avaliacoes.map((a) => (
        <GlassCard key={a.id} className="pagina-card" style={{ cursor: 'default' }}>
          <span className="label-mono">nota {a.nota}/5</span>
          <p style={{ margin: '0.4rem 0' }}>{a.comentario}</p>
          {a.resposta && (
            <p style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', borderLeft: '2px solid var(--c-blue-500)', paddingLeft: '0.6rem' }}>
              Resposta: {a.resposta}
            </p>
          )}
        </GlassCard>
      ))}
    </>
  )
}

export default function PaginaPage() {
  return (
    <main className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 640 }}>
      <Suspense fallback={<p className="label-mono">carregando…</p>}>
        <PaginaDetalhe />
      </Suspense>
    </main>
  )
}
