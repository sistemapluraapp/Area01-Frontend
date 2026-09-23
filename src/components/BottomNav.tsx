'use client'

import { usePathname } from 'next/navigation'
import { IconHeart, IconHome, IconSearch, IconUser } from '@tabler/icons-react'

const ITENS = [
  { href: '/', rotulo: 'Início', Icone: IconHome },
  { href: '/#busca', rotulo: 'Explorar', Icone: IconSearch },
  { href: '/perfil#destinos', rotulo: 'Destinos salvos', Icone: IconHeart },
  { href: '/perfil', rotulo: 'Perfil', Icone: IconUser },
]

// Barra de navegação inferior (estilo app). As páginas que a usam reservam
// espaço no fim do conteúdo (paddingBottom) para ela não cobrir nada.
export default function BottomNav() {
  const caminho = usePathname()
  return (
    <nav aria-label="Navegação principal" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 150, background: 'var(--c-glass-bg)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', borderTop: '1px solid var(--c-divider)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul style={{ listStyle: 'none', margin: '0 auto', padding: '0.375rem 0.5rem', maxWidth: '640px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {ITENS.map(({ href, rotulo, Icone }) => {
          const ativo = href === '/' ? caminho === '/' : href === '/perfil' ? caminho === '/perfil' : false
          return (
            <li key={href}>
              <a href={href} aria-current={ativo ? 'page' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', padding: '0.375rem 0.25rem', textDecoration: 'none', fontSize: '0.6875rem', fontWeight: 600, color: ativo ? 'var(--c-accent-text)' : 'var(--c-text-2)' }}>
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
