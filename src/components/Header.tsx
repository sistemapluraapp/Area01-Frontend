'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { LOGO_DATA_URI } from '@/lib/logo'

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
        padding: '0.875rem 1.5rem',
        gap: '1rem',
        background: 'var(--c-glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--c-divider)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_DATA_URI}
        alt="Plura"
        style={{ height: '30px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
        draggable={false}
        onClick={() => router.push('/')}
      />
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
      <div style={{ flex: 1 }} />
      {right}
    </header>
  )
}
