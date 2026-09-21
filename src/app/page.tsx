'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import { api, type Pagina } from '@/lib/api'

export default function HomePage() {
  const [termo, setTermo] = useState('')
  const [resultados, setResultados] = useState<Pagina[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function buscar(q: string) {
    setCarregando(true)
    setErro('')
    try {
      const { resultados } = await api.buscarPaginas(q)
      setResultados(resultados)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar Páginas')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscar('')
  }, [])

  return (
    <main className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
          Encontre seu lazer com acessibilidade
        </h1>
      </div>

      <GlassCard>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            buscar(termo)
          }}
          style={{ display: 'flex', gap: '0.75rem' }}
        >
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Buscar por nome da Página..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </form>
      </GlassCard>

      {erro && <p className="error-banner" style={{ marginTop: '1rem' }}>{erro}</p>}

      {carregando ? (
        <p className="label-mono" style={{ marginTop: '2rem' }}>
          carregando…
        </p>
      ) : (
        <>
          <p className="label-mono" style={{ marginTop: '1.5rem' }}>
            {resultados.length} resultado(s) encontrado(s)
          </p>
          <div className="card-grid">
            {resultados.map((pagina) => (
              <Link key={pagina.id} href={`/pagina?id=${pagina.id}`} style={{ textDecoration: 'none' }}>
                <GlassCard className="pagina-card">
                  <span className="label-mono">{pagina.tipo}</span>
                  <h3 style={{ margin: '0.4rem 0 0.3rem' }}>{pagina.nome}</h3>
                  <p style={{ color: 'var(--c-text-2)', fontSize: '0.9rem', margin: 0 }}>
                    {pagina.descricao ?? 'Sem descrição'}
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  )
}
