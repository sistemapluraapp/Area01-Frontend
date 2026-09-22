'use client'

import { useEffect, useState } from 'react'
import { api, type FiltroAcessibilidade } from './api'

interface FiltrosAcessibilidade {
  recursosLocal: FiltroAcessibilidade[]
  necessidadesPessoal: FiltroAcessibilidade[]
}

let cache: FiltrosAcessibilidade | null = null
let cachePromise: Promise<FiltrosAcessibilidade> | null = null

function carregarFiltros(): Promise<FiltrosAcessibilidade> {
  if (cache) return Promise.resolve(cache)
  if (!cachePromise) {
    cachePromise = api
      .listarFiltrosAcessibilidade()
      .then((res) => {
        cache = { recursosLocal: res.recursos_local, necessidadesPessoal: res.necessidades_pessoal }
        return cache
      })
      .catch((err) => {
        cachePromise = null
        throw err
      })
  }
  return cachePromise
}

export function useFiltrosAcessibilidade(): {
  recursosLocal: FiltroAcessibilidade[]
  necessidadesPessoal: FiltroAcessibilidade[]
  carregando: boolean
} {
  const [filtros, setFiltros] = useState<FiltrosAcessibilidade | null>(cache)
  const [carregando, setCarregando] = useState(!cache)

  useEffect(() => {
    if (cache) return
    let ativo = true
    carregarFiltros()
      .then((res) => {
        if (ativo) setFiltros(res)
      })
      .catch((err) => {
        console.error('Erro ao carregar filtros de acessibilidade', err)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  return {
    recursosLocal: filtros?.recursosLocal ?? [],
    necessidadesPessoal: filtros?.necessidadesPessoal ?? [],
    carregando,
  }
}
