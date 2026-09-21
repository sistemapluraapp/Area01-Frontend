export default function GlassCard({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div className={`glass ${className}`} style={{ padding: '1.5rem' }} onClick={onClick}>
      {children}
    </div>
  )
}
