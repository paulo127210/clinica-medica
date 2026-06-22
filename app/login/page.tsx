'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router   = useRouter()
  const [login, setLogin]     = useState('')
  const [senha, setSenha]     = useState('')
  const [verSenha, setVer]    = useState(false)
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-teal-700 flex items-center justify-center p-4">

      {/* Decoração de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full"/>
        <div className="absolute top-1/2 left-10 w-40 h-40 bg-white/5 rounded-full"/>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card de login */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-700 to-teal-600 px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-4 rounded-2xl">
                <Activity className="w-10 h-10 text-white"/>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Clínica Dr. Paulo</h1>
            <p className="text-green-200 text-sm mt-1">Sistema de Gestão</p>
          </div>

          {/* Formulário */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-blue-900 mb-1">Bem-vindo!</h2>
            <p className="text-gray-400 text-sm mb-7">Informe suas credenciais para acessar o sistema</p>

            <form onSubmit={entrar} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</label>
                <div className="relative mt-2">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input
                    type="text"
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Digite seu usuário"
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-green-500 transition bg-gray-50 text-blue-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input
                    type={verSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-green-500 transition bg-gray-50 text-blue-900 font-medium"
                  />
                  <button type="button" onClick={() => setVer(!verSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {verSenha ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  <span className="text-lg">⚠️</span> {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-green-500/30 disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Entrando...
                  </span>
                ) : 'Entrar no Sistema'}
              </button>
            </form>
          </div>

          {/* Rodapé */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-300">
              Clínica Dr. Paulo © {new Date().getFullYear()} · Sistema de Gestão
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
