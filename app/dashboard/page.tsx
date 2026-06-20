'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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

function DoctorIllustration() {
  return (
    <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background shapes */}
      <ellipse cx="210" cy="240" rx="180" ry="20" fill="#bbf7d0" opacity="0.5"/>

      {/* === MÉDICO (esquerda) === */}
      {/* Jaleco */}
      <rect x="80" y="130" width="70" height="100" rx="12" fill="white" stroke="#d1fae5" strokeWidth="2"/>
      {/* Cruz no jaleco */}
      <rect x="108" y="148" width="14" height="5" rx="2" fill="#16a34a"/>
      <rect x="113" y="143" width="5" height="14" rx="2" fill="#16a34a"/>
      {/* Corpo */}
      <rect x="90" y="135" width="50" height="80" rx="8" fill="#e0f2fe"/>
      {/* Cabeça */}
      <circle cx="115" cy="105" r="30" fill="#fde68a"/>
      {/* Cabelo médico */}
      <path d="M88 95 Q90 70 115 68 Q140 70 142 95 Q140 80 115 78 Q90 80 88 95" fill="#92400e"/>
      {/* Olhos felizes */}
      <ellipse cx="105" cy="100" rx="4" ry="4.5" fill="#1e40af"/>
      <ellipse cx="125" cy="100" rx="4" ry="4.5" fill="#1e40af"/>
      <circle cx="106" cy="99" r="1.5" fill="white"/>
      <circle cx="126" cy="99" r="1.5" fill="white"/>
      {/* Sorriso */}
      <path d="M105 112 Q115 122 125 112" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Estetoscópio */}
      <path d="M100 135 Q95 155 105 165 Q115 170 120 160" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="120" cy="160" r="6" fill="#16a34a"/>
      {/* Braço com prancheta */}
      <rect x="145" y="140" width="30" height="40" rx="6" fill="white" stroke="#d1fae5" strokeWidth="1.5"/>
      <rect x="150" y="145" width="20" height="3" rx="1" fill="#93c5fd"/>
      <rect x="150" y="151" width="15" height="2" rx="1" fill="#bbf7d0"/>
      <rect x="150" y="156" width="18" height="2" rx="1" fill="#bbf7d0"/>
      <rect x="150" y="161" width="12" height="2" rx="1" fill="#bbf7d0"/>
      {/* Pernas */}
      <rect x="95" y="210" width="18" height="40" rx="6" fill="#1e40af"/>
      <rect x="117" y="210" width="18" height="40" rx="6" fill="#1e40af"/>
      {/* Sapatos */}
      <ellipse cx="104" cy="250" rx="12" ry="6" fill="#1e3a5f"/>
      <ellipse cx="126" cy="250" rx="12" ry="6" fill="#1e3a5f"/>

      {/* === MÉDICA (direita) === */}
      {/* Jaleco */}
      <rect x="270" y="130" width="70" height="100" rx="12" fill="white" stroke="#d1fae5" strokeWidth="2"/>
      {/* Cruz no jaleco */}
      <rect x="298" y="148" width="14" height="5" rx="2" fill="#16a34a"/>
      <rect x="303" y="143" width="5" height="14" rx="2" fill="#16a34a"/>
      {/* Corpo */}
      <rect x="280" y="135" width="50" height="80" rx="8" fill="#fce7f3"/>
      {/* Cabeça */}
      <circle cx="305" cy="105" r="30" fill="#fde68a"/>
      {/* Cabelo médica (longo) */}
      <path d="M278 95 Q280 65 305 63 Q330 65 332 95" fill="#7c3aed"/>
      <rect x="278" y="93" width="8" height="50" rx="4" fill="#7c3aed"/>
      <rect x="334" y="93" width="8" height="50" rx="4" fill="#7c3aed"/>
      {/* Olhos felizes */}
      <ellipse cx="295" cy="100" rx="4" ry="4.5" fill="#1e40af"/>
      <ellipse cx="315" cy="100" rx="4" ry="4.5" fill="#1e40af"/>
      <circle cx="296" cy="99" r="1.5" fill="white"/>
      <circle cx="316" cy="99" r="1.5" fill="white"/>
      {/* Sorriso grande */}
      <path d="M293 112 Q305 124 317 112" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Bochechas rosadas */}
      <ellipse cx="287" cy="110" rx="6" ry="4" fill="#fca5a5" opacity="0.5"/>
      <ellipse cx="323" cy="110" rx="6" ry="4" fill="#fca5a5" opacity="0.5"/>
      {/* Estetoscópio */}
      <path d="M290 135 Q285 155 295 165 Q305 172 312 160" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="312" cy="160" r="6" fill="#16a34a"/>
      {/* Pernas */}
      <rect x="285" y="210" width="18" height="40" rx="6" fill="#7c3aed"/>
      <rect x="307" y="210" width="18" height="40" rx="6" fill="#7c3aed"/>
      {/* Sapatos */}
      <ellipse cx="294" cy="250" rx="12" ry="6" fill="#4c1d95"/>
      <ellipse cx="316" cy="250" rx="12" ry="6" fill="#4c1d95"/>

      {/* === Cruz médica central === */}
      <circle cx="210" cy="80" r="32" fill="#dcfce7" stroke="#16a34a" strokeWidth="2"/>
      <rect x="197" y="62" width="26" height="10" rx="4" fill="#16a34a"/>
      <rect x="200" y="55" width="20" height="36" rx="4" fill="#16a34a"/>

      {/* Balões de fala feliz */}
      <rect x="148" y="55" width="50" height="28" rx="10" fill="#dbeafe"/>
      <polygon points="175,83 168,95 185,83" fill="#dbeafe"/>
      <text x="173" y="74" textAnchor="middle" fontSize="16" fill="#1e40af">😊</text>

      <rect x="222" y="55" width="50" height="28" rx="10" fill="#fce7f3"/>
      <polygon points="245,83 238,95 255,83" fill="#fce7f3"/>
      <text x="247" y="74" textAnchor="middle" fontSize="16" fill="#7c3aed">💚</text>
    </svg>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vw_dashboard').select('*').single().then(({ data }) => {
      setData(data)
      setLoading(false)
    })
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
      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-green-700 via-green-600 to-teal-500 shadow-xl">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-10">
            <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-2">Bem-vindo ao Sistema</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Clínica Médica
            </h1>
            <p className="text-green-100 text-base max-w-md leading-relaxed">
              Gerencie pacientes, consultas, prontuários e financeiro com praticidade e segurança.
            </p>
            <p className="mt-4 text-green-200 text-sm">
              📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="w-full md:w-80 p-4 md:p-6">
            <DoctorIllustration />
          </div>
        </div>
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
    supabase.from('vw_agenda_diaria').select('*').limit(8).then(({ data }) => setConsultas(data || []))
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
    supabase.from('vw_estoque_critico').select('*').limit(6).then(({ data }) => setItens(data || []))
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
