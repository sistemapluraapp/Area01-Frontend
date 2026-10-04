'use client'

import { useEffect, useState } from 'react'
import Carregando from '@/components/Carregando'
import { salvarSessao } from '@/lib/auth'
import { destinoSeguro } from '@/lib/destino'
import { useTituloPagina } from '@/lib/useTituloPagina'

// Passagem automática de sessão vinda das Áreas 02 e 03 (menu "Início" e
// "Agenda"): quem já está logado lá continua logado na busca.
// Os tokens chegam no fragmento da URL (#...), que o navegador não envia ao
// servidor nem registra em logs; são gravados e o fragmento é apagado do
// histórico antes de seguir para o destino.
export default function SessaoPage() {
  useTituloPagina('Entrando')
  const [erro, setErro] = useState(false)

  useEffect(() => {
    const dados = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = dados.get('access_token')
    const refreshToken = dados.get('refresh_token')
    const userId = dados.get('user_id')
    window.history.replaceState(null, '', window.location.pathname)

    if (!accessToken || !refreshToken || !userId) {
      setErro(true)
      return
    }
    salvarSessao({ access_token: accessToken, refresh_token: refreshToken, user: { id: userId, email: dados.get('email') ?? '' } })
    window.location.replace(destinoSeguro(dados.get('destino')))
  }, [])

  return (
    <main id="conteudo" tabIndex={-1} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
      {erro ? (
        <p>
          Não foi possível continuar a sessão. <a href="/login" style={{ color: 'var(--c-accent-text)', fontWeight: 600 }}>Entrar novamente</a>
        </p>
      ) : (
        <Carregando texto="Entrando…" />
      )}
    </main>
  )
}
