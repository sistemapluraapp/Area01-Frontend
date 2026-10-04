'use client'

import { usePathname } from 'next/navigation'
import { IconArrowLeft, IconCalendarEvent, IconHome, IconUserCircle } from '@tabler/icons-react'
import { estaLogado } from '@/lib/auth'

const ITENS = [
  { href: '/', rotulo: 'Início', Icone: IconHome },
  { href: '/perfil', rotulo: 'Minha área', Icone: IconUserCircle },
  { href: '/agenda', rotulo: 'Agenda', Icone: IconCalendarEvent },
]

const estilo = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', padding: '0.375rem 0.25rem', width: '100%', background: 'none', border: 'none', textDecoration: 'none', fontFamily: 'inherit', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' } as const

function voltar() {
  const veioDaqui = document.referrer && new URL(document.referrer).origin === window.location.origin
  if (veioDaqui && window.history.length > 1) window.history.back()
  else window.location.href = '/'
}

// Menu principal no celular (barra inferior, estilo app); em telas largas
// ele fica no topo (Header). As páginas que a usam reservam espaço no fim do
// conteúdo (paddingBottom) para ela não cobrir nada.
export default function BottomNav() {
  const caminho = usePathname()
  return (
    <nav aria-label="Navegação principal" className="bottom-nav" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 150, background: 'var(--c-glass-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid var(--c-divider)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul style={{ listStyle: 'none', margin: '0 auto', padding: '0.375rem 0.5rem', maxWidth: '520px', display: 'grid', gridTemplateColumns: `repeat(${ITENS.length + 1}, 1fr)` }}>
        <li>
          <button type="button" onClick={voltar} style={{ ...estilo, color: 'var(--c-text-2)' }}>
            <IconArrowLeft size={22} stroke={1.8} aria-hidden />
            Voltar
          </button>
        </li>
        {ITENS.map(({ href, rotulo, Icone }) => {
          const ativo = caminho === href
          const destino = href === '/perfil' && typeof window !== 'undefined' && !estaLogado() ? '/login?destino=%2Fperfil' : href
          return (
            <li key={href}>
              <a href={destino} aria-current={ativo ? 'page' : undefined} style={{ ...estilo, color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-2)' }}>
                <Icone size={22} stroke={1.8} aria-hidden />
                {rotulo}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
