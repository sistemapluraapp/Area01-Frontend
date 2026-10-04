'use client'

import { useEffect, useState } from 'react'
import { IconLogout } from '@tabler/icons-react'
import { estaLogado, limparSessao } from '@/lib/auth'
import NotificationBell from './NotificationBell'

// Canto direito do topo: notificações e "Sair" para quem está logado;
// botão "Entrar" (que volta para a página atual) para visitantes.
export default function AcoesTopo() {
  const [logado, setLogado] = useState<boolean | null>(null)

  useEffect(() => setLogado(estaLogado()), [])

  function sair() {
    limparSessao()
    window.location.href = '/'
  }

  if (logado === null) return null
  if (!logado) {
    const destino = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/'
    return (
      <a href={`/login?destino=${encodeURIComponent(destino)}`} style={{ display: 'inline-flex', alignItems: 'center', height: '38px', padding: '0 1rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#1a7aff,#0062e6)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', flexShrink: 0 }}>
        Entrar
      </a>
    )
  }
  return (
    <>
      <NotificationBell rotulo="Notificações" />
      <button type="button" onClick={sair} className="nav-item" title="Sair da conta">
        <IconLogout size={18} aria-hidden />
        <span className="nav-rotulo">Sair</span>
      </button>
    </>
  )
}
