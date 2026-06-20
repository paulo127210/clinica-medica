'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Search, Calendar, User } from 'lucide-react'

export default function ProntuariosPage() {
  const [prontuarios, setProntuarios] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('prontuarios')
        .select('*, pacientes(nome, cpf), medicos(crm, funcionarios(nome)), consultas(data_hora, status)')
        .order('criado_em', { ascending: false })
        .limit(30)
      setProntuarios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = prontuarios.filter(p =>
    !search || p.pacientes?.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Prontuários</h2>
        <p className="text-gray-500 text-sm mt-1">Histórico de atendimentos e registros médicos</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Buscar por paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>Nenhum prontuário encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{p.pacientes?.nome}</p>
                    <p className="text-xs text-gray-400">CPF: {p.pacientes?.cpf || '—'}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(p.criado_em).toLocaleDateString('pt-BR')}</p>
                  <p className="flex items-center gap-1 mt-1"><User className="w-3.5 h-3.5" />Dr(a). {p.medicos?.funcionarios?.nome}</p>
                </div>
              </div>
              {p.queixa_principal && (
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Queixa Principal</p>
                  <p className="text-sm text-gray-700">{p.queixa_principal}</p>
                </div>
              )}
              {p.cid10_principal && (
                <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  CID-10: {p.cid10_principal}
                </span>
              )}
              {p.conduta && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Conduta</p>
                  <p className="text-sm text-gray-700">{p.conduta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
