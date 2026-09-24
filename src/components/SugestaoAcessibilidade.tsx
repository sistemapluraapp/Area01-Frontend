'use client'

import { useEffect, useState } from 'react'
import { IconHandLoveYou, IconTextSize, IconX } from '@tabler/icons-react'
import { api } from '@/lib/api'
import { obterPreferencias, salvarPreferencias } from '@/lib/acessibilidade'

const CHAVE_VISTA = 'plura_sugestao_acessibilidade'

type Sugestao = 'libras' | 'visao'

// Uma única vez: se a pessoa marcou no perfil uma necessidade auditiva ou
// visual, a Plura sugere ligar o recurso certo do painel de Acessibilidade.
export default function SugestaoAcessibilidade() {
  const [sugestao, setSugestao] = useState<Sugestao | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE_VISTA)) return
    } catch {
      return
    }
    const prefs = obterPreferencias()
    api
      .obterPerfil()
      .then((perfil) => {
        const necessidades = perfil.necessidades_acessibilidade as string[]
        if (!prefs.libras && necessidades.some((n) => n.startsWith('audicao_'))) setSugestao('libras')
        else if (prefs.texto === 'normal' && necessidades.some((n) => n === 'visao_baixa_visao' || n === 'visao_miopia_severa')) setSugestao('visao')
      })
      .catch(() => {})
  }, [])

  function fechar() {
    try {
      localStorage.setItem(CHAVE_VISTA, '1')
    } catch {
      // ignora
    }
    setSugestao(null)
  }

  function aceitar() {
    if (sugestao === 'libras') salvarPreferencias({ libras: true })
    else salvarPreferencias({ texto: 'grande' })
    fechar()
  }

  if (!sugestao) return null
  const libras = sugestao === 'libras'

  return (
    <div role="region" aria-label="Sugestão de acessibilidade" style={{ maxWidth: '900px', margin: '0 auto 1rem', padding: '0 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '1rem 1.125rem', borderRadius: '1.125rem', background: 'var(--c-accent-soft)', border: '1px solid var(--c-accent-soft-border)' }}>
        <span aria-hidden style={{ color: 'var(--c-accent-text)', display: 'flex', marginTop: '0.1rem' }}>{libras ? <IconHandLoveYou size={24} /> : <IconTextSize size={24} />}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{libras ? 'Quer ativar a tradução em Libras?' : 'Quer aumentar o tamanho do texto?'}</p>
          <p style={{ margin: '0.2rem 0 0.75rem', fontSize: '0.875rem', color: 'var(--c-text-2)' }}>
            {libras ? 'Um avatar traduz para Libras os textos da Plura que você tocar.' : 'Você pode mudar isso quando quiser no botão Acessibilidade, no topo da tela.'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={aceitar} style={{ padding: '0.55rem 1rem', borderRadius: '0.75rem', border: 'none', background: '#1a7aff', color: '#fff', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
              {libras ? 'Ativar Libras' : 'Aumentar texto'}
            </button>
            <button type="button" onClick={fechar} style={{ padding: '0.55rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--c-accent-soft-border)', background: 'transparent', color: 'var(--c-text-1)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              Agora não
            </button>
          </div>
        </div>
        <button type="button" onClick={fechar} aria-label="Fechar sugestão" style={{ background: 'none', border: 'none', color: 'var(--c-text-2)', cursor: 'pointer', display: 'flex', padding: '0.125rem' }}>
          <IconX size={18} aria-hidden />
        </button>
      </div>
    </div>
  )
}
