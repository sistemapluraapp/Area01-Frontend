import type { DiaSemana, Horarios } from './api'

export const DIAS: { codigo: DiaSemana; rotulo: string; curto: string }[] = [
  { codigo: 'seg', rotulo: 'Segunda', curto: 'Seg' },
  { codigo: 'ter', rotulo: 'Terça', curto: 'Ter' },
  { codigo: 'qua', rotulo: 'Quarta', curto: 'Qua' },
  { codigo: 'qui', rotulo: 'Quinta', curto: 'Qui' },
  { codigo: 'sex', rotulo: 'Sexta', curto: 'Sex' },
  { codigo: 'sab', rotulo: 'Sábado', curto: 'Sáb' },
  { codigo: 'dom', rotulo: 'Domingo', curto: 'Dom' },
]

const ORDEM_JS: DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Dia da semana e minuto atual no horário de Brasília (o horário cadastrado
// é o local do empreendimento; todos os empreendimentos estão no Brasil).
function agoraEmBrasilia(data = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(data)
  const dia = partes.find((p) => p.type === 'weekday')?.value ?? 'Mon'
  const hora = Number(partes.find((p) => p.type === 'hour')?.value ?? 0) % 24
  const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? 0)
  const indice = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(dia)
  return { dia: ORDEM_JS[indice], minuto: hora * 60 + minuto, indice }
}

export function temHorarios(horarios: Horarios | null | undefined): boolean {
  return !!horarios && Object.values(horarios).some((t) => t && t.length > 0)
}

// "Aberto agora": considera turnos que passam da meia-noite (fecha < abre).
export function abertoAgora(horarios: Horarios, data = new Date()): boolean {
  const { dia, minuto, indice } = agoraEmBrasilia(data)
  for (const t of horarios[dia] ?? []) {
    const abre = minutos(t.abre)
    const fecha = minutos(t.fecha)
    if (fecha > abre ? minuto >= abre && minuto < fecha : minuto >= abre) return true
  }
  const ontem = ORDEM_JS[(indice + 6) % 7]
  for (const t of horarios[ontem] ?? []) {
    if (minutos(t.fecha) < minutos(t.abre) && minuto < minutos(t.fecha)) return true
  }
  return false
}

export function turnosDoDia(horarios: Horarios, dia: DiaSemana): string {
  const turnos = horarios[dia] ?? []
  return turnos.length ? turnos.map((t) => `${t.abre.replace(':00', 'h')} às ${t.fecha.replace(':00', 'h')}`).join(' · ') : 'Fechado'
}

// Resumo agrupando dias consecutivos com o mesmo horário ("Segunda a sexta · 11h às 23h")
export function resumoHorarios(horarios: Horarios): { dias: string; horas: string }[] {
  const grupos: { inicio: number; fim: number; horas: string }[] = []
  DIAS.forEach((d, i) => {
    const horas = turnosDoDia(horarios, d.codigo)
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo.horas === horas && ultimo.fim === i - 1) ultimo.fim = i
    else grupos.push({ inicio: i, fim: i, horas })
  })
  return grupos
    .filter((g) => g.horas !== 'Fechado' || grupos.length === 1)
    .map((g) => ({
      dias: g.inicio === g.fim ? DIAS[g.inicio].rotulo : `${DIAS[g.inicio].rotulo} a ${DIAS[g.fim].rotulo.toLowerCase()}`,
      horas: g.horas,
    }))
}

export function hojeCodigo(): DiaSemana {
  return agoraEmBrasilia().dia
}
