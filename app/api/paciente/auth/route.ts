import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

export async function POST(req: NextRequest) {
  const { cpf, nascimento } = await req.json()
  if (!cpf || !nascimento) return NextResponse.json({ erro: 'CPF e data de nascimento obrigatórios.' }, { status: 400 })

  const cpfLimpo = cpf.replace(/\D/g, '')
  const { data, error } = await sb
    .from('pacientes')
    .select('id, nome, cpf, data_nascimento, celular, email')
    .eq('cpf', cpfLimpo)
    .eq('ativo', true)
    .single()

  if (error || !data) return NextResponse.json({ erro: 'CPF não encontrado. Faça seu cadastro.' }, { status: 401 })

  // Verifica data de nascimento
  if (data.data_nascimento !== nascimento)
    return NextResponse.json({ erro: 'Data de nascimento incorreta.' }, { status: 401 })

  return NextResponse.json({ paciente: data })
}
