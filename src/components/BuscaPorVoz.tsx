'use client'

import { useEffect, useRef, useState } from 'react'
import { IconMicrophone, IconPlayerStopFilled } from '@tabler/icons-react'

// Tipos mínimos da Web Speech API (ainda fora do lib.dom do TypeScript).
interface ResultadoFala {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}
interface EventoFala extends Event {
  readonly resultIndex: number
  readonly results: { readonly length: number; readonly [i: number]: ResultadoFala }
}
interface EventoErroFala extends Event {
  readonly error: string
}
interface Reconhecedor {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: EventoFala) => void) | null
  onerror: ((e: EventoErroFala) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
type ConstrutorReconhecedor = new () => Reconhecedor

function obterReconhecedor(): ConstrutorReconhecedor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: ConstrutorReconhecedor; webkitSpeechRecognition?: ConstrutorReconhecedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const ERROS: Record<string, string> = {
  'not-allowed': 'Permita o uso do microfone no navegador para buscar por voz.',
  'service-not-allowed': 'Permita o uso do microfone no navegador para buscar por voz.',
  'no-speech': 'Não ouvimos nada. Toque no microfone e fale de novo.',
  'audio-capture': 'Não encontramos um microfone neste aparelho.',
  network: 'Sem conexão para reconhecer a fala. Tente de novo.',
}

// Botão de microfone da busca: a pessoa fala ("restaurante acessível em
// Maceió") e o texto entra no campo de busca enquanto ela fala. Só aparece
// nos navegadores que reconhecem fala (Chrome, Edge, Safari, Android).
export default function BuscaPorVoz({ onTexto }: { onTexto: (texto: string) => void }) {
  const [suportado, setSuportado] = useState(false)
  const [ouvindo, setOuvindo] = useState(false)
  const [aviso, setAviso] = useState('')
  const reconhecedor = useRef<Reconhecedor | null>(null)

  useEffect(() => {
    setSuportado(obterReconhecedor() !== null)
    return () => reconhecedor.current?.abort()
  }, [])

  function alternar() {
    if (ouvindo) {
      reconhecedor.current?.stop()
      return
    }
    const Construtor = obterReconhecedor()
    if (!Construtor) return
    const r = new Construtor()
    r.lang = 'pt-BR'
    r.interimResults = true
    r.continuous = false
    r.onresult = (e) => {
      let texto = ''
      for (let i = 0; i < e.results.length; i++) texto += e.results[i][0].transcript
      onTexto(texto.trim().replace(/[.!?]$/, ''))
    }
    r.onerror = (e) => {
      if (e.error !== 'aborted') setAviso(ERROS[e.error] ?? 'Não foi possível ouvir agora. Tente de novo.')
    }
    r.onend = () => setOuvindo(false)
    reconhecedor.current = r
    setAviso('')
    try {
      r.start()
      setOuvindo(true)
    } catch {
      setAviso('Não foi possível usar o microfone agora.')
    }
  }

  if (!suportado) return null

  return (
    <>
      <button
        type="button"
        onClick={alternar}
        aria-pressed={ouvindo}
        aria-label={ouvindo ? 'Parar de ouvir' : 'Buscar por voz'}
        title={ouvindo ? 'Parar de ouvir' : 'Buscar por voz'}
        className={ouvindo ? 'microfone-ouvindo' : undefined}
        style={{
          position: 'absolute',
          right: '0.5rem',
          // centralizado na altura do campo (não do bloco, que cresce com os avisos)
          top: 'calc(1.55rem - 19px)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: ouvindo ? '#dc2626' : 'var(--c-accent-soft)',
          color: ouvindo ? '#ffffff' : 'var(--c-accent-text)',
        }}
      >
        {ouvindo ? <IconPlayerStopFilled size={18} aria-hidden /> : <IconMicrophone size={20} aria-hidden />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {ouvindo ? 'Ouvindo. Fale o que você procura.' : ''}
      </span>
      {aviso && (
        <p role="alert" style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'var(--c-danger-text)' }}>
          {aviso}
        </p>
      )}
      {ouvindo && (
        <p aria-hidden style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'var(--c-accent-text)', fontWeight: 600 }}>
          Ouvindo… fale o nome, a cidade ou o tipo de lugar.
        </p>
      )}
    </>
  )
}
