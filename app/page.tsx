'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Lock, User, Eye, EyeOff, MapPin, Clock, ChevronRight } from 'lucide-react'

const WHATSAPP_NUM = '5541900000000'
const MAPS_URL = 'https://www.google.com/maps/search/Rua+Dom+Pedro+I+300+Água+Verde+Curitiba+PR'

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.532 5.845L.054 23.5l5.805-1.523A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.374l-.361-.214-3.741.981.999-3.648-.235-.374A9.86 9.86 0 012.1 12C2.1 6.534 6.534 2.1 12 2.1c5.465 0 9.9 4.434 9.9 9.9 0 5.465-4.435 9.9-9.9 9.9z"/>
    </svg>
  )
}

export default function Home() {
  const router = useRouter()
  const [login, setLogin]     = useState('')
  const [senha, setSenha]     = useState('')
  const [verSenha, setVer]    = useState(false)
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('paciente')) router.push('/paciente/agendar')
  }, [])

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    if (login === 'paulo127210' && senha === 'ab127210ab') {
      document.cookie = 'clinica_auth=autenticado; path=/; max-age=86400; SameSite=Strict'
      router.push('/dashboard')
    } else {
      setErro('Usuário ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── HEADER ── */}
      <header className="bg-teal-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏥</span>
            <div>
              <h1 className="font-extrabold text-xl leading-tight">Clínica médica Dr. Paulo</h1>
              <p className="text-teal-200 text-xs">Cuidando da sua saúde com excelência</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-teal-100">
            <a href={`https://wa.me/${WHATSAPP_NUM}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition">
              <WhatsAppIcon/> (41) 9000-0000
            </a>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Seg–Sex 08h–18h</span>
          </div>
        </div>
      </header>

      {/* ── BANNER ── */}
      <div className="w-full">
        <img src="/banner.jpg" alt="Clínica médica Dr. Paulo" className="w-full object-contain" />
      </div>

      {/* ── INFO DA CLÍNICA ── */}
      <section className="bg-teal-600 text-white py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 hover:text-white transition group">
            <MapPin className="w-6 h-6 text-teal-200 group-hover:scale-110 transition-transform"/>
            <p className="font-bold">Endereço</p>
            <p className="text-teal-100 text-sm underline underline-offset-2">Rua Dom Pedro I, 300, Água Verde — Curitiba/PR</p>
          </a>
          <a href={`https://wa.me/${WHATSAPP_NUM}`} target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 hover:text-white transition group">
            <span className="text-teal-200 group-hover:scale-110 transition-transform"><WhatsAppIcon/></span>
            <p className="font-bold">WhatsApp</p>
            <p className="text-teal-100 text-sm underline underline-offset-2">(41) 9000-0000</p>
          </a>
          <div className="flex flex-col items-center gap-1">
            <Clock className="w-6 h-6 text-teal-200"/>
            <p className="font-bold">Horário</p>
            <p className="text-teal-100 text-sm">Segunda a Sexta — 08h às 18h</p>
          </div>
        </div>
      </section>

      {/* ── DOIS PAINÉIS ── */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PAINEL ESQUERDO — PACIENTE */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-6">
            <h2 className="text-white text-xl font-extrabold">Área do Paciente</h2>
            <p className="text-teal-100 text-sm mt-1">Agende sua consulta ou faça seu cadastro</p>
          </div>
          <div className="p-8 space-y-4">
            <a href="/paciente/login"
              className="flex items-center justify-between w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-5 rounded-2xl shadow-md transition group">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📅</span>
                <div className="text-left">
                  <p className="font-extrabold text-sm uppercase tracking-wide">Agendar Consulta</p>
                  <p className="text-teal-200 text-xs font-normal mt-0.5">Já tenho cadastro — entrar com CPF</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-teal-300 group-hover:translate-x-1 transition-transform"/>
            </a>

            <a href="/paciente/cadastro"
              className="flex items-center justify-between w-full bg-white hover:bg-teal-50 text-teal-700 font-bold px-6 py-5 rounded-2xl shadow border-2 border-teal-200 hover:border-teal-400 transition group">
              <div className="flex items-center gap-4">
                <span className="text-3xl">📋</span>
                <div className="text-left">
                  <p className="font-extrabold text-sm uppercase tracking-wide">Primeiro Acesso</p>
                  <p className="text-gray-400 text-xs font-normal mt-0.5">Faça seu cadastro como paciente</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform"/>
            </a>

            {/* Especialidades */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nossas especialidades</p>
              <div className="grid grid-cols-2 gap-2">
                {['❤️ Cardiologia','🧠 Neurologia','👶 Pediatria','🌸 Ginecologia','🦴 Ortopedia','👁️ Oftalmologia'].map(e => (
                  <span key={e} className="text-xs bg-teal-50 text-teal-700 font-medium px-3 py-1.5 rounded-lg">{e}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PAINEL DIREITO — ADMIN */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-700 to-teal-600 px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Activity className="w-8 h-8 text-white"/>
              </div>
            </div>
            <h2 className="text-white text-xl font-extrabold">Área Restrita</h2>
            <p className="text-green-200 text-sm mt-1">Acesso exclusivo para funcionários</p>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-blue-900 mb-1">Bem-vindo!</h3>
            <p className="text-gray-400 text-sm mb-7">Informe suas credenciais para acessar o sistema</p>

            <form onSubmit={entrar} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                    placeholder="Digite seu usuário" autoComplete="username"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-green-500 transition bg-gray-50 text-blue-900 font-medium"/>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type={verSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                    placeholder="Digite sua senha" autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-green-500 transition bg-gray-50 text-blue-900 font-medium"/>
                  <button type="button" onClick={() => setVer(!verSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {verSenha ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  <span>⚠️</span> {erro}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition shadow-lg disabled:opacity-60 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Entrando...
                  </span>
                ) : 'Entrar no Sistema'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-300 mt-8">
              Clínica Dr. Paulo © 2026 · Sistema de Gestão
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-teal-900 text-teal-300 text-center text-xs py-4">
        © 2026 Clínica médica Dr. Paulo · Todos os direitos reservados
      </footer>
    </div>
  )
}
