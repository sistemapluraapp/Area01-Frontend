import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plura — Área 01',
  description: 'Busca de Páginas, login e perfil — Plura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
