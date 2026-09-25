import { estaLogado } from './auth'

// Para ações que precisam de conta (salvar destino, avaliar, denunciar):
// sem login, leva ao login e depois volta para a mesma página.
export function exigirLogin(): boolean {
  if (estaLogado()) return true
  const aqui = `${window.location.pathname}${window.location.search}`
  window.location.href = `/login?destino=${encodeURIComponent(aqui)}`
  return false
}
