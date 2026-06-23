'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, CheckCircle, ChevronRight, User } from 'lucide-react'

const ICONS: Record<string, string> = {
  'Clínica Geral': '🏥', 'Cardiologia': '❤️', 'Dermatologia': '🌟',
  'Ortopedia': '🦴', 'Pediatria': '👶', 'Ginecologia': '🌸',
  'Neurologia': '🧠', 'Oftalmologia': '👁️', 'Urologia': '💊',
  'Psiquiatria': '🧘', 'Endocrinologia': '⚗️', 'Reumatologia': '🦾',
}

type Step = 'especialidade' | 'medico' | 'horario' | 'sucesso'

export default function AgendarConsulta() {
  const router = useRouter()
  const [paciente, setPaciente] = useState<any>(null)
  const [step, setStep] = useState<Step>('especialidade')

  const [todosMedicos, setTodosMedicos] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [espSelecionada, setEspSelecionada] = useState('')
  const [medicosFiltrados, setMedicosFiltrados] = useState<any[]>([])
  const [medicoSelecionado, setMedicoSelecionado] = useState<any>(null)

  const [horarios, setHorarios] = useState<string[]>([])
  const [form, setForm] = useState({ data: '', hora: '', motivo: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const p = sessionStorage.getItem('paciente')
    if (!p) { router.push('/paciente/login'); return }
    setPaciente(JSON.parse(p))
    fetch('/api/dados?tabela=vw_producao_medicos&order=especialidade')
      .then(r => r.json())
      .then(j => {
        const lista = j.data || []
        setTodosMedicos(lista)
        const unicas = [...new Set(lista.map((m: any) => m.especialidade))] as string[]
        setEspecialidades(unicas.sort())
      })
  }, [])

  useEffect(() => {
    if (!form.data || !medicoSelecionado) { setHorarios([]); return }
    fetch(`/api/paciente/horarios?medico_id=${medicoSelecionado.medico_id}&data=${form.data}`)
      .then(r => r.json()).then(j => setHorarios(j.horarios || []))
  }, [form.data, medicoSelecionado])

  function escolherEspecialidade(esp: string) {
    setEspSelecionada(esp)
    setMedicosFiltrados(todosMedicos.filter(m => m.especialidade === esp))
    setMedicoSelecionado(null)
    setForm({ data: '', hora: '', motivo: '' })
    setHorarios([])
    setErro('')
    setStep('medico')
  }

  function escolherMedico(m: any) {
    setMedicoSelecionado(m)
    setForm({ data: '', hora: '', motivo: '' })
    setHorarios([])
    setErro('')
    setStep('horario')
  }

  async function confirmar() {
    setErro('')
    if (!form.data || !form.hora) { setErro('Escolha a data e o horário.'); return }
    setLoading(true)
    const res = await fetch('/api/paciente/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paciente_id: paciente.id,
        medico_id: medicoSelecionado.medico_id,
        data: form.data,
        hora: form.hora,
        motivo: form.motivo,
      }),
    })
    const json = await res.json()
    setLoading(false)
    if (json.erro) { setErro(json.erro); return }
    setStep('sucesso')
  }

  const Header = ({ titulo, sub }: { titulo: string; sub?: string }) => (
    <div className="mb-6">
      <img src="/banner.jpg" alt="Clínica Dr. Paulo" className="w-full h-20 object-cover object-top rounded-2xl mb-4" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-gray-800">{titulo}</h1>
          {sub && <p className="text-teal-600 text-sm font-medium">{sub}</p>}
        </div>
        <button onClick={() => { sessionStorage.removeItem('paciente'); router.push('/paciente/login') }}
          className="text-xs text-gray-400 hover:text-red-500 transition">Sair</button>
      </div>
    </div>
  )

  // ── SUCESSO ──
  if (step === 'sucesso') return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Consulta Agendada!</h2>
        <p className="text-gray-500 mb-1">com <span className="font-semibold text-gray-700">{medicoSelecionado?.medico}</span></p>
        <p className="text-teal-600 font-bold text-lg">{form.data.split('-').reverse().join('/')} às {form.hora}</p>
        <p className="text-gray-400 text-sm mt-1">{espSelecionada}</p>
        <button onClick={() => { setStep('especialidade'); setForm({ data: '', hora: '', motivo: '' }) }}
          className="mt-6 w-full py-3 bg-teal-600 text-white font-bold rounded-xl text-sm hover:bg-teal-700 transition">
          Agendar outra consulta
        </button>
        <button onClick={() => { sessionStorage.removeItem('paciente'); router.push('/paciente/login') }}
          className="mt-2 w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition">
          Sair
        </button>
      </div>
    </div>
  )

  // ── ETAPA: ESCOLHA DO HORÁRIO ──
  if (step === 'horario') return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <Header titulo="Escolha o horário" sub={`Olá, ${paciente?.nome?.split(' ')[0]}!`} />

        {/* Médico selecionado */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{medicoSelecionado?.medico}</p>
            <p className="text-teal-600 text-xs">{espSelecionada} · {medicoSelecionado?.crm}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Data da consulta
            </label>
            <input type="date" value={form.data}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, data: e.target.value, hora: '' })}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          {form.data && horarios.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Horários disponíveis
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {horarios.map(h => (
                  <button key={h} onClick={() => setForm({ ...form, hora: h })}
                    className={`py-2 rounded-xl text-sm font-semibold transition border-2 ${
                      form.hora === h
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400'
                    }`}>{h}</button>
                ))}
              </div>
            </div>
          )}

          {form.data && horarios.length === 0 && (
            <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              Nenhum horário disponível nesta data. Tente outra.
            </p>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Motivo (opcional)</label>
            <textarea value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })}
              rows={2} placeholder="Descreva brevemente o motivo da consulta..."
              className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{erro}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={() => setStep('medico')}
              className="flex items-center gap-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-teal-400 transition">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={confirmar} disabled={loading || !form.hora}
              className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition disabled:opacity-50 text-sm">
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── ETAPA: ESCOLHA DO MÉDICO ──
  if (step === 'medico') return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <Header titulo={`Médicos · ${espSelecionada}`} sub={`Olá, ${paciente?.nome?.split(' ')[0]}!`} />

        <div className="space-y-3">
          {medicosFiltrados.map(m => (
            <button key={m.medico_id} onClick={() => escolherMedico(m)}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition text-left group">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {m.medico.split(' ').find((w: string) => w.length > 2 && !['Dr.', 'Dra.'].includes(w))?.[0] || '?'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">{m.medico}</p>
                <p className="text-teal-600 text-xs">{m.crm}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition" />
            </button>
          ))}
        </div>

        <button onClick={() => setStep('especialidade')}
          className="mt-5 flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-teal-600 transition">
          <ArrowLeft className="w-4 h-4" /> Voltar para especialidades
        </button>
      </div>
    </div>
  )

  // ── ETAPA: ESCOLHA DA ESPECIALIDADE ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
        <Header titulo="Agendar Consulta" sub={paciente ? `Olá, ${paciente.nome?.split(' ')[0]}!` : undefined} />

        <p className="text-gray-500 text-sm mb-4 font-medium">Escolha a especialidade desejada:</p>

        <div className="grid grid-cols-2 gap-3">
          {especialidades.map(esp => (
            <button key={esp} onClick={() => escolherEspecialidade(esp)}
              className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-2xl hover:border-teal-400 hover:bg-teal-50 transition text-left group">
              <span className="text-2xl">{ICONS[esp] || '🩺'}</span>
              <span className="font-semibold text-gray-700 text-sm leading-tight">{esp}</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition ml-auto" />
            </button>
          ))}
        </div>

        <button onClick={() => { sessionStorage.removeItem('paciente'); router.push('/paciente/login') }}
          className="mt-6 w-full text-center text-gray-400 text-xs hover:text-gray-600 transition">
          Sair
        </button>
      </div>
    </div>
  )
}
