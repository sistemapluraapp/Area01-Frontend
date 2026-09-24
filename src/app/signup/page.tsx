'use client'

import { useRef, useState } from 'react'
import { useFocoPreso } from '@/lib/useFocoPreso'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Input, { PasswordStrength } from '@/components/Input'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import AcessoRapido from '@/components/AcessoRapido'
import Footer from '@/components/Footer'
import { EmailIcon, LockIcon, EyeIcon, UserIcon, IdIcon } from '@/components/icons'
import { api } from '@/lib/api'
import { salvarSessao } from '@/lib/auth'
import PreferenciasTurismo from '@/components/PreferenciasTurismo'
import { aplicarPreferencias, guardarPreferenciasPendentes } from '@/lib/preferenciasPendentes'
import { formatarCpf } from '@/lib/cpf'
import { LOGO_DATA_URI } from '@/lib/logo'

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
    </div>
  )
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  const refFoco = useRef<HTMLDivElement>(null)
  useFocoPreso(refFoco)
  return (
    <div
      ref={refFoco}
      role="dialog"
      aria-modal="true"
      aria-label="Conta criada"
      style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(4,4,15,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--c-glass-bg-lg)', backdropFilter: 'blur(24px) saturate(1.8)', border: 'var(--c-border-lg)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--c-shadow-lg)', padding: '2.25rem 2rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', margin: '0 auto 1.25rem', background: 'linear-gradient(135deg,rgba(34,197,94,0.22),rgba(34,197,94,0.10))', border: '1px solid rgba(34,197,94,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Conta criada com sucesso!</h2>
        <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
        </p>
        <Button style={{ width: '100%' }} onClick={onClose}>
          Ir para o login
        </Button>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirma, setShowConfirma] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [preferencias, setPreferencias] = useState<string[]>([])

  function validate() {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Nome é obrigatório'
    if (cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido'
    if (!email.includes('@')) e.email = 'E-mail inválido'
    if (senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    if (senha !== confirma) e.confirma = 'As senhas não coincidem'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setGeneralError('')
    setLoading(true)
    try {
      const resposta = await api.signup({ email: email.trim(), password: senha, cpf, nome: nome.trim() })
      if ('pending_email_confirmation' in resposta) {
        guardarPreferenciasPendentes(preferencias)
        setShowSuccess(true)
        return
      }
      salvarSessao(resposta)
      await aplicarPreferencias(preferencias)
      router.push('/')
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Não foi possível criar a conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showSuccess && (
        <SuccessModal
          onClose={() => {
            setShowSuccess(false)
            router.push('/login')
          }}
        />
      )}
      <Grain />

      <AcessoRapido />

      <div id="conteudo" tabIndex={-1} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', position: 'relative', zIndex: 1 }}>
        <GlassCard variant="lg" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_DATA_URI} alt="Plura" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} draggable={false} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em', marginBottom: '0.375rem' }}>Criar conta</h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>Preencha as informações abaixo</p>
          </div>

          {generalError && (
            <div style={{ margin: '1rem 0 0', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--c-danger-soft)', border: '1px solid var(--c-danger-border)', fontSize: '0.875rem', color: 'var(--c-danger-text)', textAlign: 'center' }}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <SectionLabel label="Identificação" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setErrors((p) => ({ ...p, nome: '' }))
                }}
                error={errors.nome}
                leadingIcon={<UserIcon />}
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  setCpf(formatarCpf(e.target.value))
                  setErrors((p) => ({ ...p, cpf: '' }))
                }}
                error={errors.cpf}
                helperText="Usado para que empreendimentos possam adicionar você à equipe ou como parceiro."
                inputMode="numeric"
                leadingIcon={<IdIcon />}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((p) => ({ ...p, email: '' }))
                }}
                error={errors.email}
                leadingIcon={<EmailIcon />}
              />
            </div>

            <SectionLabel label="Acesso" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Input
                  label="Senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    setErrors((p) => ({ ...p, senha: '' }))
                  }}
                  error={errors.senha}
                  leadingIcon={<LockIcon />}
                  trailingIcon={
                    <button type="button" onClick={() => setShowSenha((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}>
                      <EyeIcon off={showSenha} />
                    </button>
                  }
                />
                <PasswordStrength password={senha} />
              </div>
              <Input
                label="Confirmar senha"
                type={showConfirma ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirma}
                onChange={(e) => {
                  setConfirma(e.target.value)
                  setErrors((p) => ({ ...p, confirma: '' }))
                }}
                error={errors.confirma}
                leadingIcon={<LockIcon />}
                trailingIcon={
                  <button type="button" onClick={() => setShowConfirma((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}>
                    <EyeIcon off={showConfirma} />
                  </button>
                }
              />
            </div>

            <SectionLabel label="Preferências de turismo" />
            <p style={{ fontSize: '0.875rem', color: 'var(--c-text-2)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              O que você gosta de fazer? Opcional — ajuda a Plura a sugerir lugares para você. Dá para mudar depois no perfil.
            </p>
            <PreferenciasTurismo valor={preferencias} onChange={setPreferencias} />

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: '1.75rem' }}>
              {loading ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--c-text-2)', marginTop: '1.5rem' }}>
            Já tem uma conta?{' '}
            <a href="/login" style={{ color: 'var(--c-text-blue)', fontWeight: 600, textDecoration: 'none' }}>
              Entrar →
            </a>
          </p>
        </GlassCard>

        <Footer />
      </div>
    </>
  )
}
