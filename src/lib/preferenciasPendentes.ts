import { api } from './api'

// Preferências de turismo escolhidas no cadastro quando a conta ainda
// precisa confirmar o e-mail (sem sessão para gravar no perfil). São
// guardadas neste navegador e aplicadas no primeiro login.
const CHAVE = 'plura_preferencias_pendentes'

export function guardarPreferenciasPendentes(preferencias: string[]) {
  try {
    if (preferencias.length) localStorage.setItem(CHAVE, JSON.stringify(preferencias))
  } catch {
    // sem armazenamento: o usuário pode escolher de novo no perfil
  }
}

export async function aplicarPreferencias(preferencias?: string[]): Promise<void> {
  let lista = preferencias
  if (!lista) {
    try {
      lista = JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
    } catch {
      lista = []
    }
  }
  if (!lista?.length) return
  try {
    const perfil = await api.obterPerfil()
    await api.atualizarPerfil({ nome: perfil.nome, preferencias_turismo: lista })
    localStorage.removeItem(CHAVE)
  } catch {
    // tenta de novo no próximo login
  }
}
