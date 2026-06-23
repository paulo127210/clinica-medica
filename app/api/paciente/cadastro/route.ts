import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

export async function POST(req: NextRequest) {
  const { nome, cpf, nascimento, sexo, celular, email } = await req.json()

  const cpfLimpo = cpf.replace(/\D/g, '')
  if (!nome || cpfLimpo.length < 11 || !nascimento)
    return NextResponse.json({ erro: 'Preencha nome, CPF e data de nascimento.' }, { status: 400 })

  // Verifica se CPF já existe
  const { data: existe } = await sb.from('pacientes').select('id').eq('cpf', cpfLimpo).single()
  if (existe) return NextResponse.json({ erro: 'CPF já cadastrado. Faça login.' }, { status: 409 })

  const { data, error } = await sb.from('pacientes').insert({
    nome,
    cpf: cpfLimpo,
    data_nascimento: nascimento,
    sexo: sexo || 'M',
    celular: celular || null,
    email: email || null,
    ativo: true,
  }).select('id, nome, cpf, data_nascimento, celular, email').single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ paciente: data })
}
