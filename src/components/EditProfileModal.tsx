'use client'

import { useState, type FormEvent } from 'react'
import GlassCard from './GlassCard'
import Input from './Input'
import Button from './Button'
import AccessibilityTree from './AccessibilityTree'
import { CloseIcon, EmailIcon, IdIcon, MapPinIcon, SmileIcon, UserIcon } from './icons'
import { api, type NecessidadeAcessibilidade, type Perfil } from '@/lib/api'
import { formatarCpf } from '@/lib/cpf'

function formatarCep(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0 0.25rem' }}>
      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
    </div>
  )
}

export default function EditProfileModal({
  perfil,
  email,
  onClose,
  onSaved,
}: {
  perfil: Perfil
  email: string
  onClose: () => void
  onSaved: (perfil: Perfil) => void
}) {
  const [nome, setNome] = useState(perfil.nome)
  const [nomeSocial, setNomeSocial] = useState(perfil.nome_social ?? '')
  const [cep, setCep] = useState(perfil.cep ?? '')
  const [endereco, setEndereco] = useState(perfil.endereco ?? '')
  const [cidade, setCidade] = useState(perfil.cidade ?? '')
  const [uf, setUf] = useState(perfil.uf ?? '')
  const [complemento, setComplemento] = useState(perfil.complemento ?? '')
  const [acessibilidade, setAcessibilidade] = useState<NecessidadeAcessibilidade[]>(
    perfil.necessidades_acessibilidade ?? []
  )
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function aoMudarCep(valor: string) {
    const formatado = formatarCep(valor)
    setCep(formatado)
    const digitos = formatado.replace(/\D/g, '')
    if (digitos.length !== 8) return

    setBuscandoCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digitos}/json/`)
      const data = await res.json()
      if (!data?.erro) {
        const partes = [data.logradouro, data.bairro, data.localidade && data.uf ? `${data.localidade}/${data.uf}` : '']
          .filter(Boolean)
          .join(', ')
        if (partes) setEndereco(partes)
        if (data.localidade) setCidade(data.localidade)
        if (data.uf) setUf(data.uf)
      }
    } catch {
      // busca de CEP é apenas um auxílio; falha silenciosa não bloqueia o preenchimento manual
    } finally {
      setBuscandoCep(false)
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) {
      setErro('Nome completo é obrigatório')
      return
    }
    setSalvando(true)
    try {
      const atualizado = await api.atualizarPerfil({
        nome: nome.trim(),
        nome_social: nomeSocial.trim(),
        cep: cep.trim(),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        uf: uf.trim(),
        complemento: complemento.trim(),
        necessidades_acessibilidade: acessibilidade,
      })
      onSaved(atualizado)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: 'rgba(4,4,15,0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1.25rem 3rem',
        overflowY: 'auto',
        animation: 'ep-fade 220ms ease',
      }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '520px', marginTop: '1rem', animation: 'ep-scale 280ms cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="lg" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.035em' }}>Editar perfil</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--c-text-3)' }}>Atualize suas informações pessoais</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-glass-bg-sm)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              style={{
                background: 'none',
                border: '1px solid var(--c-input-border)',
                borderRadius: '0.625rem',
                width: '36px',
                height: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-text-2)',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 200ms ease',
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {erro && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                background: 'var(--c-danger-soft)',
                border: '1px solid var(--c-danger-border)',
                fontSize: '0.875rem',
                color: 'var(--c-danger-text)',
              }}
            >
              {erro}
            </div>
          )}

          <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SectionLabel label="Identificação" />
              <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} leadingIcon={<UserIcon />} required />
              <div style={{ position: 'relative' }}>
                <Input label="E-mail" type="email" value={email} disabled leadingIcon={<EmailIcon />} />
                <span
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '2.3rem',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--c-text-4, var(--c-text-3))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                  }}
                >
                  não editável
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Input
                  label="CPF"
                  value={formatarCpf(perfil.cpf)}
                  disabled
                  leadingIcon={<IdIcon />}
                  helperText="É pelo CPF que administradores de empreendimentos adicionam você à equipe ou como parceiro."
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '2.3rem',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--c-text-4, var(--c-text-3))',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    pointerEvents: 'none',
                  }}
                >
                  não editável
                </span>
              </div>
              <Input
                label="Nome social / apelido"
                helperText="Opcional. Se preenchido, é exibido no lugar do nome completo."
                value={nomeSocial}
                onChange={(e) => setNomeSocial(e.target.value)}
                leadingIcon={<SmileIcon />}
              />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SectionLabel label="Endereço" />
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '140px', flexShrink: 0 }}>
                  <Input
                    label="CEP"
                    value={cep}
                    onChange={(e) => aoMudarCep(e.target.value)}
                    leadingIcon={<MapPinIcon />}
                    placeholder="00000-000"
                    inputMode="numeric"
                    disabled={buscandoCep}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Endereço"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    leadingIcon={<MapPinIcon />}
                    placeholder="Rua, número"
                    disabled={buscandoCep}
                  />
                </div>
              </div>
              <Input label="Complemento" helperText="Opcional" value={complemento} onChange={(e) => setComplemento(e.target.value)} leadingIcon={<MapPinIcon />} />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SectionLabel label="Acessibilidade" />
              <AccessibilityTree value={acessibilidade} onChange={setAcessibilidade} />
            </section>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="ghost" onClick={onClose} disabled={salvando} style={{ flex: 1, justifyContent: 'center' }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={salvando} style={{ flex: 2, justifyContent: 'center' }}>
                {salvando ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
