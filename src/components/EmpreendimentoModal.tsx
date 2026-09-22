'use client'

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react'
import GlassCard from './GlassCard'
import Input from './Input'
import Button from './Button'
import RecursosAcessibilidadeChips, { useRecursosAcessibilidadeLabels } from './RecursosAcessibilidadeChips'
import { CameraIcon, CloseIcon, EditIcon, MapPinIcon, PlusIcon } from './icons'
import {
  apiPaginas,
  type Categoria,
  type Empreendimento,
  type EmpreendimentoDetalhado,
  type RecursoAcessibilidade,
} from '@/lib/apiPaginas'
import { comprimirImagem } from '@/lib/comprimirImagem'
import { obterUsuarioSalvo } from '@/lib/auth'

const CATEGORIA_LABEL: Record<Categoria, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  pousada: 'Pousada',
  bar: 'Bar',
  restaurante: 'Restaurante',
  cafe: 'Café',
  espaco_eventos: 'Espaço de eventos',
  passeio_turistico: 'Passeio turístico',
  museu: 'Museu',
  parque: 'Parque',
  academia: 'Academia',
  clinica: 'Clínica',
  outros: 'Outros',
}

const CATEGORIA_GRADIENTE: Record<Categoria, string> = {
  hotel: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  hostel: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  pousada: 'linear-gradient(135deg,#10b981,#059665)',
  bar: 'linear-gradient(135deg,#f59e0b,#d97706)',
  restaurante: 'linear-gradient(135deg,#ef4444,#dc2626)',
  cafe: 'linear-gradient(135deg,#92400e,#78350f)',
  espaco_eventos: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  passeio_turistico: 'linear-gradient(135deg,#06b6d4,#0891b2)',
  museu: 'linear-gradient(135deg,#d97706,#b45705)',
  parque: 'linear-gradient(135deg,#22c55e,#15803d)',
  academia: 'linear-gradient(135deg,#f97316,#c2410c)',
  clinica: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
  outros: 'linear-gradient(135deg,#6b7280,#4b5563)',
}

const GRADIENTE_PADRAO = 'linear-gradient(135deg,#1a7aff,#0062e6)'

function gradientePor(categoria: Categoria | null): string {
  return categoria ? CATEGORIA_GRADIENTE[categoria] ?? GRADIENTE_PADRAO : GRADIENTE_PADRAO
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 0 1rem' }}>
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
  border: '1px solid var(--c-input-border)',
  borderRadius: '0.75rem',
  color: 'var(--c-input-text)',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  outline: 'none',
}

const CATEGORIAS: Categoria[] = [
  'hotel', 'hostel', 'pousada', 'bar', 'restaurante', 'cafe', 'espaco_eventos',
  'passeio_turistico', 'museu', 'parque', 'academia', 'clinica', 'outros',
]

