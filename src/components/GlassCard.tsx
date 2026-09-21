import type { CSSProperties } from 'react'

export default function GlassCard({
  children,
  className = '',
  style,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}) {
  return (
    <div className={`glass ${className}`} style={{ padding: '1.5rem', ...style }} onClick={onClick}>
      {children}
    </div>
  )
}
