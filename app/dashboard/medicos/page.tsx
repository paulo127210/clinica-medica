'use client'
import { useEffect, useState } from 'react'
import { UserRound, TrendingUp, Plus, X, Search } from 'lucide-react'

const especialidades = [
  { id: 1, nome: 'Clínica Geral' }, { id: 2, nome: 'Cardiologia' },
  { id: 3, nome: 'Dermatologia' },  { id: 4, nome: 'Ginecologia' },
  { id: 5, nome: 'Ortopedia' },     { id: 6, nome: 'Pediatria' },
  { id: 7, nome: 'Neurologia' },    { id: 8, nome: 'Oftalmologia' },
  { id: 9, nome: 'Urologia' },      { id: 10, nome: 'Psiquiatria' },
]

const formVazio = {
  nome: '', email: '', cpf: '', celular: '',
  data_nascimento: '', sexo: 'M',
  crm: '', crm_estado: 'SP', especialidade_id: '1',
  valor_consulta: '', percentual_repasse: '60',
  data_admissao: new Date().toISOString().split('T')[0],
  salario: '',
}

export default function MedicosPage() {
  const [medicos, setMedicos]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [form, setForm]         = useState(formVazio)
  const [erro, setErro]         = useState('')

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/dados?tabela=vw_producao_medicos&order=medico')
    const json = await res.json()
    setMedicos(json.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtrados = medicos.filter(m =>
    !search || m.medico?.toLowerCase().includes(search.toLowerCase()) ||
    m.especialidade?.toLowerCase().includes(search.toLowerCase())
  )

  async function salvar() {
    setErro('')
    if (!form.nome || !form.crm || !form.data_nascimento || !form.valor_consulta) {
      setErro('Preencha nome, CRM, data de nascimento e valor da consulta.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/medicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSaving(false)
    if (json.erro) { setErro(json.erro); return }
    setShowForm(false)
    setForm(formVazio)
    load()
  }

  const campo = (label: string, key: keyof typeof formVazio, type = 'text', required = false) => (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}{required && ' *'}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Médicos</h2>
          <p className="text-gray-500 text-sm mt-1">{medicos.length} médico(s) cadastrado(s)</p>
        </div>
        <button onClick={() => { setShowForm(true); setErro('') }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow">
          <Plus className="w-4 h-4" /> Novo Médico
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Buscar por nome ou especialidade..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"/>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtrados.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow">
                  <UserRound className="w-6 h-6 text-white"/>
                </div>
                <div>
                  <p className="font-bold text-blue-900">{m.medico}</p>
                  <p className="text-xs text-gray-400">{m.especialidade} · CRM {m.crm}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Consultas</p>
                  <p className="text-xl font-bold text-blue-900">{m.consultas_realizadas || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Repasse Est.</p>
                  <p className="text-sm font-bold text-teal-600">{fmt(m.repasse_estimado)}</p>
                </div>
                <div className="col-span-2 bg-green-50 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-500"/> Total Recebido</p>
                  <p className="font-bold text-green-600">{fmt(m.total_recebido)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap text-xs">
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{m.total_consultas || 0} agendadas</span>
                {m.faltas > 0 && <span className="bg-red-50 text-red-500 px-2 py-1 rounded-full">{m.faltas} faltas</span>}
              </div>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <UserRound className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p>Nenhum médico encontrado.</p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-xl">
                  <UserRound className="w-5 h-5 text-green-600"/>
                </div>
                <h3 className="text-lg font-bold text-blue-900">Cadastrar Novo Médico</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400"/>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Dados Pessoais
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">{campo('Nome completo', 'nome', 'text', true)}</div>
                  {campo('CPF', 'cpf')}
                  {campo('Data de Nascimento', 'data_nascimento', 'date', true)}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sexo</label>
                    <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>
                  {campo('Celular', 'celular')}
                  <div className="sm:col-span-2">{campo('E-mail', 'email', 'email')}</div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Dados Profissionais
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campo('CRM', 'crm', 'text', true)}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado do CRM</label>
                    <select value={form.crm_estado} onChange={e => setForm({...form, crm_estado: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Especialidade *</label>
                    <select value={form.especialidade_id} onChange={e => setForm({...form, especialidade_id: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {especialidades.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  {campo('Valor da Consulta (R$)', 'valor_consulta', 'number', true)}
                  {campo('Repasse (%)', 'percentual_repasse', 'number')}
                  {campo('Data de Admissão', 'data_admissao', 'date')}
                  {campo('Salário (R$)', 'salario', 'number')}
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{erro}</div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow">
                {saving ? 'Salvando...' : 'Cadastrar Médico'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
