'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconUser } from '@tabler/icons-react'
import { estaLogado } from '@/lib/auth'
import NotificationBell from './NotificationBell'

// Canto direito do topo: notificações e perfil para quem está logado;
// botão "Entrar" (que volta para a página atual) para visitantes.
export default function AcoesTopo() {
  const router = useRouter()
  const [logado, setLogado] = useState<boolean | null>(null)

  useEffect(() => setLogado(estaLogado()), [])

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
      <NotificationBell />
      <button type="button" onClick={() => router.push('/perfil')} aria-label="Minha área" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--c-input-border)', background: 'var(--c-glass-bg-sm)', color: 'var(--c-text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <IconUser size={18} aria-hidden />
      </button>
    </>
  )
}
