'use client'

import { useEffect, useRef, useState } from 'react'
import GlassCard from './GlassCard'
import { BellIcon } from './icons'
import { api, type Notificacao } from '@/lib/api'

export default function NotificationBell() {
  const [aberto, setAberto] = useState(false)
  const [total, setTotal] = useState(0)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [carregando, setCarregando] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function atualizarContagem() {
      api
        .contarNaoLidas()
        .then(({ total }) => setTotal(total))
        .catch(() => {})
    }

    atualizarContagem()
    const intervalo = setInterval(atualizarContagem, 60000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  function alternarPainel() {
    const vaiAbrir = !aberto
    setAberto(vaiAbrir)
    if (vaiAbrir) {
      setCarregando(true)
      api
        .listarNotificacoes()
        .then(({ notificacoes }) => setNotificacoes(notificacoes))
        .catch(() => {})
        .finally(() => setCarregando(false))
    }
  }

  async function clicarNotificacao(n: Notificacao) {
    if (n.lida) return
    setNotificacoes((atual) => atual.map((x) => (x.id === n.id ? { ...x, lida: true } : x)))
    setTotal((t) => Math.max(0, t - 1))
    try {
      await api.marcarNotificacaoComoLida(n.id)
    } catch {
      // mantém o estado otimista mesmo se a requisição falhar
    }
  }

  async function marcarTodasComoLidas() {
    setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })))
    setTotal(0)
    try {
      await api.marcarTodasNotificacoesComoLidas()
    } catch {
      // mantém o estado otimista mesmo se a requisição falhar
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={alternarPainel}
        aria-label="Notificações"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          background: 'var(--c-glass-bg-sm)',
          border: '1px solid var(--c-input-border)',
          borderRadius: '0.75rem',
          color: 'var(--c-text-1)',
          cursor: 'pointer',
        }}
      >
        <BellIcon />
        {total > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '1.05rem',
              height: '1.05rem',
              padding: '0 0.25rem',
              borderRadius: '9999px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: 700,
              lineHeight: '1.05rem',
              textAlign: 'center',
              boxShadow: '0 0 0 2px var(--c-bg)',
            }}
          >
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {aberto && (
        <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 200, width: '320px', maxWidth: '90vw' }}>
          <GlassCard variant="lg" style={{ padding: '0.875rem', maxHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Notificações</span>
              <button
                onClick={marcarTodasComoLidas}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--c-text-blue)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Marcar todas como lidas
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {carregando ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', padding: '0.75rem 0', textAlign: 'center' }}>
                  carregando…
                </p>
              ) : notificacoes.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', padding: '0.75rem 0', textAlign: 'center' }}>
                  Nenhuma notificação por aqui.
                </p>
              ) : (
                notificacoes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => clicarNotificacao(n)}
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'flex-start',
                      padding: '0.625rem 0.625rem',
                      borderRadius: '0.625rem',
                      background: n.lida ? 'transparent' : 'var(--c-glass-bg-blue)',
                      border: n.lida ? '1px solid transparent' : 'var(--c-border-blue)',
                      opacity: n.lida ? 0.55 : 1,
                      cursor: n.lida ? 'default' : 'pointer',
                    }}
                  >
                    <span
                      style={{
                        marginTop: '0.375rem',
                        width: '0.4rem',
                        height: '0.4rem',
                        borderRadius: '9999px',
                        background: n.lida ? 'transparent' : 'var(--blue-500)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.125rem' }}>{n.titulo}</p>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--c-text-2)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {n.corpo}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
