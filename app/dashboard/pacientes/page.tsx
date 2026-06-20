'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus, User, Phone, Calendar } from 'lucide-react'

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', cpf: '', data_nascimento: '', sexo: 'M', celular: '', email: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    let q = supabase.from('pacientes').select('*').eq('ativo', true).order('nome')
    if (search) q = q.ilike('nome', `%${search}%`)
    const { data } = await q.limit(50)
    setPacientes(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  async function salvar() {
    if (!form.nome || !form.data_nascimento) return alert('Preencha nome e data de nascimento.')
    setSaving(true)
    const { error } = await supabase.from('pacientes').insert([{ ...form, sexo: form.sexo as any }])
    setSaving(false)
    if (error) return alert('Erro: ' + error.message)
    setShowForm(false)
    setForm({ nome: '', cpf: '', data_nascimento: '', sexo: 'M', celular: '', email: '' })
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pacientes</h2>
          <p className="text-gray-500 text-sm mt-1">{pacientes.length} pacientes encontrados</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Novo Paciente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Nome completo *</label>
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">CPF</label>
                <input value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data de nascimento *</label>
                <input type="date" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sexo</label>
                <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Celular</label>
                <input value={form.celular} onChange={e => setForm({...form, celular: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">E-mail</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pacientes.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.cpf || 'CPF não informado'}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {p.celular && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5" /> {p.celular}
                  </div>
                )}
                {p.data_nascimento && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(p.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {pacientes.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum paciente encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
