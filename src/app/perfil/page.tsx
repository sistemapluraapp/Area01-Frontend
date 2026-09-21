'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { api, type Usuario, type Avaliacao } from '@/lib/api'
import { estaLogado, limparSessao } from '@/lib/auth'

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [nome, setNome] = useState('')
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estaLogado()) {
      router.replace('/login')
      return
    }
    Promise.all([api.obterPerfil(), api.minhasAvaliacoes()])
      .then(([perfil, { avaliacoes }]) => {
        setUsuario(perfil)
        setNome(perfil.nome)
        setAvaliacoes(avaliacoes)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfil'))
      .finally(() => setCarregando(false))
  }, [router])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSalvo(false)
    try {
      const atualizado = await api.atualizarPerfil({ nome })
      setUsuario(atualizado)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  function sair() {
    limparSessao()
    router.push('/')
  }

  if (carregando) {
    return (
      <main className="container" style={{ paddingTop: '3rem' }}>
        <p className="label-mono">carregando…</p>
      </main>
    )
  }

  return (
    <main className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: 640 }}>
      <GlassCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Minha área</h2>
          <button className="btn btn-outline" onClick={sair}>
            Sair
          </button>
        </div>

        {erro && <p className="error-banner">{erro}</p>}

        <form onSubmit={salvar} style={{ marginTop: '1.5rem' }}>
          <Input id="nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <p className="label-mono">cpf: {usuario?.cpf}</p>
          <Button type="submit">{salvo ? 'Salvo ✓' : 'Salvar alterações'}</Button>
        </form>
      </GlassCard>

      <h3 style={{ marginTop: '2rem' }}>Minhas avaliações</h3>
      {avaliacoes.length === 0 ? (
        <p style={{ color: 'var(--c-text-2)' }}>Você ainda não avaliou nenhuma Página.</p>
      ) : (
        avaliacoes.map((a) => (
          <GlassCard key={a.id} className="pagina-card" >
            <span className="label-mono">nota {a.nota}/5</span>
            <p style={{ margin: '0.4rem 0' }}>{a.comentario}</p>
            {a.resposta && (
              <p style={{ fontSize: '0.85rem', color: 'var(--c-text-2)', borderLeft: '2px solid var(--c-blue-500)', paddingLeft: '0.6rem' }}>
                Resposta: {a.resposta}
              </p>
            )}
          </GlassCard>
        ))
      )}
    </main>
  )
}
