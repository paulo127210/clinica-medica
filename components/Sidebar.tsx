'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, UserRound, Calendar,
  FileText, DollarSign, Package, Activity, Briefcase, LogOut
} from 'lucide-react'

const menu = [
  { href: '/dashboard',              label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/pacientes',    label: 'Pacientes',     icon: Users },
  { href: '/dashboard/medicos',      label: 'Médicos',       icon: UserRound },
  { href: '/dashboard/funcionarios', label: 'Funcionários',  icon: Briefcase },
  { href: '/dashboard/agenda',       label: 'Agenda',        icon: Calendar },
  { href: '/dashboard/prontuarios',  label: 'Prontuários',   icon: FileText },
  { href: '/dashboard/financeiro',   label: 'Financeiro',    icon: DollarSign },
  { href: '/dashboard/estoque',      label: 'Estoque',       icon: Package },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  function sair() {
    document.cookie = 'clinica_auth=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col min-h-screen shadow-xl">
      <div className="p-6 border-b border-green-800">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-lg shadow">
            <Activity className="w-6 h-6"/>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Clínica Médica</h1>
            <p className="text-green-300 text-xs">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menu.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                active ? 'bg-green-500 text-white shadow-lg' : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`}>
              <Icon className="w-5 h-5 shrink-0"/>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-green-800 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold shadow text-white">P</div>
          <div>
            <p className="text-sm font-semibold text-white">paulo127210</p>
            <p className="text-xs text-green-300">Administrador</p>
          </div>
        </div>
        <button onClick={sair}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-green-200 hover:bg-red-600 hover:text-white transition text-sm font-medium">
          <LogOut className="w-4 h-4"/> Sair do Sistema
        </button>
      </div>
    </aside>
  )
}
