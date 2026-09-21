'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline'

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-outline'} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Carregando…' : children}
    </button>
  )
}
