'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPaciente() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function formatCpf(v: string) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  async function entrar() {
    setErro('')
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length < 11) { setErro('CPF inválido.'); return }
    if (!nascimento) { setErro('Informe a data de nascimento.'); return }
    setLoading(true)
    const res = await fetch('/api/paciente/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpfLimpo, nascimento }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.erro) { setErro(json.erro); return }
    // Salva o paciente na sessionStorage
    sessionStorage.setItem('paciente', JSON.stringify(json.paciente))
    router.push('/paciente/agendar')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full object-contain rounded-2xl mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800">Portal do Paciente</h1>
          <p className="text-gray-500 text-sm mt-1">Faça login para agendar sua consulta</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">CPF</label>
            <input
              value={cpf}
              onChange={e => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Data de Nascimento (senha)</label>
            <input
              type="date"
              value={nascimento}
              onChange={e => setNascimento(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{erro}</p>}

          <button onClick={entrar} disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition disabled:opacity-60 text-sm">
            {loading ? 'Verificando...' : 'Entrar'}
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-sm">Não tem cadastro? </span>
            <a href="/paciente/cadastro" className="text-teal-600 font-semibold text-sm hover:underline">Cadastre-se</a>
          </div>
        </div>
      </div>
    </div>
  )
}
