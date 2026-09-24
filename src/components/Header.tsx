'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LOGO_DATA_URI } from '@/lib/logo'
import { SearchIcon } from './icons'
import ModoToggle from './ModoToggle'
import PainelAcessibilidade from './PainelAcessibilidade'

export default function Header({ label, right }: { label?: string; right?: ReactNode }) {
  const router = useRouter()

  return (
    <header
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
      <button
        onClick={() => router.push('/')}
        aria-label="Buscar lugares"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4375rem',
          background: 'none',
          border: '1px solid var(--c-input-border)',
          borderRadius: '0.625rem',
          padding: '0.375rem 0.75rem',
          color: 'var(--c-text-2)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        <SearchIcon />
        <span className="rotulo-buscar">Buscar</span>
      </button>
      <div style={{ flex: 1 }} />
      <PainelAcessibilidade />
      <ModoToggle />
      {right}
    </header>
  )
}
