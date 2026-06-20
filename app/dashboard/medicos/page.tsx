'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserRound, Award, TrendingUp } from 'lucide-react'

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vw_producao_medicos').select('*').order('total_recebido', { ascending: false })
      .then(({ data }) => { setMedicos(data || []); setLoading(false) })
  }, [])

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Médicos</h2>
        <p className="text-gray-500 text-sm mt-1">Produção e desempenho dos médicos</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : medicos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <UserRound className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>Nenhum médico cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {medicos.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <UserRound className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{m.medico}</p>
                  <p className="text-xs text-gray-400">{m.especialidade} · CRM {m.crm}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Consultas</p>
                  <p className="text-lg font-bold text-gray-800">{m.consultas_realizadas || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Repasse Est.</p>
                  <p className="text-sm font-bold text-teal-600">{fmt(m.repasse_estimado)}</p>
                </div>
                <div className="col-span-2 bg-green-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total Recebido</p>
                    <p className="text-sm font-bold text-green-600">{fmt(m.total_recebido)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{m.total_consultas || 0} agendadas</span>
                {m.faltas > 0 && <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full">{m.faltas} faltas</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
