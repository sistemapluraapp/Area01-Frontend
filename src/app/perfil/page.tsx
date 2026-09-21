'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import NotificationBell from '@/components/NotificationBell'
import { IdIcon, UserIcon } from '@/components/icons'
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
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>
      </main>
    )
  }

  return (
    <>
      <Grain />
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '3rem 1.25rem 3rem', position: 'relative', zIndex: 1 }}>
        <GlassCard variant="lg" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Minha área</h2>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>cpf {usuario?.cpf}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={sair}>
                Sair
              </Button>
            </div>
          </div>

          {erro && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem', color: '#f87171' }}>
              {erro}
            </div>
          )}

          <form onSubmit={salvar}>
            <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} leadingIcon={<IdIcon />} />
            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" variant={salvo ? 'secondary' : 'primary'}>
                {salvo ? 'Salvo ✓' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </GlassCard>

        <h3 style={{ margin: '2rem 0 1rem', fontSize: '1.0625rem', fontWeight: 700 }}>Minhas avaliações</h3>
        {avaliacoes.length === 0 ? (
          <p style={{ color: 'var(--c-text-3)', fontSize: '0.9375rem' }}>Você ainda não avaliou nenhuma Página.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {avaliacoes.map((a) => (
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
        )}
      </main>
      <Footer />
    </>
  )
}
