'use client'

import type { InputHTMLAttributes } from 'react'

export default function Input({
  label,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`input ${error ? 'input-error' : ''}`} {...rest} />
      {error && <span className="error-text">{error}</span>}
    </div>
  )
}
