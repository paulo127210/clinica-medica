import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NAO_DEFINIDA'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NAO_DEFINIDA'

  let pacientes = null
  let erro = null

  try {
    const s = createClient(
      'https://gbjxjjncrvkkafkgvxvy.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdianhqam5jcnZra2Fma2d2eHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODAyMDUsImV4cCI6MjA5NzU1NjIwNX0.-4x133sQUacucSPcqBOVi2M5yRwF_rM9YFqqT6sXT7w'
    )
    const { data, error } = await s.from('pacientes').select('id,nome').limit(3)
    pacientes = data
    erro = error?.message
  } catch (e: any) {
    erro = e.message
  }

  return NextResponse.json({
    env_url: url.slice(0, 30) + '...',
    env_key_defined: key !== 'NAO_DEFINIDA',
    pacientes_encontrados: pacientes?.length ?? 0,
    pacientes,
    erro,
  })
}
