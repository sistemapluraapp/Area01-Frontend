'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import GlassCard from './GlassCard'
import Input from './Input'
import Button from './Button'
import RecursosAcessibilidadeChips from './RecursosAcessibilidadeChips'
import { CloseIcon, MapPinIcon } from './icons'
import { apiPaginas, type Categoria, type Empreendimento, type RecursoAcessibilidade } from '@/lib/apiPaginas'

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'bar', label: 'Bar' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'cafe', label: 'Café' },
  { value: 'espaco_eventos', label: 'Espaço de eventos' },
  { value: 'passeio_turistico', label: 'Passeio turístico' },
  { value: 'museu', label: 'Museu' },
  { value: 'parque', label: 'Parque' },
  { value: 'academia', label: 'Academia' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'outros', label: 'Outros' },
]

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

const textareaStyle: CSSProperties = {
  width: '100%',
  padding: '0.625rem 1rem',
  background: 'var(--c-input-bg)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--c-input-border)',
  borderRadius: '0.75rem',
  color: 'var(--c-input-text)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  minHeight: '84px',
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '0.625rem 1rem',
  background: 'var(--c-input-bg)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--c-input-border)',
  borderRadius: '0.75rem',
  color: 'var(--c-input-text)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function CriarEmpreendimentoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (empreendimento: Empreendimento) => void
}) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<Categoria | ''>('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [complemento, setComplemento] = useState('')
  const [recursos, setRecursos] = useState<RecursoAcessibilidade[]>([])
  const [mostrarRedes, setMostrarRedes] = useState(false)
  const [youtube, setYoutube] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [website, setWebsite] = useState('')

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
        if (data.logradouro) setEndereco(data.logradouro)
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
      setErro('Nome do empreendimento é obrigatório')
      return
    }
    setSalvando(true)
    try {
      const criado = await apiPaginas.criar({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        categoria: categoria || undefined,
        cep: cep.trim() || undefined,
        endereco: endereco.trim() || undefined,
        cidade: cidade.trim() || undefined,
        uf: uf.trim() || undefined,
        complemento: complemento.trim() || undefined,
        recursos_acessibilidade: recursos,
        youtube: youtube.trim() || undefined,
        instagram: instagram.trim() || undefined,
        facebook: facebook.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        website: website.trim() || undefined,
      })
      onCreated(criado)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar empreendimento')
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
        style={{ width: '100%', maxWidth: '560px', marginTop: '1rem', animation: 'ep-scale 280ms cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="lg" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.035em' }}>Novo empreendimento</h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--c-text-3)' }}>Preencha os dados básicos para criar</p>
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
              <SectionLabel label="Identificação" />
              <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Conte um pouco sobre o empreendimento"
                  style={textareaStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria | '')} style={selectStyle}>
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SectionLabel label="Localização" />
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
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={buscandoCep} />
                </div>
                <div style={{ width: '90px', flexShrink: 0 }}>
                  <Input label="UF" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} disabled={buscandoCep} />
                </div>
              </div>
              <Input label="Complemento" helperText="Opcional" value={complemento} onChange={(e) => setComplemento(e.target.value)} leadingIcon={<MapPinIcon />} />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SectionLabel label="Acessibilidade do local" />
              <RecursosAcessibilidadeChips value={recursos} onChange={setRecursos} />
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <button
                type="button"
                onClick={() => setMostrarRedes((v) => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--c-text-blue)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                }}
              >
                {mostrarRedes ? '− ocultar redes sociais' : '+ adicionar redes sociais'}
              </button>
              {mostrarRedes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
                  <Input label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
                  <Input label="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                  <Input label="TikTok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                  <Input label="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                </div>
              )}
            </section>

            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>
              Você poderá adicionar logo, capa e fotos após criar o empreendimento.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="ghost" onClick={onClose} disabled={salvando} style={{ flex: 1, justifyContent: 'center' }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={salvando} style={{ flex: 2, justifyContent: 'center' }}>
                {salvando ? 'Criando…' : 'Criar empreendimento'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
