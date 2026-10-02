'use client'

import { useEffect, useState } from 'react'
import { IconBell, IconMapPin, IconPlus, IconX } from '@tabler/icons-react'
import SeletorLocalidade, { type Localidade } from '@/components/SeletorLocalidade'
import { api, type LocalFavorito } from '@/lib/api'
import { buscarLocalidade, nomePais } from '@/lib/localidades'

export function textoLocal(l: { pais: string; uf: string; cidade: string | null }) {
  const pais = l.pais !== 'BR' ? nomePais(l.pais) : null
  return l.cidade ? [l.cidade, l.uf, pais].filter(Boolean).join(' · ') : [`Estado: ${l.uf}`, pais].filter(Boolean).join(' · ')
}

// Cidades e estados favoritos do perfil, com o liga/desliga dos e-mails
export default function LocaisFavoritos() {
  const [locais, setLocais] = useState<LocalFavorito[]>([])
  const [avisosEmail, setAvisosEmail] = useState(true)
  const [novo, setNovo] = useState<Localidade>({ pais: 'BR', uf: null, cidade: null })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api
      .locaisFavoritos()
      .then((r) => {
        setLocais(r.locais)
        setAvisosEmail(r.avisos_email)
      })
      .catch(() => {})
  }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!novo.uf) return setErro('Escolha o estado. A cidade é opcional: sem ela, você acompanha o estado inteiro.')
    setSalvando(true)
    try {
      const local = await api.adicionarLocalFavorito({ pais: novo.pais, uf: novo.uf, cidade: novo.cidade?.trim() || null })
      setLocais((l) => [local, ...l])
      setNovo({ pais: novo.pais, uf: novo.uf, cidade: null })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível favoritar')
    } finally {
      setSalvando(false)
    }
  }

  async function remover(id: string) {
    setLocais((l) => l.filter((x) => x.id !== id))
    try {
      await api.removerLocalFavorito(id)
    } catch {
      api.locaisFavoritos().then((r) => setLocais(r.locais)).catch(() => {})
    }
  }

  async function alternarEmail(ativo: boolean) {
    setAvisosEmail(ativo)
    try {
      await api.definirAvisosFavoritosEmail(ativo)
    } catch {
      setAvisosEmail(!ativo)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--c-text-2)', lineHeight: 1.55 }}>
        Avisamos quando surgir uma página nova, mais acessibilidade, uma certificação ou um evento nesses locais. Os avisos levam em conta as necessidades do seu perfil.
      </p>

      {locais.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {locais.map((l) => (
            <li key={l.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.5rem 0.375rem 0.75rem', borderRadius: '9999px', background: 'var(--c-accent-soft)', color: 'var(--c-text-blue)', fontSize: '0.875rem', fontWeight: 600 }}>
              <IconMapPin size={15} aria-hidden /> {textoLocal(l)}
              <button type="button" onClick={() => remover(l.id)} aria-label={`Remover ${textoLocal(l)} dos favoritos`} style={{ display: 'inline-flex', background: 'none', border: 'none', padding: '0.125rem', cursor: 'pointer', color: 'inherit' }}>
                <IconX size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionar} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SeletorLocalidade valor={novo} onChange={setNovo} buscar={buscarLocalidade} />
        {erro && (
          <p role="alert" style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--c-danger-text)' }}>
            {erro}
          </p>
        )}
        <div>
          <button type="submit" disabled={salvando} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.55rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer', opacity: salvando ? 0.6 : 1 }}>
            <IconPlus size={16} aria-hidden /> {novo.cidade ? 'Favoritar cidade' : 'Favoritar estado'}
          </button>
        </div>
      </form>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--c-text-2)', cursor: 'pointer' }}>
        <input type="checkbox" checked={avisosEmail} onChange={(e) => alternarEmail(e.target.checked)} style={{ width: '1.05rem', height: '1.05rem', accentColor: 'var(--c-text-blue)' }} />
        <IconBell size={16} aria-hidden /> Receber estes avisos também por e-mail
      </label>
    </div>
  )
}
