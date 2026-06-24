'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    if (sessionStorage.getItem('paciente')) router.push('/paciente/agendar')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 via-teal-400 to-blue-500 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-white font-extrabold text-lg tracking-tight">Clínica Dr. Paulo</span>
        </div>
        <a href="/login"
          className="text-white/70 hover:text-white text-xs font-semibold uppercase tracking-widest transition border border-white/30 px-4 py-2 rounded-full hover:border-white">
          Área Restrita
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Banner */}
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl mb-8">
          <img src="/banner.jpg" alt="Clínica médica Dr. Paulo" className="w-full object-cover" style={{maxHeight: '300px', objectPosition: 'top'}} />
        </div>

        {/* Chamada */}
        <h1 className="text-white text-3xl md:text-4xl font-extrabold text-center mb-2 drop-shadow">
          Bem-vindo à Clínica médica Dr. Paulo
        </h1>
        <p className="text-white/80 text-center text-base mb-10 max-w-md">
          Agende sua consulta de forma rápida, fácil e segura.
        </p>

        {/* Cards de ação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          <a href="/paciente/login"
            className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-xl p-7 hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl group-hover:animate-bounce">📅</span>
            <div className="text-center">
              <p className="font-extrabold text-blue-700 text-base uppercase tracking-wide">Agendar Consulta</p>
              <p className="text-gray-400 text-xs mt-1">Faça login com seu CPF</p>
            </div>
          </a>

          <a href="/paciente/cadastro"
            className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-xl p-7 hover:scale-105 transition-transform cursor-pointer group">
            <span className="text-5xl group-hover:animate-bounce">📋</span>
            <div className="text-center">
              <p className="font-extrabold text-teal-700 text-base uppercase tracking-wide">Primeiro acesso?</p>
              <p className="text-gray-400 text-xs mt-1">Crie seu cadastro aqui</p>
            </div>
          </a>
        </div>

        {/* Info */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 text-white/80 text-sm text-center">
          <div className="flex items-center gap-2 justify-center">
            <span>📍</span> Rua da Clínica, 100 — São Paulo
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span>📞</span> (11) 9000-0000
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span>🕐</span> Seg–Sex 08h–18h
          </div>
        </div>
      </main>

      <footer className="text-center text-white/40 text-xs py-4">
        © 2026 Clínica médica Dr. Paulo · Todos os direitos reservados
      </footer>
    </div>
  )
}
