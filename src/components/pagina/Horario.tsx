'use client'

import { useState } from 'react'
import { IconCalendarTime } from '@tabler/icons-react'
import { BotaoContorno, Cartao, IconeRedondo, Modal, TextoFormatado, TituloSecao } from './ui'
import type { PaginaPublica } from '@/lib/api'
import { DIAS, abertoAgora, hojeCodigo, resumoHorarios, temHorarios, turnosDoDia } from '@/lib/horarios'

export default function Horario({ p }: { p: PaginaPublica }) {
  const [aberto, setAberto] = useState(false)
  const tem = temHorarios(p.horarios)
  if (!tem && !p.feriados && !p.requer_agendamento && !p.tempo_medio && !p.antecedencia) return null

  const agora = tem ? abertoAgora(p.horarios) : null
  const hoje = hojeCodigo()

  return (
    <Cartao>
      <TituloSecao
        acao={
          agora !== null && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '9999px', color: agora ? 'var(--c-success-text)' : 'var(--c-danger-text)', background: agora ? 'var(--c-success-soft)' : 'var(--c-danger-soft)' }}>
              {agora ? 'Aberto agora' : 'Fechado agora'}
            </span>
          )
        }
      >
        Horário de funcionamento
      </TituloSecao>
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <IconeRedondo tamanho={44}>
          <IconCalendarTime size={22} aria-hidden />
        </IconeRedondo>
        <div style={{ flex: '1 1 200px' }}>
          {tem ? (
            resumoHorarios(p.horarios).map((r) => (
              <p key={r.dias} style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem' }}>
                <strong>{r.dias}</strong> <span style={{ color: 'var(--c-text-2)' }}>· {r.horas}</span>
              </p>
            ))
          ) : (
            <p style={{ margin: 0, color: 'var(--c-text-2)' }}>Horários não informados.</p>
          )}
          {p.feriados && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--c-text-2)' }}>Feriados: {p.feriados.split('\n')[0]}</p>}
        </div>
        <BotaoContorno onClick={() => setAberto(true)}>Ver calendário completo</BotaoContorno>
      </div>

      {aberto && (
        <Modal titulo="Calendário de funcionamento" onClose={() => setAberto(false)} largura={480}>
          {tem && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <caption style={{ textAlign: 'left', fontSize: '0.8125rem', color: 'var(--c-text-3)', marginBottom: '0.5rem' }}>Horário de Brasília</caption>
              <tbody>
                {DIAS.map((d) => (
                  <tr key={d.codigo} style={{ borderBottom: '1px solid var(--c-divider)', fontWeight: d.codigo === hoje ? 700 : 400 }}>
                    <th scope="row" style={{ textAlign: 'left', padding: '0.6rem 0', fontWeight: 'inherit' }}>
                      {d.rotulo}
                      {d.codigo === hoje && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--p-accent-text)' }}>hoje</span>}
                    </th>
                    <td style={{ textAlign: 'right', padding: '0.6rem 0', color: turnosDoDia(p.horarios, d.codigo) === 'Fechado' ? 'var(--c-text-3)' : 'var(--c-text-1)' }}>{turnosDoDia(p.horarios, d.codigo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <dl style={{ margin: '1rem 0 0', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
            <dt style={{ color: 'var(--c-text-2)' }}>Agendamento</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{p.requer_agendamento ? 'Necessário' : 'Não é necessário'}</dd>
            {p.tempo_medio && (
              <>
                <dt style={{ color: 'var(--c-text-2)' }}>Tempo médio</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{p.tempo_medio}</dd>
              </>
            )}
            {p.antecedencia && (
              <>
                <dt style={{ color: 'var(--c-text-2)' }}>Antecedência</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{p.antecedencia}</dd>
              </>
            )}
          </dl>
          {p.feriados && (
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--c-text-2)' }}>
              <p style={{ fontWeight: 700, color: 'var(--c-text-1)', margin: '0 0 0.25rem' }}>Feriados e datas especiais</p>
              <TextoFormatado texto={p.feriados} />
            </div>
          )}
        </Modal>
      )}
    </Cartao>
  )
}
