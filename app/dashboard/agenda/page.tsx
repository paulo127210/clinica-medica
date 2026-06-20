'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, User, UserRound, MapPin } from 'lucide-react'

const statusColor: Record<string, string> = {
  AGENDADA:       'bg-blue-100 text-blue-700 border-blue-200',
  CONFIRMADA:     'bg-green-100 text-green-700 border-green-200',
  REALIZADA:      'bg-gray-100 text-gray-600 border-gray-200',
  CANCELADA:      'bg-red-100 text-red-700 border-red-200',
  EM_ATENDIMENTO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  FALTOU:         'bg-orange-100 text-orange-700 border-orange-200',
}

export default function AgendaPage() {
  const [consultas, setConsultas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: rows } = await supabase
        .from('vw_agenda_diaria')
        .select('*')
        .gte('data_hora', `${data}T00:00:00`)
        .lte('data_hora', `${data}T23:59:59`)
        .order('data_hora')
      setConsultas(rows || [])
      setLoading(false)
    }
    load()
  }, [data])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <p className="text-gray-500 text-sm mt-1">{consultas.length} consultas no dia</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : consultas.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="text-lg">Nenhuma consulta agendada para este dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultas.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition">
              <div className="text-center min-w-[60px]">
                <p className="text-lg font-bold text-blue-600">
                  {new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-400">horário</p>
              </div>
              <div className="w-px h-12 bg-gray-100" />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Paciente</p>
                    <p className="text-sm font-semibold text-gray-800">{c.paciente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Médico</p>
                    <p className="text-sm font-semibold text-gray-800">{c.medico}</p>
                    <p className="text-xs text-gray-400">{c.especialidade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Sala</p>
                    <p className="text-sm text-gray-700">{c.sala || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Convênio</p>
                    <p className="text-sm text-gray-700">{c.convenio || 'Particular'}</p>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                {c.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
