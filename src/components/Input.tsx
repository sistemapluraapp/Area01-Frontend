'use client'

import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export default function Input({ label, helperText, error, leadingIcon, trailingIcon, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)

  const borderColor = error ? 'var(--c-input-error-border)' : focused ? 'var(--c-input-focus-border)' : 'var(--c-input-border)'
  const boxShadow = error
    ? '0 0 0 3px var(--c-input-error-ring)'
    : focused
      ? '0 0 0 3px var(--c-input-focus-ring), var(--c-shadow-sm)'
      : 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: error ? 'var(--c-input-error-label)' : 'var(--c-input-label)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leadingIcon && (
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              color: focused ? 'var(--c-input-icon-focus)' : 'var(--c-input-icon)',
              display: 'flex',
            }}
          >
            {leadingIcon}
          </span>
        )}

        <input
          {...rest}
          onFocus={(e) => {
            setFocused(true)
            rest.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            rest.onBlur?.(e)
          }}
          style={{
            width: '100%',
            padding: `0.625rem ${trailingIcon ? '2.75rem' : '1rem'} 0.625rem ${leadingIcon ? '2.75rem' : '1rem'}`,
            background: 'var(--c-input-bg)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${borderColor}`,
            borderRadius: '0.75rem',
            color: 'var(--c-input-text)',
            fontSize: '0.9375rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
            boxShadow,
            ...style,
          }}
        />

        {trailingIcon && (
          <span
            style={{
              position: 'absolute',
              right: '0.875rem',
              color: focused ? 'var(--c-input-icon-focus)' : 'var(--c-input-icon)',
              display: 'flex',
            }}
          >
            {trailingIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <span style={{ fontSize: '0.8125rem', color: error ? 'var(--c-input-error-text)' : 'var(--c-input-helper)' }}>
          {error ?? helperText}
        </span>
      )}
    </div>
  )
}

export function Checkbox({
  label,
  checked = false,
  onChange,
}: {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', userSelect: 'none' }}>
      <span
        style={{
          width: '1.125rem',
          height: '1.125rem',
          borderRadius: '0.25rem',
          flexShrink: 0,
          background: checked ? 'linear-gradient(135deg, #1a7aff, #0062e6)' : 'var(--c-checkbox-bg)',
          border: checked ? '1px solid rgba(26,122,255,0.80)' : '1px solid var(--c-checkbox-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms ease',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        )}
      </span>
      <span style={{ fontSize: '0.9375rem', color: 'var(--c-checkbox-text)' }}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
    </label>
  )
}

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++
  return score as 0 | 1 | 2 | 3
}

const strengthLabel = ['', 'Fraca', 'Média', 'Forte']
const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e']

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '9999px',
              background: i <= score ? strengthColor[score] : 'var(--c-divider)',
              transition: 'background 300ms ease',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: score > 0 ? strengthColor[score] : 'var(--c-text-3)' }}>
        {`Senha ${strengthLabel[score]}`}
      </span>
    </div>
  )
}
