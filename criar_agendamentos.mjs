import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

// Buscar médicos, pacientes e procedimentos
const { data: medicos } = await supabase.from('medicos').select('id, funcionarios(nome)').eq('ativo', true)
const { data: pacientes } = await supabase.from('pacientes').select('id, nome').eq('ativo', true).limit(20)
const { data: procedimentos } = await supabase.from('procedimentos').select('id, nome').eq('ativo', true).limit(5)

console.log(`Médicos: ${medicos?.length}, Pacientes: ${pacientes?.length}, Procedimentos: ${procedimentos?.length}`)

if (!medicos?.length || !pacientes?.length) {
  console.log('Sem médicos ou pacientes cadastrados.')
  process.exit(1)
}

// Datas de 22/06 a 26/06/2026
const datas = ['2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26']
// Horários disponíveis
const horarios = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00']

const agendamentos = []
let pacienteIdx = 0

for (const medico of medicos) {
  // 6 agendamentos por médico, distribuídos entre os dias
  for (let i = 0; i < 6; i++) {
    const data = datas[i % datas.length]
    const hora = horarios[i]
    const paciente = pacientes[pacienteIdx % pacientes.length]
    const proc = procedimentos?.[i % (procedimentos?.length || 1)]
    pacienteIdx++

    agendamentos.push({
      paciente_id:     paciente.id,
      medico_id:       medico.id,
      procedimento_id: proc?.id || null,
      data_hora:       `${data} ${hora}:00`,
      duracao_minutos: 30,
      status:          'AGENDADA',
      tipo:            i === 0 ? 'PRIMEIRA_VEZ' : 'RETORNO',
      motivo:          'Consulta de rotina',
    })
  }
}

console.log(`Inserindo ${agendamentos.length} agendamentos...`)
const { data, error } = await supabase.from('consultas').insert(agendamentos).select('id')

if (error) {
  console.error('Erro:', error.message)
} else {
  console.log(`✓ ${data.length} agendamentos criados com sucesso!`)
  for (const med of medicos) {
    console.log(`  Médico ID ${med.id} (${med.funcionarios?.nome}) — 6 consultas agendadas`)
  }
}
