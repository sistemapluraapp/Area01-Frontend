'use client'

import type { ReactNode } from 'react'
import { LOGO_DATA_URI } from '@/lib/logo'
import { estaLogado } from '@/lib/auth'
import ModoToggle from './ModoToggle'
import NavPrincipal from './NavPrincipal'
import PainelAcessibilidade from './PainelAcessibilidade'

const minhaArea = () => (estaLogado() ? '/perfil' : '/login?destino=%2Fperfil')

// Topo da Área 01. Em telas largas mostra o menu principal; em telas
// estreitas o menu fica na barra inferior (BottomNav).
export default function Header({ label, right }: { label?: string; right?: ReactNode }) {
  return (
    <header
      className="cabecalho-01"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0.875rem clamp(0.75rem, 4vw, 1.5rem)',
        gap: 'clamp(0.5rem, 2vw, 1rem)',
        background: 'var(--c-glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--c-divider)',
      }}
    >
      <a href="/" aria-label="Plura, página inicial" style={{ display: 'flex', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_DATA_URI} alt="" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} draggable={false} />
      </a>
      {label && (
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: 'var(--c-text-3)',
            textTransform: 'lowercase',
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
      )}
      <NavPrincipal inicio="/" minhaArea={minhaArea} agenda="/agenda" voltarPara="/" />
      <div style={{ flex: 1 }} />
      <PainelAcessibilidade />
      <ModoToggle />
      {right}
    </header>
  )
}
