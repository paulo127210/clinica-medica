import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

export async function POST(req: NextRequest) {
  const { paciente_id, medico_id, data, hora, motivo } = await req.json()

  if (!paciente_id || !medico_id || !data || !hora)
    return NextResponse.json({ erro: 'Dados incompletos.' }, { status: 400 })

  const data_hora = `${data}T${hora}:00`

  // Verifica se horário ainda está livre
  const { data: conflito } = await sb
    .from('consultas')
    .select('id')
    .eq('medico_id', medico_id)
    .eq('data_hora', data_hora)
    .not('status', 'in', '(CANCELADA)')
    .single()

  if (conflito) return NextResponse.json({ erro: 'Este horário já foi reservado. Escolha outro.' }, { status: 409 })

  const { data: consulta, error } = await sb.from('consultas').insert({
    paciente_id: Number(paciente_id),
    medico_id: Number(medico_id),
    data_hora,
    duracao_minutos: 30,
    status: 'AGENDADA',
    tipo: 'PRIMEIRA_VEZ',
    motivo: motivo || 'Consulta agendada pelo paciente',
  }).select('id').single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, consulta_id: consulta.id })
}
