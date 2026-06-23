'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, UserRound, CheckCircle } from 'lucide-react'

export default function AgendarConsulta() {
  const router = useRouter()
  const [paciente, setPaciente] = useState<any>(null)
  const [medicos, setMedicos] = useState<any[]>([])
  const [horarios, setHorarios] = useState<string[]>([])
  const [form, setForm] = useState({ medico_id: '', data: '', hora: '', motivo: '' })
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const p = sessionStorage.getItem('paciente')
    if (!p) { router.push('/paciente/login'); return }
    setPaciente(JSON.parse(p))
    fetch('/api/dados?tabela=vw_producao_medicos&order=medico')
      .then(r => r.json()).then(j => setMedicos(j.data || []))
  }, [])

  useEffect(() => {
    if (!form.data || !form.medico_id) { setHorarios([]); return }
    fetch(`/api/paciente/horarios?medico_id=${form.medico_id}&data=${form.data}`)
      .then(r => r.json()).then(j => setHorarios(j.horarios || []))
  }, [form.data, form.medico_id])

  async function agendar() {
    setErro('')
    if (!form.medico_id || !form.data || !form.hora) { setErro('Preencha médico, data e horário.'); return }
    setLoading(true)
    const res = await fetch('/api/paciente/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, paciente_id: paciente.id }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.erro) { setErro(json.erro); return }
    setSucesso(true)
  }

  if (sucesso) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Consulta Agendada!</h2>
        <p className="text-gray-500 mb-2">Sua consulta foi agendada com sucesso.</p>
        <p className="text-gray-600 font-semibold">{form.data.split('-').reverse().join('/')} às {form.hora}</p>
        <button onClick={() => { setSucesso(false); setForm({ medico_id: '', data: '', hora: '', motivo: '' }) }}
          className="mt-6 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition">
          Agendar outra consulta
        </button>
        <button onClick={() => { sessionStorage.removeItem('paciente'); router.push('/paciente/login') }}
          className="mt-3 block w-full text-gray-400 text-sm hover:text-gray-600 transition">
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <div className="mb-6">
          <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full h-24 object-cover object-top rounded-2xl mb-4" />
          {paciente && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-gray-800">Agendar Consulta</h1>
                <p className="text-teal-600 text-sm font-medium">Olá, {paciente.nome?.split(' ')[0]}!</p>
              </div>
              <button onClick={() => { sessionStorage.removeItem('paciente'); router.push('/paciente/login') }}
                className="text-xs text-gray-400 hover:text-gray-600">Sair</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <UserRound className="w-3.5 h-3.5" /> Médico
            </label>
            <select value={form.medico_id} onChange={e => setForm({...form, medico_id: e.target.value, hora: ''})}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option value="">Selecione o médico...</option>
              {medicos.map(m => (
                <option key={m.medico_id} value={m.medico_id}>
                  {m.medico} — {m.especialidade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Data
            </label>
            <input type="date" value={form.data}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({...form, data: e.target.value, hora: ''})}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          {horarios.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Horário disponível
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {horarios.map(h => (
                  <button key={h} onClick={() => setForm({...form, hora: h})}
                    className={`py-2 rounded-xl text-sm font-semibold transition border-2 ${
                      form.hora === h
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                    }`}>
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.medico_id && form.data && horarios.length === 0 && (
            <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Nenhum horário disponível nesta data. Tente outra data.
            </p>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Motivo da consulta</label>
            <textarea value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})}
              rows={2} placeholder="Opcional — descreva brevemente o motivo"
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{erro}</p>}

          <button onClick={agendar} disabled={loading || !form.hora}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm">
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}
