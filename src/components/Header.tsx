'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { estaLogado } from '@/lib/auth'

export default function Header() {
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    setLogado(estaLogado())
  }, [])

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          Plura
        </Link>
        <nav style={{ display: 'flex', gap: '0.75rem' }}>
          {logado ? (
            <Link href="/perfil" className="btn btn-outline">
              Minha área
            </Link>
          ) : (
            <Link href="/login" className="btn btn-outline">
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
