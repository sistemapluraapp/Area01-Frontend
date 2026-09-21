'use client'

import { useState, type FormEvent } from 'react'
import GlassCard from './GlassCard'
import Input from './Input'
import Button from './Button'
import AccessibilityChips from './AccessibilityChips'
import { CloseIcon, IdIcon, MapPinIcon } from './icons'
import { api, type NecessidadeAcessibilidade, type Perfil } from '@/lib/api'

function formatarCep(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos
}

export default function EditProfileModal({
  perfil,
  onClose,
  onSaved,
}: {
  perfil: Perfil
  onClose: () => void
  onSaved: (perfil: Perfil) => void
}) {
  const [nome, setNome] = useState(perfil.nome)
  const [nomeSocial, setNomeSocial] = useState(perfil.nome_social ?? '')
  const [cep, setCep] = useState(perfil.cep ?? '')
  const [endereco, setEndereco] = useState(perfil.endereco ?? '')
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
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        background: 'rgba(4,4,15,0.72)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="lg" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Editar perfil</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                background: 'var(--c-glass-bg-sm)',
                border: '1px solid var(--c-input-border)',
                borderRadius: '0.625rem',
                width: '2rem',
                height: '2rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-text-1)',
                cursor: 'pointer',
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
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                fontSize: '0.875rem',
                color: '#f87171',
              }}
            >
              {erro}
            </div>
          )}

          <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)' }}>
                Identificação
              </h3>
              <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} leadingIcon={<IdIcon />} required />
              <Input
                label="Nome social / apelido"
                helperText="Opcional. Se preenchido, é exibido no lugar do nome completo."
                value={nomeSocial}
                onChange={(e) => setNomeSocial(e.target.value)}
                leadingIcon={<IdIcon />}
              />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)' }}>
                Endereço
              </h3>
              <Input
                label="CEP"
                value={cep}
                onChange={(e) => aoMudarCep(e.target.value)}
                leadingIcon={<MapPinIcon />}
                placeholder="00000-000"
                helperText={buscandoCep ? 'buscando…' : undefined}
                inputMode="numeric"
              />
              <Input label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} leadingIcon={<MapPinIcon />} />
              <Input label="Complemento" helperText="Opcional" value={complemento} onChange={(e) => setComplemento(e.target.value)} leadingIcon={<MapPinIcon />} />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-text-3)' }}>
                Acessibilidade
              </h3>
              <AccessibilityChips value={acessibilidade} onChange={setAcessibilidade} />
            </section>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={onClose} disabled={salvando}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={salvando}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
