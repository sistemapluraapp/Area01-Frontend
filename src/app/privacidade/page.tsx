'use client'

import { useEffect, useState } from 'react'
import { LandingSite } from '@/landing/LandingSite'
import { carregarSite, siteVazio, type DadosSite } from '@/landing/dados'
import Carregando from '@/components/Carregando'

// Etapa 9: política de privacidade da landing (texto editável no ADM)
export default function PrivacidadePage() {
  const [dados, setDados] = useState<DadosSite | null>(null)
  useEffect(() => {
    carregarSite().then(setDados).catch(() => setDados(siteVazio()))
  }, [])
  if (!dados) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Carregando /></div>
  const s = dados.settings
  return (
    <LandingSite dados={dados} titulo="Privacidade">
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-16">
        <h1 className="fp-heading fp-h2">Política de privacidade</h1>
        <div className="fp-prose mt-6 whitespace-pre-line">
          {s.privacy_text ||
            `A ${s.festival_name} usa os dados enviados pelo formulário de interesse (nome, e-mail e demais campos preenchidos) apenas para entrar em contato. Os dados não são vendidos nem compartilhados com terceiros. As estatísticas de visita são anônimas e não usam cookies. Para pedir a exclusão dos seus dados, fale com a equipe pelos contatos do rodapé.`}
        </div>
      </div>
    </LandingSite>
  )
}
