'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { api } from '@/lib/api'
import { salvarSessao } from '@/lib/auth'
import { formatarCpf } from '@/lib/cpf'

function forcaSenha(senha: string): number {
  let pontos = 0
  if (senha.length >= 6) pontos++
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) pontos++
  return pontos
}

export default function SignupPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  const forca = forcaSenha(senha)
  const forcaLabel = ['Fraca', 'Fraca', 'Média', 'Forte'][forca] ?? 'Fraca'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!nome) return setErro('Informe seu nome completo')
    if (cpf.replace(/\D/g, '').length !== 11) return setErro('CPF inválido')
    if (!email.includes('@')) return setErro('Informe um e-mail válido')
    if (senha.length < 6) return setErro('A senha deve ter ao menos 6 caracteres')
    if (senha !== confirmarSenha) return setErro('As senhas não coincidem')

    setLoading(true)
    try {
      const resposta = await api.signup({ email, password: senha, cpf, nome })
      if ('pending_email_confirmation' in resposta) {
        setSucesso('Conta criada! Verifique seu e-mail para confirmar antes de fazer login.')
        return
      }
      salvarSessao(resposta)
      router.push('/perfil')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar a conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container" style={{ paddingTop: '3rem', maxWidth: 460, paddingBottom: '3rem' }}>
      <GlassCard>
        <h2 style={{ marginTop: 0 }}>Criar conta</h2>

        {erro && <p className="error-banner">{erro}</p>}
        {sucesso && (
          <p className="error-banner" style={{ color: 'var(--c-success)', borderColor: 'var(--c-success)', background: 'rgba(34,197,94,0.1)' }}>
            {sucesso} <Link href="/login">Ir para o login</Link>
          </p>
        )}

        {!sucesso && (
          <form onSubmit={onSubmit}>
            <span className="label-mono">identificação</span>
            <Input id="nome" label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Input
              id="cpf"
              label="CPF"
              value={cpf}
              onChange={(e) => setCpf(formatarCpf(e.target.value))}
              placeholder="000.000.000-00"
            />
            <Input id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <span className="label-mono">acesso</span>
            <Input
              id="senha"
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {senha && (
              <div style={{ marginTop: '-0.6rem', marginBottom: '1rem' }}>
                <div className="strength-bar">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`strength-seg ${
                        i < forca ? (forca === 1 ? 'on-weak' : forca === 2 ? 'on-medium' : 'on-strong') : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="label-mono">{forcaLabel}</span>
              </div>
            )}
            <Input
              id="confirmar-senha"
              label="Confirmar senha"
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              Criar conta
            </Button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem' }}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>
      </GlassCard>
    </main>
  )
}
