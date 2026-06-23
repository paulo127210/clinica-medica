'use client'
import { useEffect, useState } from 'react'
import { Users, UserRound, Calendar, DollarSign, AlertTriangle, TrendingUp, Activity, Package } from 'lucide-react'

interface Dashboard {
  total_pacientes: number
  total_medicos: number
  consultas_hoje: number
  atendimentos_hoje: number
  receita_hoje: number
  receita_mes: number
  titulos_vencidos: number
  estoque_critico: number
}

function StatCard({ title, value, icon: Icon, bg, sub }: {
  title: string; value: string | number; icon: any; bg: string; sub?: string
}) {
  return (
    <div className={`rounded-2xl shadow-md p-6 flex items-center gap-4 text-white ${bg}`}>
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}


export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dados?tabela=vw_dashboard&limit=1')
      .then(r => r.json())
      .then(json => { setData(json.data?.[0] ?? null); setLoading(false) })
  }, [])

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-8 space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl overflow-hidden shadow-xl relative" style={{maxHeight: '340px'}}>
        <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full object-cover object-top" style={{maxHeight: '340px'}} />
        {/* Botão invisível sobre o botão azul da imagem */}
        <a href="/paciente/login"
          className="absolute"
          style={{left: '5%', top: '62%', width: '28%', height: '14%'}}
          title="Agendar Consulta" />
      </div>

      {/* Stats Row 1 */}
      <div>
        <h2 className="text-blue-900 font-bold text-lg mb-4">Resumo Geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Pacientes"  value={data?.total_pacientes ?? 0}  icon={Users}      bg="bg-gradient-to-br from-blue-700 to-blue-500"   />
          <StatCard title="Médicos Ativos"       value={data?.total_medicos ?? 0}    icon={UserRound}  bg="bg-gradient-to-br from-green-700 to-green-500"  />
          <StatCard title="Consultas Hoje"       value={data?.consultas_hoje ?? 0}   icon={Calendar}   bg="bg-gradient-to-br from-teal-700 to-teal-500"    sub={`${data?.atendimentos_hoje ?? 0} realizadas`} />
          <StatCard title="Receita do Mês"       value={fmt(data?.receita_mes ?? 0)} icon={TrendingUp} bg="bg-gradient-to-br from-emerald-700 to-emerald-500" sub={`Hoje: ${fmt(data?.receita_hoje ?? 0)}`} />
        </div>
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Atendimentos Hoje"  value={data?.atendimentos_hoje ?? 0} icon={Activity}      bg="bg-gradient-to-br from-cyan-700 to-cyan-500"    />
        <StatCard title="Receita Hoje"        value={fmt(data?.receita_hoje ?? 0)} icon={DollarSign}    bg="bg-gradient-to-br from-green-600 to-green-400"  />
        <StatCard title="Títulos Vencidos"    value={data?.titulos_vencidos ?? 0}  icon={AlertTriangle} bg="bg-gradient-to-br from-red-600 to-red-400"      />
        <StatCard title="Estoque Crítico"     value={data?.estoque_critico ?? 0}   icon={Package}       bg="bg-gradient-to-br from-orange-600 to-orange-400"/>
      </div>

      {/* Cards inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-green-600" /> Agenda de Hoje
          </h3>
          <AgendaHoje />
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-base">
            <Package className="w-5 h-5 text-orange-500" /> Estoque Crítico
          </h3>
          <EstoqueCritico />
        </div>
      </div>
    </div>
  )
}

function AgendaHoje() {
  const [consultas, setConsultas] = useState<any[]>([])
  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0]
    fetch(`/api/dados?tabela=vw_agenda_diaria&order=data_hora&gte=data_hora=${hoje}T00:00:00&lte=data_hora=${hoje}T23:59:59&limit=8`)
      .then(r => r.json()).then(json => setConsultas(json.data || []))
  }, [])

  const statusColor: Record<string, string> = {
    AGENDADA:       'bg-blue-100 text-blue-700',
    CONFIRMADA:     'bg-green-100 text-green-700',
    REALIZADA:      'bg-gray-100 text-gray-600',
    CANCELADA:      'bg-red-100 text-red-700',
    EM_ATENDIMENTO: 'bg-yellow-100 text-yellow-700',
    FALTOU:         'bg-orange-100 text-orange-700',
  }

  if (!consultas.length) return <p className="text-gray-400 text-sm py-4 text-center">Nenhuma consulta agendada hoje.</p>

  return (
    <div className="space-y-3">
      {consultas.map((c, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div>
            <p className="font-semibold text-blue-900 text-sm">{c.paciente}</p>
            <p className="text-xs text-gray-400">{c.medico} · {c.especialidade}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 font-medium">
              {new Date(c.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
              {c.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function EstoqueCritico() {
  const [itens, setItens] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/dados?tabela=vw_estoque_critico&limit=6')
      .then(r => r.json()).then(json => setItens(json.data || []))
  }, [])

  if (!itens.length) return (
    <p className="text-green-600 text-sm py-4 text-center font-medium">✅ Estoque em níveis normais!</p>
  )

  return (
    <div className="space-y-3">
      {itens.map((item, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
          <div>
            <p className="font-semibold text-blue-900 text-sm">{item.nome}</p>
            <p className="text-xs text-gray-400">{item.categoria}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-red-600">{item.estoque_atual} {item.unidade}</p>
            <p className="text-xs text-gray-400">mín: {item.estoque_minimo}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
