'use client'

import { useEffect, useMemo, useState } from 'react'
import { api, type Catalogo, type ItemCatalogo } from './api'

// Catálogo mantido pela Área 04 (rótulos e ícones), carregado uma vez por visita.
let cache: Catalogo | null = null
let pendente: Promise<Catalogo> | null = null

function carregar(): Promise<Catalogo> {
  if (cache) return Promise.resolve(cache)
  pendente ??= api
    .catalogo()
    .then((c) => (cache = c))
    .catch((e) => {
      pendente = null
      throw e
    })
  return pendente
}

const VAZIO: Catalogo = { categorias: [], tags: [], antes_de_ir: [], preferencias_turismo: [], grupos_acessibilidade: [] }

export function useCatalogo() {
  const [catalogo, setCatalogo] = useState<Catalogo | null>(cache)

  useEffect(() => {
    if (cache) return
    let ativo = true
    carregar()
      .then((c) => ativo && setCatalogo(c))
      .catch((e) => console.error('Erro ao carregar catálogo', e))
    return () => {
      ativo = false
    }
  }, [])

  return useMemo(() => {
    const c = catalogo ?? VAZIO
    const mapa = (itens: ItemCatalogo[]) => Object.fromEntries(itens.map((i) => [i.codigo, i]))
    const recursos = c.grupos_acessibilidade.flatMap((g) => g.recursos)
    return {
      carregado: catalogo !== null,
      catalogo: c,
      categorias: mapa(c.categorias),
      tags: mapa(c.tags),
      antesDeIr: mapa(c.antes_de_ir),
      preferencias: mapa(c.preferencias_turismo),
      recursos: mapa(recursos),
    }
  }, [catalogo])
}
