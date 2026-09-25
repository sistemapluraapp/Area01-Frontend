'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Grain from '@/components/Grain'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import AcoesTopo from '@/components/AcoesTopo'
import BottomNav from '@/components/BottomNav'
import Cabecalho from '@/components/pagina/Cabecalho'
import Sobre from '@/components/pagina/Sobre'
import { NivelAcessibilidade, RecursosEquipamentos } from '@/components/pagina/Acessibilidade'
import Horario from '@/components/pagina/Horario'
import { Contato, Localizacao } from '@/components/pagina/Localizacao'
import Galeria, { itensDaGaleria } from '@/components/pagina/Galeria'
import Experiencias from '@/components/pagina/Experiencias'
import { ApresentacaoLibras, ComoEOLugar } from '@/components/pagina/Inclusao'
import Avaliacoes from '@/components/pagina/Avaliacoes'
import { AntesDeIr, Denunciar, Recomendacoes, Seguranca, SelosPrevia } from '@/components/pagina/Complementos'
import { TemaPaginaContext } from '@/components/pagina/ui'
import { api, type PaginaPublica } from '@/lib/api'
import { estaLogado } from '@/lib/auth'
import { exigirLogin } from '@/lib/exigirLogin'
import { temaValido } from '@/lib/temasPagina'
import { useCatalogo } from '@/lib/useCatalogo'

function PaginaEmpreendimento() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const catalogo = useCatalogo()
  const [pagina, setPagina] = useState<PaginaPublica | null>(null)
  const [erro, setErro] = useState('')
  const [favoritado, setFavoritado] = useState(false)

  useEffect(() => {
    // A página é aberta a visitantes; salvar, avaliar e denunciar pedem login
    if (!id) {
      setErro('Página não encontrada')
      return
    }
    api
      .obterPagina(id)
      .then((p) => {
        setPagina(p)
        document.title = `${p.nome} | Plura`
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Página não encontrada'))
    if (!estaLogado()) return
    api
      .listarFavoritos()
      .then(({ favoritos }) => setFavoritado(favoritos.some((f) => f.paginas.id === id)))
      .catch(() => {})
  }, [id])

  async function alternarFavorito() {
    if (!exigirLogin()) return
    const antes = favoritado
    setFavoritado(!antes)
    try {
      if (antes) await api.desfavoritar(id)
      else await api.favoritar(id)
    } catch {
      setFavoritado(antes)
    }
  }

  if (erro) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>{erro}</p>
        <a href="/" style={{ color: 'var(--c-accent-text)', fontWeight: 600 }}>
          Voltar para a busca
        </a>
      </div>
    )
  }

  if (!pagina) return <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)', padding: '2rem 0' }}>carregando…</p>

  const tema = temaValido(pagina.tema)

  return (
    <TemaPaginaContext.Provider value={tema}>
    <div data-tema={tema} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Leve tom da cor da página no fundo da tela */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'var(--p-bg)' }} />
      <Cabecalho
        p={pagina}
        catalogo={catalogo}
        favoritado={favoritado}
        onFavoritar={alternarFavorito}
        onVerGaleria={() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}
        totalMidias={itensDaGaleria(pagina).length}
      />
      <div style={{ height: '0.25rem' }} />
      <Sobre p={pagina} catalogo={catalogo} />
      <ApresentacaoLibras p={pagina} />
      <NivelAcessibilidade p={pagina} catalogo={catalogo} />
      <ComoEOLugar p={pagina} />
      <RecursosEquipamentos p={pagina} catalogo={catalogo} />
      <Horario p={pagina} />
      <Localizacao p={pagina} />
      <Contato p={pagina} />
      <Galeria p={pagina} id="galeria" />
      <Experiencias p={pagina} catalogo={catalogo} />
      <Avaliacoes p={pagina} />
      <Recomendacoes p={pagina} catalogo={catalogo} />
      <AntesDeIr p={pagina} catalogo={catalogo} />
      <Seguranca p={pagina} />
      <SelosPrevia />
      <Denunciar p={pagina} />
    </div>
    </TemaPaginaContext.Provider>
  )
}

export default function PaginaPage() {
  return (
    <>
      <Grain />
      <Header
        right={<AcoesTopo />}
      />
      <main id="conteudo" tabIndex={-1} style={{ maxWidth: '820px', margin: '0 auto', padding: '5.25rem 1rem 6.5rem', position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<p style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-3)' }}>carregando…</p>}>
          <PaginaEmpreendimento />
        </Suspense>
      </main>
      <Footer />
      <div style={{ height: '4.5rem' }} aria-hidden />
      <BottomNav />
    </>
  )
}
