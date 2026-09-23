'use client'

import { useEffect, useMemo, useState } from 'react'
import { IconAdjustmentsHorizontal, IconCheck, IconX } from '@tabler/icons-react'
import type { RecursoAcessibilidade } from '@/lib/api'
import { useFiltrosAcessibilidade } from '@/lib/useFiltrosAcessibilidade'
import { useCatalogo } from '@/lib/useCatalogo'
import Icone from './Icone'
import Portal from './Portal'

// Filtro de acessibilidade da busca. A escolha acontece num modal que ocupa
// a tela disponível, com rolagem vertical; só vale depois de "Aplicar".
export default function AcessibilidadeFiltro({
  value,
  onChange,
}: {
  value: RecursoAcessibilidade[]
  onChange: (value: RecursoAcessibilidade[]) => void
}) {
  const { recursosLocal, carregando } = useFiltrosAcessibilidade()
  const { catalogo, recursos } = useCatalogo()
  const [aberto, setAberto] = useState(false)
  const [rascunho, setRascunho] = useState<RecursoAcessibilidade[]>(value)

  const grupos = useMemo(() => {
    const lista: { id: string; label: string; icone: string | null; itens: { value: string; label: string }[] }[] = []
    for (const item of recursosLocal) {
      let grupo = lista.find((g) => g.id === item.categoria)
      if (!grupo) {
        const g = catalogo.grupos_acessibilidade.find((x) => x.codigo === item.categoria)
        grupo = { id: item.categoria, label: g?.rotulo ?? item.categoria, icone: g?.icone ?? null, itens: [] }
        lista.push(grupo)
      }
      grupo.itens.push({ value: item.codigo, label: item.rotulo })
    }
    return lista
  }, [recursosLocal, catalogo])

  const rotulos = useMemo(() => Object.fromEntries(recursosLocal.map((r) => [r.codigo, r.rotulo])), [recursosLocal])

  function abrir() {
    setRascunho(value)
    setAberto(true)
  }

  function aplicar() {
    onChange(rascunho)
    setAberto(false)
  }

  useEffect(() => {
    if (!aberto) return
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false)
    window.addEventListener('keydown', aoTeclar)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflow
    }
  }, [aberto])

  if (carregando) return null

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={abrir}
          aria-haspopup="dialog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.1rem',
            borderRadius: '9999px',
            border: value.length ? '1px solid var(--c-accent-soft-border)' : 'var(--c-border)',
            background: value.length ? 'var(--c-accent-soft)' : 'var(--c-glass-bg-lg)',
            boxShadow: 'var(--c-shadow-sm)',
            color: value.length ? 'var(--c-accent-text)' : 'var(--c-text-1)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <IconAdjustmentsHorizontal size={19} aria-hidden />
          Filtrar por acessibilidade
          {value.length > 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, borderRadius: '9999px', padding: '0.05rem 0.5rem', background: 'var(--c-accent-text)', color: 'var(--c-bg)' }}>{value.length}</span>
          )}
        </button>

        {value.map((codigo) => (
          <button
            key={codigo}
            type="button"
            onClick={() => onChange(value.filter((v) => v !== codigo))}
            aria-label={`Remover filtro ${rotulos[codigo] ?? codigo}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', border: '1px solid var(--c-accent-soft-border)', background: 'var(--c-glass-bg-lg)', color: 'var(--c-accent-text)', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {rotulos[codigo] ?? codigo} <IconX size={14} aria-hidden />
          </button>
        ))}
      </div>

      {aberto && (
        <Portal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtrar por acessibilidade"
            onClick={() => setAberto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 10040, background: 'var(--c-overlay)', display: 'flex', padding: 'min(2vh, 16px) min(2vw, 16px)', animation: 'ep-fade 150ms ease' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--c-modal-bg)', color: 'var(--c-text-1)', border: 'var(--c-border)', borderRadius: '1.25rem', boxShadow: 'var(--c-shadow-lg)', overflow: 'hidden', animation: 'ep-scale 180ms ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-divider)' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Filtrar por acessibilidade</h2>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>Mostra só os lugares que têm todos os recursos escolhidos.</p>
                </div>
                <button type="button" onClick={() => setAberto(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--c-text-2)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                  <IconX size={22} />
                </button>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {grupos.map((grupo) => (
                  <fieldset key={grupo.id} style={{ border: 'none', margin: 0, padding: 0 }}>
                    <legend style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--c-accent-text)', display: 'flex' }}>
                        <Icone nome={grupo.icone} size={20} />
                      </span>
                      {grupo.label}
                    </legend>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                      {grupo.itens.map((item) => {
                        const ativo = rascunho.includes(item.value)
                        return (
                          <label
                            key={item.value}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.7rem 0.875rem', borderRadius: '0.875rem', cursor: 'pointer', border: ativo ? '1px solid var(--c-accent-soft-border)' : '1px solid var(--c-divider)', background: ativo ? 'var(--c-accent-soft)' : 'transparent', color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-1)', fontSize: '0.9375rem', fontWeight: ativo ? 600 : 500 }}
                          >
                            <input
                              type="checkbox"
                              checked={ativo}
                              onChange={() => setRascunho((r) => (ativo ? r.filter((v) => v !== item.value) : [...r, item.value]))}
                              style={{ width: '1.125rem', height: '1.125rem', accentColor: '#1a7aff', flexShrink: 0 }}
                            />
                            <span style={{ display: 'flex', color: 'var(--c-accent-text)' }}>
                              <Icone nome={recursos[item.value]?.icone} size={19} />
                            </span>
                            {item.label}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--c-divider)', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setRascunho([])} disabled={rascunho.length === 0} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--c-text-2)', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'inherit', textDecoration: 'underline', cursor: 'pointer', opacity: rascunho.length ? 1 : 0.4 }}>
                  Limpar
                </button>
                <button type="button" onClick={aplicar} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <IconCheck size={18} /> Aplicar filtros{rascunho.length ? ` (${rascunho.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