export default function EmpreendimentoModal({
  empreendimentoId,
  onClose,
  onUpdated,
}: {
  empreendimentoId: string
  onClose: () => void
  onUpdated?: (empreendimento: Empreendimento) => void
}) {
  const [detalhe, setDetalhe] = useState<EmpreendimentoDetalhado | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [enviandoLogo, setEnviandoLogo] = useState(false)
  const [enviandoCapa, setEnviandoCapa] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)

  const [cpfConvite, setCpfConvite] = useState('')
  const [convidando, setConvidando] = useState(false)
  const [erroConvite, setErroConvite] = useState('')

  // Campos editáveis
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<Categoria | ''>('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [complemento, setComplemento] = useState('')
  const [youtube, setYoutube] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [website, setWebsite] = useState('')
  const [recursos, setRecursos] = useState<RecursoAcessibilidade[]>([])
  const recursosAcessibilidadeLabels = useRecursosAcessibilidadeLabels()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const capaInputRef = useRef<HTMLInputElement>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const usuario = obterUsuarioSalvo()
  const souAdmin = !!detalhe && detalhe.vinculos.some((v) => v.papel === 'administrador' && v.usuario_id === usuario?.id)

  function carregar() {
    setCarregando(true)
    apiPaginas
      .obter(empreendimentoId)
      .then((d) => {
        setDetalhe(d)
        preencherCampos(d)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar empreendimento'))
      .finally(() => setCarregando(false))
  }

  function preencherCampos(d: EmpreendimentoDetalhado) {
    setNome(d.nome)
    setDescricao(d.descricao ?? '')
    setCategoria(d.categoria ?? '')
    setCep(d.cep ?? '')
    setEndereco(d.endereco ?? '')
    setCidade(d.cidade ?? '')
    setUf(d.uf ?? '')
    setComplemento(d.complemento ?? '')
    setYoutube(d.youtube ?? '')
    setInstagram(d.instagram ?? '')
    setFacebook(d.facebook ?? '')
    setTiktok(d.tiktok ?? '')
    setWebsite(d.website ?? '')
    setRecursos(d.recursos_acessibilidade ?? [])
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empreendimentoId])

  function atualizarLocal(patch: Partial<EmpreendimentoDetalhado>) {
    setDetalhe((atual) => {
      if (!atual) return atual
      const novo = { ...atual, ...patch }
      onUpdated?.(novo)
      return novo
    })
  }

  async function salvarEdicao(e: FormEvent) {
    e.preventDefault()
    if (!detalhe) return
    setSalvando(true)
    setErro('')
    try {
      const atualizado = await apiPaginas.atualizar(detalhe.id, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria: categoria || undefined,
        cep: cep.trim(),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        uf: uf.trim(),
        complemento: complemento.trim(),
        recursos_acessibilidade: recursos,
        youtube: youtube.trim(),
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        tiktok: tiktok.trim(),
        website: website.trim(),
      })
      atualizarLocal(atualizado)
      setEditando(false)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar alterações')
    } finally {
      setSalvando(false)
    }
  }

  async function aoSelecionarLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !detalhe) return
    setEnviandoLogo(true)
    setErro('')
    try {
      const { base64, extensao } = await comprimirImagem(file)
      const { logo_url } = await apiPaginas.uploadLogo(detalhe.id, base64, extensao)
      atualizarLocal({ logo_url })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar logo')
    } finally {
      setEnviandoLogo(false)
    }
  }

  async function aoSelecionarCapa(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !detalhe) return
    setEnviandoCapa(true)
    setErro('')
    try {
      const { base64, extensao } = await comprimirImagem(file)
      const { capa_url } = await apiPaginas.uploadCapa(detalhe.id, base64, extensao)
      atualizarLocal({ capa_url })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar capa')
    } finally {
      setEnviandoCapa(false)
    }
  }

  async function aoSelecionarFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !detalhe) return
    if (detalhe.fotos_urls.length >= 10) return
    setEnviandoFoto(true)
    setErro('')
    try {
      const { base64, extensao } = await comprimirImagem(file)
      const { fotos_urls } = await apiPaginas.adicionarFoto(detalhe.id, base64, extensao)
      atualizarLocal({ fotos_urls })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar foto')
    } finally {
      setEnviandoFoto(false)
    }
  }

  async function removerFoto(url: string) {
    if (!detalhe) return
    try {
      const { fotos_urls } = await apiPaginas.removerFoto(detalhe.id, url)
      atualizarLocal({ fotos_urls })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover foto')
    }
  }

  async function convidar(e: FormEvent) {
    e.preventDefault()
    if (!detalhe || !cpfConvite.trim()) return
    setConvidando(true)
    setErroConvite('')
    try {
      const vinculo = await apiPaginas.convidarColaborador(detalhe.id, cpfConvite.trim())
      setDetalhe((atual) => (atual ? { ...atual, vinculos: [...atual.vinculos, vinculo] } : atual))
      setCpfConvite('')
    } catch (err) {
      setErroConvite(err instanceof Error ? err.message : 'Erro ao convidar colaborador')
    } finally {
      setConvidando(false)
    }
  }

  async function removerColaborador(vinculoId: string) {
    if (!detalhe) return
    try {
      await apiPaginas.removerColaborador(detalhe.id, vinculoId)
      setDetalhe((atual) => (atual ? { ...atual, vinculos: atual.vinculos.filter((v) => v.id !== vinculoId) } : atual))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover colaborador')
    }
  }

  const gradiente = gradientePor(detalhe?.categoria ?? null)
  const inicial = detalhe?.nome?.trim()?.[0]?.toUpperCase() ?? '?'
  const colaboradores = detalhe?.vinculos.filter((v) => v.papel === 'colaborador') ?? []

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: 'rgba(4,4,15,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem 1rem 3rem',
        overflowY: 'auto',
        animation: 'ep-fade 220ms ease',
      }}
      onClick={onClose}
    >
      {fotoAmpliada && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
          onClick={(e) => {
            e.stopPropagation()
            setFotoAmpliada(null)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotoAmpliada} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '1rem', objectFit: 'contain' }} />
        </div>
      )}

      <div
        style={{ width: '100%', maxWidth: '920px', animation: 'ep-scale 280ms cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard variant="lg" style={{ padding: 0, overflow: 'hidden' }}>
          {carregando ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>carregando…</div>
          ) : !detalhe ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--c-text-3)' }}>{erro || 'Empreendimento não encontrado'}</div>
          ) : (
            <>
              {/* Banner */}
              <div style={{ position: 'relative', height: '240px', width: '100%', background: detalhe.capa_url ? `url(${detalhe.capa_url}) center/cover no-repeat` : gradiente }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.60) 100%)' }} />

                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px',
                    padding: '0.5rem 0.875rem', color: '#fff', fontSize: '0.8125rem',
                    fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <CloseIcon /> Fechar
                </button>

                {souAdmin && (
                  <>
                    <input ref={capaInputRef} type="file" accept="image/*" onChange={aoSelecionarCapa} style={{ display: 'none' }} />
                    <button
                      onClick={() => capaInputRef.current?.click()}
                      disabled={enviandoCapa}
                      title="Alterar capa"
                      style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px',
                        width: '2.25rem', height: '2.25rem', justifyContent: 'center',
                        color: '#fff', cursor: enviandoCapa ? 'wait' : 'pointer',
                      }}
                    >
                      <CameraIcon />
                    </button>
                  </>
                )}

                <input ref={logoInputRef} type="file" accept="image/*" onChange={aoSelecionarLogo} style={{ display: 'none' }} />
                <div
                  onClick={() => souAdmin && logoInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: '-32px', left: '1.75rem',
                    width: '80px', height: '80px', borderRadius: '1rem',
                    background: detalhe.logo_url ? `url(${detalhe.logo_url}) center/cover no-repeat` : gradiente,
                    border: '3px solid var(--c-bg, #04040f)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                    cursor: souAdmin ? 'pointer' : 'default',
                  }}
                  title={souAdmin ? 'Alterar logo' : undefined}
                >
                  {!detalhe.logo_url && inicial}
                  {enviandoLogo && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '2.5rem 1.75rem 1.75rem' }}>
                {erro && (
                  <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem', color: '#f87171' }}>
                    {erro}
                  </div>
                )}

                {/* Head */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--c-divider)', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em' }}>{detalhe.nome}</h2>
                      {detalhe.categoria && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '9999px', background: 'rgba(26,122,255,0.15)', color: '#6aadff', border: '1px solid rgba(26,122,255,0.3)' }}>
                          {CATEGORIA_LABEL[detalhe.categoria]}
                        </span>
                      )}
                    </div>
                    {(detalhe.endereco || detalhe.cidade) && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9375rem', color: 'var(--c-text-3)', margin: '0 0 0.625rem' }}>
                        <MapPinIcon />
                        {detalhe.endereco ?? ''}{detalhe.cidade ? ` · ${detalhe.cidade}` : ''}{detalhe.uf ? `/${detalhe.uf}` : ''}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {detalhe.website && <RedeChip label={detalhe.website} href={detalhe.website} />}
                      {detalhe.instagram && <RedeChip label={detalhe.instagram} href={`https://instagram.com/${detalhe.instagram.replace('@', '')}`} />}
                      {detalhe.facebook && <RedeChip label={detalhe.facebook} href={detalhe.facebook} />}
                      {detalhe.tiktok && <RedeChip label={detalhe.tiktok} href={detalhe.tiktok} />}
                      {detalhe.youtube && <RedeChip label="YouTube" href={detalhe.youtube} />}
                    </div>
                  </div>
                  {souAdmin && !editando && (
                    <Button variant="secondary" size="sm" icon={<EditIcon />} onClick={() => setEditando(true)}>
                      Editar
                    </Button>
                  )}
                </div>

                {editando ? (
                  <form onSubmit={salvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <SectionLabel label="Identificação" />
                      <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Descrição</label>
                        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} style={textareaStyle} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-input-label)' }}>Categoria</label>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria | '')} style={selectStyle}>
                          <option value="">Selecione uma categoria</option>
                          {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORIA_LABEL[c]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </section>

                    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <SectionLabel label="Localização" />
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ width: '140px', flexShrink: 0 }}>
                          <Input label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} leadingIcon={<MapPinIcon />} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Input label="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} leadingIcon={<MapPinIcon />} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                        </div>
                        <div style={{ width: '90px', flexShrink: 0 }}>
                          <Input label="UF" value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} />
                        </div>
                      </div>
                      <Input label="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} leadingIcon={<MapPinIcon />} />
                    </section>

                    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <SectionLabel label="Acessibilidade do local" />
                      <RecursosAcessibilidadeChips value={recursos} onChange={setRecursos} />
                    </section>

                    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      <SectionLabel label="Redes sociais" />
                      <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                      <Input label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                      <Input label="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                      <Input label="TikTok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
                      <Input label="YouTube" value={youtube} onChange={(e) => setYoutube(e.target.value)} />
                    </section>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={salvando}
                        onClick={() => {
                          preencherCampos(detalhe)
                          setEditando(false)
                        }}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" loading={salvando} style={{ flex: 2, justifyContent: 'center' }}>
                        {salvando ? 'Salvando…' : 'Salvar alterações'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                      {/* Main column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                          <SectionLabel label="Sobre" />
                          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.7 }}>
                            {detalhe.descricao || 'Nenhuma descrição cadastrada.'}
                          </p>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Galeria</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>{detalhe.fotos_urls.length}/10</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: '0.625rem' }}>
                            {detalhe.fotos_urls.map((url) => (
                              <div
                                key={url}
                                style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--c-input-border)', cursor: 'zoom-in' }}
                                onClick={() => setFotoAmpliada(url)}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {souAdmin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removerFoto(url)
                                    }}
                                    style={{
                                      position: 'absolute', top: '0.25rem', right: '0.25rem',
                                      width: '22px', height: '22px', borderRadius: '50%',
                                      background: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    }}
                                    aria-label="Remover foto"
                                  >
                                    <CloseIcon />
                                  </button>
                                )}
                              </div>
                            ))}
                            {souAdmin && detalhe.fotos_urls.length < 10 && (
                              <>
                                <input ref={fotoInputRef} type="file" accept="image/*" onChange={aoSelecionarFoto} style={{ display: 'none' }} />
                                <button
                                  onClick={() => fotoInputRef.current?.click()}
                                  disabled={enviandoFoto}
                                  style={{
                                    aspectRatio: '1', borderRadius: '0.75rem', border: '1px dashed var(--c-input-border)',
                                    background: 'var(--c-glass-bg-sm)', color: 'var(--c-text-3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: enviandoFoto ? 'wait' : 'pointer',
                                  }}
                                >
                                  {enviandoFoto ? (
                                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                  ) : (
                                    <PlusIcon />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {detalhe.recursos_acessibilidade.length > 0 && (
                          <div>
                            <SectionLabel label="Acessibilidade" />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {detalhe.recursos_acessibilidade.map((r) => (
                                <span key={r} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500, background: 'rgba(26,122,255,0.12)', border: '1px solid rgba(26,122,255,0.25)', color: '#6aadff' }}>
                                  {recursosAcessibilidadeLabels[r] ?? r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sidebar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <GlassCard variant="sm">
                          <SectionLabel label="Informações" />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
                            <InfoRow label="Endereço" value={detalhe.endereco} />
                            <InfoRow label="Cidade/UF" value={detalhe.cidade ? `${detalhe.cidade}${detalhe.uf ? `/${detalhe.uf}` : ''}` : null} />
                            <InfoRow label="CEP" value={detalhe.cep} />
                            <InfoRow label="Complemento" value={detalhe.complemento} />
                          </div>
                        </GlassCard>

                        {souAdmin && (
                          <GlassCard variant="sm">
                            <SectionLabel label="Colaboradores" />
                            <form onSubmit={convidar} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                              <input
                                value={cpfConvite}
                                onChange={(e) => setCpfConvite(e.target.value)}
                                placeholder="CPF do colaborador"
                                style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--c-input-bg)', border: '1px solid var(--c-input-border)', borderRadius: '0.625rem', color: 'var(--c-input-text)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }}
                              />
                              <Button type="submit" variant="secondary" size="sm" loading={convidando}>
                                Convidar
                              </Button>
                            </form>
                            {erroConvite && <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#f87171' }}>{erroConvite}</p>}
                            {colaboradores.length === 0 ? (
                              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-3)' }}>Nenhum colaborador ainda.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {colaboradores.map((v) => (
                                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: '0.625rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,rgba(26,122,255,0.3),rgba(0,98,230,0.2))', border: '1px solid rgba(26,122,255,0.35)' }} />
                                    <p style={{ flex: 1, margin: 0, fontSize: '0.8125rem', color: 'var(--c-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {v.usuarios?.nome ?? `usuário ${v.usuario_id.slice(0, 8)}…`}
                                    </p>
                                    <button
                                      onClick={() => removerColaborador(v.id)}
                                      style={{ background: 'none', border: 'none', color: 'var(--c-text-4, var(--c-text-3))', cursor: 'pointer', display: 'flex' }}
                                      aria-label="Remover colaborador"
                                    >
                                      <CloseIcon />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </GlassCard>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p style={{ margin: '0 0 0.125rem', fontSize: '0.6875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ margin: 0, color: 'var(--c-text-1)' }}>{value}</p>
    </div>
  )
}

function RedeChip({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href.startsWith('http') ? href : `https://${href}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-2)', textDecoration: 'none' }}
    >
      {label}
    </a>
  )
}
