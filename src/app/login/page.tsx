'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { api } from '@/lib/api'
import { salvarSessao } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!email) return setErro('Informe seu e-mail')
    if (!senha) return setErro('Informe sua senha')

    setLoading(true)
    try {
      const auth = await api.login({ email, password: senha })
      salvarSessao(auth)
      router.push('/perfil')
    } catch {
      setErro('E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: '3rem', maxWidth: 420 }}>
      <GlassCard>
        <h2 style={{ marginTop: 0 }}>Bem-vindo de volta</h2>
        <p style={{ color: 'var(--c-text-2)', marginTop: '-0.5rem' }}>Faça login para continuar</p>

        {erro && <p className="error-banner">{erro}</p>}

        <form onSubmit={onSubmit}>
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="senha"
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} />
            Mostrar senha
          </label>
          <Button type="submit" loading={loading} style={{ width: '100%' }}>
            Entrar
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem' }}>
          Não tem conta? <Link href="/signup">Criar conta →</Link>
        </p>
      </GlassCard>
    </main>
  )
}
