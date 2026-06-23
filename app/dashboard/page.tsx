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

function ClinicaIllustration() {
  return (
    <svg viewBox="0 0 560 310" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe"/>
          <stop offset="100%" stopColor="#eff6ff"/>
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1d5db"/>
          <stop offset="100%" stopColor="#9ca3af"/>
        </linearGradient>
        <linearGradient id="building" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0fdf4"/>
          <stop offset="100%" stopColor="#dcfce7"/>
        </linearGradient>
        <linearGradient id="ambulance" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f8fafc"/>
          <stop offset="100%" stopColor="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="skinM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#fbbf24"/>
        </linearGradient>
        <linearGradient id="skinF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fed7aa"/>
          <stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* CÉU */}
      <rect width="560" height="310" fill="url(#sky)"/>

      {/* Nuvens decorativas */}
      <ellipse cx="80" cy="40" rx="35" ry="18" fill="white" opacity="0.8"/>
      <ellipse cx="110" cy="35" rx="25" ry="15" fill="white" opacity="0.8"/>
      <ellipse cx="60" cy="38" rx="20" ry="12" fill="white" opacity="0.8"/>
      <ellipse cx="450" cy="50" rx="30" ry="15" fill="white" opacity="0.7"/>
      <ellipse cx="475" cy="45" rx="22" ry="12" fill="white" opacity="0.7"/>

      {/* PRÉDIO CLÍNICA - fundo */}
      <rect x="240" y="55" width="290" height="200" rx="6" fill="url(#building)" filter="url(#shadow)" stroke="#bbf7d0" strokeWidth="1.5"/>

      {/* Detalhes arquitetônicos - colunas */}
      <rect x="255" y="100" width="14" height="155" rx="4" fill="#e2e8f0"/>
      <rect x="500" y="100" width="14" height="155" rx="4" fill="#e2e8f0"/>

      {/* Telhado / friso superior */}
      <rect x="232" y="48" width="306" height="18" rx="4" fill="#16a34a"/>
      <rect x="244" y="38" width="282" height="18" rx="4" fill="#15803d"/>

      {/* Janelas - 1ª fileira */}
      {[275,325,375,425,475].map((x,i) => (
        <g key={i}>
          <rect x={x} y="110" width="36" height="44" rx="3" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5"/>
          <line x1={x+18} y1="110" x2={x+18} y2="154" stroke="#93c5fd" strokeWidth="1"/>
          <line x1={x} y1="132" x2={x+36} y2="132" stroke="#93c5fd" strokeWidth="1"/>
        </g>
      ))}

      {/* Janelas - 2ª fileira */}
      {[275,325,375,425,475].map((x,i) => (
        <g key={i}>
          <rect x={x} y="168" width="36" height="36" rx="3" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1.5"/>
          <line x1={x+18} y1="168" x2={x+18} y2="204" stroke="#93c5fd" strokeWidth="1"/>
        </g>
      ))}

      {/* PORTA DE ENTRADA */}
      <rect x="355" y="204" width="60" height="51" rx="4" fill="#1e40af"/>
      <rect x="360" y="209" width="23" height="46" rx="2" fill="#1d4ed8"/>
      <rect x="387" y="209" width="23" height="46" rx="2" fill="#1d4ed8"/>
      <circle cx="383" cy="234" r="3" fill="#fbbf24"/>
      <circle cx="393" cy="234" r="3" fill="#fbbf24"/>

      {/* Marquise entrada */}
      <rect x="330" y="196" width="110" height="14" rx="3" fill="#15803d"/>

      {/* PLACA CLÍNICA */}
      <rect x="270" y="64" width="230" height="32" rx="5" fill="#15803d"/>
      <text x="385" y="85" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial">CLÍNICA MÉDICA</text>

      {/* Cruz médica no prédio */}
      <rect x="522" y="72" width="7" height="20" rx="2" fill="white"/>
      <rect x="517" y="77" width="17" height="7" rx="2" fill="white"/>

      {/* CHÃO / CALÇADA */}
      <rect x="0" y="255" width="560" height="55" fill="url(#ground)"/>
      <rect x="0" y="250" width="560" height="10" fill="#9ca3af"/>
      {/* Faixas calçada */}
      {[0,40,80,120,160,200,240,280,320,360,400,440,480,520].map((x,i) => (
        <rect key={i} x={x} y="260" width="25" height="3" rx="1" fill="#6b7280" opacity="0.4"/>
      ))}

      {/* AMBULÂNCIA */}
      <g filter="url(#shadow)">
        {/* Carroceria */}
        <rect x="18" y="168" width="185" height="82" rx="6" fill="url(#ambulance)" stroke="#cbd5e1" strokeWidth="1.5"/>
        {/* Cabine */}
        <rect x="163" y="148" width="40" height="102" rx="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
        {/* Para-brisa */}
        <rect x="168" y="158" width="30" height="26" rx="3" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1"/>
        {/* Grade frente */}
        <rect x="200" y="190" width="12" height="30" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
        {/* Faróis */}
        <ellipse cx="207" cy="185" rx="6" ry="4" fill="#fef08a"/>
        <ellipse cx="207" cy="223" rx="5" ry="3" fill="#fca5a5"/>
        {/* Sirene */}
        <rect x="30" y="158" width="40" height="12" rx="4" fill="#ef4444"/>
        <rect x="78" y="158" width="40" height="12" rx="4" fill="#3b82f6"/>
        {/* Luzes sirene */}
        <circle cx="42" cy="164" r="4" fill="#fef08a" filter="url(#glow)"/>
        <circle cx="55" cy="164" r="4" fill="#fef08a" opacity="0.5"/>
        <circle cx="90" cy="164" r="4" fill="#fef08a" filter="url(#glow)"/>
        <circle cx="103" cy="164" r="4" fill="#fef08a" opacity="0.5"/>
        {/* Faixa laranja */}
        <rect x="18" y="206" width="185" height="10" fill="#f97316"/>
        <rect x="18" y="206" width="185" height="2" fill="#ea580c"/>
        {/* Cruz vermelha */}
        <rect x="62" y="178" width="10" height="28" rx="2" fill="#dc2626"/>
        <rect x="54" y="186" width="26" height="10" rx="2" fill="#dc2626"/>
        {/* AMBULÂNCIA texto */}
        <text x="110" y="200" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1e3a5f" fontFamily="Arial" letterSpacing="2">AMBULÂNCIA</text>
        {/* Rodas */}
        <circle cx="52" cy="250" r="22" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="52" cy="250" r="14" fill="#374151"/>
        <circle cx="52" cy="250" r="6"  fill="#6b7280"/>
        {[0,60,120,180,240,300].map((a,i) => (
          <line key={i} x1={52+14*Math.cos(a*Math.PI/180)} y1={250+14*Math.sin(a*Math.PI/180)}
                x2={52+22*Math.cos(a*Math.PI/180)} y2={250+22*Math.sin(a*Math.PI/180)}
                stroke="#4b5563" strokeWidth="2"/>
        ))}
        <circle cx="168" cy="250" r="22" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
        <circle cx="168" cy="250" r="14" fill="#374151"/>
        <circle cx="168" cy="250" r="6"  fill="#6b7280"/>
        {[0,60,120,180,240,300].map((a,i) => (
          <line key={i} x1={168+14*Math.cos(a*Math.PI/180)} y1={250+14*Math.sin(a*Math.PI/180)}
                x2={168+22*Math.cos(a*Math.PI/180)} y2={250+22*Math.sin(a*Math.PI/180)}
                stroke="#4b5563" strokeWidth="2"/>
        ))}
      </g>

      {/* ====== MÉDICO (homem) ====== */}
      <g filter="url(#shadow)">
        {/* Pernas calça azul */}
        <rect x="232" y="210" width="20" height="44" rx="5" fill="#1d4ed8"/>
        <rect x="256" y="210" width="20" height="44" rx="5" fill="#1d4ed8"/>
        {/* Sapatos */}
        <ellipse cx="242" cy="254" rx="14" ry="7" fill="#111827"/>
        <ellipse cx="266" cy="254" rx="14" ry="7" fill="#111827"/>
        {/* Jaleco body */}
        <rect x="224" y="148" width="64" height="72" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
        {/* Lapelas jaleco */}
        <path d="M256 148 L240 165 L256 170 L272 165 Z" fill="#f8fafc"/>
        {/* Camisa */}
        <rect x="240" y="150" width="30" height="25" rx="4" fill="#dbeafe"/>
        {/* Gravata */}
        <polygon points="256,152 251,172 256,176 261,172" fill="#1d4ed8"/>
        {/* Bolso jaleco */}
        <rect x="228" y="168" width="22" height="16" rx="3" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1"/>
        {/* Cruz jaleco */}
        <rect x="263" y="157" width="14" height="5" rx="1.5" fill="#16a34a"/>
        <rect x="268" y="152" width="5" height="15" rx="1.5" fill="#16a34a"/>
        {/* Pescoço */}
        <rect x="248" y="130" width="16" height="22" rx="6" fill="url(#skinM)"/>
        {/* Cabeça */}
        <ellipse cx="256" cy="112" rx="28" ry="30" fill="url(#skinM)"/>
        {/* Cabelo */}
        <path d="M228 100 Q230 72 256 70 Q282 72 284 100 Q280 82 256 80 Q232 82 228 100" fill="#78350f"/>
        <path d="M228 100 Q224 108 228 115 Q226 105 230 100" fill="#78350f"/>
        <path d="M284 100 Q288 108 284 115 Q286 105 282 100" fill="#78350f"/>
        {/* Sobrancelhas */}
        <path d="M240 97 Q248 93 252 97" stroke="#78350f" strokeWidth="2" fill="none"/>
        <path d="M260 97 Q264 93 272 97" stroke="#78350f" strokeWidth="2" fill="none"/>
        {/* Olhos */}
        <ellipse cx="246" cy="106" rx="5" ry="5.5" fill="#1e40af"/>
        <ellipse cx="266" cy="106" rx="5" ry="5.5" fill="#1e40af"/>
        <circle cx="247" cy="104" r="2" fill="white"/>
        <circle cx="267" cy="104" r="2" fill="white"/>
        <ellipse cx="246" cy="106" rx="2.5" ry="3" fill="#1e3a8a"/>
        <ellipse cx="266" cy="106" rx="2.5" ry="3" fill="#1e3a8a"/>
        {/* Sorriso */}
        <path d="M243 118 Q256 130 269 118" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Dentes */}
        <path d="M248 120 Q256 127 264 120" fill="white" stroke="none"/>
        {/* Orelhas */}
        <ellipse cx="228" cy="112" rx="6" ry="8" fill="#fde68a"/>
        <ellipse cx="284" cy="112" rx="6" ry="8" fill="#fde68a"/>
        {/* Estetoscópio */}
        <path d="M234 165 Q220 185 228 200 Q236 210 246 200" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="246" cy="200" r="8" fill="#374151"/>
        <circle cx="246" cy="200" r="5" fill="#6b7280"/>
        <path d="M220 185 L215 175" stroke="#374151" strokeWidth="2.5"/>
        <path d="M215 175 L218 170" stroke="#374151" strokeWidth="2.5"/>
        <circle cx="219" cy="169" r="4" fill="#374151"/>
        {/* Braço com prancheta */}
        <rect x="286" y="158" width="32" height="46" rx="5" fill="#fefce8" stroke="#fde68a" strokeWidth="1.5"/>
        <rect x="291" y="162" width="22" height="4" rx="1" fill="#93c5fd"/>
        <rect x="291" y="169" width="18" height="2.5" rx="1" fill="#bbf7d0"/>
        <rect x="291" y="174" width="20" height="2.5" rx="1" fill="#bbf7d0"/>
        <rect x="291" y="179" width="15" height="2.5" rx="1" fill="#bbf7d0"/>
        <rect x="291" y="184" width="19" height="2.5" rx="1" fill="#fca5a5"/>
        <rect x="291" y="189" width="12" height="2.5" rx="1" fill="#fca5a5"/>
        <rect x="295" y="152" width="12" height="8" rx="3" fill="#f97316"/>
      </g>

      {/* ====== MÉDICA (mulher) ====== */}
      <g filter="url(#shadow)">
        {/* Pernas */}
        <rect x="330" y="210" width="20" height="44" rx="5" fill="#6d28d9"/>
        <rect x="354" y="210" width="20" height="44" rx="5" fill="#6d28d9"/>
        {/* Sapatos femininos */}
        <ellipse cx="340" cy="254" rx="14" ry="7" fill="#3b0764"/>
        <ellipse cx="364" cy="254" rx="14" ry="7" fill="#3b0764"/>
        <rect x="334" y="248" width="8" height="10" rx="2" fill="#4c1d95"/>
        <rect x="358" y="248" width="8" height="10" rx="2" fill="#4c1d95"/>
        {/* Jaleco body */}
        <rect x="320" y="148" width="64" height="72" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
        {/* Blusa rosa */}
        <rect x="336" y="150" width="32" height="28" rx="4" fill="#fce7f3"/>
        {/* Colar */}
        <ellipse cx="352" cy="150" rx="8" ry="3" fill="#e879f9"/>
        {/* Bolso jaleco */}
        <rect x="326" y="168" width="22" height="16" rx="3" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1"/>
        {/* Cruz jaleco */}
        <rect x="358" y="157" width="14" height="5" rx="1.5" fill="#16a34a"/>
        <rect x="363" y="152" width="5" height="15" rx="1.5" fill="#16a34a"/>
        {/* Pescoço */}
        <rect x="344" y="130" width="16" height="22" rx="6" fill="url(#skinF)"/>
        {/* Cabeça */}
        <ellipse cx="352" cy="112" rx="28" ry="30" fill="url(#skinF)"/>
        {/* Cabelo longo */}
        <path d="M324 98 Q326 65 352 63 Q378 65 380 98 Q378 78 352 76 Q326 78 324 98" fill="#7c3aed"/>
        <rect x="323" y="96" width="10" height="60" rx="5" fill="#7c3aed"/>
        <rect x="371" y="96" width="10" height="60" rx="5" fill="#7c3aed"/>
        <path d="M323 96 Q318 110 322 130" stroke="#7c3aed" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M381 96 Q386 110 382 130" stroke="#7c3aed" strokeWidth="8" fill="none" strokeLinecap="round"/>
        {/* Tiara */}
        <path d="M324 90 Q352 78 380 90" stroke="#e879f9" strokeWidth="3" fill="none"/>
        <circle cx="352" cy="77" r="5" fill="#e879f9"/>
        {/* Sobrancelhas */}
        <path d="M336 97 Q344 92 348 97" stroke="#6d28d9" strokeWidth="2" fill="none"/>
        <path d="M356 97 Q360 92 368 97" stroke="#6d28d9" strokeWidth="2" fill="none"/>
        {/* Olhos */}
        <ellipse cx="342" cy="106" rx="5" ry="5.5" fill="#1e40af"/>
        <ellipse cx="362" cy="106" rx="5" ry="5.5" fill="#1e40af"/>
        <circle cx="343" cy="104" r="2" fill="white"/>
        <circle cx="363" cy="104" r="2" fill="white"/>
        <ellipse cx="342" cy="107" rx="2.5" ry="3" fill="#1e3a8a"/>
        <ellipse cx="362" cy="107" rx="2.5" ry="3" fill="#1e3a8a"/>
        {/* Cílios */}
        {[-6,-3,0,3,6].map((d,i) => <line key={i} x1={342+d} y1={101} x2={342+d-1} y2={96} stroke="#3b0764" strokeWidth="1.2"/>)}
        {[-6,-3,0,3,6].map((d,i) => <line key={i} x1={362+d} y1={101} x2={362+d-1} y2={96} stroke="#3b0764" strokeWidth="1.2"/>)}
        {/* Bochechas coradas */}
        <ellipse cx="333" cy="116" rx="8" ry="5" fill="#fca5a5" opacity="0.5"/>
        <ellipse cx="371" cy="116" rx="8" ry="5" fill="#fca5a5" opacity="0.5"/>
        {/* Sorriso */}
        <path d="M339 120 Q352 134 365 120" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M344 122 Q352 130 360 122" fill="white"/>
        {/* Batom */}
        <path d="M341 120 Q352 128 363 120" stroke="#e11d48" strokeWidth="1" fill="none"/>
        {/* Orelhas */}
        <ellipse cx="324" cy="112" rx="6" ry="8" fill="#fed7aa"/>
        <ellipse cx="380" cy="112" rx="6" ry="8" fill="#fed7aa"/>
        {/* Brinco */}
        <circle cx="323" cy="118" r="4" fill="#e879f9"/>
        <circle cx="381" cy="118" r="4" fill="#e879f9"/>
        {/* Estetoscópio */}
        <path d="M330 165 Q316 185 324 200 Q332 212 342 202" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <circle cx="342" cy="202" r="8" fill="#374151"/>
        <circle cx="342" cy="202" r="5" fill="#6b7280"/>
        <path d="M316 185 L311 175" stroke="#374151" strokeWidth="2.5"/>
        <path d="M311 175 L314 170" stroke="#374151" strokeWidth="2.5"/>
        <circle cx="315" cy="169" r="4" fill="#374151"/>
      </g>

      {/* Sombras no chão */}
      <ellipse cx="256" cy="257" rx="36" ry="6" fill="#000" opacity="0.12"/>
      <ellipse cx="352" cy="257" rx="36" ry="6" fill="#000" opacity="0.12"/>

      {/* Árvore decorativa */}
      <rect x="218" y="200" width="8" height="55" rx="3" fill="#92400e"/>
      <ellipse cx="222" cy="185" rx="22" ry="25" fill="#16a34a"/>
      <ellipse cx="212" cy="195" rx="14" ry="18" fill="#15803d"/>
      <ellipse cx="232" cy="192" rx="13" ry="16" fill="#166534"/>
    </svg>
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
            <ClinicaIllustration />
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
