'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Lock, User, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-500 to-blue-600 flex items-center justify-center p-4">

      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-white/5 rounded-full"/>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-white/5 rounded-full"/>
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── PAINEL ESQUERDO: PACIENTE ── */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Banner */}
          <div className="relative">
            <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full object-cover object-top" style={{height:'220px'}} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 flex flex-col p-8">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Área do Paciente</h2>
            <p className="text-gray-400 text-sm mb-8">Agende sua consulta de forma rápida e fácil.</p>

            <div className="space-y-4 flex-1">
              {/* Já tenho cadastro */}
              <a href="/paciente/login"
                className="flex items-center gap-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg transition group">
                <span className="text-3xl group-hover:scale-110 transition-transform">📅</span>
                <div className="text-left">
                  <p className="text-sm font-extrabold uppercase tracking-wide">Agendar Consulta</p>
                  <p className="text-teal-200 text-xs font-normal">Já tenho cadastro — entrar com CPF</p>
                </div>
              </a>

              {/* Primeiro acesso */}
              <a href="/paciente/cadastro"
                className="flex items-center gap-4 w-full bg-white hover:bg-teal-50 text-teal-700 font-bold px-6 py-4 rounded-2xl shadow border-2 border-teal-200 hover:border-teal-400 transition group">
                <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                <div className="text-left">
                  <p className="text-sm font-extrabold uppercase tracking-wide text-teal-700">Primeiro acesso?</p>
                  <p className="text-gray-400 text-xs font-normal">Faça seu cadastro aqui</p>
                </div>
              </a>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-1 text-gray-400 text-xs">
              <span>📍 Rua da Clínica, 100 — São Paulo</span>
              <span>📞 (11) 9000-0000 &nbsp;·&nbsp; 🕐 Seg–Sex 08h–18h</span>
            </div>
          </div>
        </div>

        {/* ── PAINEL DIREITO: ÁREA RESTRITA ── */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-700 to-teal-600 px-8 py-9 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Activity className="w-9 h-9 text-white"/>
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-white">Clínica Dr. Paulo</h1>
            <p className="text-green-200 text-xs mt-1">Sistema de Gestão — Área Restrita</p>
          </div>

          {/* Formulário */}
          <div className="flex-1 flex flex-col px-8 py-8">
            <h2 className="text-xl font-bold text-blue-900 mb-1">Bem-vindo!</h2>
            <p className="text-gray-400 text-sm mb-7">Informe suas credenciais para acessar o sistema</p>

            <form onSubmit={entrar} className="space-y-5 flex-1 flex flex-col">
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

              <div className="flex-1"/>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-green-500/30 disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Entrando...
                  </span>
                ) : 'Entrar no Sistema'}
              </button>
            </form>
          </div>

          <div className="px-8 pb-5 text-center">
            <p className="text-xs text-gray-300">Clínica Dr. Paulo © 2026 · Sistema de Gestão</p>
          </div>
        </div>

      </div>
    </div>
  )
}
