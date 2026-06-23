import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

export async function POST(req: NextRequest) {
  try {
    const form = await req.json()

    const { data: usu, error: eUsu } = await sb.from('usuarios').insert([{
      perfil_id: 2,
      nome: form.nome,
      email: form.email || `${form.crm.toLowerCase().replace(/[^a-z0-9]/g,'')}@clinica.com`,
      senha_hash: 'hash_placeholder',
      salt: 'salt_placeholder',
    }]).select('id').single()
    if (eUsu) return NextResponse.json({ erro: 'Erro ao criar usuário: ' + eUsu.message }, { status: 500 })

    const { data: func, error: eFunc } = await sb.from('funcionarios').insert([{
      usuario_id: usu.id,
      cargo_id: 1,
      nome: form.nome,
      cpf: form.cpf || null,
      celular: form.celular || null,
      data_nascimento: form.data_nascimento,
      sexo: form.sexo,
      data_admissao: form.data_admissao,
      salario: parseFloat(form.salario) || 15000,
    }]).select('id').single()
    if (eFunc) return NextResponse.json({ erro: 'Erro ao criar funcionário: ' + eFunc.message }, { status: 500 })

    const { error: eMed } = await sb.from('medicos').insert([{
      funcionario_id: func.id,
      especialidade_id: parseInt(form.especialidade_id),
      crm: form.crm,
      crm_estado: form.crm_estado,
      valor_consulta: parseFloat(form.valor_consulta),
      percentual_repasse: parseFloat(form.percentual_repasse) || 60,
    }])
    if (eMed) return NextResponse.json({ erro: 'Erro ao criar médico: ' + eMed.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
