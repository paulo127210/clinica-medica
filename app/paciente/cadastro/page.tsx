'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CadastroPaciente() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: '', cpf: '', nascimento: '', sexo: 'M', celular: '', email: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function formatCpf(v: string) {
    return v.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  async function cadastrar() {
    setErro('')
    const cpfLimpo = form.cpf.replace(/\D/g, '')
    if (!form.nome) { setErro('Informe seu nome completo.'); return }
    if (cpfLimpo.length < 11) { setErro('CPF inválido.'); return }
    if (!form.nascimento) { setErro('Informe sua data de nascimento.'); return }
    setLoading(true)
    const res = await fetch('/api/paciente/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cpf: cpfLimpo }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.erro) { setErro(json.erro); return }
    sessionStorage.setItem('paciente', JSON.stringify(json.paciente))
    router.push('/paciente/agendar')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full h-28 object-cover object-top rounded-2xl mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-800">Novo Cadastro</h1>
          <p className="text-gray-500 text-sm mt-1">Seu CPF será o login e sua data de nascimento a senha</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Nome completo *</label>
            <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">CPF *</label>
              <input value={form.cpf} onChange={e => setForm({...form, cpf: formatCpf(e.target.value)})}
                placeholder="000.000.000-00"
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Data Nascimento *</label>
              <input type="date" value={form.nascimento} onChange={e => setForm({...form, nascimento: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Sexo</label>
              <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Celular</label>
              <input value={form.celular} onChange={e => setForm({...form, celular: e.target.value})}
                placeholder="(00) 00000-0000"
                className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">E-mail</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{erro}</p>}

          <button onClick={cadastrar} disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition disabled:opacity-60 text-sm">
            {loading ? 'Cadastrando...' : 'Criar Cadastro e Agendar'}
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-sm">Já tem cadastro? </span>
            <a href="/paciente/login" className="text-teal-600 font-semibold text-sm hover:underline">Fazer login</a>
          </div>
        </div>
      </div>
    </div>
  )
}
