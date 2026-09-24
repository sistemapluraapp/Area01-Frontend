import { obterRefreshToken, obterToken, obterUsuarioSalvo } from './auth'

// Painel de gestão de empreendimentos (Área 02). O botão "Gerenciar" leva a
// sessão junto, pelo fragmento da URL (#...), que o navegador não envia ao
// servidor; a página /sessao da Área 02 grava a sessão e apaga o fragmento.
const AREA02_URL = process.env.NEXT_PUBLIC_AREA02_FRONTEND_URL ?? 'https://login.plura.app.br'

export function urlGerenciar(destino: string): string {
  const token = obterToken()
  const refresh = obterRefreshToken()
  const usuario = obterUsuarioSalvo()
  if (!token || !refresh || !usuario) return `${AREA02_URL}/login?destino=${encodeURIComponent(destino)}`

  const dados = new URLSearchParams({ access_token: token, refresh_token: refresh, user_id: usuario.id, destino })
  if (usuario.email) dados.set('email', usuario.email)
  return `${AREA02_URL}/sessao#${dados.toString()}`
}
