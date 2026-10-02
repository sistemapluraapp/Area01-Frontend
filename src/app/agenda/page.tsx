'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconCalendarEvent, IconFilter, IconList } from '@tabler/icons-react'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import AcoesTopo from '@/components/AcoesTopo'
import BottomNav from '@/components/BottomNav'
import SeletorLocalidade, { type Localidade } from '@/components/SeletorLocalidade'
import CartaoEvento from '@/components/eventos/CartaoEvento'
import CalendarioMensal, { diasDoEvento } from '@/components/eventos/CalendarioMensal'
import { api, type EventoPublico } from '@/lib/api'
import { buscarLocalidade } from '@/lib/localidades'
import { useCatalogo } from '@/lib/useCatalogo'
import { useTituloPagina } from '@/lib/useTituloPagina'

type Visao = 'calendario' | 'lista'

export default function AgendaPage() {
  useTituloPagina('Agenda cultural')
  const catalogo = useCatalogo()
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [visao, setVisao] = useState<Visao>('calendario')
  const [dia, setDia] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [local, setLocal] = useState<Localidade>({ pais: 'BR', uf: null, cidade: null })
  const [gratuito, setGratuito] = useState(false)
  const [acess, setAcess] = useState<string[]>([])
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [eventos, setEventos] = useState<EventoPublico[] | null>(null)
  const [erro, setErro] = useState('')

  // Busca espera uma pausa na digitação
  useEffect(() => {
    const t = setTimeout(() => setBuscaAplicada(busca.trim()), 400)
    return () => clearTimeout(t)
  }, [busca])

  useEffect(() => {
    let ativo = true
    setEventos(null)
    setErro('')
    const inicioMes = new Date(ano, mes, 1)
    const de = inicioMes < hoje && inicioMes.getMonth() === hoje.getMonth() && inicioMes.getFullYear() === hoje.getFullYear() ? new Date(hoje.getTime() - 6 * 3600 * 1000) : inicioMes
    api
      .agenda({
        de: de.toISOString(),
        ate: new Date(ano, mes + 1, 0, 23, 59, 59).toISOString(),
        pais: local.uf || local.cidade ? local.pais : undefined,
        uf: local.uf ?? undefined,
        cidade: local.cidade?.trim() || undefined,
        q: buscaAplicada || undefined,
        gratuito,
        acessibilidade: acess,
      })
      .then((r) => ativo && setEventos(r.eventos))
      .catch((e) => ativo && setErro(e instanceof Error ? e.message : 'Não foi possível carregar a agenda'))
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ano, mes, local.pais, local.uf, local.cidade, buscaAplicada, gratuito, acess])

  function mudarMes(delta: number) {
    const d = new Date(ano, mes + delta, 1)
    setAno(d.getFullYear())
    setMes(d.getMonth())
    setDia(null)
  }

  const listados = useMemo(() => (eventos ?? []).filter((e) => !dia || diasDoEvento(e, ano, mes).includes(dia)), [eventos, dia, ano, mes])
  const recursos = catalogo.catalogo.grupos_acessibilidade.flatMap((g) => g.recursos)
  const rotulo = (c: string) => catalogo.recursos[c]?.rotulo ?? c
  const filtrosAtivos = [local.uf, local.cidade, gratuito || null, acess.length || null].filter(Boolean).length
  const tituloDia = dia ? new Date(ano, mes, Number(dia.split('-')[2])).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : null

  return (
    <>
      <Grain />
      <Header right={<AcoesTopo />} />
      <main id="conteudo" tabIndex={-1} style={{ maxWidth: '1040px', margin: '0 auto', padding: '5.25rem 1rem 6.5rem', position: 'relative', zIndex: 1 }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Agenda cultural</h1>
        <p style={{ margin: '0 0 1.25rem', color: 'var(--c-text-2)' }}>Eventos dos lugares e programas da Plura. Marque “Tenho interesse” para acompanhar.</p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.875rem' }}>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por evento, local ou cidade"
            aria-label="Buscar eventos"
            style={{ flex: '1 1 260px', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--c-input-border)', background: 'var(--c-input-bg)', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit' }}
          />
          <button type="button" onClick={() => setMostrarFiltros((m) => !m)} aria-expanded={mostrarFiltros} style={botao(mostrarFiltros)}>
            <IconFilter size={16} aria-hidden /> Filtros{filtrosAtivos ? ` (${filtrosAtivos})` : ''}
          </button>
          <div role="group" aria-label="Forma de exibição" style={{ display: 'flex', gap: '0.25rem' }}>
            <button type="button" onClick={() => setVisao('calendario')} aria-pressed={visao === 'calendario'} style={botao(visao === 'calendario')}>
              <IconCalendarEvent size={16} aria-hidden /> Calendário
            </button>
            <button type="button" onClick={() => setVisao('lista')} aria-pressed={visao === 'lista'} style={botao(visao === 'lista')}>
              <IconList size={16} aria-hidden /> Lista
            </button>
          </div>
        </div>

        {mostrarFiltros && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--c-divider)', background: 'var(--c-glass-bg-lg)', marginBottom: '1rem' }}>
            <SeletorLocalidade valor={local} onChange={setLocal} buscar={buscarLocalidade} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={gratuito} onChange={(e) => setGratuito(e.target.checked)} style={{ width: '1.05rem', height: '1.05rem' }} /> Só eventos gratuitos
            </label>
            {recursos.length > 0 && (
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-input-label)', marginBottom: '0.5rem' }}>Acessibilidade do evento</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {recursos.map((r) => {
                    const ativo = acess.includes(r.codigo)
                    return (
                      <button key={r.codigo} type="button" aria-pressed={ativo} onClick={() => setAcess((l) => (ativo ? l.filter((x) => x !== r.codigo) : [...l, r.codigo]))} style={{ ...botao(ativo), padding: '0.3rem 0.75rem', fontSize: '0.8125rem' }}>
                        {r.rotulo}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}
            {filtrosAtivos > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLocal({ pais: 'BR', uf: null, cidade: null })
                  setGratuito(false)
                  setAcess([])
                }}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--c-text-blue)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', padding: 0 }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {erro && <p role="alert" style={{ color: 'var(--c-danger-text)' }}>{erro}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: visao === 'calendario' ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
          {visao === 'calendario' && <CalendarioMensal ano={ano} mes={mes} eventos={eventos ?? []} diaSelecionado={dia} onSelecionarDia={setDia} onMudarMes={mudarMes} />}
          <section aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
            {visao === 'lista' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button type="button" onClick={() => mudarMes(-1)} style={botao(false)} aria-label="Mês anterior">‹</button>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{(() => { const m = new Date(ano, mes, 1).toLocaleDateString('pt-BR', { month: 'long' }); return `${m.charAt(0).toUpperCase()}${m.slice(1)} de ${ano}` })()}</h2>
                <button type="button" onClick={() => mudarMes(1)} style={botao(false)} aria-label="Próximo mês">›</button>
              </div>
            )}
            {tituloDia && (
              <p style={{ margin: 0, fontWeight: 700 }}>
                {tituloDia}{' '}
                <button type="button" onClick={() => setDia(null)} style={{ background: 'none', border: 'none', color: 'var(--c-text-blue)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
                  ver o mês todo
                </button>
              </p>
            )}
            {eventos === null && !erro && <p style={{ color: 'var(--c-text-3)' }}>Carregando eventos…</p>}
            {eventos !== null && listados.length === 0 && <p style={{ color: 'var(--c-text-2)' }}>Nenhum evento encontrado neste período com os filtros escolhidos.</p>}
            {listados.map((e) => (
              <CartaoEvento key={e.id} evento={e} rotuloRecurso={rotulo} />
            ))}
          </section>
        </div>
      </main>
      <Footer />
      <div style={{ height: '4.5rem' }} aria-hidden />
      <BottomNav />
    </>
  )
}

function botao(ativo: boolean) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.55rem 0.875rem',
    borderRadius: '0.75rem',
    border: ativo ? '1px solid var(--c-text-blue)' : '1px solid var(--c-divider)',
    background: ativo ? 'var(--c-accent-soft)' : 'var(--c-glass-bg-sm)',
    color: ativo ? 'var(--c-text-blue)' : 'var(--c-text-1)',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  } as const
}
