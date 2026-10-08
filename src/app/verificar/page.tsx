'use client'

import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconAlertTriangle, IconCircleCheckFilled, IconCircleX, IconRosetteDiscountCheck, IconSearch } from '@tabler/icons-react'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import AcoesTopo from '@/components/AcoesTopo'
import BottomNav from '@/components/BottomNav'
import Carregando from '@/components/Carregando'
import Icone from '@/components/Icone'
import { api, type VerificacaoCertificado } from '@/lib/api'
import { useTituloPagina } from '@/lib/useTituloPagina'

// Etapa 8e: qualquer pessoa confere um certificado da Plura pelo código (ou pelo QR do PDF)
const SITUACAO = {
  valida: { texto: 'Certificado válido', cor: 'var(--c-success-text)', fundo: 'var(--c-success-soft)', Icone: IconCircleCheckFilled },
  vencida: { texto: 'Certificado vencido', cor: 'var(--c-warning-text, #b45309)', fundo: 'var(--c-warning-soft, rgba(245,158,11,.14))', Icone: IconAlertTriangle },
  invalida: { texto: 'Certificado não está mais válido', cor: 'var(--c-danger-text)', fundo: 'var(--c-danger-soft)', Icone: IconCircleX },
} as const

function Verificacao() {
  useTituloPagina('Verificar certificado')
  const inicial = (useSearchParams().get('codigo') ?? '').toUpperCase()
  const [codigo, setCodigo] = useState(inicial)
  const [resultado, setResultado] = useState<VerificacaoCertificado | null>(null)
  const [erro, setErro] = useState('')
  const [buscando, setBuscando] = useState(false)

  async function verificar(c: string) {
    const limpo = c.trim().toUpperCase()
    if (!limpo) return
    setBuscando(true)
    setErro('')
    setResultado(null)
    try {
      setResultado(await api.verificarCertificado(limpo))
      const url = new URL(window.location.href)
      url.searchParams.set('codigo', limpo)
      window.history.replaceState(null, '', url)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível verificar')
    } finally {
      setBuscando(false)
    }
  }

  useEffect(() => {
    if (inicial) verificar(inicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function enviar(e: FormEvent) {
    e.preventDefault()
    verificar(codigo)
  }

  const st = resultado ? SITUACAO[resultado.situacao] : null

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <IconRosetteDiscountCheck size={34} aria-hidden style={{ color: 'var(--c-accent-text)' }} />
        <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Verificar certificado</h1>
      </div>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--c-text-2)' }}>Digite o código que aparece no certificado da Plura (ou leia o QR code do PDF).</p>

      <form onSubmit={enviar} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <label htmlFor="codigo" className="sr-only">Código do certificado</label>
        <input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="PLURA-XXXX-XXXX"
          autoComplete="off"
          spellCheck={false}
          maxLength={20}
          style={{ flex: '1 1 240px', padding: '0.75rem 1rem', borderRadius: '0.875rem', border: '1px solid var(--c-input-border)', background: 'var(--c-input-bg, var(--c-glass-bg))', color: 'var(--c-text-1)', fontSize: '1rem', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em' }}
        />
        <button type="submit" disabled={buscando || !codigo.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9375rem', cursor: 'pointer', opacity: buscando ? 0.7 : 1 }}>
          <IconSearch size={18} aria-hidden /> {buscando ? 'Verificando…' : 'Verificar'}
        </button>
      </form>

      {buscando && <Carregando compacto />}
      {erro && (
        <p role="alert" style={{ padding: '0.875rem 1rem', borderRadius: '0.875rem', background: 'var(--c-danger-soft)', color: 'var(--c-danger-text)', fontWeight: 600 }}>{erro}</p>
      )}

      {resultado && st && (
        <section aria-live="polite" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: 'var(--c-border)', background: 'var(--c-glass-bg-lg, var(--c-glass-bg))', boxShadow: 'var(--c-shadow-md)' }}>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 1rem', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 800, color: st.cor, background: st.fundo }}>
            <st.Icone size={18} aria-hidden /> {st.texto}
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span aria-hidden style={{ width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-accent-soft)', color: 'var(--c-accent-text)' }}>
              {resultado.certificacao_icone ? <Icone nome={resultado.certificacao_icone} size={28} /> : <IconRosetteDiscountCheck size={30} />}
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{resultado.certificacao_titulo}</h2>
              {resultado.certificacao_resumo && <p style={{ margin: '0.2rem 0 0', color: 'var(--c-text-2)', fontSize: '0.9rem' }}>{resultado.certificacao_resumo}</p>}
            </div>
          </div>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            <div><dt style={rotulo}>Concedido a</dt><dd style={valor}><a href={`/pagina?id=${resultado.pagina_id}`} style={{ color: 'var(--c-accent-text)' }}>{resultado.pagina_nome}</a></dd></div>
            <div><dt style={rotulo}>Local</dt><dd style={valor}>{[resultado.pagina_cidade, resultado.pagina_uf].filter(Boolean).join('/') || '—'}</dd></div>
            <div><dt style={rotulo}>Concedido em</dt><dd style={valor}>{new Date(resultado.concedida_em).toLocaleDateString('pt-BR')}</dd></div>
            <div><dt style={rotulo}>{resultado.situacao === 'vencida' ? 'Venceu em' : 'Válido até'}</dt><dd style={valor}>{resultado.expira_em ? new Date(resultado.expira_em).toLocaleDateString('pt-BR') : 'Sem vencimento'}</dd></div>
            <div><dt style={rotulo}>Código</dt><dd style={{ ...valor, fontFamily: 'var(--font-mono, monospace)' }}>{resultado.codigo}</dd></div>
          </dl>
        </section>
      )}
    </>
  )
}

const rotulo = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' } as const
const valor = { margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 600 } as const

export default function VerificarPage() {
  return (
    <>
      <Grain />
      <Header right={<AcoesTopo />} />
      <main id="conteudo" tabIndex={-1} style={{ maxWidth: '760px', margin: '0 auto', padding: '5.25rem 1rem 6.5rem', position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<Carregando />}>
          <Verificacao />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </>
  )
}
