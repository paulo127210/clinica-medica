import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://gbjxjjncrvkkafkgvxvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
)

const HORARIOS_PADRAO = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30']

export async function GET(req: NextRequest) {
  const medico_id = req.nextUrl.searchParams.get('medico_id')
  const data = req.nextUrl.searchParams.get('data')
  if (!medico_id || !data) return NextResponse.json({ horarios: [] })

  // Busca horários já ocupados
  const { data: ocupados } = await sb
    .from('consultas')
    .select('data_hora')
    .eq('medico_id', medico_id)
    .gte('data_hora', `${data}T00:00:00`)
    .lte('data_hora', `${data}T23:59:59`)
    .not('status', 'in', '(CANCELADA)')

  const ocupadosSet = new Set(
    (ocupados || []).map(c => new Date(c.data_hora).toTimeString().slice(0, 5))
  )

  const livres = HORARIOS_PADRAO.filter(h => !ocupadosSet.has(h))
  return NextResponse.json({ horarios: livres })
}
