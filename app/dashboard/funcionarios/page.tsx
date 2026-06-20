'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Briefcase, Plus, X, Search, User } from 'lucide-react'

const cargos = [
  { id: 1, nome: 'Médico' }, { id: 2, nome: 'Enfermeiro' },
  { id: 3, nome: 'Técnico de Enfermagem' }, { id: 4, nome: 'Recepcionista' },
  { id: 5, nome: 'Auxiliar Administrativo' },
]

const formVazio = {
  nome: '', email: '', cpf: '', celular: '',
  data_nascimento: '', sexo: 'M', cargo_id: '4',
  data_admissao: new Date().toISOString().split('T')[0],
  salario: '',
}

export default function FuncionariosPage() {
  const [lista, setLista]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [form, setForm]         = useState(formVazio)
  const [erro, setErro]         = useState('')

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('funcionarios')
      .select('*, cargos(nome), usuarios(email)')
      .order('nome')
      .limit(100)
    setLista(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtrados = lista.filter(f =>
    !search ||
    f.nome?.toLowerCase().includes(search.toLowerCase()) ||
    f.cargos?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  async function salvar() {
    setErro('')
    if (!form.nome || !form.data_nascimento || !form.data_admissao) {
      setErro('Preencha nome, data de nascimento e data de admissão.')
      return
    }
    setSaving(true)
    try {
      // 1. Cria usuário
      const email = form.email || `${form.nome.toLowerCase().replace(/\s+/g,'.').normalize('NFD').replace(/[̀-ͯ]/g,'')}@clinica.com`
      const { data: usu, error: eUsu } = await supabase
        .from('usuarios')
        .insert([{ perfil_id: 3, nome: form.nome, email, senha_hash: 'hash_placeholder', salt: 'salt_placeholder' }])
        .select('id').single()
      if (eUsu) throw new Error(eUsu.message)

      // 2. Cria funcionário
      const { error: eFunc } = await supabase
        .from('funcionarios')
        .insert([{
          usuario_id: usu.id,
          cargo_id: parseInt(form.cargo_id),
          nome: form.nome,
          cpf: form.cpf || null,
          celular: form.celular || null,
          data_nascimento: form.data_nascimento,
          sexo: form.sexo,
          data_admissao: form.data_admissao,
          salario: parseFloat(form.salario) || null,
        }])
      if (eFunc) throw new Error(eFunc.message)

      setShowForm(false)
      setForm(formVazio)
      load()
    } catch (e: any) {
      setErro('Erro: ' + e.message)
    }
    setSaving(false)
  }

  const input = (label: string, key: keyof typeof formVazio, type = 'text', req = false) => (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}{req && ' *'}</label>
      <input type={type} value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"/>
    </div>
  )

  const corCargo: Record<number, string> = {
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-teal-100 text-teal-700',
    3: 'bg-cyan-100 text-cyan-700',
    4: 'bg-purple-100 text-purple-700',
    5: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Funcionários</h2>
          <p className="text-gray-500 text-sm mt-1">{lista.length} funcionário(s) cadastrado(s)</p>
        </div>
        <button onClick={() => { setShowForm(true); setErro('') }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow">
          <Plus className="w-4 h-4"/> Novo Funcionário
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input placeholder="Buscar por nome ou cargo..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"/>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
              <tr>
                {['Funcionário','Cargo','CPF','Celular','Admissão','Salário'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {f.nome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">{f.nome}</p>
                        <p className="text-xs text-gray-400">{f.usuarios?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${corCargo[f.cargo_id] || 'bg-gray-100 text-gray-600'}`}>
                      {f.cargos?.nome}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{f.cpf || '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{f.celular || '—'}</td>
                  <td className="px-5 py-4 text-gray-500">
                    {f.data_admissao ? new Date(f.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-700">{fmt(f.salario)}</td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                  Nenhum funcionário encontrado.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-xl">
                  <Briefcase className="w-5 h-5 text-green-600"/>
                </div>
                <h3 className="text-lg font-bold text-blue-900">Cadastrar Funcionário</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-400"/>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">{input('Nome completo', 'nome', 'text', true)}</div>
                {input('CPF', 'cpf')}
                {input('Data de Nascimento', 'data_nascimento', 'date', true)}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sexo</label>
                  <select value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                {input('Celular', 'celular')}
                <div className="sm:col-span-2">{input('E-mail', 'email', 'email')}</div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cargo *</label>
                  <select value={form.cargo_id} onChange={e => setForm({...form, cargo_id: e.target.value})}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
                    {cargos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                {input('Data de Admissão', 'data_admissao', 'date', true)}
                {input('Salário (R$)', 'salario', 'number')}
              </div>

              {erro && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                  {erro}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 shadow">
                {saving ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
