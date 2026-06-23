import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

const comAtivo = ['pacientes','medicos','funcionarios','produtos','procedimentos']

export async function GET(req: NextRequest) {
  const p     = req.nextUrl.searchParams
  const tabela = p.get('tabela')
  const busca  = p.get('busca') || ''
  const select = p.get('select') || '*'
  const order  = p.get('order') || 'id'
  const filtro = p.get('filtro') // ex: "medico_id=5"
  const limit  = parseInt(p.get('limit') || '200')

  if (!tabela) return NextResponse.json({ erro: 'tabela obrigatória' }, { status: 400 })

  try {
    let q: any = sb.from(tabela).select(select)

    if (comAtivo.includes(tabela)) q = q.eq('ativo', true)

    if (busca) {
      if (['pacientes','funcionarios'].includes(tabela)) q = q.ilike('nome', `%${busca}%`)
    }

    if (filtro) {
      const [col, val] = filtro.split('=')
      if (col && val) q = q.eq(col, val)
    }

    const gte = p.get('gte') // ex: "data_hora=2026-06-22T00:00:00"
    const lte = p.get('lte')
    if (gte) { const [col, val] = gte.split('='); if (col && val) q = q.gte(col, val) }
    if (lte) { const [col, val] = lte.split('='); if (col && val) q = q.lte(col, val) }

    const asc = p.get('asc') // se "false", descending
    q = q.order(order, { ascending: asc !== 'false' }).limit(limit)

    const { data, error } = await q
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const tabela = req.nextUrl.searchParams.get('tabela')
  if (!tabela) return NextResponse.json({ erro: 'tabela obrigatória' }, { status: 400 })
  try {
    const body = await req.json()
    const { data, error } = await sb.from(tabela).insert(body).select()
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const p     = req.nextUrl.searchParams
  const tabela = p.get('tabela')
  const id     = p.get('id')
  if (!tabela || !id) return NextResponse.json({ erro: 'tabela e id obrigatórios' }, { status: 400 })
  try {
    const body = await req.json()
    const { data, error } = await sb.from(tabela).update(body).eq('id', id).select()
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 })
  }
}
