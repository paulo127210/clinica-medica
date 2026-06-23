import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

export async function POST(req: NextRequest) {
  try {
    const form = await req.json()

    const email = form.email || `${form.nome.toLowerCase().replace(/\s+/g,'.').normalize('NFD').replace(/[̀-ͯ]/g,'')}@clinica.com`
    const { data: usu, error: eUsu } = await sb.from('usuarios').insert([{
      perfil_id: 3,
      nome: form.nome,
      email,
      senha_hash: 'hash_placeholder',
      salt: 'salt_placeholder',
    }]).select('id').single()
    if (eUsu) return NextResponse.json({ erro: eUsu.message }, { status: 500 })

    const { error: eFunc } = await sb.from('funcionarios').insert([{
      usuario_id: usu.id,
      cargo_id: parseInt(form.cargo_id),
      nome: form.nome,
      cpf: form.cpf || null,
      celular: form.celular || null,
      data_nascimento: form.data_nascimento,
      sexo: form.sexo,
      data_admissao: form.data_admissao,
      salario: parseFloat(form.salario) || null,
    }])
    if (eFunc) return NextResponse.json({ erro: eFunc.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
