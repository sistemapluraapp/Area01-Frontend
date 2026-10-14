'use client'

import { useEffect, useState } from 'react'
import { LandingSite } from '@/landing/LandingSite'
import { Tracker } from '@/landing/Tracker'
import { PageRenderer } from '@/landing/shared/render/PageRenderer'
import { defaultHomeContent } from '@/landing/shared/blocks'
import { currentTime } from '@/landing/shared/format'
import { carregarSite, siteVazio, type DadosSite } from '@/landing/dados'
import Carregando from '@/components/Carregando'

// Etapa 9: página inicial de plura.app.br (landing editada no ADM). A busca fica em /buscar.
export default function InicioPage() {
  const [dados, setDados] = useState<DadosSite | null>(null)

  useEffect(() => {
    // Link de recuperação de senha que caiu na raiz: leva para a tela de nova senha
    if (/(^|&)type=recovery(&|$)/.test(window.location.hash.slice(1))) {
      window.location.replace(`/redefinir-senha${window.location.hash}`)
      return
    }
    carregarSite(true).then(setDados).catch(() => setDados(siteVazio()))
  }, [])

  if (!dados) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Carregando /></div>
  const home = dados.home
  const content = home?.content.sections.length ? home.content : defaultHomeContent()
  return (
    <LandingSite dados={dados}>
      <PageRenderer content={content} ctx={{ mode: 'public', pageId: home?.id, settings: dados.settings, events: dados.events, now: currentTime() }} />
      <Tracker pageId={home?.id} />
    </LandingSite>
  )
}
