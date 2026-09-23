'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/GlassCard'
import Input from '@/components/Input'
import { Checkbox } from '@/components/Input'
import Button from '@/components/Button'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import { EmailIcon, LockIcon, EyeIcon } from '@/components/icons'
import { api, ApiError } from '@/lib/api'
import { salvarSessao } from '@/lib/auth'
import { destinoSeguro } from '@/lib/destino'
import { aplicarPreferencias } from '@/lib/preferenciasPendentes'
import { LOGO_DATA_URI } from '@/lib/logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [suspensa, setSuspensa] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!email.trim()) errs.email = 'Informe seu e-mail'
    if (!password.trim()) errs.password = 'Informe sua senha'
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})
    setSuspensa(false)
    try {
      const auth = await api.login({ email: email.trim(), password })
      salvarSessao(auth)
      await aplicarPreferencias()
      router.push(destinoSeguro(new URLSearchParams(window.location.search).get('destino')))
    } catch (err) {
      if (err instanceof ApiError && err.suspensa) {
        setSuspensa(true)
        setErrors({ general: err.message })
      } else {
        setErrors({ general: 'E-mail ou senha incorretos' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Grain />
      <div
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem 1rem', position: 'relative', zIndex: 1,
        }}
      >
        <GlassCard variant="lg" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_DATA_URI} alt="Plura" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} draggable={false} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.035em', marginBottom: '0.375rem' }}>Bem-vindo de volta</h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)' }}>Faça login para continuar</p>
          </div>

          {errors.general && suspensa && (
            <div style={{ marginBottom: '1rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.45)', fontSize: '0.875rem', color: '#f59e0b', textAlign: 'center', fontWeight: 700 }}>
              {errors.general}
            </div>
          )}

          {errors.general && !suspensa && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--c-danger-soft)', border: '1px solid var(--c-danger-border)', fontSize: '0.875rem', color: 'var(--c-danger-text)', textAlign: 'center' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((p) => ({ ...p, email: undefined, general: undefined }))
                  setSuspensa(false)
                }}
                error={errors.email}
                leadingIcon={<EmailIcon />}
              />
              <Input
                label="Senha"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((p) => ({ ...p, password: undefined, general: undefined }))
                  setSuspensa(false)
                }}
                error={errors.password}
                leadingIcon={<LockIcon />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}
                  >
                    <EyeIcon off={showPass} />
                  </button>
                }
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <Checkbox label="Lembrar de mim" checked={remember} onChange={setRemember} />
              </div>

              <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--c-text-2)', marginTop: '1.75rem' }}>
            Não tem uma conta?{' '}
            <a href="/signup" style={{ color: 'var(--c-text-blue)', fontWeight: 600, textDecoration: 'none' }}>
              Criar conta →
            </a>
          </p>
        </GlassCard>

        <Footer />
      </div>
    </>
  )
}
