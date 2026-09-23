'use client'

import { createContext, useContext, useEffect, type CSSProperties, type ReactNode } from 'react'
import { IconStarFilled, IconStarHalfFilled, IconX } from '@tabler/icons-react'
import Portal from '../Portal'

// Cor da página atual. Os modais são renderizados direto no <body> (fora do
// contêiner [data-tema]), então levam o tema junto por este contexto.
export const TemaPaginaContext = createContext<string>('plura')

// Elementos visuais da página do empreendimento. As cores de destaque vêm
// do tema da página (--p-accent...), definido no contêiner [data-tema].

export function Cartao({ children, style, id }: { children: ReactNode; style?: CSSProperties; id?: string }) {
  return (
    <section
      id={id}
      style={{
        background: 'var(--c-glass-bg-lg)',
        border: 'var(--c-border)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: 'var(--c-shadow-sm)',
        ...style,
      }}
    >
      {children}
    </section>
  )
}

export function TituloSecao({ children, acao, id }: { children: ReactNode; acao?: ReactNode; id?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
      <h2 id={id} style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
        {children}
      </h2>
      {acao}
    </div>
  )
}

export function LinkAcao({ children, onClick, href }: { children: ReactNode; onClick?: () => void; href?: string }) {
  const estilo: CSSProperties = { background: 'none', border: 'none', padding: 0, color: 'var(--p-accent-text)', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={estilo}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} style={estilo}>
      {children}
    </button>
  )
}

export function BotaoContorno({ children, onClick, style, rotulo }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; rotulo?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.6rem 0.95rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--p-soft-border)',
        background: 'var(--c-glass-bg-lg)',
        color: 'var(--p-accent-text)',
        fontWeight: 600,
        fontSize: '0.875rem',
        fontFamily: 'inherit',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Estrelas({ nota, tamanho = 16 }: { nota: number; tamanho?: number }) {
  return (
    <span role="img" aria-label={`${nota.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} de 5 estrelas`} style={{ display: 'inline-flex', gap: '1px', color: '#f59e0b', verticalAlign: 'middle' }}>
      {[1, 2, 3, 4, 5].map((i) =>
        nota >= i ? (
          <IconStarFilled key={i} size={tamanho} aria-hidden />
        ) : nota >= i - 0.5 ? (
          <IconStarHalfFilled key={i} size={tamanho} aria-hidden />
        ) : (
          <IconStarFilled key={i} size={tamanho} style={{ opacity: 0.22 }} aria-hidden />
        )
      )}
    </span>
  )
}

export function formatarNota(nota: number): string {
  return nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function Modal({ titulo, onClose, children, largura = 560 }: { titulo: string; onClose: () => void; children: ReactNode; largura?: number }) {
  const tema = useContext(TemaPaginaContext)
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', aoTeclar)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return (
    <Portal>
    <div data-tema={tema} role="dialog" aria-modal="true" aria-label={titulo} onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 10040, background: 'var(--c-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'ep-fade 150ms ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: `${largura}px`, maxHeight: '90vh', overflowY: 'auto', background: 'var(--c-modal-bg)', color: 'var(--c-text-1)', border: 'var(--c-border)', borderRadius: '1.25rem', boxShadow: 'var(--c-shadow-lg)', animation: 'ep-scale 180ms ease' }}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--c-modal-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-divider)', zIndex: 1 }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', color: 'var(--c-text-2)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
            <IconX size={20} />
          </button>
        </div>
        <div style={{ padding: '1.25rem' }}>{children}</div>
      </div>
    </div>
    </Portal>
  )
}

// Ícone dentro de um círculo com a cor da página
export function IconeRedondo({ children, tamanho = 44, cheio = false }: { children: ReactNode; tamanho?: number; cheio?: boolean }) {
  return (
    <span aria-hidden style={{ width: tamanho, height: tamanho, flexShrink: 0, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: cheio ? 'var(--p-accent)' : 'var(--p-soft)', color: cheio ? 'var(--p-accent-contrast)' : 'var(--p-accent-text)' }}>
      {children}
    </span>
  )
}

// Texto livre: parágrafos separados por linha em branco, "- " vira lista e
// links http(s) ficam clicáveis. Tudo renderizado como texto (sem HTML).
export function TextoFormatado({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n\s*\n/)
  const comLinks = (linha: string) =>
    linha.split(/(https?:\/\/[^\s]+)/g).map((parte, i) =>
      /^https?:\/\//.test(parte) ? (
        <a key={i} href={parte} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--p-accent-text)', wordBreak: 'break-all' }}>
          {parte}
        </a>
      ) : (
        parte
      )
    )
  return (
    <>
      {blocos.map((bloco, i) => {
        const linhas = bloco.split('\n')
        if (linhas.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={i} style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', lineHeight: 1.7 }}>
              {linhas.map((l, j) => (
                <li key={j}>{comLinks(l.replace(/^\s*[-•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} style={{ margin: '0 0 0.75rem', lineHeight: 1.7 }}>
            {linhas.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {comLinks(l)}
              </span>
            ))}
          </p>
        )
      })}
    </>
  )
}
